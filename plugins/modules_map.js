const {
    parseSync
} = require("@babel/core");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const Path = require('path');
const fileTypeList = ['html', 'ts', 'js'];

module.exports = async function (filePath, plugins) {
    const rlt = await modulesMap(filePath, new Dependecy('', [], []), plugins);
    return rlt;
}

class Dependecy {
    constructor(path, imports, exports) {
        this.path = path;
        this.imports = imports;
        this.exports = exports;
        this.subModules = [];
    }
}


async function modulesMap(filePath, data, plugins) {
    data.path = filePath;
    const existedFileInfo = await getFilePath(filePath);
    if (existedFileInfo.err !== '') {
        console.log(existedFileInfo.err);
        return;
    }
    const _path = existedFileInfo.filePath;
    const _type = existedFileInfo.fileType;
    const sourceCode = fs.readFileSync(_path).toString();
    // parse
    const parserPlugins = [
        ['decorators', {
            decoratorsBeforeExport: true
        }]
    ];
    if (_type === 'ts') {
        parserPlugins.unshift(['typescript']);
    }
    const ast = parseSync(sourceCode, {
        parserOpts: {
            plugins: parserPlugins
        },
        plugins: plugins,
        sourceType: 'unambiguous',
        generatorOpts: {
            decoratorsBeforeExport: true
        }
    });
    // traverse
    const subModules = traverseJS(ast, data);
    // repeat
    for (let i = 0; i < subModules.length; i++) {
        const subFilePath = subModules[i];
        const subModulesData = await modulesMap(subFilePath, new Dependecy('', [], []), plugins);
        data.subModules.push(subModulesData);
    }
    return data;
}

function traverseJS(ast, data) {
    const subModules = [];
    traverse(ast, {
        ImportDeclaration: function (curPath) {
            const p = data.path.split('/');
            p.pop();

            const requirePath = curPath.node.source.value;
            if (!checkPath(requirePath)) {
                curPath.skip();
                return;
            }
            // ??????????????????????????????
            const absolutePath = Path.resolve(p.join('/'), requirePath);
            if (curPath.node.specifiers) {
                curPath.node.specifiers.map(node => {
                    data.imports.push(node.local.name);
                })
                subModules.push(absolutePath);
            }
        },
        ExportDeclaration: function (curPath) {
            // export
            if (curPath.node.specifiers) {
                curPath.node.specifiers.map(node => {
                    data.exports.push(node.local.name);
                })
            }
            // export default
            if (curPath.node.declaration) {
                data.exports.push(curPath.node.declaration.name);
            }

        }
    });
    return subModules;
}

// ????????????????????????
function checkPath(filePath) {
    // TODO: ??????tsconfig??????
    const path = filePath.replace('@app/', 'src/app/');
    const checkList = ['./', '../', 'src/'];
    return checkList.some(p => path.startsWith(p));
}

// ???????????????????????????
async function getFilePath(filePath) {
    const res = {
        fileType: '',
        filePath: '',
        err: ''
    }
    // ????????????????????????????????????????????????
    const fileType = filePath.split('/').pop().split('.').pop();
    if (fileTypeList.includes(fileType)) {
        res.filePath = filePath;
        res.fileType = fileType;
    } else {
        let err = true;
        for (let i = 0; i < fileTypeList.length; i++) {
            const _type = fileTypeList[i];
            const _path = filePath + `.${_type}`;
            try {
                await fs.promises.access(_path, fs.constants.R_OK);
                err = false;
                res.filePath = _path;
                res.fileType = _type;
            } catch {}
        }
        if (err) {
            res.err = `${filePath} ??????JS??????TS??????????????????`;
        }
    }
    return res;
}