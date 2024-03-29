"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function updateStockStatus(et) {
    let shares = et.emuDetails.shares;
    for (let i = 0; i < shares.length; ++i) {
        await updateOne(et, shares[i]);
    }
}
exports.updateStockStatus = updateStockStatus;
async function updateOne(et, share) {
    if (share.items.length <= 0)
        return;
    let retPrice = await et.runner.call('tv_getstockpriceatday', [share.stock, et.currentTradeDay.day]);
    let oldPrice = share.items[0].price;
    if (retPrice.length > 0) {
        let newPrice = retPrice[0].price;
        let items = share.items;
        items.forEach(v => {
            v.price = newPrice;
        });
    }
    let retDiv = await et.runner.call('tv_getstockdivinfoatday', [share.stock, et.currentTradeDay.day]);
    if (retDiv.length > 0) {
        let { s, p, price, bonus } = retDiv[0];
        let items = share.items;
        for (let i = 0; i < items.length; ++i) {
            let v = items[i];
            if (bonus > 0) {
                let money = v.volume * bonus / 10;
                let p = {
                    type: et.typeID,
                    day: et.currentTradeDay.day,
                    stock: share.stock,
                    tradeType: 10,
                    price: bonus / 10,
                    volume: v.volume
                };
                await et.SaveTrade(p);
                et.addBouns(money);
            }
            let oldVolume = v.volume;
            let oldCost = v.costprice;
            if (s > 0) {
                let svolume = Math.floor(oldVolume * s / 10);
                let p = {
                    type: et.typeID,
                    day: et.currentTradeDay.day,
                    stock: share.stock,
                    tradeType: 3,
                    price: v.price,
                    volume: svolume
                };
                await (et.SaveTrade(p));
                v.volume = oldVolume + svolume;
                v.costprice = oldCost / (1 + s);
            }
            if (p > 0) {
                let pvolume = Math.floor(oldVolume * p / 10);
                let adjustVolume = Math.floor((pvolume * price) / v.price);
                if (adjustVolume < v.volume) {
                    let p = {
                        type: et.typeID,
                        day: et.currentTradeDay.day,
                        stock: share.stock,
                        tradeType: 4,
                        price: v.price,
                        volume: adjustVolume
                    };
                    await (et.SaveTrade(p));
                    p.tradeType = 5;
                    p.price = price;
                    p.volume = pvolume;
                    await (et.SaveTrade(p));
                    let cost = v.volume * v.costprice;
                    v.volume = v.volume + pvolume - adjustVolume;
                    v.costprice = cost / v.volume;
                }
            }
        }
    }
}
//# sourceMappingURL=updateStockStatus.js.map