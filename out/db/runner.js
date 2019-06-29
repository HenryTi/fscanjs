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
const db_1 = require("./db");
const runners = {};
function getRunner(name) {
    return __awaiter(this, void 0, void 0, function* () {
        name = name.toLowerCase();
        let runner = runners[name];
        if (runner === null)
            return;
        if (runner === undefined) {
            let db = db_1.getDb(name);
            let isExists = yield db.exists();
            if (isExists === false) {
                runners[name] = null;
                return;
            }
            runner = new Runner(db);
            runners[name] = runner;
        }
        //await runner.init();
        return runner;
    });
}
exports.getRunner = getRunner;
class Runner {
    constructor(db) {
        this.db = db;
        this.setting = {};
    }
    getDb() { return this.db.getDbName(); }
    sql(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.sql(sql, params);
        });
    }
    call(proc, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.call(proc, params);
        });
    }
    callEx(proc, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.callEx(proc, params);
        });
    }
    query(query, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.call(query, params);
        });
    }
    createDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.createDatabase();
        });
    }
    tableFromProc(proc, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.tableFromProc(proc, params);
        });
    }
    tablesFromProc(proc, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.tablesFromProc(proc, params);
        });
    }
    initResDb(resDbName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.initResDb(resDbName);
        });
    }
}
exports.Runner = Runner;
//# sourceMappingURL=runner.js.map