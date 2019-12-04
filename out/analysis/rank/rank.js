"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Point {
    constructor(stockId) {
        this.stockId = stockId;
    }
}
exports.Point = Point;
class Rank {
    constructor() {
        this.queue = [];
    }
    async sort(date, prices, reports) {
        if (this.date !== undefined && this.date.day === date.day)
            return;
        this.date = date;
        this.prices = prices;
        this.reports = reports;
        await this.internalSort();
    }
    async internalSort() {
    }
}
exports.Rank = Rank;
//# sourceMappingURL=rank.js.map