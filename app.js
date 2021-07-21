const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const template = require('@babel/template').default;
const types = require('@babel/types');

const fs = require("fs");
const parser = require('@babel/parser');
const { transformFromAstSync, transformAsync } = require('@babel/core');
const transform_insert_plugins = require('./plugins/transform-insert-plugin');

const sourceCode = fs.readFileSync('src/index.js').toString();

const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
    plugins: ['jsx']
})

const { code, map } = transformFromAstSync(ast, sourceCode, {
    plugins: [transform_insert_plugins]
});


fs.writeFile('./dist/index.js', code, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('done');
    }
});

const { codeFrameColumns } = require('、');

const res = codeFrameColumns(code, {
  start: { line: 2, column: 1 },
  end: { line: 3, column: 5 },
}, {
  highlightCode: true,
  message: '这里出错了'
});

console.log(res);
