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
const emulate_1 = require("../magic/emulate");
const roe_1 = require("../magic/roe");
const updateEarnig_1 = require("../magic/updateEarnig");
const gfuncs_1 = require("../gfuncs");
const magicRouter = express_1.Router();
magicRouter.get('/all', (req, res) => __awaiter(this, void 0, void 0, function* () {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    emulate_1.emulateAll();
    res.json({ "magic": "emulateAll" });
}));
magicRouter.get('/day', (req, res) => __awaiter(this, void 0, void 0, function* () {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    let day = Number(req.query['day']);
    emulate_1.emulateAtDay(day);
    res.json({ "magic": "emulateday", "day": day });
}));
magicRouter.get('/avg', (req, res) => __awaiter(this, void 0, void 0, function* () {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    let begin = Number(req.query['begin']);
    let end = Number(req.query['end']);
    emulate_1.allStocksAvg(begin, end);
    res.json({ "magic": "stocksavg", "begin": begin, "end": end });
}));
magicRouter.get('/roe', (req, res) => __awaiter(this, void 0, void 0, function* () {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    roe_1.calculateAllRoe();
    res.json({ "magic": "calculateAllRoe" });
}));
magicRouter.get('/updateearning', (req, res) => __awaiter(this, void 0, void 0, function* () {
    if (gfuncs_1.RemoteIsRun()) {
        res.json({ "magic": "busy" });
        return;
    }
    updateEarnig_1.updateAllEarning();
    res.json({ "magic": "updateAllEarning" });
}));
exports.default = magicRouter;
//# sourceMappingURL=magic.js.map