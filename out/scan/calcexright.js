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
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
function caclulateExRight() {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield runner_1.getRunnerN('mi');
        let sinaer = new CalculateSinaExRight(runner);
        try {
            let ret = [];
            let pageStart = 0, pageSize = 100;
            for (;;) {
                let ids = yield runner.tuidSeach('股票', const_1.DefaultUnit, undefined, undefined, '', pageStart, pageSize);
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
    });
}
exports.caclulateExRight = caclulateExRight;
class CalculateSinaExRight {
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
            console.log('calculate sinaExRight onegroup : ' + items.length);
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
            let paramObj = { stock: id };
            yield this.runner.actionFromObj('计算除权因子', const_1.DefaultUnit, undefined, paramObj);
        });
    }
}
//# sourceMappingURL=calcexright.js.map