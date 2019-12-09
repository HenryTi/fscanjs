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
    get topPE() {
        return this.topPEavg;
    }
    getOrder(stockId) {
        let item = this.map[stockId];
        if (item === undefined)
            return -1;
        return item.num;
    }
    async getAt(date, prices, reports) {
        if (this.date !== undefined && this.date.day === date.day)
            return;
        this.date = date;
        this.prices = prices;
        this.reports = reports;
        await this.internalSort();
        this.calculateAVG();
    }
    async internalSort() {
    }
    calculateAVG() {
        let points = this.queue.slice(0, 50);
        let count = 0;
        let sum = 0;
        for (let item of points) {
            let data = item.data;
            if (data !== undefined) {
                sum += data.pe;
                ++count;
            }
        }
        if (count <= 0) {
            this.topPEavg = 0;
        }
        else {
            this.topPEavg = sum / count;
        }
    }
}
exports.Rank = Rank;
//# sourceMappingURL=rank.js.map