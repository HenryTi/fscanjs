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
const request = require("request");
const iconv = require("iconv-lite");
var BufferHelper = require('bufferhelper');
function fetchSinaContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                let req = request.get(url);
                req.on('error', err => {
                    reject(err);
                });
                req.on('response', (res) => {
                    var bufferHelper = new BufferHelper();
                    res.on('data', (chunk) => {
                        try {
                            bufferHelper.concat(chunk);
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                    res.on('end', () => {
                        try {
                            var result = iconv.decode(bufferHelper.toBuffer(), 'GBK');
                            resolve(result);
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                    res.on('error', (err) => {
                        reject(err);
                    });
                });
            }
            catch (reqErr) {
                reject(reqErr);
            }
        });
    });
}
exports.fetchSinaContent = fetchSinaContent;
//# sourceMappingURL=sina.js.map