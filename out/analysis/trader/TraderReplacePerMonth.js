"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trader_1 = require("./trader");
const holding_1 = require("../holding");
class TraderReplacePerMonth extends trader_1.Trader {
    constructor(buyPe, sellPe, intervalCount = 1, tradeCount = 50) {
        super();
        this.monthno = 0;
        this.tradeMonthno = -1;
        this.intervalCount = intervalCount;
        this.buyPe = buyPe;
        this.sellPe = sellPe;
        this.maxShareCount = tradeCount;
        this.buyCountPerMonth = Math.round(tradeCount / 12);
    }
    async internalDailyTrade(date, prices, rank, reports) {
        await this.checkHodingsPE(date, prices);
        let monthno = date.monthno;
        if (monthno === this.monthno || (this.tradeMonthno >= 0 && monthno - this.tradeMonthno < this.intervalCount)) {
            if (this.cashCount <= 0) {
                return;
            }
        }
        await rank.getAt(date, prices, reports);
        this.calculateSellBuyOrder(date, prices, rank);
        await this.checksellOrders(date, prices);
        await this.checkbuyOrders(date, prices);
        this.monthno = monthno;
        this.tradeMonthno = monthno;
    }
    calculateSellBuyOrder(date, prices, rank) {
        this.buyOrder = [];
        this.sellOrder = [];
        let queue = rank.queue.slice(0, this.maxShareCount);
        for (let i = 0; i < queue.length; ++i) {
            let qi = queue[i];
            let holding = this.holdings[qi.stockId];
            if (holding !== undefined)
                continue;
            if (qi.data.pe >= this.buyPe)
                continue;
            this.buyOrder.push({ stockId: qi.stockId, order: qi.num });
            if (this.buyOrder.length >= this.buyCountPerMonth)
                break;
        }
        let sellCount = this.buyOrder.length + this.cashCount - this.maxShareCount;
        if (this.buyOrder.length > 0 && sellCount > 0) {
            let tmpsellOrder = [];
            let keys = Object.keys(this.holdings);
            for (let i of keys) {
                let holding = this.holdings[i];
                let stockId = holding.stockId;
                let o = rank.getOrder(stockId);
                if (o < 0) {
                    let p = prices.map[stockId];
                    if (p !== undefined && p.day === date.day) {
                        o = 2000;
                    }
                }
                if (o > 0) {
                    let j = 0;
                    for (; j < tmpsellOrder.length; ++j) {
                        let sitem = tmpsellOrder[i];
                        if (o < sitem.order) {
                            break;
                        }
                    }
                    tmpsellOrder.splice(j, 0, { stockId: stockId, order: o });
                }
            }
            tmpsellOrder = tmpsellOrder.slice(0, sellCount);
            let maxBuyOrder = this.buyOrder[this.buyOrder.length - 1].order + this.maxShareCount;
            for (let bitem of tmpsellOrder) {
                if (bitem.order >= maxBuyOrder) {
                    this.sellOrder.push(bitem);
                }
            }
        }
    }
    async checksellOrders(date, prices) {
        for (let item of this.sellOrder) {
            let holding = this.holdings[item.stockId];
            await this.sellHolding(holding, date, prices);
        }
    }
    async checkbuyOrders(date, prices) {
        for (let v of this.buyOrder) {
            let buyItem = new holding_1.Holding(v.stockId);
            buyItem.add(date.day, prices.map[v.stockId].price, 0, 0);
            await this.buyHolding(buyItem, date, prices);
        }
    }
    async checkHodingsPE(date, prices) {
        let keys = Object.keys(this.holdings);
        for (let i of keys) {
            let holding = this.holdings[i];
            let daype = await prices.getPe(holding.stockId, date.day);
            let pe = daype.pe;
            if (pe !== undefined && pe >= this.sellPe) {
                await this.sellHolding(holding, date, prices);
                delete this.holdings[i];
            }
        }
    }
    async sellHolding(holding, date, prices) {
        let { stockId, list } = holding;
        for (let item of list) {
            await this.sellHoldingItem(stockId, item, date, prices);
        }
    }
    async sellHoldingItem(stockId, holdingItem, date, prices) {
        let sellPrice = prices.map[stockId].price;
        let money = sellPrice * holdingItem.volume * 0.999;
        this.cash += money;
        this.cashCount += holdingItem.count;
        let p = {
            type: this.recorder.typeID,
            day: date.day,
            stock: stockId,
            tradeType: 2,
            price: sellPrice,
            volume: holdingItem.volume
        };
        await this.recorder.saveTrade(p);
    }
    async buyHolding(holding, date, prices) {
        if (this.cashCount <= 0)
            return;
        let { stockId, list } = holding;
        let buyPrice = prices.map[stockId].price;
        let money = this.cash / this.cashCount;
        for (let item of list) {
            if (this.cashCount < item.count)
                continue;
            let volume = Math.floor(money * 0.999 * item.count / buyPrice / 100) * 100;
            if (volume > 0) {
                await this.buyStock(stockId, buyPrice, volume, date, item.level, item.count);
            }
        }
    }
}
exports.TraderReplacePerMonth = TraderReplacePerMonth;
//# sourceMappingURL=TraderReplacePerMonth.js.map