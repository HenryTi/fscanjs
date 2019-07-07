"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const my_1 = require("./my");
const const_connection = 'connection';
const const_development = 'development';
exports.isDevelopment = (process.env.NODE_ENV === const_development);
class Db {
    constructor(dbName) {
        this.dbName = dbName;
        this.dbServer = this.createDbServer();
        this.isExists = false;
    }
    getDbName() { return this.dbName; }
    createDbServer() {
        let sqlType = config.get('sqlType');
        let dbConfig;
        if (dbConfig === undefined) {
            dbConfig = config.get(const_connection);
        }
        switch (sqlType) {
            case 'mysql': return new my_1.MyDbServer(dbConfig);
        }
    }
    async exists() {
        if (this.isExists === true)
            return true;
        return this.isExists = await this.dbServer.existsDatabase(this.dbName);
    }
    async sql(sql, params) {
        //console.log(this.dbName, ' sql: ', params.join(','))
        return await this.dbServer.sql(this.dbName, sql, params);
    }
    async call(proc, params) {
        //console.log(this.dbName, '.', proc, ': ', params.join(','))
        return await this.dbServer.call(this.dbName, proc, params);
    }
    async callEx(proc, params) {
        //console.log(this.dbName, '.', proc, ': ', params.join(','))
        return await this.dbServer.callEx(this.dbName, proc, params);
    }
    async tableFromProc(proc, params) {
        //console.log(this.dbName, '.', proc, ': ', params.join(','))
        return await this.dbServer.tableFromProc(this.dbName, proc, params);
    }
    async tablesFromProc(proc, params) {
        //console.log(this.dbName, '.', proc, ': ', params.join(','))
        return await this.dbServer.tablesFromProc(this.dbName, proc, params);
    }
    async createDatabase() {
        return await this.dbServer.createDatabase(this.dbName);
    }
    async uqDbs() {
        return await this.dbServer.uqDbs();
    }
    async initResDb(resDbName) {
        await this.dbServer.initResDb(resDbName);
    }
}
exports.Db = Db;
const dbs = {};
// 数据库名称对照表
const dbCollection = (function () {
    const dbColl = "db";
    if (!config.has(dbColl))
        return {};
    return config.get(dbColl);
})();
function getDb(name) {
    let db = dbs[name];
    if (db !== undefined)
        return db;
    let dbName = dbCollection[name];
    if (dbName === undefined)
        dbName = name;
    //let dbName = dbNameFromProject(name);
    //if (dbName === undefined) return;
    // 开发用户定义uqdb之后，直接用uqdb的dbname，所以，dbname不能有符号什么的，因为会通过url上传
    //if (dbName === undefined) 
    //let dbName = name;
    //if (dbServer === undefined) dbServer = createDbServer();
    dbs[name] = db = new Db(dbName);
    return db;
}
exports.getDb = getDb;
//# sourceMappingURL=db.js.map