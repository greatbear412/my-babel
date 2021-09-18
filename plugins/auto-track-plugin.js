const {
    declare
} = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');
const Config = require('./track/config.ts');

const auto_track_plugin = declare((api, option, dirname) => {
    api.assertVersion('7');

    const config = getConfig(Config);

    return {
        visitor: {
            // Program: {
            //     enter(path, state) {
            //         path.traverse({
            //             ImportDeclaration(curPath) {
            //                 const requirePath = curPath.node.source.value;
            //                 if (requirePath === option.tracerID) {
            //                     const specifiers = curPath.get('specifiers.0');
            //                     if (specifiers.isImportSpecifier()) {
            //                         state.tracerID = specifiers.toString();
            //                     } else {
            //                         state.tracerID = specifiers.get('local').toString();
            //                     }
            //                     path.stop();
            //                 }
            //             }
            //         })
            //         if (!state.tracerID) {
            //             // 生成独特ID
            //             state.tracerID = importModule.addDefault(path, '/qwe/asd/tracker', {
            //                 nameHint: path.scope.generateUid('tracker')
            //             }).name;
            //             // 你要生成AST，就用template；生成Path，就用types
            //             state.tracerAST = api.template.statement(`${state.tracerID}()`)();
            //         }
            //     }
            // },
            'ClassMethod|FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path, state) {
                const body = path.get('body');
                const fnName = path.node.key.name;
                if (body == null) {
                    return;
                }
                insert(fnName, body, )
                path.skip();
            }
        }
    }

    function getConfig(config) {
        const res = {};
        for (const key in config) {
            if (Object.hasOwnProperty.call(config, key)) {
                const data = config[key];
                key.split('|').map(k => res[k] = data)
            }
        }
        return res;
    }

    function insert(fn, body) {
        if (config.hasOwnProperty(fn)) {
            const fnConfig = config[fn];
            const statement = fnConfig.expression;
            const ast = api.template.ast(statement);
            // 放在遍历里面做
            // TODO: 校验path
            // TODO: 引入importFn
            const pos = fnConfig.position;
            if (body.isBlockStatement()) {
                // 有块级作用域，插入AST
                if (pos === 'top') {
                    body.node.body.unshift(ast);
                } else if (pos === 'bottom') {
                    body.node.body.push(ast);
                } else {
                    throwError(fn, pos);
                }
            } else {
                // 简写语法的，依旧返回原表达式
                const ast = api.template.statement(`{${statement};return PREV_BODY;}`)({
                    PREV_BODY: body.node
                });
                body.replaceWith(ast);
            };
        }
    }

    function throwError(fn, key) {
        console.log(`*** ${fn} 配置错误：position不支持${key}`)
    }
})

module.exports = auto_track_plugin;