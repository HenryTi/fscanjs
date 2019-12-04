"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
class Price {
}
exports.Price = Price;
class Prices {
    constructor() {
        this.map = {};
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
}
exports.Prices = Prices;
//# sourceMappingURL=price.js.map