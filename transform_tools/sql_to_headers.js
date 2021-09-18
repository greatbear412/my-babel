const sql_to_headers = function (sourceCode) {
    const content = sourceCode.split(',');
    const rlt = [];
    content.map((item, index) => {
        try {
            const action = item.match(/`.*`/)[0].replace(/`/g, "'");
            const title = item.match(/'.*'/)[0];
            const r = {
                title: title,
                action: action,
                type: 'input',
                valid: true
            };

            // select
            const selectList = [
                '品牌', '架构', '类型', '型号', '接口'
            ]
            if (selectList.filter(item => title.indexOf(item) > -1).length) {
                r.options = [];
                r.type = 'select'
            }

            // date
            const dateList = [
                '日期', '时间'
            ]
            if (dateList.filter(item => title.indexOf(item) > -1).length) {
                r.type = 'date'
            }

            // Rlt
            rlt.push(r);
        } catch (error) {
            console.log(error);
            console.log(item, index);
        }

    })
    return rlt;
}

module.exports = sql_to_headers;