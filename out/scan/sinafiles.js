"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const sina_1 = require("./sina");
const const_1 = require("../const");
const cheerio = require("cheerio");
const const_type_sinaFinance = '新浪财务指标';
const const_type_sinaStockStructure = '新浪股本结构';
const const_type_sinaBalanceSheet = '新浪资产负债表';
const const_type_sinaProfitStatement = '新浪利润表';
const const_type_sinaCashFlow = '新浪现金流量表';
async function scanSinaFiles(start, scanType) {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    console.log(`scanSinaAllFiles(${scanType}) Begin`);
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let sinascanner;
        switch (scanType) {
            default:
                gfuncs_1.RemoteRun(false);
                return;
            case 'finance':
                sinascanner = new sinaFinance(runner);
                break;
            case 'stockstructure':
                sinascanner = new sinaStockStructure(runner);
                break;
            case 'balancesheet':
                sinascanner = new sinaBalanceSheet(runner);
                break;
            case 'profitstatement':
                sinascanner = new sinaProfitStatement(runner);
                break;
            case 'cashflow':
                sinascanner = new sinaCashFlow(runner);
                break;
        }
        let pageStart = start, pageSize = 100;
        for (;;) {
            let ids = await runner.query('tv_股票$search', ['', pageStart, pageSize]);
            let arr = ids;
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
    console.log(`scanSinaAllFiles(${scanType}) End`);
    gfuncs_1.RemoteRun(false);
}
exports.scanSinaFiles = scanSinaFiles;
class sinaFiles {
    constructor(runner) {
        this.runner = runner;
        this.retryArr = [];
    }
    async processGroup(items) {
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
                    gfuncs_1.sleep(3000);
            }
        }
    }
    async processOne(item) {
        try {
            await this.scanItem(item);
        }
        catch (err) {
            this.retryArr.push(item);
            return false;
        }
        return true;
    }
    async retryOne(item) {
        try {
            await this.scanItem(item);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    async scanItem(item) {
        if (this.checkExist(item)) {
            await this.scanRecentYears(item);
        }
        else {
            await this.scanAllYears(item);
        }
    }
    async checkExist(item) {
        return true;
    }
    async scanRecentYears(item) {
        let date = new Date();
        let yn = date.getFullYear();
        try {
            await this.scanOneYear(item, yn.toString());
            let month = date.getMonth();
            if (month <= 5) {
                --yn;
                await this.scanOneYear(item, yn.toString());
            }
        }
        catch (err) {
        }
    }
}
class sinaFinance extends sinaFiles {
    constructor(runner) {
        super(runner);
    }
    async checkExist(item) {
        let { id } = item;
        try {
            let r = await this.runner.call('t_stockarchives$query', [id, const_type_sinaFinance, undefined]);
            if (r === undefined)
                return false;
            if (r.length <= 0)
                return false;
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async scanAllYears(item) {
        let { id, symbol, code } = item;
        let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
            + code + '/displaytype/4.phtml';
        let content = await sina_1.fetchSinaContent(url);
        let years = [];
        let $ = cheerio.load(content);
        $('#con02-1').find('>table').first().find('>tbody').first().find('>tr').first().find('a')
            .map((index, element) => {
            years.push($(element).text());
        });
        for (let i = 0; i < years.length; ++i) {
            let year = years[i].trim();
            if (year.length > 0) {
                await this.scanOneYear(item, year);
            }
        }
        console.log('sinaFinance, scanall, code: ' + id + ' - ' + symbol);
    }
    async scanOneYear(item, year) {
        let { id, symbol, code } = item;
        let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
            + code + '/ctrl/' + year + '/displaytype/4.phtml';
        let cont = await sina_1.fetchSinaContent(urlone);
        let row = [];
        let $ = cheerio.load(cont);
        $('#BalanceSheetNewTable0').find('>tbody').first().find('>tr')
            .map((index, element) => {
            let subarr = [];
            $(element).find('>td').map((index, element) => {
                subarr.push($(element).text().trim());
            });
            row.push(subarr);
        });
        let contentStr = JSON.stringify(row);
        await this.runner.call('t_stockarchives$save', [id, const_type_sinaFinance, year, contentStr]);
    }
}
;
class sinaStockStructure extends sinaFiles {
    constructor(runner) {
        super(runner);
    }
    async checkExist(item) {
        return false;
    }
    async scanItem(item) {
        await this.scanAllYears(item);
    }
    async scanAllYears(item) {
        let { id, symbol, code } = item;
        let url = 'http://vip.stock.finance.sina.com.cn/corp/go.php/vCI_StockStructure/stockid/' + code + '.phtml';
        let content = await sina_1.fetchSinaContent(url);
        let rows = [];
        let $ = cheerio.load(content);
        $('#con02-1').find('>table')
            .map((index, element) => {
            let row = [];
            $(element).find('>tbody').first().find('>tr').map((index, element) => {
                let subarr = [];
                $(element).find('>td').map((index, element) => {
                    subarr.push($(element).text().trim());
                });
                row.push(subarr);
            });
            rows.push(row);
        });
        let contentStr = JSON.stringify(rows);
        await this.runner.call('t_stockarchives$save', [id, const_type_sinaStockStructure, '', contentStr]);
        //console.log('sinaStockStructure, code: ' + id + ' - ' + symbol);
    }
    async scanOneYear(item, year) {
    }
}
class sinaBalanceSheet extends sinaFiles {
    constructor(runner) {
        super(runner);
    }
    async checkExist(item) {
        let { id } = item;
        try {
            let r = await this.runner.call('t_stockarchives$query', [id, const_type_sinaBalanceSheet, undefined]);
            if (r === undefined)
                return false;
            if (r.length <= 0)
                return false;
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async scanAllYears(item) {
        let { id, symbol, code } = item;
        let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_BalanceSheet/stockid/'
            + code + '/ctrl/part/displaytype/4.phtml';
        let content = await sina_1.fetchSinaContent(url);
        let years = [];
        let $ = cheerio.load(content);
        $('#con02-1').find('>table').first().find('>tbody').first().find('a')
            .map((index, element) => {
            let ys = $(element).text().trim();
            if (ys.length > 0)
                years.push(ys);
        });
        for (let i = 0; i < years.length; ++i) {
            let year = years[i].trim();
            if (year.length > 0)
                await this.scanOneYear(item, year);
        }
        console.log('scanBalanceSheet, scanall, code: ' + id + ' - ' + symbol);
    }
    async scanOneYear(item, year) {
        let { id, symbol, code } = item;
        let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_BalanceSheet/stockid/'
            + code + '/ctrl/' + year + '/displaytype/4.phtml';
        let cont = await sina_1.fetchSinaContent(urlone);
        let row = [];
        let $ = cheerio.load(cont);
        $('#BalanceSheetNewTable0').find('>tbody').first().find('>tr')
            .map((index, element) => {
            let subarr = [];
            $(element).find('>td').map((index, element) => {
                subarr.push($(element).text().trim());
            });
            row.push(subarr);
        });
        let contentStr = JSON.stringify(row);
        await this.runner.call('t_stockarchives$save', [id, const_type_sinaBalanceSheet, year, contentStr]);
    }
}
class sinaProfitStatement extends sinaFiles {
    constructor(runner) {
        super(runner);
    }
    async checkExist(item) {
        let { id } = item;
        try {
            let r = await this.runner.call('t_stockarchives$query', [id, const_type_sinaProfitStatement, undefined]);
            if (r === undefined)
                return false;
            if (r.length <= 0)
                return false;
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async scanAllYears(item) {
        let { id, symbol, code } = item;
        let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_ProfitStatement/stockid/'
            + code + '/ctrl/part/displaytype/4.phtml';
        let content = await sina_1.fetchSinaContent(url);
        let years = [];
        let $ = cheerio.load(content);
        $('#con02-1').find('>table').first().find('>tbody').first().find('a')
            .map((index, element) => {
            let ys = $(element).text().trim();
            if (ys.length > 0)
                years.push(ys);
        });
        for (let i = 0; i < years.length; ++i) {
            let year = years[i].trim();
            if (year.length > 0)
                await this.scanOneYear(item, year);
        }
        console.log('scanProfitStatement, scanall, code: ' + id + ' - ' + symbol);
    }
    async scanOneYear(item, year) {
        let { id, symbol, code } = item;
        let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_ProfitStatement/stockid/'
            + code + '/ctrl/' + year + '/displaytype/4.phtml';
        let cont = await sina_1.fetchSinaContent(urlone);
        let row = [];
        let $ = cheerio.load(cont);
        $('#ProfitStatementNewTable0').find('>tbody').first().find('>tr')
            .map((index, element) => {
            let subarr = [];
            $(element).find('>td').map((index, element) => {
                subarr.push($(element).text().trim());
            });
            row.push(subarr);
        });
        let contentStr = JSON.stringify(row);
        await this.runner.call('t_stockarchives$save', [id, const_type_sinaProfitStatement, year, contentStr]);
    }
}
class sinaCashFlow extends sinaFiles {
    constructor(runner) {
        super(runner);
    }
    async checkExist(item) {
        let { id } = item;
        try {
            let r = await this.runner.call('t_stockarchives$query', [id, const_type_sinaCashFlow, undefined]);
            if (r === undefined)
                return false;
            if (r.length <= 0)
                return false;
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async scanAllYears(item) {
        let { id, symbol, code } = item;
        let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_CashFlow/stockid/'
            + code + '/ctrl/part/displaytype/4.phtml';
        let content = await sina_1.fetchSinaContent(url);
        let years = [];
        let $ = cheerio.load(content);
        $('#con02-1').find('>table').first().find('>tbody').first().find('a')
            .map((index, element) => {
            let ys = $(element).text().trim();
            if (ys.length > 0)
                years.push(ys);
        });
        for (let i = 0; i < years.length; ++i) {
            let year = years[i].trim();
            if (year.length > 0) {
                await this.scanOneYear(item, year);
            }
        }
        console.log('scanCashFlow, scanall, code: ' + id + ' - ' + symbol);
    }
    async scanOneYear(item, year) {
        let { id, symbol, code } = item;
        let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_CashFlow/stockid/'
            + code + '/ctrl/' + year + '/displaytype/4.phtml';
        let cont = await sina_1.fetchSinaContent(urlone);
        let row = [];
        let $ = cheerio.load(cont);
        $('#ProfitStatementNewTable0').find('>tbody').first().find('>tr')
            .map((index, element) => {
            let subarr = [];
            $(element).find('>td').map((index, element) => {
                subarr.push($(element).text().trim());
            });
            row.push(subarr);
        });
        let contentStr = JSON.stringify(row);
        await this.runner.call('t_stockarchives$save', [id, const_type_sinaCashFlow, year, contentStr]);
    }
}
//# sourceMappingURL=sinafiles.js.map