"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function checkOld(et) {
    let shares = et.emuDetails.shares;
    for (let i = 0; i < shares.length; ++i) {
        await updateOne(et, shares[i]);
    }
}
exports.checkOld = checkOld;
async function updateOne(et, share) {
    if (share.items.length <= 0)
        return;
    let stock = share.stock;
    let rItems = share.items;
    let eItemArr = [];
    let i;
    let maxLevel = 1;
    let haveLevel = [false, false, false, false, false, false, false];
    rItems.forEach(v => {
        haveLevel[v.level] = true;
        if (v.level > maxLevel)
            maxLevel = v.level;
    });
    for (i = 0; i < rItems.length; ++i) {
        let item = rItems[i];
        if (item.level === 1) {
            let zf = item.price / item.costprice;
            if (zf <= 0.9 && maxLevel <= 1 && et.emuDetails.moneyCount >= 2 && et.weekBuyCount < et.maxWeekBuyCount) {
                eItemArr.push(item);
                let price = item.price;
                let money = 2 * et.emuDetails.money / et.emuDetails.moneyCount;
                let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
                if (volume > 0) {
                    let nbItem = {
                        buyDay: et.currentTradeDay.day,
                        count: 2,
                        level: 2,
                        volume: volume,
                        costprice: item.price,
                        price: item.price
                    };
                    await et.buyShareItem(stock, nbItem);
                    et.weekBuyCount++;
                    eItemArr.push(nbItem);
                    share.count += nbItem.count;
                }
            }
            else if (zf >= 1.01 && maxLevel > 1) {
                et.sellShareItem(stock, item);
                share.count -= item.count;
            }
            else {
                eItemArr.push(item);
            }
        }
        else if (item.level === 2) {
            let zf = item.price / item.costprice;
            if (zf <= 0.9 && maxLevel <= 2 && et.emuDetails.moneyCount >= 4 && et.weekBuyCount < et.maxWeekBuyCount) {
                eItemArr.push(item);
                let price = item.price;
                let money = 4 * et.emuDetails.money / et.emuDetails.moneyCount;
                let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
                if (volume > 0) {
                    let nbItem = {
                        buyDay: et.currentTradeDay.day,
                        count: 4,
                        level: 3,
                        volume: volume,
                        costprice: item.price,
                        price: item.price
                    };
                    await et.buyShareItem(stock, nbItem);
                    et.weekBuyCount++;
                    eItemArr.push(nbItem);
                    share.count += nbItem.count;
                }
            }
            else if (zf >= 1.01 && maxLevel > 2) {
                et.sellShareItem(stock, item);
                share.count -= item.count;
            }
            else {
                eItemArr.push(item);
            }
        }
        else if (item.level === 3) {
            let zf = item.price / item.costprice;
            if (zf <= 0.9 && maxLevel <= 3 && et.emuDetails.moneyCount >= 8 && et.weekBuyCount < et.maxWeekBuyCount) {
                eItemArr.push(item);
                let price = item.price;
                let money = 8 * et.emuDetails.money / et.emuDetails.moneyCount;
                let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
                if (volume > 0) {
                    let nbItem = {
                        buyDay: et.currentTradeDay.day,
                        count: 8,
                        level: 4,
                        volume: volume,
                        costprice: item.price,
                        price: item.price
                    };
                    await et.buyShareItem(stock, nbItem);
                    et.weekBuyCount++;
                    eItemArr.push(nbItem);
                    share.count += nbItem.count;
                }
            }
            else if (zf >= 1.01 && maxLevel > 3) {
                et.sellShareItem(stock, item);
                share.count -= item.count;
            }
            else {
                eItemArr.push(item);
            }
        }
        else {
            eItemArr.push(item);
        }
    }
    share.items = eItemArr;
}
async function updateOneOld(et, share) {
    if (share.items.length <= 0)
        return;
    let stock = share.stock;
    let rItems = share.items;
    let eItemArr = [];
    let i;
    let maxLevel = 1;
    let haveLevel = [false, false, false, false, false, false, false];
    rItems.forEach(v => {
        haveLevel[v.level] = true;
        if (v.level > maxLevel)
            maxLevel = v.level;
    });
    for (i = 0; i < rItems.length; ++i) {
        let item = rItems[i];
        if (item.level === 1) {
            let zf = item.price / item.costprice;
            eItemArr.push(item);
            if (zf <= 0.9 && !haveLevel[2] && et.emuDetails.moneyCount >= 2 && et.weekBuyCount < et.maxWeekBuyCount) {
                let price = item.price;
                let money = 2 * et.emuDetails.money / et.emuDetails.moneyCount;
                let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
                if (volume > 0) {
                    let nbItem = {
                        buyDay: et.currentTradeDay.day,
                        count: 2,
                        level: 2,
                        volume: volume,
                        costprice: item.price,
                        price: item.price
                    };
                    await et.buyShareItem(stock, nbItem);
                    et.weekBuyCount++;
                    eItemArr.push(nbItem);
                    share.count += nbItem.count;
                }
            }
        }
        else if (item.level === 2) {
            let zf = item.price / item.costprice;
            if (zf <= 0.9 && maxLevel <= 2 && et.emuDetails.moneyCount >= 4 && et.weekBuyCount < et.maxWeekBuyCount) {
                eItemArr.push(item);
                let price = item.price;
                let money = 4 * et.emuDetails.money / et.emuDetails.moneyCount;
                let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
                if (volume > 0) {
                    let nbItem = {
                        buyDay: et.currentTradeDay.day,
                        count: 4,
                        level: 3,
                        volume: volume,
                        costprice: item.price,
                        price: item.price
                    };
                    await et.buyShareItem(stock, nbItem);
                    et.weekBuyCount++;
                    eItemArr.push(nbItem);
                    share.count += nbItem.count;
                }
            }
            else if (zf >= 1.1) {
                et.sellShareItem(stock, item);
                share.count -= item.count;
            }
            else {
                eItemArr.push(item);
            }
        }
        else if (item.level === 3) {
            let zf = item.price / item.costprice;
            eItemArr.push(item);
            if (zf <= 0.9 && !haveLevel[4] && et.emuDetails.moneyCount >= 8 && et.weekBuyCount < et.maxWeekBuyCount) {
                let price = item.price;
                let money = 8 * et.emuDetails.money / et.emuDetails.moneyCount;
                let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
                if (volume > 0) {
                    let nbItem = {
                        buyDay: et.currentTradeDay.day,
                        count: 8,
                        level: 4,
                        volume: volume,
                        costprice: item.price,
                        price: item.price
                    };
                    await et.buyShareItem(stock, nbItem);
                    et.weekBuyCount++;
                    eItemArr.push(nbItem);
                    share.count += nbItem.count;
                }
            }
        }
        else if (item.level === 4) {
            let zf = item.price / item.costprice;
            // if (zf <= 0.9 && maxLevel <= 4 && et.emuDetails.moneyCount >= 1 && et.weekBuyCount < et.maxWeekBuyCount) {
            //   eItemArr.push(item);
            //   let price = item.price;
            //   let money = et.emuDetails.money / et.emuDetails.moneyCount;
            //   let volume = Math.floor((money / (price*1.002)) / 100) * 100;
            //   if (volume > 0) {
            //     let nbItem: EmulateShareItem = {
            //       buyDay: et.currentTradeDay.day,
            //       count: 1,
            //       level: 5,
            //       volume: volume,
            //       costprice: item.price,
            //       price: item.price
            //     }
            //     await et.buyShareItem(stock, nbItem);
            //     et.weekBuyCount++;
            //     eItemArr.push(nbItem);
            //     share.count += nbItem.count;
            //   }
            // }
            // else if (zf >= 1.1) {
            if (zf >= 1.12) {
                et.sellShareItem(stock, item);
                share.count -= item.count;
            }
            else {
                eItemArr.push(item);
            }
        }
        // else if (item.level === 5) {
        //   let zf = item.price / item.costprice;
        //   eItemArr.push(item);
        //   if (zf <= 0.9 && maxLevel <= 5 && et.emuDetails.moneyCount >= 1 && et.weekBuyCount < et.maxWeekBuyCount) {
        //     let price = item.price;
        //     let money = et.emuDetails.money / et.emuDetails.moneyCount;
        //     let volume = Math.floor((money / (price*1.002)) / 100) * 100;
        //     if (volume > 0) {
        //       let nbItem: EmulateShareItem = {
        //         buyDay: et.currentTradeDay.day,
        //         count: 1,
        //         level: 6,
        //         volume: volume,
        //         costprice: item.price,
        //         price: item.price
        //       }
        //       await et.buyShareItem(stock, nbItem);
        //       et.weekBuyCount++;
        //       eItemArr.push(nbItem);
        //       share.count += nbItem.count;
        //     }
        //   }
        // }
        // else if (item.level === 6) {
        //   if (item.price / item.costprice >= 1.1) {
        //     et.sellShareItem(stock, item);
        //     share.count -= item.count;
        //   }
        //   else {
        //     eItemArr.push(item);
        //   }     
        // }
    }
    share.items = eItemArr;
}
//# sourceMappingURL=checkOld.js.map