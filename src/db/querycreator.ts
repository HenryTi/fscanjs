
interface QueryTemplate {
  check: (query: any, params: any[]) => boolean;
  sql: (query: any, params: any[]) => string;
  createsql: (query: any, params: any[]) => string;
}

const queryTemplates: { [name: string]: QueryTemplate } = {
  pe: {
    check: (query: any, params: any[]) => {
      return query.user !== undefined && query.user !== null &&
            query.yearlen !== undefined && query.yearlen !== null &&
            query.pageStart !== undefined && query.pageStart !== null &&
            query.pageSize !== undefined && query.pageStart !== null 
    },
    sql: (query: any, params: any[]) => { 
      return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
    t0.\`name\` AS \`name\`, t3.\`价格\` as price, t3.\`价格\`/ t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`
    FROM \`t_stocksorderbyuser\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
    left join \`l_earning\` as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
    left join \`l_roe\` as t2 on t0.id=t2.stock 
    left join \`tv_股票价格\` as t3 on t0.id= t3.\`股票\`
    WHERE ta.order > ${query.pageStart}
    ORDER BY ta.order ASC
    LIMIT ${query.pageSize};
` 
    },
    createsql: (query: any, parasm: any[]) => {
      return `truncate t_tmporder;
delete from t_stocksorderbyuser where \`user\`='${query.user}';
insert into t_tmporder (stock) select a.\`股票\` as stock from tv_股票价格 as a inner join l_earning as b 
  on a.\`股票\` = b.stock and b.yearlen = '${query.yearlen}' and b.earning > 0
  order by a.\`价格\` / b.earning ASC limit 2000;
insert into t_stocksorderbyuser (\`user\`, \`order\`, \`stock\`) select '${query.user}' as \`user\`, \`no\` as \`order\`, \`stock\` from t_tmporder;
` 
    },
  },
}

export class QueryCreator {
  private query: any;
  private params: any[];
  private qt:QueryTemplate;
  private valid:boolean;

  firstPage: boolean;

  constructor(query: any, params: any[]) {
    this.query = query;
    this.params = params;
    this.valid = false;
    this.init();
  }

  IsValid() {
    return this.valid;
  }

  protected init() {
    let { name, pageStart } = this.query as { name: string, pageStart: number };
    if (name) {
      this.qt = queryTemplates[name];
    }
    if (this.qt === undefined || !this.qt.check(this.query, this.params))
      return;
    this.firstPage = pageStart <= 0;
    this.valid = true;
  }

  GetCreateSql() {
    if (this.valid)
      return this.qt.createsql(this.query, this.params);
    return undefined;
  }

  GetQuerySql() {
    if (this.valid)
      return this.qt.sql(this.query, this.params);
    return undefined;
  }
}