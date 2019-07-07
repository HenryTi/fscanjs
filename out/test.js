"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sina_1 = require("./scan/sina");
const cheerio = require("cheerio");
async function doTest() {
    //let runner: Runner = await getRunner(Const_dbname);
    //let pret = await runner.mapQuery('新浪财务指标', DefaultUnit, undefined, [1, undefined, 12]);
    //debugger;
}
exports.doTest = doTest;
async function scanItem(item) {
    let { symbol, code } = item;
    let url = 'https://money.finance.sina.com.cn/corp/go.php/vISSUE_ShareBonus/stockid/' + code + '.phtml';
    let content = await sina_1.fetchSinaContent(url);
    try {
        let $ = cheerio.load(content);
        let t1 = $('#sharebonus_1>td');
        let tableOne = $('#sharebonus_1 > tbody');
        tableOne.find('>tr').map((index, element) => {
            let value = [];
            $(element).find('>td').map((i, e) => {
                value.push($(e).text());
            });
            let d = 1;
        });
        let arr = tableOne.find('>td');
        let tableTwo = $('#sharebonus_2 tbody');
        let arr2 = tableTwo.find('>tr');
        let a = 1;
        $('#sharebonus_2>tbody>tr').map((index, element) => {
            let value = [];
            $(element).find('>td').map((i, e) => {
                value.push($(e).text());
            });
            let bb = 1;
        });
    }
    catch (err) {
        let e = err;
    }
}
//# sourceMappingURL=test.js.map