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
    async getPricesFromDay(date) {
        let dayNum = getDayNum(date);
        return await this.runner.tableFromProc('getPricesFromDay', [dayNum]);
    }
}
exports.data = new Data();
//# sourceMappingURL=data.js.map