
interface QueryTemplate {
  check: (query: any, params: any[]) => boolean;
  sql: (query: any, params: any[]) => string;
  createsql: (query: any, params: any[]) => string;
}

const queryTemplates: { [name: string]: QueryTemplate } = {
  queryA: {
    check: (query: any, params: any[]) => { return true },
    sql: (query: any, params: any[]) => { return '' },
    createsql: (query: any, parasm: any[]) => {
      return `truncate t_tmporder;
delete from t_userstocks where \`user\`='${query.user}';

` 
    },
  },
}

export class QueryCreator {
  private query: any;
  private params: any[];
  private sqlstr: string;

  firstPage: boolean;

  constructor(query: any, params: any[]) {
    this.query = query;
    this.params = params;
    this.init();
  }

  protected init() {
    let { name, pageStart } = this.query as { name: string, pageStart: number };
    let qt: QueryTemplate;
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