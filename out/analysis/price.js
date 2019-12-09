"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
class Price {
}
exports.Price = Price;
class PeAtDay {
}
exports.PeAtDay = PeAtDay;
class Prices {
    constructor() {
        this.map = {};
        this.pemap = {};
    }
    async load(tradeDay) {
        let { day } = tradeDay;
        this.day = day;
        let arr = await data_1.data.getPricesFromDay(day);
        this.count = arr.length;
        for (let item of arr) {
            let { id, price, open } = item;
            this.map[id] = { day: day, price: price, open: open };
        }
    }
    async getPe(stockId, day) {
        let item = this.pemap[stockId];
        if (item !== undefined && item.day === day) {
            return item;
        }
        else {
            let r = await data_1.data.getPeAtDay(stockId, day);
            if (r.length <= 0) {
                item = { day: day, pe: undefined };
            }
            else {
                item = { day: day, pe: r[0].pe };
            }
            this.pemap[stockId] = item;
            return item;
        }
    }
}
exports.Prices = Prices;
//# sourceMappingURL=price.js.map