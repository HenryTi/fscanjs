<<<<<<< HEAD
import { data } from "../data";
import { Rank, Point } from "./rank";
=======
import { Rank, Point } from "./rank";
import { data } from "../data";
>>>>>>> 50d992f73f6a20bf7dc9bc563e95ea3c55e51a8f

export class ROE_PE_Dividend_Rank extends Rank {
  protected async internalSort() {
    this.queue.splice(0);
    this.map = [];
    let ret = await data.LoadROE_PE_Dividend_Rank(this.date.day, 1000);
    for (let i = 0; i < ret.length; ++i) {
      let item = ret[i];
      let point: Point = new Point(item.stock);
      point.num = item.no;
      point.data = item;
      this.queue.push(point);
      this.map[item.stock] = point;
    }
  }
}
