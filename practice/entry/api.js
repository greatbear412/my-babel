const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const template = require('@babel/template').default;
const types = require('@babel/types');
const path = require('path');
const fs = require("fs");
const parser = require('@babel/parser');
const {
    transformFromAstSync,
    transformSync
} = require('@babel/core');
const plugin = require(path.resolve(__dirname, '../plugins/auto-api-doc'));

const sourceCode = fs.readFileSync(path.resolve(__dirname, '../src/api.ts')).toString();
const {
    code,
    map
} = transformSync(sourceCode, {
    parserOpts: {
        plugins: [
            ['typescript'],
            ['decorators', {
                decoratorsBeforeExport: true
            }]
        ]
    },
    sourceType: 'unambiguous',
    plugins: [
        [plugin, {
            format: 'markdown',
            outputDir: '../dist'
        }]
    ],
    generatorOpts: {
        decoratorsBeforeExport: true
    }
})


fs.writeFile('../dist/api.ts', JSON.stringify(code), function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('done');
    }
});