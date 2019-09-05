"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querycreator_1 = require("./querycreator");
class DbQuery {
    constructor(runner) {
        this.runner = runner;
    }
    async process(query, params) {
        let spc = new querycreator_1.QueryCreator(query, params);
    }
}
exports.DbQuery = DbQuery;
//# sourceMappingURL=dbquery.js.map