"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
let tradeDayMaps = {};
let tradeDayNoMaps = {};
let tradeDays = [];
async function initTradeDay(begin, end) {
    tradeDays = await data_1.data.getTradDays(begin, end);
    for (let item of tradeDays) {
        tradeDayMaps[item.day] = item;
        tradeDayNoMaps[item.dayno] = item;
    }
}
exports.initTradeDay = initTradeDay;
function getNextTradeDay(day) {
    let r = tradeDayMaps[day];
    if (r !== undefined) {
        return tradeDayNoMaps[r.dayno + 1];
    }
    for (let i = 0; i < tradeDays.length; ++i) {
        let item = tradeDays[i];
        if (item.day >= day) {
            return item;
        }
    }
    return undefined;
}
exports.getNextTradeDay = getNextTradeDay;
function tradeDayToNext(tradeDay) {
    return tradeDayNoMaps[tradeDay.dayno + 1];
}
exports.tradeDayToNext = tradeDayToNext;
function getTradeDayAt(day) {
    return tradeDayMaps[day];
}
exports.getTradeDayAt = getTradeDayAt;
function getLastTradeDay(day) {
    for (let i = 0; i < tradeDays.length; ++i) {
        let item = tradeDays[i];
        if (item.day >= day) {
            if (i > 0) {
                return tradeDays[i - 1];
            }
            break;
        }
    }
    return undefined;
}
exports.getLastTradeDay = getLastTradeDay;
function getTrdaeDayDif(begin, end) {
    let bi;
    let i = 0;
    for (; i < tradeDays.length; ++i) {
        let item = tradeDays[i];
        if (item.day >= begin) {
            bi = item;
            break;
        }
    }
    for (; i < tradeDays.length; ++i) {
        let item = tradeDays[i];
        if (item.day >= end) {
            if (bi !== undefined) {
                return item.dayno - bi.dayno;
            }
            break;
        }
    }
    return undefined;
}
exports.getTrdaeDayDif = getTrdaeDayDif;
//# sourceMappingURL=tradeday.js.map