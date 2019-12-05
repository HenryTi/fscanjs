"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
class Recorder {
    constructor(name, dayBegin, dayEnd) {
        this.trades = [];
        this.status = {};
        this.laststatus = { gain: 1 };
        this.details = [];
        this.name = name;
        this.dayBegin = dayBegin;
        this.dayEnd = dayEnd;
    }
    async init() {
        this.typeID = await data_1.data.initTypeID(this.name, this.dayBegin.day, this.dayEnd.day);
    }
    async saveTrade(p) {
        this.trades.push(p);
    }
    async SaveStatus(money, date, share, gain) {
        this.laststatus.gain = gain;
        let dayIndex = Math.floor(date.day / 100);
        this.status[dayIndex] = { money: money, share: share, gain: gain };
    }
    async SaveDetails(date, detail) {
        this.details.push({ day: date.day, detail: detail });
    }
    async flush() {
        await data_1.data.SaveLastStatus(this.typeID, this.laststatus.gain);
        for (let p of this.trades) {
            await data_1.data.SaveTrade(p);
        }
        let keys = Object.keys(this.status);
        for (let dayIndex of keys) {
            let item = this.status[dayIndex];
            let { money, share, gain } = item;
            let day = parseInt(dayIndex);
            await data_1.data.SaveStatus(this.typeID, day, money, share, gain);
        }
        for (let dItem of this.details) {
            await data_1.data.SaveDetail(this.typeID, dItem.day, dItem.detail);
        }
    }
}
exports.Recorder = Recorder;
//# sourceMappingURL=recorder.js.map