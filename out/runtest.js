"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sina_1 = require("./scan/sina");
const cheerio = require("cheerio");
const z = require("zlib");
const db_1 = require("./db");
const const_1 = require("./const");
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
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
async function testa() {
    let run = await db_1.getRunner(const_1.Const_dbname);
    debugger;
}
testa();
//# sourceMappingURL=runtest.js.map