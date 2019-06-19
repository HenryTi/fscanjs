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
const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
const sina_1 = require("./router/sina");
const eastmoney_1 = require("./router/eastmoney");
const test_1 = require("./test");
test_1.doTest();
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let connection = config.get("connection");
        if (connection === undefined || connection.host === '0.0.0.0') {
            console.log("mysql connection must defined in config/default.json or config/production.json");
            return;
        }
        let app = express();
        app.use(express.static('public'));
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
        app.use(bodyParser.json());
        app.set('json replacer', (key, value) => {
            if (value === null)
                return undefined;
            return value;
        });
        app.use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let s = req.socket;
            let p = '';
            if (req.method !== 'GET')
                p = JSON.stringify(req.body);
            console.log('%s:%s - %s %s %s', s.remoteAddress, s.remotePort, req.method, req.originalUrl, p);
            try {
                yield next();
            }
            catch (e) {
                console.error(e);
            }
        }));
        app.use('/fsjs/sina', sina_1.default);
        app.use('/fsjs/eastmoney', eastmoney_1.default);
        app.use('/hello', dbHello);
        function dbHello(req, res) {
            let db = req.params.db;
            res.json({ "hello": 'fscanjs: hello, db is ' + db });
        }
        let port = config.get('port');
        console.log('port=', port);
        app.listen(port, () => __awaiter(this, void 0, void 0, function* () {
            console.log('fscanjs listening on port ' + port);
            let connection = config.get("connection");
            let { host, user } = connection;
            console.log('process.env.NODE_ENV: %s\nDB host: %s, user: %s', process.env.NODE_ENV, host, user);
        }));
    });
})();
//# sourceMappingURL=index.js.map