"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sinafiles_1 = require("./scan/sinafiles");
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
let d = new Date(1999, 1, 1);
let ms = 24 * 60 * 60 * 1000;
let d1 = new Date(d.getTime() + ms);
let d2 = new Date(d.getTime() - ms);
var result = 0.1 * 0.2;
sinafiles_1.scanSinaFiles(0, 'cashflow');
//caclulateExRight();
//emulateTradeMonthChange();
//# sourceMappingURL=runtest.js.map