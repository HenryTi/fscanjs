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
const sina_1 = require("./scan/sina");
const cheerio = require("cheerio");
const db_1 = require("./uq-api/db");
const const_1 = require("./const");
function doTest() {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield db_1.getRunner('mi');
        let row = [1, 5, 20160101, 20160901];
        let r1 = yield runner.query('getstockexearning', const_1.DefaultUnit, null, row);
        let row2 = [const_1.DefaultUnit, null, 1, 5, 20160101, 20160901];
        let r2 = yield runner.procCall('tv_getstockexearning', row2);
        let a = 0;
    });
}
exports.doTest = doTest;
//scanItem({ symbol: 'sz000001', code: "000001" });
function scanItem(item) {
    return __awaiter(this, void 0, void 0, function* () {
        let { symbol, code } = item;
        let url = 'https://money.finance.sina.com.cn/corp/go.php/vISSUE_ShareBonus/stockid/' + code + '.phtml';
        let content = yield sina_1.fetchSinaContent(url);
        try {
            let $ = cheerio.load(content);
            let t1 = $('#sharebonus_1>td');
            let tableOne = $('#sharebonus_1 > tbody');
            tableOne.find('>tr').map((index, element) => {
                let value = [];
                $(element).find('>td').map((i, e) => {
                    value.push($(e).text());
                });
                let d = 1;
            });
            let arr = tableOne.find('>td');
            let tableTwo = $('#sharebonus_2 tbody');
            let arr2 = tableTwo.find('>tr');
            let a = 1;
            $('#sharebonus_2>tbody>tr').map((index, element) => {
                let value = [];
                $(element).find('>td').map((i, e) => {
                    value.push($(e).text());
                });
                let bb = 1;
            });
        }
        catch (err) {
            let e = err;
        }
    });
}
//# sourceMappingURL=test.js.map