"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Holding {
    constructor(stockId) {
        this.stockId = stockId;
        this.list = [];
    }
    add(buyDate, buyPrice, numShares, amount) {
        this.list.push({
            buyDate: buyDate,
            buyPrice: buyPrice,
            numShares: numShares,
            amount: amount,
        });
    }
    remove(buyDate) {
        let index = this.list.findIndex(v => v.buyDate === buyDate);
        if (index >= 0)
            this.list.splice(index, 1);
    }
}
exports.Holding = Holding;
//# sourceMappingURL=holding.js.map