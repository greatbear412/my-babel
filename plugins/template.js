const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');

const autoTrackPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
        },
        visitor: {
            Program: {
                enter(path, state){
                }
            }
        },
        post(file) {
        }
    }
});
module.exports = autoTrackPlugin;