"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sina_1 = require("./scan/sina");
const cheerio = require("cheerio");
const sinafiles_1 = require("./scan/sinafiles");
const z = require("zlib");
const timedtask_1 = require("./timedtask");
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
timedtask_1.startTimer();
async function testZip() {
    let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_CashFlow/stockid/'
        + '600000' + '/ctrl/' + '2018' + '/displaytype/4.phtml';
    let cont = await sina_1.fetchSinaContent(urlone);
    let row = [];
    let $ = cheerio.load(cont);
    $('#ProfitStatementNewTable0').find('>tbody').first().find('>tr')
        .map((index, element) => {
        let subarr = [];
        $(element).find('>td').map((index, element) => {
            subarr.push($(element).text().trim());
        });
        row.push(subarr);
    });
    let contentStr = JSON.stringify(row);
    let contentLen = contentStr.length;
    let buf = z.gzipSync(contentStr);
    let bufstr = buf.toString('base64');
    let bufstrLen = bufstr.length;
    let bufJson = buf.toJSON();
    let b = Buffer.from(bufstr, 'base64');
    let bunzip = z.gunzipSync(b);
    let unzipstr = bunzip.toString();
}
testZip();
async function scansina() {
    await sinafiles_1.scanSinaFiles(0, true, 'finance');
    await sinafiles_1.scanSinaFiles(0, true, 'balancesheet');
    await sinafiles_1.scanSinaFiles(0, true, 'profitstatement');
    await sinafiles_1.scanSinaFiles(0, true, 'stockstructure');
}
//scansina();
//caclulateExRight();
//emulateTradeMonthChange();
//# sourceMappingURL=runtest.js.map