"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const sina_1 = require("./sina");
const const_1 = require("../const");
async function scanSinaQuotations() {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let dt = new Date();
        console.log('scanSinaQuotations begin  - ' + dt.toLocaleString());
        let ret = [];
        let pageStart = 0, pageSize = 500;
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
        let i, j;
        let retryArr = [];
        let oneGroup = [];
        i = 0;
        let totalCount = 0;
        for (;;) {
            if (i >= count) {
                break;
            }
            let code = ret[i];
            oneGroup.push(code);
            ++i;
            if (oneGroup.length >= 30 || i >= count) {
                let gv = oneGroup;
                oneGroup = [];
                let sqg = new SinaQuotationGroup(runner);
                let r = await sqg.processOneGroup(gv);
                if (r != 1) {
                    retryArr.push(gv);
                }
                else {
                    totalCount += gv.length;
                }
            }
        }
        count = retryArr.length;
        for (i = 0; i < count; ++i) {
            let gv = retryArr[i];
            for (j = 0; j < 10; ++j) {
                await gfuncs_1.sleep(3000);
                let sqg = new SinaQuotationGroup(runner);
                let r = await sqg.processOneGroup(gv);
                if (r == 1) {
                    totalCount += gv.length;
                    break;
                }
            }
        }
        dt = new Date();
        console.log('scanSinaQuotations end  - ' + dt.toLocaleString());
    }
    catch (err) {
        console.log(err);
    }
    gfuncs_1.RemoteRun(false);
}
exports.scanSinaQuotations = scanSinaQuotations;
class SinaQuotationGroup {
    constructor(runner) {
        this.runner = runner;
        this.idTable = {};
    }
    async processOneGroup(items) {
        try {
            this.idTable = {};
            let lstr = '';
            items.forEach((value, index) => {
                let { symbol } = value;
                lstr += ',' + symbol;
                let idname = symbol;
                this.idTable[idname] = value;
            });
            if (lstr.length <= 1)
                return 1;
            let url = 'https://hq.sinajs.cn/list=' + lstr.substring(1);
            let results = await this.fetchString(url);
            if (results === null || results === undefined) {
                results = await this.fetchString(url);
            }
            if (results === null || results === undefined) {
                results = await this.fetchString(url);
            }
            await this.saveQutations(results);
        }
        catch (err) {
            return 0;
        }
        return 1;
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
    async saveQutations(values) {
        let lines = values.split('\n');
        let promiseArr = [];
        let i;
        let count = lines.length;
        for (i = 0; i < count; ++i) {
            let line = lines[i];
            if (line.length <= 0)
                break;
            let arr = line.split('=');
            let head = arr[0].substring(11);
            let subarr = arr[1].split('"');
            let items = subarr[1].split(',');
            if (items.length < 6)
                continue;
            let idItem = this.idTable[head];
            let row = this.getQuotatonRow(idItem, items);
            if (row === undefined)
                throw 'hqsina 返回格式错误';
            if (row[3] === '0.000')
                continue;
            promiseArr.push(this.runner.call('tv_股票价格$save', row));
            promiseArr.push(this.calculateExPrice(row));
        }
        if (promiseArr.length > 0) {
            await Promise.all(promiseArr);
        }
    }
    getQuotatonRow(idItem, arr) {
        let { id, market } = idItem;
        let row = [id];
        let date;
        switch (market) {
            default:
                date = gfuncs_1.checkToDateInt(arr[30]);
                if (date === undefined)
                    return undefined;
                row.push(date);
                row.push(arr[3]);
                row.push(arr[1]);
                row.push(arr[4]);
                row.push(arr[5]);
                break;
            case 'HK':
                date = gfuncs_1.checkToDateInt(arr[17]);
                if (date === undefined)
                    return undefined;
                row.push(date);
                row.push(arr[6]);
                row.push(arr[2]);
                row.push(arr[4]);
                row.push(arr[5]);
                break;
        }
        return row;
    }
    async calculateExPrice(item) {
        try {
            let id = item[0];
            let row = [id];
            row.push(item[1]);
            row.push(item[2]);
            let day = Number.parseInt(item[1]);
            let price = Number.parseFloat(item[2]);
            let priceEx = price;
            let year = Math.floor(day / 10000);
            let dayBegin = year.toString() + '0101';
            let ret = await this.runner.query('t_exrightinfo$query', [id, dayBegin, day]);
            if (!(ret === undefined || ret.length < 1)) {
                let bonus = 0;
                for (let i = 0; i < ret.length; ++i) {
                    let fitem = ret[i];
                    let e = fitem.factor;
                    let e2 = fitem.factore;
                    if (e === 0 || e2 === 0)
                        continue;
                    bonus += fitem.bonus;
                    priceEx = priceEx / e;
                    bonus = bonus / e2;
                }
                priceEx += bonus;
            }
            await this.runner.call('t_股票价格复权$save', [id, day, price, priceEx]);
        }
        catch (error) {
            let e = error;
        }
    }
}
//# sourceMappingURL=hqsina.js.map