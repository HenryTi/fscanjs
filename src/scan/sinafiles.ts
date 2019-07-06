import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { fetchSinaContent } from './sina';
import { Const_dbname } from '../const';
import * as cheerio from 'cheerio';

const const_type_sinaFinance='新浪财务指标';
const const_type_sinaStockStructure = '新浪股本结构';
const const_type_sinaBalanceSheet = '新浪资产负债表';
const const_type_sinaProfitStatement = '新浪利润表';
const const_type_sinaCashFlow = '新浪现金流量表';

export async function scanSinaFiles(start:number, scanType:'finance'|'stockstructure'|'balancesheet'|'profitstatement'|'cashflow') : Promise<void> {
  if (RemoteIsRun())
    return;
  RemoteRun(true);

  try {
    let runner = await getRunner(Const_dbname);
    let sinascanner:sinaFiles;
    switch (scanType) {
      default: sinascanner = new sinaFinance(runner); break;
      case 'stockstructure': sinascanner = new sinaStockStructure(runner);
      case 'balancesheet': sinascanner = new sinaBalanceSheet(runner);
      case 'profitstatement': sinascanner = new sinaProfitStatement(runner);
      case 'cashflow': sinascanner = new sinaCashFlow(runner);
    }
    let pageStart = start, pageSize = 100;
    for (; ;) {
      let ids = await runner.query('tv_股票$search', ['', pageStart, pageSize]);
      let arr = ids as any[];
      if (arr.length > pageSize) {
        let top = arr.pop();
        pageStart = arr[pageSize - 1].id;
        await sinascanner.processGroup(arr);
      }
      else {
        if (arr.length > 0) {
          await sinascanner.processGroup(arr);
        }
        break;
      }
    }

    await sinascanner.processRetry();
  }
  catch (err) {
    console.log(err);
  }
  RemoteRun(false);
}

abstract class sinaFiles {
  protected runner: Runner;
  protected retryArr: any[];

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

  protected abstract scanItem(item: any) : Promise<void>;
}

class sinaFinance extends sinaFiles {
  constructor(runner: Runner) {
    super(runner);
  }

  protected async scanItem(item: any) {
    let { id, symbol, code } = item as { id: number, symbol: string, code: string };
    let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
       + code + '/displaytype/4.phtml';
    let content = await fetchSinaContent(url);
    let years:string[] = [];
    let $ = cheerio.load(content);
    $('#con02-1').find('>table').first().find('>tbody').first().find('>tr').first().find('a')
      .map((index: number, element: CheerioElement) => {
      years.push($(element).text());
    });

    for (let i = 0; i < years.length; ++i) {
      let year = years[i].trim();
      let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
        + code + '/ctrl/' + year +'/displaytype/4.phtml';
      let cont = await fetchSinaContent(urlone);
      let row:any[][] = [];
      let $ = cheerio.load(cont);
      $('#BalanceSheetNewTable0').find('>tbody').first().find('>tr')
        .map((index: number, element: CheerioElement) => {
        let subarr:any[] = [];
        $(element).find('>td').map((index: number, element: CheerioElement) => {
          subarr.push($(element).text().trim());
        });
        row.push(subarr);
      });

      let contentStr = JSON.stringify(row);
      await this.runner.call('t_stockarchives$save', [id, const_type_sinaFinance, year, contentStr]);
    }
    console.log('scan sinaFinance, code: ' + id + ' - ' + symbol);
  }
}

class sinaStockStructure extends sinaFiles {
  constructor(runner: Runner) {
    super(runner);
  }

  protected async scanItem(item: any) {
    let { id, symbol, code } = item as { id: number, symbol: string, code: string };
    let url = 'http://vip.stock.finance.sina.com.cn/corp/go.php/vCI_StockStructure/stockid/' + code + '.phtml';
    let content = await fetchSinaContent(url);
    let rows:any[][][] = [];
    let $ = cheerio.load(content);
    $('#con02-1').find('>table')
      .map((index: number, element: CheerioElement) => {
      let row:any[][] = [];
      $(element).find('>tbody').first().find('>tr').map((index: number, element: CheerioElement) => {
        let subarr:any[] = [];
        $(element).find('>td').map((index: number, element: CheerioElement) => {
          subarr.push($(element).text().trim());
        });
        row.push(subarr);
      });
      rows.push(row);
    });

    let contentStr = JSON.stringify(rows);
    await this.runner.call('t_stockarchives$save', [id, const_type_sinaStockStructure, '', contentStr]);
    console.log('scan sinaStockStructure, code: ' + id + ' - ' + symbol);
  }
}

class sinaBalanceSheet extends sinaFiles {
  constructor(runner: Runner) {
    super(runner);
  }

  protected async scanItem(item: any) {
    let { id, symbol, code } = item as { id: number, symbol: string, code: string };
    let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_BalanceSheet/stockid/'
       + code + '/ctrl/part/displaytype/4.phtml';
    let content = await fetchSinaContent(url);
    let years:string[] = [];
    let $ = cheerio.load(content);
    $('#con02-1').find('>table').first().find('>tbody').first().find('a')
      .map((index: number, element: CheerioElement) => {
      let ys = $(element).text().trim();
      if (ys.length > 0)
        years.push(ys);
    });

    for (let i = 0; i < years.length; ++i) {
      let year = years[i].trim();
      let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_BalanceSheet/stockid/'
        + code + '/ctrl/' + year +'/displaytype/4.phtml';
      let cont = await fetchSinaContent(urlone);
      let row:any[][] = [];
      let $ = cheerio.load(cont);
      $('#BalanceSheetNewTable0').find('>tbody').first().find('>tr')
        .map((index: number, element: CheerioElement) => {
        let subarr:any[] = [];
        $(element).find('>td').map((index: number, element: CheerioElement) => {
          subarr.push($(element).text().trim());
        });
        row.push(subarr);
      });

      let contentStr = JSON.stringify(row);
      await this.runner.call('t_stockarchives$save', [id, const_type_sinaBalanceSheet, year, contentStr]);
    }
    console.log('scan scanBalanceSheet, code: ' + id + ' - ' + symbol);
  }
}

class sinaProfitStatement extends sinaFiles {
  constructor(runner: Runner) {
    super(runner);
  }

  protected async scanItem(item: any) {
    let { id, symbol, code } = item as { id: number, symbol: string, code: string };
    let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_ProfitStatement/stockid/'
       + code + '/ctrl/part/displaytype/4.phtml';
    let content = await fetchSinaContent(url);
    let years:string[] = [];
    let $ = cheerio.load(content);
    $('#con02-1').find('>table').first().find('>tbody').first().find('a')
      .map((index: number, element: CheerioElement) => {
      let ys = $(element).text().trim();
      if (ys.length > 0)
        years.push(ys);
    });

    for (let i = 0; i < years.length; ++i) {
      let year = years[i].trim();
      let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_ProfitStatement/stockid/'
        + code + '/ctrl/' + year +'/displaytype/4.phtml';
      let cont = await fetchSinaContent(urlone);
      let row:any[][] = [];
      let $ = cheerio.load(cont);
      $('#ProfitStatementNewTable0').find('>tbody').first().find('>tr')
        .map((index: number, element: CheerioElement) => {
        let subarr:any[] = [];
        $(element).find('>td').map((index: number, element: CheerioElement) => {
          subarr.push($(element).text().trim());
        });
        row.push(subarr);
      });

      let contentStr = JSON.stringify(row);
      await this.runner.call('t_stockarchives$save', [id, const_type_sinaProfitStatement, year, contentStr]);
    }
    console.log('scan scanProfitStatement, code: ' + id + ' - ' + symbol);
  }
}

class sinaCashFlow extends sinaFiles {
  constructor(runner: Runner) {
    super(runner);
  }

  protected async scanItem(item: any) {
    let { id, symbol, code } = item as { id: number, symbol: string, code: string };
    let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_CashFlow/stockid/'
       + code + '/ctrl/part/displaytype/4.phtml';
    let content = await fetchSinaContent(url);
    let years:string[] = [];
    let $ = cheerio.load(content);
    $('#con02-1').find('>table').first().find('>tbody').first().find('a')
      .map((index: number, element: CheerioElement) => {
      let ys = $(element).text().trim();
      if (ys.length > 0)
        years.push(ys);
    });

    for (let i = 0; i < years.length; ++i) {
      let year = years[i].trim();
      let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_CashFlow/stockid/'
        + code + '/ctrl/' + year +'/displaytype/4.phtml';
      let cont = await fetchSinaContent(urlone);
      let row:any[][] = [];
      let $ = cheerio.load(cont);
      $('#ProfitStatementNewTable0').find('>tbody').first().find('>tr')
        .map((index: number, element: CheerioElement) => {
        let subarr:any[] = [];
        $(element).find('>td').map((index: number, element: CheerioElement) => {
          subarr.push($(element).text().trim());
        });
        row.push(subarr);
      });

      let contentStr = JSON.stringify(row);
      await this.runner.call('t_stockarchives$save', [id, const_type_sinaCashFlow, year, contentStr]);
    }
    console.log('scan scanCashFlow, code: ' + id + ' - ' + symbol);
  }
}
