"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const iconv = require("iconv-lite");
var BufferHelper = require('bufferhelper');
async function fetchSinaContent(url) {
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
}
exports.fetchSinaContent = fetchSinaContent;
//# sourceMappingURL=sina.js.map