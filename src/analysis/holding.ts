export interface HoldingItem {
    buyDate: Date;
    buyPrice: number;
    numShares: number;
    amount: number;
}

export class Holding {
    readonly stockId: number;
    readonly list: HoldingItem[];

    constructor(stockId:number) {
        this.stockId = stockId;
        this.list = [];
    }

    add(buyDate:Date, buyPrice:number, numShares:number, amount:number) {
        this.list.push({
            buyDate: buyDate,
            buyPrice: buyPrice,
            numShares: numShares,
            amount: amount,
        });
    }

    remove(buyDate:Date) {
        let index = this.list.findIndex(v => v.buyDate === buyDate);
        if (index >= 0) this.list.splice(index, 1);
    }
}

export interface Holdings {
    [id:number]: Holding;
}
