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
const db_1 = require("../uq-api/db");
const gfuncs_1 = require("../gfuncs");
const sina_1 = require("./sina");
const const_1 = require("../const");
function scanSinaHistory(len, start) {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield db_1.getRunner('mi');
        let sqg = new SinaHistory(runner);
        let ret = [];
        let pageStart = start, pageSize = 500;
        for (;;) {
            let ids = yield runner.tuidSeach('股票', const_1.DefaultUnit, undefined, undefined, '', pageStart, pageSize);
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
        let i, j;
        let retryArr = [];
        i = 0;
        for (;;) {
            if (i >= count) {
                break;
            }
            let code = ret[i];
            ++i;
            let r = yield sqg.processOne(code, len);
            if (!r) {
                retryArr.push(code);
            }
            else {
                if (len > 1000) {
                    yield gfuncs_1.sleep(1000);
                }
                console.log('sinahistory: ' + code['id'] + ' : ' + code['symbol']);
            }
        }
        count = retryArr.length;
        for (i = 0; i < count; ++i) {
            let rc = retryArr[i];
            for (j = 0; j < 10; ++j) {
                yield gfuncs_1.sleep(3000);
                let r = yield sqg.processOne(rc, len);
                if (r) {
                    console.log('sinahistory retry: ' + rc['id'] + ' : ' + rc['symbol']);
                    break;
                }
            }
        }
    });
}
exports.scanSinaHistory = scanSinaHistory;
class SinaHistory {
    constructor(runner) {
        this.runner = runner;
    }
    processOne(item, len) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, symbol } = item;
                let url = 'https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?scale=240&ma=5&symbol='
                    + symbol + '&datalen=' + len;
                let results = yield this.fetchString(url);
                if (results === null || results === undefined) {
                    results = yield this.fetchString(url);
                }
                if (results === null || results === undefined) {
                    results = yield this.fetchString(url);
                }
                yield this.saveHistory(id, results);
            }
            catch (err) {
                return false;
            }
            return true;
        });
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
    saveHistory(id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            let lines = eval(values);
            let promiseArr = [];
            let i;
            let count = lines.length;
            for (i = 0; i < count; ++i) {
                let item = lines[i];
                let { day, open, high, low, close, volume } = item;
                let date = gfuncs_1.checkToDateInt(day);
                if (date === undefined)
                    continue;
                let row = [id, date, close, open, high, low, volume];
                promiseArr.push(this.runner.mapSave('股票价格历史', const_1.DefaultUnit, undefined, row));
                if (promiseArr.length >= 200) {
                    yield Promise.all(promiseArr);
                    promiseArr.splice(0, promiseArr.length);
                }
            }
            if (promiseArr.length > 0) {
                yield Promise.all(promiseArr);
            }
        });
    }
}
//# sourceMappingURL=historysina.js.map