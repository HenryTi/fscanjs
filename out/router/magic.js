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
const magicRouter = express_1.Router();
magicRouter.get('/magicall', (req, res) => __awaiter(this, void 0, void 0, function* () {
    emulate_1.emulateAll();
    res.json({ "magic": 'emulateAll' });
}));
exports.default = magicRouter;
//# sourceMappingURL=magic.js.map