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
const runner_1 = require("../runner");
const const_1 = require("../const");
function updateAllEarning() {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield runner_1.getRunnerN('mi');
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
        try {
            yield runner.query('clearcapitalearningall', const_1.DefaultUnit, undefined, []);
        }
        catch (err) {
        }
        let rCount = 0;
        let sum = 0;
        for (let i = 0; i < count; ++i) {
            yield calculateOne(ret[i], runner);
        }
        console.log('updateAllEarning completed');
    });
}
exports.updateAllEarning = updateAllEarning;
function checkNull(v) {
    return v === null || v === undefined;
}
function calculateOne(code, runner) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { id } = code;
            let pret = yield runner.mapQuery('新浪财务指标', const_1.DefaultUnit, undefined, [id, undefined, 12]);
            let parr = pret;
            for (let i = 0; i < parr.length; ++i) {
                let item = parr[i];
                let year = item.year;
                let capital = item.每股净资产_调整前;
                if (checkNull(capital)) {
                    capital = item.每股净资产_调整后;
                    if (checkNull(capital))
                        continue;
                }
                let earning = item.摊薄每股收益;
                if (checkNull(earning)) {
                    earning = item.扣非每股收益;
                    if (checkNull(earning)) {
                        earning = item.每股收益_调整后;
                        if (checkNull(earning)) {
                            earning = item.加权每股收益;
                            if (checkNull(earning))
                                continue;
                        }
                    }
                }
                let e = Number(earning);
                if (e >= 1000)
                    continue;
                yield runner.mapSave('capitalearning', const_1.DefaultUnit, undefined, [id, year, capital, e]);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
//# sourceMappingURL=updateEarnig.js.map