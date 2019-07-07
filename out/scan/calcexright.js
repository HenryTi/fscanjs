"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
const db_1 = require("../db");
async function caclulateExRight() {
    let runner = await db_1.getRunner(const_1.Const_dbname);
    let sinaer = new CalculateSinaExRight(runner);
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
    console.log('calculate Exrightinfo completed');
}
exports.caclulateExRight = caclulateExRight;
class CalculateSinaExRight {
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
        console.log('calculate sinaExRight onegroup : ' + items.length);
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
            console.log(err);
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
        await this.runner.call('c_calculateexrightinfo', [id]);
    }
}
//# sourceMappingURL=calcexright.js.map