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
    sort(date, prices, reports) {
        this.date = date;
        this.prices = prices;
        this.reports = reports;
        this.internalSort();
    }
    internalSort() {
    }
}
exports.Rank = Rank;
class ROERank extends Rank {
    internalSort() {
    }
}
exports.ROERank = ROERank;
class PERank extends Rank {
    internalSort() {
    }
}
exports.PERank = PERank;
class DividendRank extends Rank {
    internalSort() {
    }
}
exports.DividendRank = DividendRank;
class ROE_PE_Rank extends Rank {
    internalSort() {
    }
}
exports.ROE_PE_Rank = ROE_PE_Rank;
class ROE_PE_Dividend_Rank extends Rank {
    internalSort() {
    }
}
exports.ROE_PE_Dividend_Rank = ROE_PE_Dividend_Rank;
//# sourceMappingURL=rank.js.map