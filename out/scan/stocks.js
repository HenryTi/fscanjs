"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const db_1 = require("../db");
const const_1 = require("../const");
const jsonPath = '../data/shsz.json';
db_1.getRunner(const_1.Const_dbname).then(async (runner) => {
    let p = path.resolve(__dirname, jsonPath);
    let content = fs.readFileSync(p, 'utf-8');
    let arr = JSON.parse(content);
    let promiseArr = [];
    for (let item of arr) {
        try {
            let { market, code, name } = item;
            market = market.toUpperCase().trim();
            let symbol = market.toLowerCase() + code;
            let row = [undefined, symbol, market, code, name, undefined];
            promiseArr.push(runner.call('tv_股票$save', row));
            if (promiseArr.length >= 100) {
                await Promise.all(promiseArr);
                promiseArr.splice(0, promiseArr.length);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    if (promiseArr.length > 0) {
        try {
            await Promise.all(promiseArr);
        }
        catch (err) {
            console.error(err);
        }
    }
});
let a = 1;
//# sourceMappingURL=stocks.js.map