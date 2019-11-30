"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sina_1 = require("./scan/sina");
const cheerio = require("cheerio");
const z = require("zlib");
const calcuallpeavg_1 = require("./emulatefull/calcuallpeavg");
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
async function calculateLastOne(code, runner) {
    try {
        let { id } = code;
        let dt = new Date();
        let year = dt.getFullYear();
        let day = year * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
        let dayBegin = year * 10000 + 101;
        let ret = await runner.query('tv_股票分红$query', [id, dayBegin, day]);
        let bonus = 0;
        if (ret === undefined || ret.length < 1) {
            year = year - 1;
            dayBegin = year * 10000 + 101;
            day = year * 10000 + 1231;
            ret = await runner.query('t_exrightinfo$query', [id, dayBegin, day]);
            if (!(ret === undefined || ret.length < 1)) {
                for (let i = 0; i < ret.length; ++i) {
                    let item = ret[i];
                    if (item.bonus > 0) {
                        bonus += item.bonus;
                    }
                    bonus = bonus * item.factore;
                }
            }
        }
        else {
            ret = await runner.query('t_exrightinfo$query', [id, dayBegin, day]);
            if (!(ret === undefined || ret.length < 1)) {
                for (let i = 0; i < ret.length; ++i) {
                    let item = ret[i];
                    if (item.bonus > 0) {
                        let bi = item.bonus;
                        if (i > 0) {
                            for (let j = i - 1; j >= 0; --j) {
                                let di = ret[j];
                                bi = bi / di.factore;
                            }
                        }
                        bonus += bi;
                    }
                }
            }
        }
        if (bonus > 0) {
            await runner.call('t_最近年分红$save', [id, year, bonus]);
        }
    }
    catch (err) {
        console.log(err);
    }
}
async function testa() {
    //let runner = await getRunner(Const_dbname);
    //await emulateTrade61(2010, 1, 2019, 1);
    await calcuallpeavg_1.CalculateAllPeAvg();
    debugger;
}
testa();
//# sourceMappingURL=runtest.js.map