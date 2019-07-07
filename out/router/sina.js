"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const symbolsina_1 = require("../scan/symbolsina");
const hqsina_1 = require("../scan/hqsina");
const historysina_1 = require("../scan/historysina");
const cqsina_1 = require("../scan/cqsina");
const calcexright_1 = require("../scan/calcexright");
const financesina_1 = require("../scan/financesina");
const gfuncs_1 = require("../gfuncs");
const sinaRouter = express_1.Router();
sinaRouter.get('/history', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "sina": "busy" });
        return;
    }
    let len = Number(req.query['len']);
    let start = Number(req.query['start']);
    if (start === undefined || isNaN(start)) {
        start = 0;
    }
    if (len !== undefined && len >= 10 && len <= 5000) {
        historysina_1.scanSinaHistory(len, start);
    }
    else {
        res.json({ "sina": "scan history ", "len": len, "start": start, "error": "param" });
        return;
    }
    res.json({ "sina": "scan history ", "len": len, "start": start });
});
sinaRouter.post('/history', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "sina": "busy" });
        return;
    }
    let len = Number(req.body['len']);
    let start = Number(req.body['start']);
    if (len > 0 && len <= 5000) {
        historysina_1.scanSinaHistory(len, start);
    }
    res.json({ "sina": "scan history ", "len": len, "start": start });
});
sinaRouter.get('/symbols', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "sina": "busy" });
        return;
    }
    symbolsina_1.scanSinaSymbols();
    res.json({ "sina": 'scan symbols' });
});
sinaRouter.get('/quotations', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "sina": "busy" });
        return;
    }
    hqsina_1.scanSinaQuotations();
    res.json({ "sina": 'scan quotations' });
});
sinaRouter.get('/exrights', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "sina": "busy" });
        return;
    }
    cqsina_1.scanSinaExRight();
    res.json({ "sina": 'scan ExRights' });
});
sinaRouter.get('/calcexrights', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "sina": "busy" });
        return;
    }
    calcexright_1.caclulateExRight();
    res.json({ "sina": 'caculate ExRights' });
});
sinaRouter.get('/finance', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "sina": "busy" });
        return;
    }
    let start = Number(req.query['start']);
    if (isNaN(start) || start < 0) {
        start = 0;
    }
    financesina_1.scanSinaFinance(start);
    res.json({ "sina": "scan finance ", "start": start });
});
exports.default = sinaRouter;
//# sourceMappingURL=sina.js.map