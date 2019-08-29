"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const sina_1 = require("./sina");
const const_1 = require("../const");
const cheerio = require("cheerio");
async function scanSinaExRight() {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    let runner = await db_1.getRunner(const_1.Const_dbname);
    let sinaer = new SinaExRight(runner);
    try {
        let ret = [];
        let pageStart = 0, pageSize = 100;
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
    console.log('scan Sina Exright completed');
    gfuncs_1.RemoteRun(false);
}
exports.scanSinaExRight = scanSinaExRight;
class SinaExRight {
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
        let url = 'https://money.finance.sina.com.cn/corp/go.php/vISSUE_ShareBonus/stockid/' + code + '.phtml';
        let content = await sina_1.fetchSinaContent(url);
        let promiseArr = [];
        let rows = [];
        let $ = cheerio.load(content);
        $('#sharebonus_1>tbody>tr').map((index, element) => {
            let value = [];
            $(element).find('>td').map((i, e) => {
                value.push($(e).text());
            });
            if (value.length == 9 && value[4] === '实施') {
                let day = gfuncs_1.checkToDateInt(value[5]);
                if (isNaN(day))
                    return;
                let row = [id,
                    day,
                    gfuncs_1.checkNumberNaNToZero(value[1]),
                    gfuncs_1.checkNumberNaNToZero(value[2]),
                    gfuncs_1.checkNumberNaNToZero(value[3]),
                    0, 0];
                rows.push(row);
            }
        });
        $('#sharebonus_2>tbody>tr').map((index, element) => {
            let value = [];
            $(element).find('>td').map((i, e) => {
                value.push($(e).text());
            });
            if (value.length == 11) {
                let day = gfuncs_1.checkToDateInt(value[4]);
                if (isNaN(day))
                    return;
                let pei = gfuncs_1.checkNumberNaNToZero(value[1]);
                let peiPrice = gfuncs_1.checkNumberNaNToZero(value[2]);
                if (pei <= 0 || peiPrice <= 0)
                    return;
                for (let i = 0; i < rows.length; ++i) {
                    let item = rows[i];
                    if (item[1] === day) {
                        item[5] = pei;
                        item[6] = peiPrice;
                        return;
                    }
                }
                let row = [id, day, 0, 0, 0, pei, peiPrice];
                rows.push(row);
            }
        });
        rows.forEach((item) => {
            promiseArr.push(this.runner.call('tv_新浪除权信息$save', item));
        });
        if (promiseArr.length > 0)
            await Promise.all(promiseArr);
        await this.runner.call('tv_计算除权因子', [id]);
        await this.runner.call('c_calculateexrightinfo', [id]);
    }
}
//# sourceMappingURL=cqsina.js.map