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
const express_1 = require("express");
const symbolsina_1 = require("../scan/symbolsina");
const hqsina_1 = require("../scan/hqsina");
const sinaRouter = express_1.Router();
sinaRouter.get('/history', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let r = req;
    let a = 1;
    res.json({ "sina": 'scan history' });
}));
sinaRouter.post('/history', (req, res) => __awaiter(this, void 0, void 0, function* () {
}));
sinaRouter.get('/symbols', (req, res) => __awaiter(this, void 0, void 0, function* () {
    symbolsina_1.scanSinaSymbols();
    res.json({ "sina": 'scan symbols' });
}));
sinaRouter.get('/quotations', (req, res) => __awaiter(this, void 0, void 0, function* () {
    hqsina_1.scanSinaQuotations();
    res.json({ "sina": 'scan quotations' });
}));
exports.default = sinaRouter;
//# sourceMappingURL=sina.js.map