"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const const_1 = require("../const");
const sqlRouter = express_1.Router();
sqlRouter.post('/call', async (req, res) => {
    let sqlprocess = req.body['call'];
    let params = req.body['params'];
    let runner = await db_1.getRunner(const_1.Const_dbname);
    try {
        let r = await runner.call(sqlprocess, params);
        res.json({ ok: true, res: r });
    }
    catch (error) {
        res.json({ ok: false, error: JSON.stringify(error) });
    }
    finally {
        res.end();
    }
});
sqlRouter.post('/query', async (req, res) => {
    let query = req.body['query'];
    let params = req.body['params'];
    let runner = await db_1.getRunner(const_1.Const_dbname);
    try {
        let dbproc = new db_1.DbQuery(runner);
        let r = await dbproc.process(query, params);
        res.json({ ok: true, res: r });
    }
    catch (error) {
        res.json({ ok: false, error: JSON.stringify(error) });
    }
    finally {
        res.end();
    }
});
exports.default = sqlRouter;
//# sourceMappingURL=sqlapi.js.map