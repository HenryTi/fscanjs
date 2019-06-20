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
const historysina_1 = require("../scan/historysina");
const cqsina_1 = require("../scan/cqsina");
const calcexright_1 = require("../scan/calcexright");
const sinaRouter = express_1.Router();
sinaRouter.get('/history', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let len = Number(req.query['len']);
    let start = Number(req.query['start']);
    if (len > 0 && len <= 5000) {
        historysina_1.scanSinaHistory(len, start);
    }
    res.json({ "sina": "scan history ", "len": len, "start": start });
}));
sinaRouter.post('/history', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let len = Number(req.body['len']);
    let start = Number(req.body['start']);
    if (len > 0 && len <= 5000) {
        historysina_1.scanSinaHistory(len, start);
    }
    res.json({ "sina": "scan history ", "len": len, "start": start });
}));
sinaRouter.get('/symbols', (req, res) => __awaiter(this, void 0, void 0, function* () {
    symbolsina_1.scanSinaSymbols();
    res.json({ "sina": 'scan symbols' });
}));
sinaRouter.get('/quotations', (req, res) => __awaiter(this, void 0, void 0, function* () {
    hqsina_1.scanSinaQuotations();
    res.json({ "sina": 'scan quotations' });
}));
sinaRouter.get('/exrights', (req, res) => __awaiter(this, void 0, void 0, function* () {
    cqsina_1.scanSinaExRight();
    res.json({ "sina": 'scan ExRights' });
}));
sinaRouter.get('/calcexrights', (req, res) => __awaiter(this, void 0, void 0, function* () {
    calcexright_1.caclulateExRight();
    res.json({ "sina": 'caculate ExRights' });
}));
exports.default = sinaRouter;
//# sourceMappingURL=sina.js.map