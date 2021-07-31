const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const template = require('@babel/template').default;
const types = require('@babel/types');

const fs = require("fs");
const parser = require('@babel/parser');
const { transformFromAstSync, transformAsync } = require('@babel/core');
const auto_i18n_transfer = require('./plugins/auto-i18n-transfer');

const sourceCode = fs.readFileSync('src/index.js').toString();

const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
    plugins: ['jsx']
})

const { code, map } = transformFromAstSync(ast, sourceCode, {
    plugins: [[auto_i18n_transfer, {
        intlName: 'intl',
        intlPath: './src/intl',
        outputDir: './dist/'
    }]]
});


fs.writeFile('./dist/index.js', code, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('done');
    }
});
