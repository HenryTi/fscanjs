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
const const_1 = require("../const");
function calculateAllRoe() {
    return __awaiter(this, void 0, void 0, function* () {
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
        let rCount = 0;
        let sum = 0;
        for (let i = 0; i < count; ++i) {
            yield calculateOne(ret[i], runner);
        }
        console.log('calculateAllRoe completed');
    });
}
exports.calculateAllRoe = calculateAllRoe;
function calculateOne(code, runner) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { id } = code;
            let pret = yield runner.query('getcapitalearning', const_1.DefaultUnit, undefined, [id]);
            let parr = pret;
            if (parr.length <= 0)
                return;
            let ce = {};
            parr.forEach((item) => {
                let { year, capital, earning } = item;
                let roe = capital > 0 ? earning / capital : 0;
                ce[year] = { roe: roe };
            });
            let count = parr.length;
            for (let i = 0; i < count; ++i) {
                let item = parr[i];
                let { year } = item;
                let roe = ce[year];
                if (roe !== undefined) {
                    let sum = roe.roe;
                    yield runner.mapSave('roe', const_1.DefaultUnit, undefined, [id, year, 1, sum]);
                    let preyear = year;
                    let weight = 1;
                    let sw = 1;
                    for (let k = 2; k <= 5; ++k) {
                        --preyear;
                        let ri = ce[preyear];
                        if (ri === undefined)
                            break;
                        sw -= 0.125;
                        sum += ri.roe * sw;
                        weight += sw;
                        let roeavg = sum / weight;
                        yield runner.mapSave('roe', const_1.DefaultUnit, undefined, [id, year, k, roeavg]);
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
//# sourceMappingURL=roe.js.map