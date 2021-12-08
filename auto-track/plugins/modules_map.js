const {
    parseSync
} = require("@babel/core");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const Path = require('path');
const fileTypeList = ['html', 'ts', 'js'];
const projectConfig = {
    tsConfig: {}
};

module.exports = async function (filePath, plugins, configs) {
    // init
    initTsConfigs(configs);

    // transform
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
    // 保存Plugins处理（插桩）后的ast
    data.ast = ast;

    // traverse遍历子模块
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
            // 深度遍历时的路径问题
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

// 路径（别名）替换
function checkPath(filePath) {
    let pathResult = '';
    const pathsList = projectConfig.tsConfig.paths;
    for (const shortName in pathsList) {
        if (Object.hasOwnProperty.call(pathsList, shortName)) {
            // eg: @app/* : [src/app/*]
            const _path = pathsList[shortName][0].replace('\*', '');
            const _shortName = shortName.replace('\*', '');
            pathResult = filePath.replace(_shortName, _path);
        }
    }
    const checkList = ['./', '../', 'src/'];
    return checkList.some(p => pathResult.startsWith(p));
}

// 返回存在的文件路径
async function getFilePath(filePath) {
    const res = {
        fileType: '',
        filePath: '',
        err: ''
    }
    // 先判断当前路径是否存在正确的后缀
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
            res.err = `已跳过${filePath} ： 1. 不是JS或者TS文件；2. 不存在。`;
        }
    }
    return res;
}

// 初始化
// tsconfig 
function initTsConfigs(configs) {
    projectConfig.tsConfig = JSON.parse(fs.readFileSync(configs.tsConfig).toString());
    projectConfig.tsConfig.paths = projectConfig.tsConfig.compilerOptions.paths;
}