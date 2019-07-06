
import { sleep, checkToDateInt, checkNumberNaNToZero } from '../gfuncs';
import { Const_dbname } from '../const';
import { getRunner, Runner } from '../db';

export async function caclulateExRight() {
  let runner = await getRunner(Const_dbname);
  let sinaer = new CalculateSinaExRight(runner);
  try {
    let ret: any[] = [];
    let pageStart = 0, pageSize = 100;
    for (; ;) {
      let ids = await runner.query('tv_股票$search', ['', pageStart, pageSize]);
      let arr = ids as any[];
      if (arr.length > pageSize) {
        let top = arr.pop();
        pageStart = arr[pageSize - 1].id;
        await sinaer.processGroup(arr);
      }
      else {
        if (arr.length > 0) {
          await sinaer.processGroup(arr);
        }
        break;
      }
    }

    await sinaer.processRetry();
  }
  catch (err) {
    console.log(err);
  }
}

class CalculateSinaExRight {
  private runner: Runner;
  private retryArr: any[];

  constructor(runner: Runner) {
    this.runner = runner;
    this.retryArr = [];
  }

  async processGroup(items: any[]) {
    if (items.length <= 0)
      return;
    for (let i = 0; i < items.length; ++i) {
      let item = items[i];
      await this.processOne(item);
    }

    console.log('calculate sinaExRight onegroup : ' + items.length);
  }

  async processRetry() {
    for (let index = 0; index < this.retryArr.length; ++index) {
      let item = this.retryArr[index];
      for (let i = 0; i < 5; ++i) {
        let r = await this.retryOne(item);
        if (r)
          break;
        else
          sleep(3000);
      }
    }
  }

  protected async processOne(item: any) {
    try {
      await this.scanItem(item);
    }
    catch (err) {
      console.log(err);
      this.retryArr.push(item);
      return false;
    }
    return true;
  }

  protected async retryOne(item: any) {
    try {
      await this.scanItem(item);
    }
    catch (err) {
      return false;
    }
    return true;
  }

  protected async scanItem(item: any) {
    let { id, symbol, code } = item as { id: number, symbol: string, code: string };
    await this.runner.call('c_calculateexrightinfo', [id]);
  }
}