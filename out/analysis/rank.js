"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
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
class ROERank extends Rank {
    async internalSort() {
    }
}
exports.ROERank = ROERank;
class PERank extends Rank {
    async internalSort() {
    }
}
exports.PERank = PERank;
class DividendRank extends Rank {
    async internalSort() {
    }
}
exports.DividendRank = DividendRank;
class ROE_PE_Magic_Rank extends Rank {
    async internalSort() {
        this.queue.splice(0);
        this.map = [];
        let ret = await data_1.data.LoadROE_PE_Magic_Rank(this.date.day, 1000);
        for (let i = 0; i < ret.length; ++i) {
            let item = ret[i];
            let point = new Point(item.stock);
            point.num = item.no;
            point.data = item;
            this.queue.push(point);
            this.map[item.stock] = point;
        }
    }
}
exports.ROE_PE_Magic_Rank = ROE_PE_Magic_Rank;
class ROE_PE_Magic_CheckE_Rank extends Rank {
    async internalSort() {
        this.queue.splice(0);
        this.map = [];
        let ret = await data_1.data.LoadROE_PE_Magic_CheckE_Rank(this.date.day, 1000);
        for (let i = 0; i < ret.length; ++i) {
            let item = ret[i];
            let point = new Point(item.stock);
            point.num = item.no;
            point.data = item;
            this.queue.push(point);
            this.map[item.stock] = point;
        }
    }
}
exports.ROE_PE_Magic_CheckE_Rank = ROE_PE_Magic_CheckE_Rank;
class ROE_PE_Dividend_Rank extends Rank {
    async internalSort() {
        this.queue.splice(0);
        this.map = [];
        let ret = await data_1.data.LoadROE_PE_Dividend_Rank(this.date.day, 1000);
        for (let i = 0; i < ret.length; ++i) {
            let item = ret[i];
            let point = new Point(item.stock);
            point.num = item.no;
            point.data = item;
            this.queue.push(point);
            this.map[item.stock] = point;
        }
    }
}
exports.ROE_PE_Dividend_Rank = ROE_PE_Dividend_Rank;
//# sourceMappingURL=rank.js.map