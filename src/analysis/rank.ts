import { Estimates } from "./estimate";
import { Prices } from "./price";
import { Reports } from "./reports";

export class Point {
    readonly stockId:number;
    num:number;
    constructor(stockId:number) {
        this.stockId = stockId;
    }
}

export abstract class Rank {
    date: Date;
    private prices: Prices;
    private reports: Reports;
    readonly estimates: Estimates;
    readonly queue: Point[] = [];

    sort(date:Date, prices:Prices, reports:Reports):void {
        this.date = date;
        this.prices = prices;
        this.reports = reports;
        this.internalSort();
    }

    protected internalSort() {

    }
}

export class ROERank extends Rank {
    protected internalSort():void {

    }
}

export class PERank extends Rank {
    protected internalSort():void {

    }
}

export class DividendRank extends Rank {
    protected internalSort():void {

    }
}

export class ROE_PE_Rank extends Rank {
    protected internalSort():void {

    }
}

export class ROE_PE_Dividend_Rank extends Rank {
    protected internalSort():void {

    }
}
