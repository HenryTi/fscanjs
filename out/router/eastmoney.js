"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eastmoney_1 = require("../scan/eastmoney");
const gfuncs_1 = require("../gfuncs");
const eastmoneyRouter = express_1.Router();
eastmoneyRouter.get('/finance', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "eastmoney": "busy" });
        return;
    }
    eastmoney_1.scanEastmoney();
    res.json({ "eastmoney": 'scan finance' });
});
eastmoneyRouter.post('/finance', async (req, res) => {
});
exports.default = eastmoneyRouter;
//# sourceMappingURL=eastmoney.js.map