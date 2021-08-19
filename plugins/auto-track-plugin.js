const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');

const auto_track_plugin = declare((api, option, dirname) => {
    api.assertVersion('7');


    const logStatement = `test(123)`;
    const logStatementAST = api.template.ast(logStatement);

    return {
        visitor: {
            Program:{
                enter(path, state){
                    path.traverse({
                        ImportDeclaration(curPath){
                            const requirePath = curPath.node.source.value;
                            if(requirePath === option.tracerID){
                                const specifiers = curPath.get('specifiers.0');
                                if (specifiers.isImportSpecifier()) {
                                    state.tracerID = specifiers.toString();
                                } else {
                                    state.tracerID = specifiers.get('local').toString();
                                }
                                path.stop();
                            }
                        }
                    })
                    if(!state.tracerID){
                        // 生成独特ID
                        state.tracerID = importModule.addDefault(path, '/qwe/asd/tracker', {
                            nameHint: path.scope.generateUid('tracker')
                        }).name;
                        // 你要生成AST，就用template；生成Path，就用types
                        state.tracerAST = api.template.statement(`${state.tracerID}()`)();
                    }
                }
            },
            'ClassMethod|FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path, state){
                const body = path.get('body');
                if(body == null) {
                    return;
                }
                if (body.isBlockStatement()) {
                    body.node.body.unshift(logStatementAST);
                } else {
                    // statement 如何用
                    const ast = api.template.statement(`{${logStatement};return PREV_BODY;}`)({PREV_BODY: body.node});
                    body.replaceWith(ast);
                };
                path.skip();
            }
        }
    }
})

module.exports = auto_track_plugin;