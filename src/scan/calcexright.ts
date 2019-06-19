import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkNumberNaNToZero } from '../gfuncs';
import { fetchSinaContent } from './sina';
import { DefaultUnit } from '../const';
import * as cheerio from 'cheerio';

export async function caclulateExRight() {
  let runner = await getRunner('mi');
  let sinaer = new CalculateSinaExRight(runner);
  try {
    let ret: any[] = [];
    let pageStart = 0, pageSize = 100;
    for (; ;) {
      let ids = await runner.tuidSeach('股票', DefaultUnit, undefined, undefined, '', pageStart, pageSize);
      let arr = ids[0];
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
    let paramObj :any = {stock:id};
    await this.runner.actionFromObj('计算除权因子', DefaultUnit, undefined, paramObj);
  }
}