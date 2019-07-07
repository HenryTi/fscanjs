"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const runners = {};
async function getRunner(name) {
    name = name.toLowerCase();
    let runner = runners[name];
    if (runner === null)
        return;
    if (runner === undefined) {
        let db = db_1.getDb(name);
        let isExists = await db.exists();
        if (isExists === false) {
            runners[name] = null;
            return;
        }
        runner = new Runner(db);
        runners[name] = runner;
    }
    //await runner.init();
    return runner;
}
exports.getRunner = getRunner;
class Runner {
    constructor(db) {
        this.db = db;
        this.setting = {};
    }
    getDb() { return this.db.getDbName(); }
    async sql(sql, params) {
        return await this.db.sql(sql, params);
    }
    async call(proc, params) {
        return await this.db.call(proc, params);
    }
    async callEx(proc, params) {
        return await this.db.callEx(proc, params);
    }
    async query(query, params) {
        return await this.db.call(query, params);
    }
    async createDatabase() {
        return await this.db.createDatabase();
    }
    async tableFromProc(proc, params) {
        return await this.db.tableFromProc(proc, params);
    }
    async tablesFromProc(proc, params) {
        return await this.db.tablesFromProc(proc, params);
    }
    async initResDb(resDbName) {
        await this.db.initResDb(resDbName);
    }
}
exports.Runner = Runner;
//# sourceMappingURL=runner.js.map