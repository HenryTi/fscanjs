import { Rank, Point } from "./rank";
import { data } from "../data";

export class ROE_PE_Magic_CheckE_Rank extends Rank {
<<<<<<< HEAD
    protected async internalSort() {
      this.queue.splice(0);
      this.map = [];
      let ret = await data.LoadROE_PE_Magic_CheckE_Rank(this.date.day, 1000);
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
  
  
=======
  protected async internalSort() {
    this.queue.splice(0);
    this.map = [];
    let ret = await data.LoadROE_PE_Magic_CheckE_Rank(this.date.day, 1000);
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
>>>>>>> 50d992f73f6a20bf7dc9bc563e95ea3c55e51a8f
