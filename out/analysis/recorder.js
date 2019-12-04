"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
class Recorder {
    constructor(name, dayBegin, dayEnd) {
        this.name = name;
        this.dayBegin = dayBegin;
        this.dayEnd = dayEnd;
    }
    async init() {
        this.typeID = await data_1.data.initTypeID(this.name, this.dayBegin.day, this.dayEnd.day);
    }
    async saveTrade(p) {
        await data_1.data.SaveTrade(p);
    }
    async SaveStatus(money, date, share, gain) {
        await data_1.data.SaveStatus(this.typeID, Math.floor(date.day / 100), money, share, gain);
    }
    async SaveDetails(date, detail) {
        await data_1.data.SaveDetail(this.typeID, date.day, detail);
    }
}
exports.Recorder = Recorder;
//# sourceMappingURL=recorder.js.map