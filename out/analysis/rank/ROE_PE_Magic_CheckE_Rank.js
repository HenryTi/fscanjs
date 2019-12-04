"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rank_1 = require("./rank");
const data_1 = require("../data");
class ROE_PE_Magic_CheckE_Rank extends rank_1.Rank {
    async internalSort() {
        this.queue.splice(0);
        this.map = [];
        let ret = await data_1.data.LoadROE_PE_Magic_CheckE_Rank(this.date.day, 1000);
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
exports.ROE_PE_Magic_CheckE_Rank = ROE_PE_Magic_CheckE_Rank;
//# sourceMappingURL=ROE_PE_Magic_CheckE_Rank.js.map