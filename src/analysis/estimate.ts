import { Report } from "./reports";

export class Estimate {
    readonly stockId: number;
    readonly report: Report;
    readonly date: Date;
    readonly price: number;
    constructor(stockId:number, report:Report, date:Date, price:number) {
        this.stockId = stockId;
        this.report = report;
        this.date = date;
        this.price = price;
    }
}

export class Estimates {
    readonly date: Date;
    readonly map: {[id:number]: Estimate} = {};
    constructor(date:Date) {
        this.date = date;
    }
}
