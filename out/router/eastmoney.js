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
const eastmoney_1 = require("../scan/eastmoney");
const eastmoneyRouter = express_1.Router();
eastmoneyRouter.get('/finance', (req, res) => __awaiter(this, void 0, void 0, function* () {
    eastmoney_1.scanEastmoney();
    res.json({ "eastmoney": 'scan finance' });
}));
eastmoneyRouter.post('/finance', (req, res) => __awaiter(this, void 0, void 0, function* () {
}));
exports.default = eastmoneyRouter;
//# sourceMappingURL=eastmoney.js.map