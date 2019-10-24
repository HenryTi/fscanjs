
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
      let blackID = query.blackID === undefined || query.blackID === null ? 0 : query.blackID;
      if (blackID > 0) {
      return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
    t0.\`name\` AS \`name\`, t3.价格 as price, t3.复权 / t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`, t3.复权 as priceEx
    FROM \`t_stocksorderbyuser\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
    left join l_earning as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
    left join l_roe as t2 on t0.id=t2.stock 
    left join t_股票价格复权 as t3 on t0.id= t3.stock
    left join mi.tv_tagstock as t4 on ta.user=t4.user and t4.tag='${blackID}' and ta.stock=t4.stock
    WHERE ta.order > ${query.pageStart} and t4.stock is null
    ORDER BY ta.order ASC
    LIMIT ${query.pageSize};
` 
      }
      else {
        return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
    t0.\`name\` AS \`name\`, t3.价格 as price, t3.复权 / t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`
    FROM \`t_stocksorderbyuser\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
    left join \`l_earning\` as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
    left join \`l_roe\` as t2 on t0.id=t2.stock 
    left join t_股票价格复权 as t3 on t0.id= t3.stock
    WHERE ta.order > ${query.pageStart}
    ORDER BY ta.order ASC
    LIMIT ${query.pageSize};
` 
      }
    },
    createsql: (query: any, parasm: any[]) => {
      let user = query.user as number;
      let userStr = Number.isNaN(user) ? '' : user.toString();
      let tempTableName = '_tmporderbyuser_' + userStr;
      return `DROP TEMPORARY TABLE IF EXISTS \`${tempTableName}\`;
CREATE TEMPORARY TABLE \`${tempTableName}\` (\`no\` INT NOT NULL AUTO_INCREMENT, \`stock\` INT NULL, PRIMARY KEY(\`no\`)) ENGINE=MyISAM;
delete from t_stocksorderbyuser where \`user\`='${query.user}';
insert into \`${tempTableName}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join l_earning as b 
  on a.stock = b.stock and b.yearlen = '${query.yearlen}' and b.earning > 0
  order by a.复权 / b.earning ASC limit 2000;
insert into t_stocksorderbyuser (\`user\`, \`order\`, \`stock\`) select '${query.user}' as \`user\`, \`no\` as \`order\`, \`stock\` from \`${tempTableName}\`;
` 
    },
  },
  tagpe: {
    check: (query: any, params: any[]) => {
      return query.user !== undefined && query.user !== null &&
            query.yearlen !== undefined && query.yearlen !== null &&
            query.tag !== undefined && query.tag !== null &&
            query.pageStart !== undefined && query.pageStart !== null &&
            query.pageSize !== undefined && query.pageStart !== null 
    },
    sql: (query: any, params: any[]) => { 
      return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
    t0.\`name\` AS \`name\`, t3.价格 as price, t3.复权 / t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`
    FROM \`t_stocksorderbyusertag\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
    left join \`l_earning\` as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
    left join \`l_roe\` as t2 on t0.id=t2.stock 
    left join t_股票价格复权 as t3 on t0.id= t3.stock
    WHERE ta.order > ${query.pageStart}
    ORDER BY ta.order ASC
    LIMIT ${query.pageSize};
` 
    },
    createsql: (query: any, parasm: any[]) => {
      let user = query.user as number;
      let userStr = Number.isNaN(user) ? '' : user.toString();
      let tempTableName = '_tmporderbyusertag_' + userStr;
      return `DROP TEMPORARY TABLE IF EXISTS \`${tempTableName}\`;
CREATE TEMPORARY TABLE \`${tempTableName}\` (\`no\` INT NOT NULL AUTO_INCREMENT, \`stock\` INT NULL, PRIMARY KEY(\`no\`)) ENGINE=MyISAM;
delete from t_stocksorderbyusertag where \`user\`='${query.user}';
insert into \`${tempTableName}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join l_earning as b 
  on a.stock = b.stock and b.yearlen = '${query.yearlen}' and b.earning > 0 
  inner join mi.tv_tagstock as c on c.user='${query.user}' and c.tag=${query.tag} and c.stock=a.stock
  order by a.复权 / b.earning ASC limit 2000;
insert into t_stocksorderbyusertag (\`user\`, \`order\`, \`stock\`) select '${query.user}' as \`user\`, \`no\` as \`order\`, \`stock\` from \`${tempTableName}\`;
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