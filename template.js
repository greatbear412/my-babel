const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const types = require('@babel/types');
const fs = require("fs");


const sourceCode = fs.readFileSync('src/index.js').toString();

const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
    plugins: []
})

traverse(ast, {
    CallExpression(path, state) {

    }
})

const [code, map] = generator(ast);

console.log(code);