"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const sina_1 = require("./sina");
const const_1 = require("../const");
async function scanSinaSymbols() {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let dt = new Date();
        console.log('scanSinaSymbols begin  - ' + dt.toLocaleString());
        let sinaSym = new SinaSymbols(runner);
        await sinaSym.GetHS_A();
        await runner.call('t_updatestockstomi', []);
        dt = new Date();
        console.log('scanSinaSymbols end  - ' + dt.toLocaleString());
    }
    catch (err) {
        console.log(err);
    }
    gfuncs_1.RemoteRun(false);
}
exports.scanSinaSymbols = scanSinaSymbols;
class SinaSymbols {
    constructor(runner) {
        this.runner = runner;
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
    async GetHS_A() {
        let hsaCount = await this.getHSACount();
        let readCount = 0;
        let page = 1;
        let retryArr = [];
        while (readCount < hsaCount) {
            let r = await this.GetHSAOnePage(page);
            if (!r) {
                retryArr.push(page);
            }
            else {
                //console.log('sinasymbols hsa page : ' + page);
            }
            ++page;
            readCount += 80;
        }
        let count = retryArr.length;
        for (let i = 0; i < count; ++i) {
            let p = retryArr[i];
            for (let j = 0; j < 10; ++j) {
                await gfuncs_1.sleep(3000);
                let r = await this.GetHSAOnePage(p);
                ;
                if (r) {
                    //console.log('sinasymbols hsa page : ' + p);
                    break;
                }
            }
        }
    }
    async GetHSAOnePage(page) {
        try {
            let url = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?num=80&sort=symbol&asc=1&node=hs_a&page=' + page;
            let content = await sina_1.fetchSinaContent(url);
            let c = eval(content);
            if (c === undefined || c === null)
                return false;
            return this.saveHSAOnePage(c);
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    async getHSACount() {
        try {
            let url = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount?node=hs_a';
            let str = await sina_1.fetchSinaContent(url);
            let nstr = eval(str);
            console.log('hs_a count: ' + nstr);
            return Number(nstr);
        }
        catch (err) {
            console.log(err);
            return -1;
        }
    }
    async saveHSAOnePage(arr) {
        let i;
        let count = arr.length;
        for (i = 0; i < count; ++i) {
            let item = arr[i];
            let { symbol, code, name } = item;
            symbol = symbol.toLowerCase().substring(0, 16);
            if (symbol.length < 4)
                continue;
            name = name.substring(0, 32);
            let market = symbol.substring(0, 2).toUpperCase();
            let row = [undefined, symbol, market, code, name, undefined];
            await this.runner.call('tv_股票$save', row);
        }
        return true;
    }
}
//# sourceMappingURL=symbolsina.js.map