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
const sina = require("./sina");
const eastmoney_1 = require("./eastmoney");
var BufferHelper = require('bufferhelper');
const urlOptions = {
    uri: 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/600036/displaytype/4.phtml',
};
let s = new sina.FechContent();
//s.fech(urlOptions.uri);
const uris = [
    'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/600036/displaytype/4.phtml',
];
function processUris() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let uri of uris) {
            yield s.process(uri);
        }
    });
}
//processUris();
const jsonPath = '../data/shsz.json';
let s1 = '123,456,678.9';
let arr = s1.split(',');
var str = arr.join('').substring(0, 64);
var ssss = '134124312431242fgregtergtregaergregtregear'.substring(0, 5);
let a1 = 2;
eastmoney_1.scanEastmoney();
let a = 1;
//# sourceMappingURL=index.js.map