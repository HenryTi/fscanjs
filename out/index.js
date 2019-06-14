"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const historysina_1 = require("./scan/historysina");
const express = require("express");
let app = express();
let dir = __dirname;
let p1 = path.join(__dirname, '../../data');
let p2 = path.resolve(__dirname, '../../data');
let afds = 8;
//scanSinaQuotations();
historysina_1.scanSinaHistory(10);
//scanSinaSymbols();
//scanEastmoney();
let a = 1;
//# sourceMappingURL=index.js.map