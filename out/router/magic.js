"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emulatemagic_1 = require("../magic/emulatemagic");
const roe_1 = require("../magic/roe");
const updateEarnig_1 = require("../magic/updateEarnig");
const gfuncs_1 = require("../gfuncs");
const updatedividend_1 = require("../magic/updatedividend");
const magicRouter = express_1.Router();
magicRouter.get('/all', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    emulatemagic_1.emulateAll();
    res.json({ "magic": "emulateAll" });
});
magicRouter.get('/day', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    let day = Number(req.query['day']);
    emulatemagic_1.emulateAtDay(day);
    res.json({ "magic": "emulateday", "day": day });
});
magicRouter.get('/avg', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    let begin = Number(req.query['begin']);
    let end = Number(req.query['end']);
    emulatemagic_1.allStocksAvg(begin, end);
    res.json({ "magic": "stocksavg", "begin": begin, "end": end });
});
magicRouter.get('/roe', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    roe_1.calculateAllRoe();
    res.json({ "magic": "calculateAllRoe" });
});
magicRouter.get('/updateearning', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    updateEarnig_1.updateAllEarning();
    res.json({ "magic": "updateAllEarning" });
});
magicRouter.get('/updatedividend', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    updatedividend_1.updateAllDividend();
    res.json({ "magic": "updateAllDividend" });
});
exports.default = magicRouter;
//# sourceMappingURL=magic.js.map