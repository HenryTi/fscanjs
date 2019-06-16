import * as request from 'request';
import { getRunner, Runner } from '../uq-api/db';
import { sleep } from '../gfuncs';
import { DefaultUnit } from '../const';

const capitalStockStructureUrl = 'http://f10.eastmoney.com/CapitalStockStructure/CapitalStockStructureAjax?code=';
const financeAnalysisSeasonUrl = 'http://f10.eastmoney.com/NewFinanceAnalysis/MainTargetAjax?type=2&code=';
const financeAnalysisYearUrl = 'http://f10.eastmoney.com/NewFinanceAnalysis/MainTargetAjax?type=1&code=';

export async function scanEastmoney() {
  let runner = await getRunner('mi');
  let f = new FechStockContents(runner);

  let ret: any[] = [];
  let pageStart = 0, pageSize = 500;
  for (; ;) {
    let ids = await runner.tuidSeach('股票', DefaultUnit, undefined, undefined, '', pageStart, pageSize);
    let arr = ids[0];
    if (arr.length > pageSize) {
      let top = arr.pop();
      ret.push(...arr);
      pageStart = arr[pageSize - 1].id;
    }
    else {
      ret.push(...arr);
      break;
    }
  }
  let count = ret.length;
  let i: number, j: number;
  let retryArr = [];
  for (i = 0; i < count; ++i) {
    let value = ret[i];
    let r = await f.processOne(value);
    if (r != 1) {
      retryArr.push(value);
    }
  }

  count = retryArr.length;
  for (i = 0; i < count; ++i) {
    let value = retryArr[i];
    for (j = 0; j < 10; ++j) {
      await sleep(3000);
      let r = await f.processOne(value);
      if (r == 1) {
        break;
      }
    }
  }
}

class FechStockContents {
  protected runner: Runner;
  constructor(runner: Runner) {
    this.runner = runner;
  }

  async processOne(item: any) {
    let { id, symbol } = item;
    let scode = (symbol as string).toLowerCase();
    try {
      let url = capitalStockStructureUrl + scode;
      let capitals = await this.fetchJson(url);
      if (capitals === null || capitals === undefined) {
        capitals = await this.fetchJson(url);
      }
      if (capitals === null || capitals === undefined) {
        capitals = await this.fetchJson(url);
      }
      await this.saveCapitalStockStructure(id, capitals, scode);

      url = financeAnalysisYearUrl + scode;
      let financeYearContent = await this.fetchJson(url);
      if (financeYearContent === null || financeYearContent === undefined) {
        financeYearContent = await this.fetchJson(url);
      }
      if (financeYearContent === null || financeYearContent === undefined) {
        financeYearContent = await this.fetchJson(url);
      }
      await this.saveFinanceAnalysis(id, financeYearContent, scode);

      url = financeAnalysisSeasonUrl + scode;
      let financeSeasonContent = await this.fetchJson(url);
      if (financeSeasonContent === null || financeSeasonContent === undefined) {
        financeSeasonContent = await this.fetchJson(url);
      }
      if (financeSeasonContent === null || financeSeasonContent === undefined) {
        financeSeasonContent = await this.fetchJson(url);
      }
      await this.saveFinanceAnalysisSeason(id, financeSeasonContent, scode);

      console.log(id + ' : ' + scode);
      return 1;
    }
    catch (err) {
      console.log(id + ' : ' + scode + ' ' + err);
      return 0;
    }
  }

  async fetchJson(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        request.get(url, (error: any, response: request.Response, body: any) => {
          try {
            let jdata = JSON.parse(body);
            resolve(jdata);
          }
          catch (err) {
            reject(err);
          }
        });
      }
      catch (reqErr) {
        reject(reqErr);
      }
    });
  }

  async fetchString(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        request.get(url, (error: any, response: request.Response, body: any) => {
          resolve(body);
        });
      }
      catch (reqErr) {
        reject(reqErr);
      }
    });
  }

  protected checkToNumber(index: number, list: string[]) {
    if (list.length <= index)
      return undefined;
    let s = list[index];
    if (s == '--')
      return undefined;
    let s1 = s.split(',').join('');
    let ret = Number(s1);
    if (isNaN(ret))
      return undefined;
    return ret;
  }

  protected checkToNumber1(str: string) {
    if (str === null || str == '--')
      return undefined;
    let s1 = str.split(',').join('');
    let arr = s1.split('亿');
    s1 = arr.join('');
    let arr2 = s1.split('万');
    s1 = arr2.join('');
    let ret = Number(s1);
    if (isNaN(ret))
      return undefined;
    if (arr.length > 1)
      ret = ret * 100000000;
    if (arr2.length > 1)
      ret = ret * 10000;
    return ret;
  }

  protected checkToDateInt(str: string) {
    let s = str.split('-').join('');
    let ret = parseInt(s);
    if (isNaN(ret))
      return undefined;
    return ret;
  }

  protected checkToString(index: number, list: string[]) {
    return list.length > index ? list[index] : undefined;
  }

  async saveCapitalStockStructure(id: any, value: any, scode: string) {
    try {
      let { ShareChangeList } = value as { ShareChangeList: any[] };
      let dayList: string[] = [];
      let 总股本: string[] = [];
      let 已流通股份: string[] = [];
      let 已上市流通A股: string[] = [];
      let 境外上市流通股: string[] = [];
      let 流通受限股份: string[] = [];
      let 变动原因: string[] = [];

      ShareChangeList.forEach((item: any, index: number) => {
        let { des, changeList } = item as { des: string, changeList: string[] };
        switch (des) {
          case '单位:万股':
            dayList = changeList;
            break;
          case '总股本':
            总股本 = changeList;
            break;
          case '已流通股份':
            已流通股份 = changeList;
            break;
          case '已上市流通A股':
            已上市流通A股 = changeList;
            break;
          case '境外上市流通股':
            境外上市流通股 = changeList;
            break;
          case '流通受限股份':
            流通受限股份 = changeList;
            break;
          case '变动原因':
            变动原因 = changeList;
            break;
        }
      });

      let count = dayList.length;
      let i: number;
      let promiseArr: Promise<void>[] = [];
      for (i = 0; i < count; ++i) {
        let date = this.checkToDateInt(dayList[i]);
        if (date === undefined) continue;
        let row: any[] = [
          id,
          date,
          this.checkToNumber(i, 总股本),
          this.checkToNumber(i, 已流通股份),
          this.checkToNumber(i, 已上市流通A股),
          this.checkToNumber(i, 境外上市流通股),
          this.checkToNumber(i, 流通受限股份),
          this.checkToString(i, 变动原因).substring(0, 64),
        ];
        promiseArr.push(this.runner.mapSave('东方财富历年股本', DefaultUnit, undefined, row));
      }
      await Promise.all(promiseArr);
    }
    catch (err) {
      console.log(scode + ' : ' + err);
    }
  }

  async saveFinanceAnalysis(id: any, value: any, scode: string) {
    try {
      let jarr = value as any[];

      let promiseArr: Promise<void>[] = [];
      jarr.forEach((item: any, index: number) => {
        let date = item.date;
        if (date !== null && date !== undefined) {
          let dint = this.checkToDateInt(date);
          if (dint !== undefined) {
            let row: any[] = [
              id,
              dint,
              this.checkToNumber1(item.jbmgsy),
              this.checkToNumber1(item.kfmgsy),
              this.checkToNumber1(item.xsmgsy),
              this.checkToNumber1(item.mgjzc),
              this.checkToNumber1(item.mggjj),
              this.checkToNumber1(item.mgwfply),
              this.checkToNumber1(item.mgjyxjl),
              this.checkToNumber1(item.yyzsr),
              this.checkToNumber1(item.mlr),
              this.checkToNumber1(item.gsjlr),
              this.checkToNumber1(item.kfjlr),
              this.checkToNumber1(item.yyzsrtbzz),
              this.checkToNumber1(item.gsjlrtbzz),
              this.checkToNumber1(item.kfjlrtbzz),
              this.checkToNumber1(item.yyzsrgdhbzz),
              this.checkToNumber1(item.gsjlrgdhbzz),
              this.checkToNumber1(item.kfjlrgdhbzz),
              this.checkToNumber1(item.jqjzcsyl),
              this.checkToNumber1(item.tbjzcsyl),
              this.checkToNumber1(item.tbzzcsyl),
              this.checkToNumber1(item.mll),
              this.checkToNumber1(item.jll),
              this.checkToNumber1(item.sjsl),
              this.checkToNumber1(item.yskyysr),
              this.checkToNumber1(item.xsxjlyysr),
              this.checkToNumber1(item.jyxjlyysr),
              this.checkToNumber1(item.zzczzy),
              this.checkToNumber1(item.yszkzzts),
              this.checkToNumber1(item.chzzts),
              this.checkToNumber1(item.zcfzl),
              this.checkToNumber1(item.ldzczfz),
              this.checkToNumber1(item.ldbl),
              this.checkToNumber1(item.sdbl),
            ];
            promiseArr.push(this.runner.mapSave('东方财富财务分析', DefaultUnit, undefined, row));
          }
        }
      });

      await Promise.all(promiseArr);
    }
    catch (err) {
      console.log(scode + ' : ' + err);
    }
  }

  async saveFinanceAnalysisSeason(id: any, value: any, scode: string) {
    try {
      let jarr = value as any[];

      let promiseArr: Promise<void>[] = [];
      jarr.forEach((item: any, index: number) => {
        let date = item.date;
        if (date !== null && date !== undefined) {
          let dint = this.checkToDateInt(date);
          if (dint !== undefined) {
            let row: any[] = [
              id,
              dint,
              this.checkToNumber1(item.jbmgsy),
              this.checkToNumber1(item.mgjzc),
              this.checkToNumber1(item.mggjj),
              this.checkToNumber1(item.mgwfply),
              this.checkToNumber1(item.mgjyxjl),
              this.checkToNumber1(item.yyzsr),
              this.checkToNumber1(item.mlr),
              this.checkToNumber1(item.gsjlr),
              this.checkToNumber1(item.kfjlr),
              this.checkToNumber1(item.yyzsrtbzz),
              this.checkToNumber1(item.gsjlrtbzz),
              this.checkToNumber1(item.kfjlrtbzz),
              this.checkToNumber1(item.yyzsrgdhbzz),
              this.checkToNumber1(item.gsjlrgdhbzz),
              this.checkToNumber1(item.kfjlrgdhbzz),
              this.checkToNumber1(item.tbjzcsyl),
              this.checkToNumber1(item.tbzzcsyl),
              this.checkToNumber1(item.mll),
              this.checkToNumber1(item.jll),
            ];
            promiseArr.push(this.runner.mapSave('东方财富财务分析季报', DefaultUnit, undefined, row));
          }
        }
      });

      await Promise.all(promiseArr);
    }
    catch (err) {
      console.log(scode + ' : ' + err);
    }
  }
}
