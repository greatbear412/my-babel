const sql_to_headers = function (sourceCode) {
    const content = sourceCode.split(',');
    const rlt = [];
    content.map((item, index) => {
        try {
            const title = item.match(/`.*`/)[0].replace(/`/g, "'");
            const action = item.match(/'.*'/)[0];
            const r = {
                title: title,
                action: action,
                type: 'input',
                valid: true
            };
            if (item.indexOf('selecttttt') > -1) {
                r.options = [];
                r.type = 'select'
            }
            rlt.push(r);
        } catch (error) {
            console.log(error);
            console.log(item, index);
        }

    })
    return rlt;
}

module.exports = sql_to_headers;