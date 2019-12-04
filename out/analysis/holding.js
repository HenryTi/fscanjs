"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Holding {
    constructor(stockId) {
        this.stockId = stockId;
        this.list = [];
    }
    add(buyDate, buyPrice, volume, amount, level = 1, count = 1) {
        this.list.push({
            buyDate: buyDate,
            buyPrice: buyPrice,
            volume: volume,
            amount: amount,
            level: level,
            count: count
        });
    }
    remove(buyDate, level) {
        let index = this.list.findIndex(v => v.buyDate === buyDate && v.level === level);
        if (index >= 0)
            this.list.splice(index, 1);
    }
    getTotalCount() {
        let count = 0;
        for (let item of this.list) {
            count += item.count;
        }
        return count;
    }
}
exports.Holding = Holding;
//# sourceMappingURL=holding.js.map