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
const db_1 = require("./uq-api/db");
const sleep_1 = require("./sleep");
const sina_1 = require("./sina");
const const_1 = require("./const");
function scanSinaSymbols() {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield db_1.getRunner('mi');
        let sinaSym = new SinaSymbols(runner);
        yield sinaSym.GetHS_A();
    });
}
exports.scanSinaSymbols = scanSinaSymbols;
class SinaSymbols {
    constructor(runner) {
        this.runner = runner;
    }
    fetchString(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let ret = yield sina_1.fetchSinaContent(url);
                return ret;
            }
            catch (err) {
                console.log(err);
                return undefined;
            }
        });
    }
    GetHS_A() {
        return __awaiter(this, void 0, void 0, function* () {
            let hsaCount = yield this.getHSACount();
            let readCount = 0;
            let page = 1;
            let retryArr = [];
            while (readCount < hsaCount) {
                let r = yield this.GetHSAOnePage(page);
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
                    yield sleep_1.sleep(3000);
                    let r = yield this.GetHSAOnePage(p);
                    ;
                    if (r) {
                        console.log('sinasymbols hsa page : ' + p);
                        break;
                    }
                }
            }
        });
    }
    GetHSAOnePage(page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?num=80&sort=symbol&asc=1&node=hs_a&page=' + page;
                let content = yield sina_1.fetchSinaContent(url);
                let c = eval(content);
                if (c === undefined || c === null)
                    return false;
                return this.saveHSAOnePage(c);
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    getHSACount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount?node=hs_a';
                let str = yield sina_1.fetchSinaContent(url);
                let nstr = eval(str);
                console.log('hs_a count: ' + nstr);
                return Number(nstr);
            }
            catch (err) {
                console.log(err);
                return -1;
            }
        });
    }
    saveHSAOnePage(arr) {
        return __awaiter(this, void 0, void 0, function* () {
            let promiseArr = [];
            let i;
            let count = arr.length;
            for (i = 0; i < count; ++i) {
                let item = arr[i];
                let { symbol, code, name } = item;
                symbol = symbol.toLowerCase().substring(0, 16);
                if (symbol.length < 4)
                    continue;
                name = name.substring(0, 32);
                let market = symbol.substring(0, 2).toUpperCase();
                let row = [undefined, symbol, market, code, name, undefined];
                promiseArr.push(this.runner.tuidSave('股票', const_1.DefaultUnit, undefined, row));
            }
            if (promiseArr.length > 0) {
                yield Promise.all(promiseArr);
            }
            return true;
        });
    }
}
//# sourceMappingURL=symbolsina.js.map