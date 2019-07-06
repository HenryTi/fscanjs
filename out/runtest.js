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
const sinafiles_1 = require("./scan/sinafiles");
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
let date = new Date();
let yn = date.getFullYear();
function scansina() {
    return __awaiter(this, void 0, void 0, function* () {
        yield sinafiles_1.scanSinaFiles(0, true, 'finance');
        yield sinafiles_1.scanSinaFiles(0, true, 'balancesheet');
        yield sinafiles_1.scanSinaFiles(0, true, 'profitstatement');
        yield sinafiles_1.scanSinaFiles(0, true, 'stockstructure');
    });
}
scansina();
//caclulateExRight();
//emulateTradeMonthChange();
//# sourceMappingURL=runtest.js.map