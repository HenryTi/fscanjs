"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
const sina_1 = require("./router/sina");
const eastmoney_1 = require("./router/eastmoney");
const magic_1 = require("./router/magic");
const timedtask_1 = require("./timedtask");
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
(async function () {
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
    app.use(async (req, res, next) => {
        let s = req.socket;
        let p = '';
        if (req.method !== 'GET')
            p = JSON.stringify(req.body);
        console.log('%s:%s - %s %s %s', s.remoteAddress, s.remotePort, req.method, req.originalUrl, p);
        try {
            await next();
        }
        catch (e) {
            console.error(e);
        }
    });
    app.use('/fsjs/sina', sina_1.default);
    app.use('/fsjs/eastmoney', eastmoney_1.default);
    app.use('/fsjs/magic', magic_1.default);
    app.use('/hello', dbHello);
    function dbHello(req, res) {
        let db = req.params.db;
        res.json({ "hello": 'fscanjs: hello, db is ' + db });
    }
    let port = config.get('port');
    console.log('port=', port);
    timedtask_1.startTimer();
    app.listen(port, async () => {
        console.log('fscanjs listening on port ' + port);
        let connection = config.get("connection");
        let { host, user } = connection;
        console.log('process.env.NODE_ENV: %s\nDB host: %s, user: %s', process.env.NODE_ENV, host, user);
    });
})();
//# sourceMappingURL=index.js.map