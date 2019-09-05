"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const sina_1 = require("./sina");
const const_1 = require("../const");
const cheerio = require("cheerio");
async function scanSinaFinance(start, scanAll = false) {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    console.log(`scanSinaFinance Begin`);
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let sinaer = new SinaFinace(runner, scanAll);
        let ret = [];
        let pageStart = start, pageSize = 100;
        for (;;) {
            let ids = await runner.query('tv_股票$search', ['', pageStart, pageSize]);
            let arr = ids;
            if (arr.length > pageSize) {
                let top = arr.pop();
                pageStart = arr[pageSize - 1].id;
                await sinaer.processGroup(arr);
            }
            else {
                if (arr.length > 0) {
                    await sinaer.processGroup(arr);
                }
                break;
            }
        }
        await sinaer.processRetry();
    }
    catch (err) {
        console.log(err);
    }
    console.log(`scanSinaFinance End`);
    gfuncs_1.RemoteRun(false);
}
exports.scanSinaFinance = scanSinaFinance;
function parseToDate(str) {
    let r = { year: 0, month: 0, day: 0 };
    let s = str.split('-');
    r.year = parseInt(s[0]);
    r.month = parseInt(s[1]);
    r.day = parseInt(s[2]);
    if (isNaN(r.year) || isNaN(r.month) || isNaN(r.day))
        return undefined;
    return r;
}
function checkparseNumber(s) {
    if (s == '--')
        return undefined;
    let ret = Number(s);
    if (isNaN(ret))
        return undefined;
    return ret;
}
class SinaFinace {
    constructor(runner, scanAll) {
        this.runner = runner;
        this.scanAll = scanAll;
        this.retryArr = [];
    }
    async processGroup(items) {
        if (items.length <= 0)
            return;
        for (let i = 0; i < items.length; ++i) {
            let item = items[i];
            await this.processOne(item);
        }
    }
    async processRetry() {
        for (let index = 0; index < this.retryArr.length; ++index) {
            let item = this.retryArr[index];
            for (let i = 0; i < 5; ++i) {
                let r = await this.retryOne(item);
                if (r)
                    break;
                else
                    gfuncs_1.sleep(3000);
            }
        }
    }
    async processOne(item) {
        try {
            await this.scanItem(item);
        }
        catch (err) {
            this.retryArr.push(item);
            return false;
        }
        return true;
    }
    async retryOne(item) {
        try {
            await this.scanItem(item);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    async scanItem(item) {
        let { id } = item;
        let ret = await this.runner.query('t_stockarchives$query', [id, '新浪财务指标', null]);
        if (ret === undefined || ret.length <= 0) {
            return;
        }
        for (let i = 0; i < ret.length; ++i) {
            let item = ret[i];
            await this.scanOneYear(id, item);
        }
    }
    async checkDataExist(id, year) {
        let ret = await this.runner.query('tv_新浪财务指标$query', [id, year, 12]);
        if (ret === undefined || ret.length < 1) {
            return false;
        }
        return true;
    }
    async scanOneYear(id, item) {
        let { name, text } = item;
        let year = name;
        if (!this.scanAll) {
            let fcheck = await this.checkDataExist(id, year);
            if (fcheck) {
                return;
            }
        }
        let values = JSON.parse(text);
        let row = values;
        if (row.length < 11)
            return;
        let dateArr = row[0];
        for (let k = 1; k < dateArr.length; ++k) {
            let nitem = [id];
            let date = parseToDate(dateArr[k]);
            if (date === undefined)
                break;
            nitem.push(date.year);
            nitem.push(date.month);
            let findData = false;
            for (let ni = 2; ni < 11; ++ni) {
                let s = row[ni][k];
                let value = checkparseNumber(s);
                if (value !== undefined)
                    findData = true;
                nitem.push(value);
            }
            if (findData) {
                await this.runner.query('tv_新浪财务指标$save', nitem);
            }
        }
    }
}
exports.SinaFinace = SinaFinace;
class SinaFinaceFromWeb {
    constructor(runner) {
        this.runner = runner;
        this.retryArr = [];
    }
    async processGroup(items) {
        if (items.length <= 0)
            return;
        for (let i = 0; i < items.length; ++i) {
            let item = items[i];
            await this.processOne(item);
        }
    }
    async processRetry() {
        for (let index = 0; index < this.retryArr.length; ++index) {
            let item = this.retryArr[index];
            for (let i = 0; i < 5; ++i) {
                let r = await this.retryOne(item);
                if (r)
                    break;
                else
                    gfuncs_1.sleep(3000);
            }
        }
    }
    async processOne(item) {
        try {
            await this.scanItem(item);
        }
        catch (err) {
            this.retryArr.push(item);
            return false;
        }
        return true;
    }
    async retryOne(item) {
        try {
            await this.scanItem(item);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    async scanItem(item) {
        let { id, symbol, code } = item;
        let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
            + code + '/displaytype/4.phtml';
        let content = await sina_1.fetchSinaContent(url);
        let promiseArr = [];
        let years = [];
        let $ = cheerio.load(content);
        $('#con02-1').find('>table').first().find('>tbody').first().find('>tr').first().find('a')
            .map((index, element) => {
            years.push($(element).text());
        });
        for (let i = 0; i < years.length; ++i) {
            let year = years[i].trim();
            let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
                + code + '/ctrl/' + year + '/displaytype/4.phtml';
            let cont = await sina_1.fetchSinaContent(urlone);
            let row = [];
            let $ = cheerio.load(cont);
            $('#BalanceSheetNewTable0').find('>tbody').first().find('>tr')
                .map((index, element) => {
                let subarr = [];
                $(element).find('>td').map((index, element) => {
                    subarr.push($(element).text());
                });
                row.push(subarr);
            });
            if (row.length < 11)
                continue;
            let dateArr = row[0];
            for (let k = 1; k < dateArr.length; ++k) {
                let nitem = [id];
                let date = parseToDate(dateArr[k]);
                if (date === undefined)
                    break;
                nitem.push(date.year);
                nitem.push(date.month);
                let findData = false;
                for (let ni = 2; ni < 11; ++ni) {
                    let s = row[ni][k];
                    let value = checkparseNumber(s);
                    if (value !== undefined)
                        findData = true;
                    nitem.push(value);
                }
                if (findData) {
                    await this.runner.query('tv_新浪财务指标$save', nitem);
                }
            }
        }
        console.log('scan sinaFinance, code: ' + id + ' - ' + symbol);
    }
}
//# sourceMappingURL=financesina.js.map