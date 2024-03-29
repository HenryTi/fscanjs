"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
const data_1 = require("../data");
const rank_1 = require("./rank");
=======
const rank_1 = require("./rank");
const data_1 = require("../data");
>>>>>>> 50d992f73f6a20bf7dc9bc563e95ea3c55e51a8f
class ROE_PE_Dividend_Rank extends rank_1.Rank {
    async internalSort() {
        this.queue.splice(0);
        this.map = [];
        let ret = await data_1.data.LoadROE_PE_Dividend_Rank(this.date.day, 1000);
        for (let i = 0; i < ret.length; ++i) {
            let item = ret[i];
            let point = new rank_1.Point(item.stock);
            point.num = item.no;
            point.data = item;
            this.queue.push(point);
            this.map[item.stock] = point;
        }
    }
}
exports.ROE_PE_Dividend_Rank = ROE_PE_Dividend_Rank;
//# sourceMappingURL=ROE_PE_Dividend_Rank.js.map