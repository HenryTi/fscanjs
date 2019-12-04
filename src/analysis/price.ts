import { data } from "./data";
import { TradeDay } from "./tradeday";

export class Price {
    day: number;
    price: number;
    open: number;
}

export class Prices {
    day: number;
    map: {[id:number]: Price} = {};
    count: number;

    async load(tradeDay: TradeDay): Promise<void> {
        let {day} = tradeDay;
        this.day = day;
        let arr = await data.getPricesFromDay(day);
        this.count = arr.length;
        for (let item of arr) {
            let {id, price, open} = item;
            this.map[id] = {day: day, price: price, open: open};
        }
    }
}
