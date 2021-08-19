const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const template = require('@babel/template').default;
const types = require('@babel/types');

const sql_to_headers = require('./transform_tools/sql_to_headers');

const fs = require("fs");
const parser = require('@babel/parser');
const {
    transformFromAstSync,
    transformSync
} = require('@babel/core');
const auto_lint_example = require('./plugins/auto-lint-example');
const auto_track_plugin = require('./plugins/auto-track-plugin');

// const sourceCode = fs.readFileSync('src/component.ts').toString();
const sourceCode = fs.readFileSync('src/hardcommon.sql').toString();
const rlt = sql_to_headers(sourceCode);
// const {
//     code,
//     map
// } = transformSync(sourceCode, {
//     parserOpts: {
//         plugins: [
//             ['typescript'],
//             ['decorators', {
//                 decoratorsBeforeExport: true
//             }]
//         ]
//     },
//     sourceType: 'unambiguous',
//     plugins: [
//         [auto_track_plugin, {
//             tracerID: 'test'
//         }]
//     ],
//     generatorOpts: {
//         decoratorsBeforeExport: true
//     }
// })


fs.writeFile('./dist/index.ts', JSON.stringify(rlt), function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('done');
    }
});