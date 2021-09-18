const modulesMap = require("./plugins/modules_map");
const path = require('path');

const entry = path.resolve(__dirname, './src/index.js');
const rlt = modulesMap(entry, __dirname);
console.log(rlt);