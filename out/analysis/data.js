"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const const_1 = require("../const");
function getDayNum(date) {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + (date.getDate());
}
class Data {
    async init() {
        this.runner = await db_1.getRunner(const_1.Const_dbname);
    }
    async getPricesFromDay(dayNum) {
        return await this.runner.tableFromProc('getPricesFromDay', [dayNum]);
    }
    async getPeAtDay(stockId, dayNum) {
        return await this.runner.tableFromProc('q_getstockpeatday', [stockId, dayNum]);
    }
    async getTradDays(begin, end) {
        try {
            let sqlStr = `select \`day\`, \`dayno\`, \`year\`, \`seasonno\`, \`monthno\` 
      from t_dayindex where \`day\`>=${begin} and \`day\`<=${end}`;
            let ret = await this.runner.sql(sqlStr, []);
            if (Array.isArray(ret)) {
                return ret;
            }
        }
        catch (e) {
            let a = e;
        }
        return [];
    }
    async getStockDivInfo(stockID, day) {
        let retDiv = await this.runner.call('tv_getstockdivinfoatday', [stockID, day]);
        if (Array.isArray(retDiv) && retDiv.length > 0) {
            let item = retDiv[0];
            return item;
        }
        return undefined;
    }
    async initTypeID(name, dayBegin, dayEnd) {
        let qr = await this.runner.call('tv_emulatetype$save', [undefined, name, dayBegin, dayEnd]);
        let arr = qr;
        if (arr.length > 0) {
            let r = arr[0];
            await this.runner.call('tv_emulatetype$deletedata', [r.id]);
            return r.id;
        }
        return undefined;
    }
    async SaveStatus(typeID, date, money, share, gain) {
        await this.runner.call('tv_emulateresult$save', [typeID, date, money, share, gain]);
    }
    async SaveLastStatus(typeID, gain) {
        await this.runner.call('tv_emulatescore$save', [typeID, gain]);
    }
    async SaveDetail(typeID, day, detail) {
        await this.runner.call('tv_emulateshares$save', [typeID, day, detail]);
    }
    async SaveTrade(p) {
        await this.runner.call('tv_emulatetrade$add', [p.type, p.day, p.stock, p.tradeType, p.price, p.volume]);
    }
    async LoadROE_PE_Dividend_Rank(day, count) {
        return await this.runner.call('tv_calcmagicorderdpr', [day, count]);
    }
    async LoadROE_PE_Rank(day, count) {
        return await this.runner.call('tv_calcmagicorderpr', [day, count]);
    }
    async LoadROE_PE_Magic_Rank(day, count) {
        return await this.runner.call('tv_calcmagicorder2', [day, count]);
    }
    async LoadROE_PE_Magic_CheckE_Rank(day, count) {
        return await this.runner.call('tv_calcmagicorder3', [day, count]);
    }
}
exports.data = new Data();
//# sourceMappingURL=data.js.map