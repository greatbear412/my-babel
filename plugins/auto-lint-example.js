const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');

const auto_lint_example = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set('error', []);
        },
        visitor: {
            Program: {
                enter(path, state){
                }
            },
            AssignmentExpression(path, state) {
                const bindings = path.get('left').toString();
                const scope = path.scope.getBinding(bindings);
                console.log(scope);
            }
        },
        post(file) {
            const err = file.get('error');
            console.log(err);
        }
    }
});
module.exports = auto_lint_example;