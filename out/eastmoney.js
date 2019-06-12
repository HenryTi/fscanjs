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
const request = require("request");
const db_1 = require("./uq-api/db");
const capitalStockStructureUrl = 'http://f10.eastmoney.com/CapitalStockStructure/CapitalStockStructureAjax?code=';
const financeAnalysisSeasonUrl = 'http://f10.eastmoney.com/NewFinanceAnalysis/MainTargetAjax?type=2&code=';
const financeAnalysisYearUrl = 'http://f10.eastmoney.com/NewFinanceAnalysis/MainTargetAjax?type=1&code=';
function scanEastmoney() {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield db_1.getRunner('mi');
        let f = new FechStockContents(runner);
        let ret = [];
        let pageStart = 0, pageSize = 500;
        for (;;) {
            let ids = yield runner.tuidSeach('股票', 35, undefined, undefined, '', pageStart, pageSize);
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
        let i;
        for (i = 0; i < count; ++i) {
            let value = ret[i];
            yield f.processOne(value);
        }
    });
}
exports.scanEastmoney = scanEastmoney;
class FechStockContents {
    constructor(runner) {
        this.runner = runner;
    }
    processOne(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, 市场, 代码 } = item;
            let scode = 市场 + 代码;
            let url = capitalStockStructureUrl + scode;
            let capitals = yield this.fetch(url);
            yield this.saveCapitalStockStructure(id, capitals);
            url = financeAnalysisYearUrl + scode;
            let financeYearContent = yield this.fetch(url);
            yield this.saveFinanceAnalysis(id, financeYearContent);
            url = financeAnalysisSeasonUrl + scode;
            let financeContent = yield this.fetch(url);
            yield this.saveFinanceAnalysisSeason(id, financeContent);
        });
    }
    fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    request.get(url, (error, response, body) => {
                        resolve(body);
                    });
                }
                catch (reqErr) {
                    reject(reqErr);
                }
            });
        });
    }
    checkToNumber(index, list) {
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
    checkToNumber1(str) {
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
    checkToDateInt(str) {
        let s = str.split('-').join('');
        let ret = parseInt(s);
        if (isNaN(ret))
            return undefined;
        return ret;
    }
    checkToString(index, list) {
        return list.length > index ? list[index] : undefined;
    }
    saveCapitalStockStructure(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let jdata = JSON.parse(value);
                let { ShareChangeList } = jdata;
                let dayList = [];
                let 总股本 = [];
                let 已流通股份 = [];
                let 已上市流通A股 = [];
                let 境外上市流通股 = [];
                let 流通受限股份 = [];
                let 变动原因 = [];
                ShareChangeList.forEach((item, index) => {
                    let { des, changeList } = item;
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
                let i;
                let promiseArr = [];
                for (i = 0; i < count; ++i) {
                    let date = this.checkToDateInt(dayList[i]);
                    if (date === undefined)
                        continue;
                    let row = [
                        id,
                        date,
                        this.checkToNumber(i, 总股本),
                        this.checkToNumber(i, 已流通股份),
                        this.checkToNumber(i, 已上市流通A股),
                        this.checkToNumber(i, 境外上市流通股),
                        this.checkToNumber(i, 流通受限股份),
                        this.checkToString(i, 变动原因).substring(0, 64),
                    ];
                    promiseArr.push(this.runner.mapSave('东方财富历年股本', 35, undefined, row));
                }
                yield Promise.all(promiseArr);
            }
            catch (err) {
                debugger;
                console.log(err);
            }
        });
    }
    saveFinanceAnalysis(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let jdata = JSON.parse(value);
                let jarr = jdata;
                let promiseArr = [];
                jarr.forEach((item, index) => {
                    let date = item.date;
                    if (date !== null && date !== undefined) {
                        let dint = this.checkToDateInt(date);
                        if (dint !== undefined) {
                            let row = [
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
                            promiseArr.push(this.runner.mapSave('东方财富财务分析', 35, undefined, row));
                        }
                    }
                });
                yield Promise.all(promiseArr);
            }
            catch (err) {
                debugger;
                console.log(err);
            }
        });
    }
    saveFinanceAnalysisSeason(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let jdata = JSON.parse(value);
                let jarr = jdata;
                let promiseArr = [];
                jarr.forEach((item, index) => {
                    let date = item.date;
                    if (date !== null && date !== undefined) {
                        let dint = this.checkToDateInt(date);
                        if (dint !== undefined) {
                            let row = [
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
                            promiseArr.push(this.runner.mapSave('东方财富财务分析季报', 35, undefined, row));
                        }
                    }
                });
                yield Promise.all(promiseArr);
            }
            catch (err) {
                debugger;
                console.log(err);
            }
        });
    }
}
//# sourceMappingURL=eastmoney.js.map