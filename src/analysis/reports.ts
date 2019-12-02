import { Stock } from "./stock";

export class Report {
    readonly stockId: number;
    readonly date: number;
    profit: number;
    netAssets: number;
    dividend: number;
    sumShares: number;
}

export class Reports {
    date: Date;
    map: {[id:number]: Report} = {};

    async load(date: Date): Promise<void> {
        this.date = date;
        this.map = {};
        //throw new Error('implementing!');
    }
}
