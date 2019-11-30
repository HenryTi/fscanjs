import { data } from "./data";

export class Price {
    date: number;
    open: number;
    close: number;
    high: number;
    low: number;
}

export class Prices {
    date: Date;
    map: {[id:number]: Price};
    count: number;

    async load(date:Date): Promise<void> {
        this.date = date;
        this.map = {};
        let arr = await data.getPricesFromDay(date);
        this.count = arr.length;
        for (let item of arr) {
            let {id, price} = item;
            this.map[id] = price;
        }
    }
}
