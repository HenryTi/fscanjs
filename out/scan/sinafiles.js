"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function scanSinaFiles(start, scanAll, scanType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner(const_1.Const_dbname);
            let sinascanner;
            switch (scanType) {
                default:
                    gfuncs_1.RemoteRun(false);
                    return;
                case 'finance':
                    sinascanner = new sinaFinance(runner, scanAll);
                    break;
                case 'stockstructure':
                    sinascanner = new sinaStockStructure(runner, scanAll);
                    break;
                case 'balancesheet':
                    sinascanner = new sinaBalanceSheet(runner, scanAll);
                    break;
                case 'profitstatement':
                    sinascanner = new sinaProfitStatement(runner, scanAll);
                    break;
                case 'cashflow':
                    sinascanner = new sinaCashFlow(runner, scanAll);
                    break;
            }
            let pageStart = start, pageSize = 100;
            for (;;) {
                let ids = yield runner.query('tv_股票$search', ['', pageStart, pageSize]);
                let arr = ids;
                if (arr.length > pageSize) {
                    let top = arr.pop();
                    pageStart = arr[pageSize - 1].id;
                    yield sinascanner.processGroup(arr);
                }
                else {
                    if (arr.length > 0) {
                        yield sinascanner.processGroup(arr);
                    }
                    break;
                }
            }
            yield sinascanner.processRetry();
        }
        catch (err) {
            console.log(err);
        }
        gfuncs_1.RemoteRun(false);
    });
}
exports.scanSinaFiles = scanSinaFiles;
class sinaFiles {
    constructor(runner, all) {
        this.runner = runner;
        this.retryArr = [];
        this.scanAll = all;
    }
    processGroup(items) {
        return __awaiter(this, void 0, void 0, function* () {
            if (items.length <= 0)
                return;
            for (let i = 0; i < items.length; ++i) {
                let item = items[i];
                yield this.processOne(item);
            }
        });
    }
    processRetry() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < this.retryArr.length; ++index) {
                let item = this.retryArr[index];
                for (let i = 0; i < 5; ++i) {
                    let r = yield this.retryOne(item);
                    if (r)
                        break;
                    else
                        gfuncs_1.sleep(3000);
                }
            }
        });
    }
    processOne(item) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.scanItem(item);
            }
            catch (err) {
                this.retryArr.push(item);
                return false;
            }
            return true;
        });
    }
    retryOne(item) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.scanItem(item);
            }
            catch (err) {
                return false;
            }
            return true;
        });
    }
    scanItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.scanAll) {
                yield this.scanAllYears(item);
            }
            else {
                yield this.scanRecentYears(item);
            }
        });
    }
    scanRecentYears(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let date = new Date();
            let yn = date.getFullYear();
            try {
                yield this.scanOneYear(item, yn.toString());
                --yn;
                yield this.scanOneYear(item, yn.toString());
            }
            catch (err) {
            }
        });
    }
}
class sinaFinance extends sinaFiles {
    constructor(runner, all) {
        super(runner, all);
    }
    scanAllYears(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
                + code + '/displaytype/4.phtml';
            let content = yield sina_1.fetchSinaContent(url);
            let years = [];
            let $ = cheerio.load(content);
            $('#con02-1').find('>table').first().find('>tbody').first().find('>tr').first().find('a')
                .map((index, element) => {
                years.push($(element).text());
            });
            for (let i = 0; i < years.length; ++i) {
                let year = years[i].trim();
                if (year.length > 0) {
                    yield this.scanOneYear(item, year);
                }
            }
            console.log('sinaFinance, scanall, code: ' + id + ' - ' + symbol);
        });
    }
    scanOneYear(item, year) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
                + code + '/ctrl/' + year + '/displaytype/4.phtml';
            let cont = yield sina_1.fetchSinaContent(urlone);
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
            yield this.runner.call('t_stockarchives$save', [id, const_type_sinaFinance, year, contentStr]);
            if (!this.scanAll) {
                console.log('sinaFinance, code: ' + id + ' - ' + symbol + ' year:' + year);
            }
        });
    }
}
;
class sinaStockStructure extends sinaFiles {
    constructor(runner, all) {
        super(runner, false);
    }
    scanItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scanAllYears(item);
        });
    }
    scanAllYears(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let url = 'http://vip.stock.finance.sina.com.cn/corp/go.php/vCI_StockStructure/stockid/' + code + '.phtml';
            let content = yield sina_1.fetchSinaContent(url);
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
            yield this.runner.call('t_stockarchives$save', [id, const_type_sinaStockStructure, '', contentStr]);
            console.log('sinaStockStructure, code: ' + id + ' - ' + symbol);
        });
    }
    scanOneYear(item, year) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
class sinaBalanceSheet extends sinaFiles {
    constructor(runner, all) {
        super(runner, all);
    }
    scanAllYears(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_BalanceSheet/stockid/'
                + code + '/ctrl/part/displaytype/4.phtml';
            let content = yield sina_1.fetchSinaContent(url);
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
                    yield this.scanOneYear(item, year);
            }
            console.log('scanBalanceSheet, scanall, code: ' + id + ' - ' + symbol);
        });
    }
    scanOneYear(item, year) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_BalanceSheet/stockid/'
                + code + '/ctrl/' + year + '/displaytype/4.phtml';
            let cont = yield sina_1.fetchSinaContent(urlone);
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
            yield this.runner.call('t_stockarchives$save', [id, const_type_sinaBalanceSheet, year, contentStr]);
            if (!this.scanAll) {
                console.log('scanBalanceSheet, code: ' + id + ' - ' + symbol + ' year:' + year);
            }
        });
    }
}
class sinaProfitStatement extends sinaFiles {
    constructor(runner, all) {
        super(runner, all);
    }
    scanAllYears(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_ProfitStatement/stockid/'
                + code + '/ctrl/part/displaytype/4.phtml';
            let content = yield sina_1.fetchSinaContent(url);
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
                    yield this.scanOneYear(item, year);
            }
            console.log('scanProfitStatement, scanall, code: ' + id + ' - ' + symbol);
        });
    }
    scanOneYear(item, year) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_ProfitStatement/stockid/'
                + code + '/ctrl/' + year + '/displaytype/4.phtml';
            let cont = yield sina_1.fetchSinaContent(urlone);
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
            yield this.runner.call('t_stockarchives$save', [id, const_type_sinaProfitStatement, year, contentStr]);
            if (!this.scanAll) {
                console.log('scanProfitStatement, code: ' + id + ' - ' + symbol + ' year:' + year);
            }
        });
    }
}
class sinaCashFlow extends sinaFiles {
    constructor(runner, all) {
        super(runner, all);
    }
    scanAllYears(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_CashFlow/stockid/'
                + code + '/ctrl/part/displaytype/4.phtml';
            let content = yield sina_1.fetchSinaContent(url);
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
                    yield this.scanOneYear(item, year);
                }
            }
            console.log('scanCashFlow, scanall, code: ' + id + ' - ' + symbol);
        });
    }
    scanOneYear(item, year) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, symbol, code } = item;
            let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_CashFlow/stockid/'
                + code + '/ctrl/' + year + '/displaytype/4.phtml';
            let cont = yield sina_1.fetchSinaContent(urlone);
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
            yield this.runner.call('t_stockarchives$save', [id, const_type_sinaCashFlow, year, contentStr]);
            if (!this.scanAll) {
                console.log('scanCashFlow, code: ' + id + ' - ' + symbol + ' year:' + year);
            }
        });
    }
}
//# sourceMappingURL=sinafiles.js.map