export class Holding {
    readonly stockId: number;
    readonly buyDate: number;
    readonly buyPrice: number;
    readonly numShares: number;
    readonly amount: number;

    constructor(stockId:number, buyDate:number, buyPrice:number, numShares:number, amount:number) {
        this.stockId = stockId;
        this.buyDate = buyDate;
        this.buyPrice = buyPrice;
        this.numShares = numShares;
        this.amount = amount;
    }
}

export interface Holdings {
    [id:number]: Holding | Holding[];
}
