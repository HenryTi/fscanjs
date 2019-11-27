"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tradeday_1 = require("./tradeday");
async function checkBuyNew(et) {
    if (et.weekBuyCount >= 3 || et.emuDetails.moneyCount <= 0)
        return;
    let lastDay = tradeday_1.getLastTradeDay(et.currentTradeDay.day);
    let ret = await et.runner.call('tv_calcmagicorderdpr', [lastDay, 100]);
    if (!CheckAllPE(ret))
        return;
    let length = ret.length;
    let i = 0;
    for (; i < length; ++i) {
        let item = ret[i];
        if (item.pe >= 10)
            continue;
        let fi = et.emuDetails.shares.findIndex(v => v.stock === item.stock);
        if (fi >= 0)
            continue;
        let retPrice = await et.runner.call('tv_getstockpriceatday', [item.stock, et.currentTradeDay.day]);
        if (retPrice.length <= 0)
            continue;
        let price = retPrice[0].price;
        let money = et.emuDetails.money / et.emuDetails.moneyCount;
        let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
        if (volume <= 0)
            continue;
        let r = await et.AddNewStock(item.stock, volume, price);
        if (r)
            break;
    }
}
exports.checkBuyNew = checkBuyNew;
function CheckAllPE(stockSelected) {
    if (stockSelected.length < 50)
        return false;
    let sum = 0;
    for (let i = 0; i < 50; ++i) {
        sum += stockSelected[i].pe;
    }
    let peAvg = sum / 50;
    if (peAvg >= 25)
        return false;
    return true;
}
//# sourceMappingURL=checkBuyNew.js.map