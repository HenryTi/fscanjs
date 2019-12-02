"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Estimate {
    constructor(stockId, report, date, price) {
        this.stockId = stockId;
        this.report = report;
        this.date = date;
        this.price = price;
    }
}
exports.Estimate = Estimate;
class Estimates {
    constructor(date) {
        this.map = {};
        this.date = date;
    }
}
exports.Estimates = Estimates;
//# sourceMappingURL=estimate.js.map