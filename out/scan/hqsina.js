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
function scanSinaQuotations() {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner('mi');
            let ret = [];
            let pageStart = 0, pageSize = 500;
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
            let oneGroup = [];
            i = 0;
            let totalCount = 0;
            for (;;) {
                if (i >= count) {
                    break;
                }
                let code = ret[i];
                oneGroup.push(code);
                ++i;
                if (oneGroup.length >= 40 || i >= count) {
                    let gv = oneGroup;
                    oneGroup = [];
                    let sqg = new SinaQuotationGroup(runner);
                    let r = yield sqg.processOneGroup(gv);
                    if (r != 1) {
                        retryArr.push(gv);
                    }
                    else {
                        totalCount += gv.length;
                        console.log('sinahq: count=' + totalCount);
                    }
                }
            }
            count = retryArr.length;
            for (i = 0; i < count; ++i) {
                let gv = retryArr[i];
                for (j = 0; j < 10; ++j) {
                    yield gfuncs_1.sleep(3000);
                    let sqg = new SinaQuotationGroup(runner);
                    let r = yield sqg.processOneGroup(gv);
                    if (r == 1) {
                        totalCount += gv.length;
                        console.log('sinahq retry: count=' + totalCount);
                        break;
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
        gfuncs_1.RemoteRun(false);
    });
}
exports.scanSinaQuotations = scanSinaQuotations;
class SinaQuotationGroup {
    constructor(runner) {
        this.runner = runner;
        this.idTable = {};
    }
    processOneGroup(items) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.idTable = {};
                let lstr = '';
                items.forEach((value, index) => {
                    let { symbol } = value;
                    lstr += ',' + symbol;
                    let idname = symbol;
                    this.idTable[idname] = value;
                });
                if (lstr.length <= 1)
                    return 1;
                let url = 'https://hq.sinajs.cn/list=' + lstr.substring(1);
                let results = yield this.fetchString(url);
                if (results === null || results === undefined) {
                    results = yield this.fetchString(url);
                }
                if (results === null || results === undefined) {
                    results = yield this.fetchString(url);
                }
                yield this.saveQutations(results);
            }
            catch (err) {
                return 0;
            }
            return 1;
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
    saveQutations(values) {
        return __awaiter(this, void 0, void 0, function* () {
            let lines = values.split('\n');
            let promiseArr = [];
            let i;
            let count = lines.length;
            for (i = 0; i < count; ++i) {
                let line = lines[i];
                if (line.length <= 0)
                    break;
                let arr = line.split('=');
                let head = arr[0].substring(11);
                let subarr = arr[1].split('"');
                let items = subarr[1].split(',');
                if (items.length < 6)
                    continue;
                let idItem = this.idTable[head];
                let row = this.getQuotatonRow(idItem, items);
                if (row === undefined)
                    throw 'hqsina 返回格式错误';
                if (row[3] === '0.000')
                    continue;
                promiseArr.push(this.runner.mapSave('股票价格', const_1.DefaultUnit, undefined, row));
            }
            if (promiseArr.length > 0) {
                yield Promise.all(promiseArr);
            }
        });
    }
    getQuotatonRow(idItem, arr) {
        let { id, market } = idItem;
        let row = [id];
        let date;
        switch (market) {
            default:
                date = gfuncs_1.checkToDateInt(arr[30]);
                if (date === undefined)
                    return undefined;
                row.push(date);
                row.push(arr[3]);
                row.push(arr[1]);
                row.push(arr[4]);
                row.push(arr[5]);
                break;
            case 'HK':
                date = gfuncs_1.checkToDateInt(arr[17]);
                if (date === undefined)
                    return undefined;
                row.push(date);
                row.push(arr[6]);
                row.push(arr[2]);
                row.push(arr[4]);
                row.push(arr[5]);
                break;
        }
        return row;
    }
}
//# sourceMappingURL=hqsina.js.map