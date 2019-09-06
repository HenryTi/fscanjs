"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querycreator_1 = require("./querycreator");
class DbQuery {
    constructor(runner) {
        this.runner = runner;
    }
    async process(query, params) {
        let spc = new querycreator_1.QueryCreator(query, params);
        if (spc.IsValid()) {
            if (spc.firstPage) {
                let csqlstr = spc.GetCreateSql();
                await this.runner.sql(csqlstr, []);
            }
            return await this.runner.sql(spc.GetQuerySql(), []);
        }
        else {
            throw 'query传入参数错误:' + JSON.stringify(query);
        }
    }
}
exports.DbQuery = DbQuery;
//# sourceMappingURL=dbquery.js.map