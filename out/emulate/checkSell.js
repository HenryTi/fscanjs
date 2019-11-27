"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function checkSell(et, pelist) {
    let shares = et.emuDetails.shares;
    let sellCount = 0;
    let sellAllStocks = [];
    let i = 0;
    for (; i < shares.length; ++i) {
        let si = shares[i];
        let index = pelist.findIndex(v => v.stock === si.stock);
        let pe = undefined;
        if (index >= 0)
            pe = pelist[index].pe;
        if (pe === undefined || pe < 0 || pe >= 30) {
            sellAllStocks.push(si.stock);
        }
    }
    for (i = 0; i < sellAllStocks.length; ++i) {
        await et.removeStock(sellAllStocks[i]);
    }
}
exports.checkSell = checkSell;
//# sourceMappingURL=checkSell.js.map