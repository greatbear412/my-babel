const fs = require("fs");
const auto_track_plugin = require('../plugins/auto-track-plugin');

const modulesMap = require("../plugins/modules_map");
const path = require('path');

const entry = path.resolve(__dirname, '../src/track.ts');
const tsConfig = path.resolve(__dirname, '../src/tsconfig.json');

modulesMap(entry, [auto_track_plugin], {
    tsConfig
}).then(rlt => {
    fs.writeFile('./dist/index.ts', rlt, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log(rlt);
        }
    });
});