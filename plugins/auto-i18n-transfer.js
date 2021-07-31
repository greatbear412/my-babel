const {
    declare
} = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');
const fse = require('fs-extra');
const path = require('path');


/**
 * 1. 引入intl
 * 2. 去掉注释和import语句
 * 3. 转换、收集
 */
const auto_i18n_transfer = declare((api, options, dirname) => {
    api.assertVersion(7);

    const save = (file, key, val) => {
        const allText = file.get('allText');
        const value = val.raw || val;
        allText.push({
            key,
            value
        });
        file.set('allText', allText);
    }

    const ignoreList = ['id', 'className'];
    const generateExpression = (path, key, intlUid) => {
        let ast = api.template.ast(`${intlUid}('${key}')`).expression;
        const pA = path.findParent(p => p.isJSXAttribute());
        if (pA && ignoreList.includes(pA.node.name.name)) return false;
        if (pA && !path.findParent(p => p.isJSXExpressionContainer())) {
            ast = api.types.JSXExpressionContainer(ast);
        }
        return ast;
    }

    return {
        pre(file) {
            file.set('allText', []);
        },
        visitor: {
            Program: {
                enter(path, state) {
                    let imported = false;
                    let uid = '';
                    path.traverse({
                        ImportDeclaration(curPath) {
                            if (curPath.node.source.value === options.intlName) {
                                imported = true;
                                uid = options.intlName;
                            }
                        }
                    })
                    if (!imported) {
                        uid = path.scope.generateUid(options.intlName);
                        const importAst = api.template.statement(`import ${uid} from '${options.intlPath}'`)();
                        path.node.body.unshift(importAst);
                    }
                    state.intlUid = uid;

                    path.traverse({
                        'StringLiteral|TemplateLiteral'(path, state) {
                            const disable = 'i18n-disable';
                            const leadingComments = path.node.leadingComments;

                            if (leadingComments) {
                                path.node.leadingComments = path.node.leadingComments.filter(c => {
                                    if (c.value.includes(disable)) {
                                        path.node.skipI18nTransfer = true;
                                        return false;
                                    }
                                    return true;
                                })
                            }

                            if (path.findParent(p => p.isImportDeclaration())) {
                                path.node.skipI18nTransfer = true;
                            }
                        }
                    })
                }
            },
            'StringLiteral'(path, state) {
                if (path.node.skipI18nTransfer) return;
                const val = path.node.value;
                let key = path.scope.generateUid(val);

                let ast = generateExpression(path, key, state.intlUid);
                if (ast) {
                    save(state.file, key, val);
                    path.replaceWith(ast);
                    path.skip();
                }
            },
            'TemplateLiteral'(path, state) {
                if (path.node.skipI18nTransfer) return;
                path.get('quasis').forEach(templateElement => {
                    const val = templateElement.node.value.raw;
                    if (!val) return;
                    let key = templateElement.scope.generateUid(val);
                    save(state.file, key, templateElement.node.value);

                    let ast = generateExpression(templateElement, key, state.intlUid);
                    templateElement.replaceWith(ast);
                })
                path.skip();
            }
        },
        post(file) {
            const allText = file.get('allText');
            const intlData = allText.reduce((obj, item) => {
                obj[item.key] = item.value;
                return obj;
            }, {});

            const content = `const resource = ${JSON.stringify(intlData, null, 4)};\nexport default resource;`;
            fse.ensureDirSync(options.outputDir);
            fse.writeFileSync(path.join(options.outputDir, 'zh_CN.js'), content);
            fse.writeFileSync(path.join(options.outputDir, 'en_US.js'), content);
        }
    }
});
module.exports = auto_i18n_transfer;