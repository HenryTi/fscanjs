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
const fs = require("fs");
const path = require("path");
const db_1 = require("./uq-api/db");
const jsonPath = '../data/shsz.json';
db_1.getRunner('mi').then((runner) => __awaiter(this, void 0, void 0, function* () {
    let p = path.resolve(__dirname, jsonPath);
    let content = fs.readFileSync(p, 'utf-8');
    let arr = JSON.parse(content);
    let promiseArr = [];
    for (let item of arr) {
        try {
            let { market, code, name, short } = item;
            let row = [undefined, market, code, name, short];
            promiseArr.push(runner.tuidSave('股票', 35, undefined, row));
            if (promiseArr.length >= 100) {
                yield Promise.all(promiseArr);
                promiseArr.splice(0, promiseArr.length);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    if (promiseArr.length > 0) {
        try {
            yield Promise.all(promiseArr);
        }
        catch (err) {
            console.error(err);
        }
    }
}));
let a = 1;
//# sourceMappingURL=stocks.js.map