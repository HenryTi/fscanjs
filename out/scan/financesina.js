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
function scanSinaFinance(start) {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner(const_1.Const_dbname);
            let sinaer = new SinaFinace(runner);
            let ret = [];
            let pageStart = start, pageSize = 100;
            for (;;) {
                let ids = yield runner.query('tv_股票$search', ['', pageStart, pageSize]);
                let arr = ids[0];
                if (arr.length > pageSize) {
                    let top = arr.pop();
                    pageStart = arr[pageSize - 1].id;
                    yield sinaer.processGroup(arr);
                }
                else {
                    if (arr.length > 0) {
                        yield sinaer.processGroup(arr);
                    }
                    break;
                }
            }
            yield sinaer.processRetry();
        }
        catch (err) {
            console.log(err);
        }
        gfuncs_1.RemoteRun(false);
    });
}
exports.scanSinaFinance = scanSinaFinance;
function parseToDate(str) {
    let r = { year: 0, month: 0, day: 0 };
    let s = str.split('-');
    r.year = parseInt(s[0]);
    r.month = parseInt(s[1]);
    r.day = parseInt(s[2]);
    if (isNaN(r.year) || isNaN(r.month) || isNaN(r.day))
        return undefined;
    return r;
}
function checkparseNumber(s) {
    if (s == '--')
        return undefined;
    let ret = Number(s);
    if (isNaN(ret))
        return undefined;
    return ret;
}
class SinaFinace {
    constructor(runner) {
        this.runner = runner;
        this.retryArr = [];
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
            let { id, symbol, code } = item;
            let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
                + code + '/displaytype/4.phtml';
            let content = yield sina_1.fetchSinaContent(url);
            let promiseArr = [];
            let years = [];
            let $ = cheerio.load(content);
            $('#con02-1').find('>table').first().find('>tbody').first().find('>tr').first().find('a')
                .map((index, element) => {
                years.push($(element).text());
            });
            for (let i = 0; i < years.length; ++i) {
                let year = years[i].trim();
                let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
                    + code + '/ctrl/' + year + '/displaytype/4.phtml';
                let cont = yield sina_1.fetchSinaContent(urlone);
                let row = [];
                let $ = cheerio.load(cont);
                $('#BalanceSheetNewTable0').find('>tbody').first().find('>tr')
                    .map((index, element) => {
                    let subarr = [];
                    $(element).find('>td').map((index, element) => {
                        subarr.push($(element).text());
                    });
                    row.push(subarr);
                });
                if (row.length < 11)
                    continue;
                let dateArr = row[0];
                for (let k = 1; k < dateArr.length; ++k) {
                    let nitem = [id];
                    let date = parseToDate(dateArr[k]);
                    if (date === undefined)
                        break;
                    nitem.push(date.year);
                    nitem.push(date.month);
                    let findData = false;
                    for (let ni = 2; ni < 11; ++ni) {
                        let s = row[ni][k];
                        let value = checkparseNumber(s);
                        if (value !== undefined)
                            findData = true;
                        nitem.push(value);
                    }
                    if (findData) {
                        yield this.runner.query('tv_新浪财务指标$save', nitem);
                    }
                }
            }
            console.log('scan sinaFinance, code: ' + id + ' - ' + symbol);
        });
    }
}
//# sourceMappingURL=financesina.js.map