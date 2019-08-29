"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calcexright_1 = require("../scan/calcexright");
const gfuncs_1 = require("../gfuncs");
const sinaRouter = express_1.Router();
sinaRouter.get('/calcexrights', async (req, res) => {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "sina": "busy" });
        return;
    }
    calcexright_1.caclulateExRight();
    res.json({ "sina": 'caculate ExRights' });
});
exports.default = sinaRouter;
//# sourceMappingURL=sina.js.map