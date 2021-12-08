const {
    declare
} = require('@babel/helper-plugin-utils');
const doctrine = require('doctrine');
const renderer = require('./renderer');
const fse = require('fs-extra');
const path = require('path');

const auto_api_doc = declare((api, options, dirname) => {
    api.assertVersion(7);

    function parseComment(commentStr) {
        if (!commentStr) {
            return;
        }
        return doctrine.parse(commentStr, {
            unwrap: true
        });
    }

    function resolveType(tsType) {
        const typeAnnotation = tsType.typeAnnotation;
        if (!typeAnnotation) {
            return;
        }
        switch (typeAnnotation.type) {
            case 'TSStringKeyword':
                return 'string';
            case 'TSNumberKeyword':
                return 'number';
            case 'TSBooleanKeyword':
                return 'boolean';
        }
    }

    function generate(docs, format = 'json') {
        if (format === 'markdown') {
            return {
                ext: '.md',
                content: renderer.markdown(docs)
            }
        } else if (format === 'html') {
            return {
                ext: 'html',
                content: renderer.html(docs)
            }
        } else {
            return {
                ext: 'json',
                content: renderer.json(docs)
            }
        }
    }

    return {
        pre(file) {
            file.set('doc', []);
        },
        visitor: {
            FunctionDeclaration(path, state) {
                const leaComments = path.node.leadingComments;
                let cm = [];
                if (leaComments) {
                    cm = leaComments.map(c => parseComment(c.value));
                    const docs = state.file.get('doc');
                    docs.push(...cm);
                }
            },
            ClassDeclaration(path, state) {
                const docs = state.file.get('doc');
                const classInfo = {
                    type: 'class',
                    name: path.get('id').toString(),
                    constructorInfo: {},
                    methodsInfo: [],
                    propertiesInfo: []
                };
                if (path.node.leadingComments) {
                    classInfo.doc = parseComment(path.node.leadingComments[0].value);
                }
                if (path.node.id.leadingComments) {
                    classInfo.doc = parseComment(path.node.id.leadingComments[0].value);
                }
                path.traverse({
                    ClassProperty(path) {
                        classInfo.propertiesInfo.push({
                            name: path.get('key').toString(),
                            type: resolveType(path.getTypeAnnotation()),
                            doc: [path.node.leadingComments, path.node.trailingComments].filter(Boolean).map(comment => {
                                return parseComment(comment.value);
                            }).filter(Boolean)
                        })
                    },
                    ClassMethod(path) {
                        if (path.node.kind === 'constructor') {
                            classInfo.constructorInfo = {
                                params: path.get('params').map(paramPath => {
                                    return {
                                        name: paramPath.toString(),
                                        type: resolveType(paramPath.getTypeAnnotation()),
                                        doc: path.node.leadingComments && parseComment(path.node.leadingComments[0].value)
                                    }
                                })
                            }
                        } else {
                            if (!path.node.leadingComments) return;
                            classInfo.methodsInfo.push({
                                name: path.get('key').toString(),
                                doc: parseComment(path.node.leadingComments[0].value),
                                params: path.get('params').map(paramPath => {
                                    return {
                                        name: paramPath.toString(),
                                        type: resolveType(paramPath.getTypeAnnotation())
                                    }
                                }),
                                return: resolveType(path.getTypeAnnotation())
                            })
                        }
                    }
                });
                docs.push(classInfo);
                state.file.set('docs', docs);
            }
        },
        post(file) {
            const docs = file.get('docs');
            const res = generate(docs, options.format);
            fse.ensureDirSync(options.outputDir);
            fse.writeFileSync(path.join(options.outputDir, 'docs' + res.ext), res.content);
        }
    }
});

module.exports = auto_api_doc;