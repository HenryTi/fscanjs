"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queryTemplates = {
    queryA: {
        check: (query, params) => { return true; },
        sql: (query, params) => { return ''; },
        createsql: (query, parasm) => {
            return `truncate t_tmporder;
delete from t_userstocks where \`user\`='${query.user}';

`;
        },
    },
};
class QueryCreator {
    constructor(query, params) {
        this.query = query;
        this.params = params;
        this.init();
    }
    init() {
        let { name, pageStart } = this.query;
        let qt;
        if (name) {
            qt = queryTemplates[name];
        }
        if (qt === undefined || !qt.check(this.query, this.params))
            return;
        this.sqlstr = qt.sql(this.query, this.params);
        this.firstPage = pageStart <= 0;
    }
    GetOrderSql() {
        return '';
    }
    GetQuerySql() {
        return '';
    }
}
exports.QueryCreator = QueryCreator;
//# sourceMappingURL=querycreator.js.map