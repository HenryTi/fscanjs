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
                if (csqlstr !== undefined)
                    await this.runner.sql(csqlstr, []);
            }
            let qstr = spc.GetQuerySql();
            return await this.runner.sql(qstr, []);
        }
        else {
            throw 'query传入参数错误:' + JSON.stringify(query);
        }
    }
}
exports.DbQuery = DbQuery;
//# sourceMappingURL=dbquery.js.map