import { getRunner, Runner } from '../db';
import { sleep, RemoteIsRun, RemoteRun } from '../gfuncs';
import { fetchSinaContent } from './sina';
import { Const_dbname } from '../const';

export async function scanSinaSymbols() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);

  try {
    let runner = await getRunner(Const_dbname);
    let sinaSym = new SinaSymbols(runner);
    await sinaSym.GetHS_A();
  }
  catch (err) {
    console.log(err);
  }
  RemoteRun(false);
}

class SinaSymbols {
  private runner: Runner;
  constructor(runner: Runner) {
    this.runner = runner;
  }

  protected async fetchString(url: string): Promise<string> {
    try {
      let ret = await fetchSinaContent(url);
      return ret;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async GetHS_A() {
    let hsaCount = await this.getHSACount();
    let readCount = 0;
    let page = 1;
    let retryArr = [];
    while (readCount < hsaCount) {
      let r = await this.GetHSAOnePage(page);
      if (!r) {
        retryArr.push(page);
      }
      else {
        console.log('sinasymbols hsa page : ' + page);
      }
      ++page;
      readCount += 80;
    }

    let count = retryArr.length;
    for (let i = 0; i < count; ++i) {
      let p = retryArr[i];
      for (let j = 0; j < 10; ++j) {
        await sleep(3000);
        let r = await this.GetHSAOnePage(p);;
        if (r) {
          console.log('sinasymbols hsa page : ' + p);
          break;
        }
      }
    }
  }

  protected async GetHSAOnePage(page: number): Promise<boolean> {
    try {
      let url = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?num=80&sort=symbol&asc=1&node=hs_a&page=' + page;
      let content = await fetchSinaContent(url);
      let c = eval(content);
      if (c === undefined || c === null)
        return false;
      return this.saveHSAOnePage(c);
    }
    catch (err) {
      console.log(err);
      return false;
    }
  }

  protected async getHSACount(): Promise<number> {
    try {
      let url = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount?node=hs_a';
      let str = await fetchSinaContent(url);
      let nstr = eval(str);
      console.log('hs_a count: ' + nstr);
      return Number(nstr);
    }
    catch (err) {
      console.log(err);
      return -1;
    }
  }

  protected async saveHSAOnePage(arr: any[]): Promise<boolean> {
    let i: number;
    let count = arr.length;
    for (i = 0; i < count; ++i) {
      let item = arr[i];
      let { symbol, code, name } = item as { symbol: string, code: string, name: string };
      symbol = symbol.toLowerCase().substring(0, 16);
      if (symbol.length < 4)
        continue;
      name = name.substring(0, 32);
      let market = symbol.substring(0, 2).toUpperCase();
      let row = [undefined, symbol, market, code, name, undefined];
      await this.runner.call('tv_股票$save', row);
    }

    return true;
  }
}
