"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const sina_1 = require("./sina");
const const_1 = require("../const");
async function scanSinaHistory(len, start) {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let sqg = new SinaHistory(runner);
        let dt = new Date();
        console.log('scanSinaHistory begin  - ' + dt.toLocaleString());
        let ret = [];
        let pageStart = start, pageSize = 500;
        for (;;) {
            let ids = await runner.query('tv_股票$search', ['', pageStart, pageSize]);
            let arr = ids;
            if (arr.length > pageSize) {
                let top = arr.pop();
                ret.push(...arr);
                pageStart = arr[pageSize - 1].id;
            }
            else {
                ret.push(...arr);
                break;
            }
        }
        let count = ret.length;
        console.log('stock count = ' + count);
        let i, j;
        let retryArr = [];
        i = 0;
        for (;;) {
            if (i >= count) {
                break;
            }
            let code = ret[i];
            ++i;
            let r = await sqg.processOne(code, len);
            if (!r) {
                retryArr.push(code);
            }
            await gfuncs_1.sleep(1500);
        }
        count = retryArr.length;
        for (i = 0; i < count; ++i) {
            let rc = retryArr[i];
            for (j = 0; j < 10; ++j) {
                await gfuncs_1.sleep(3000);
                let r = await sqg.processOne(rc, len);
                if (r) {
                    console.log('sinahistory retry: ' + rc['symbol']);
                    break;
                }
            }
        }
        await runner.call('c_updatedayindex', []);
        dt = new Date();
        console.log('scanSinaHistory end - ' + dt.toLocaleString());
    }
    catch (err) {
        console.log(err);
    }
    gfuncs_1.RemoteRun(false);
}
exports.scanSinaHistory = scanSinaHistory;
class SinaHistory {
    constructor(runner) {
        this.runner = runner;
    }
    async processOne(item, len) {
        try {
            let { id, symbol } = item;
            let url = 'https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?scale=240&ma=5&symbol='
                + symbol + '&datalen=' + len;
            let results = await this.fetchString(url);
            if (results === null || results === undefined) {
                results = await this.fetchString(url);
            }
            if (results === null || results === undefined) {
                results = await this.fetchString(url);
            }
            await this.saveHistory(id, results);
        }
        catch (err) {
            console.log("fetch sina history err " + item.symbol);
            return false;
        }
        return true;
    }
    async fetchString(url) {
        try {
            let ret = await sina_1.fetchSinaContent(url);
            return ret;
        }
        catch (err) {
            console.log(err);
            return undefined;
        }
    }
    async saveHistory(id, values) {
        let lines = eval(values);
        let promiseArr = [];
        let i;
        let count = lines.length;
        for (i = 0; i < count; ++i) {
            let item = lines[i];
            let { day, open, high, low, close, volume } = item;
            let date = gfuncs_1.checkToDateInt(day);
            if (date === undefined)
                continue;
            let row = [id, date, close, open, high, low, volume];
            if (date < 19950101)
                continue;
            promiseArr.push(this.runner.call('tv_股票价格历史$save', row));
            if (promiseArr.length >= 200) {
                await Promise.all(promiseArr);
                promiseArr.splice(0, promiseArr.length);
            }
        }
        if (promiseArr.length > 0) {
            await Promise.all(promiseArr);
        }
    }
}
//# sourceMappingURL=historysina.js.map