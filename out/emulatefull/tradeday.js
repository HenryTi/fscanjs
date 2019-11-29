"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let tradeDays = [];
async function initTradeDay(runner, begin, end) {
    try {
        let sqlStr = `select \`day\`, \`dayno\`, \`year\`, \`seasonno\`, \`monthno\` 
from t_dayindex where \`day\`>=${begin} and \`day\`<=${end}`;
        let ret = await runner.sql(sqlStr, []);
        if (Array.isArray(ret)) {
            tradeDays = ret;
        }
    }
    catch (e) {
        let a = e;
    }
}
exports.initTradeDay = initTradeDay;
function getNextTradeDay(day) {
    for (let i = 0; i < tradeDays.length; ++i) {
        let item = tradeDays[i];
        if (item.day > day)
            return item;
    }
    return undefined;
}
exports.getNextTradeDay = getNextTradeDay;
function getTradeDayAt(day) {
    for (let i = 0; i < tradeDays.length; ++i) {
        let item = tradeDays[i];
        if (item.day >= day)
            return item;
    }
    return undefined;
}
exports.getTradeDayAt = getTradeDayAt;
function getLastTradeDay(day) {
    for (let i = 0; i < tradeDays.length; ++i) {
        let item = tradeDays[i];
        if (item.day >= day) {
            if (i > 0) {
                return tradeDays[i - 1].day;
            }
            break;
        }
    }
    return day;
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