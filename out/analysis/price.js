"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
class Price {
}
exports.Price = Price;
class Prices {
    async load(date) {
        this.date = date;
        this.map = {};
        let arr = await data_1.data.getPricesFromDay(date);
        this.count = arr.length;
        for (let item of arr) {
            let { id, price } = item;
            this.map[id] = price;
        }
    }
}
exports.Prices = Prices;
//# sourceMappingURL=price.js.map