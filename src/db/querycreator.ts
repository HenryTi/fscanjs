
interface QueryTemplate {
  check: (query: any, params: any[]) => boolean;
  sql: (query: any, params: any[]) => string;
  createsql?: (query: any, params: any[]) => string;
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
        return `SELECT a.order, \`id\`, a.ma, a.m1, a.m2, a.m3, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
    a.roe, a.bonus / a.exprice as divyield
    FROM v_userselectstock as a
    left join mi.tv_tagstock as b on a.user=b.user and b.tag='${blackID}' and a.id=b.stock
    WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart} and b.stock is null
    ORDER BY a.order ASC
    LIMIT ${query.pageSize};
`
      }
      else {
        return `SELECT a.order, \`id\`, a.ma, a.m1, a.m2, a.m3, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
    a.roe, a.bonus / a.exprice as divyield
    FROM v_userselectstock as a
    WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart}
    ORDER BY a.order ASC
    LIMIT ${query.pageSize};
`
//         return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
//     t0.\`name\` AS \`name\`, t3.价格 as price, t3.复权 / t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`, t4.bonus / t3.复权 as divyield
//     FROM \`t_stocksorderbyuser\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
//     left join \`l_earning\` as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
//     left join \`l_roe\` as t2 on t0.id=t2.stock 
//     left join t_股票价格复权 as t3 on t0.id= t3.stock
//     left join t_最近年分红 as t4 on t0.id=t4.stock
//     WHERE ta.order > ${query.pageStart}
//     ORDER BY ta.order ASC
//     LIMIT ${query.pageSize};
// ` 
      }
    },
    createsql: (query: any, parasm: any[]) => {
//       let user = query.user as number;
//       let userStr = Number.isNaN(user) ? '' : user.toString();
//       let tempTableName = '_tmporderbyuser_' + userStr;
//       return `DROP TEMPORARY TABLE IF EXISTS \`${tempTableName}\`;
// CREATE TEMPORARY TABLE \`${tempTableName}\` (\`no\` INT NOT NULL AUTO_INCREMENT, \`stock\` INT NULL, PRIMARY KEY(\`no\`)) ENGINE=MyISAM;
// delete from t_stocksorderbyuser where \`user\`='${query.user}';
// insert into \`${tempTableName}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join l_earning as b 
//   on a.stock = b.stock and b.yearlen = '${query.yearlen}' and b.earning > 0
//   order by a.复权 / b.earning ASC limit 2000;
// insert into t_stocksorderbyuser (\`user\`, \`order\`, \`stock\`) select '${query.user}' as \`user\`, \`no\` as \`order\`, \`stock\` from \`${tempTableName}\`;
// ` 
      let user = query.user as number;
      let userStr = Number.isNaN(user) ? '' : user.toString();
      let ttNamePE = '_tmppeorderbyuser_' + userStr;
      return `START TRANSACTION;
DELETE FROM t_userselectstock WHERE \`user\`='${user}';
DROP TEMPORARY TABLE IF EXISTS \`${ttNamePE}\`;
CREATE TEMPORARY TABLE \`${ttNamePE}\` (\`no\` int not null auto_increment primary key, stock int not null, INDEX (stock)) ENGINE=MYISAM;
insert into \`${ttNamePE}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join l_earning as b 
  on a.stock = b.stock and b.yearlen = '${query.yearlen}' and b.earning > 0
  order by a.复权 / b.earning ASC LIMIT 1500;
INSERT INTO t_userselectstock (\`user\`,\`order\`,\`stock\`, m1)
SELECT '${user}', a.\`no\`, a.stock, (10 - FLOOR((a.\`no\`-1)/150)) AS m1
  FROM \`${ttNamePE}\` AS a order by a.\`no\` ASC
  limit 400;
COMMIT;
DROP TEMPORARY TABLE IF EXISTS \`${ttNamePE}\`;
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
      return `SELECT a.order, \`id\`, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
      a.roe, a.bonus / a.exprice as divyield
      FROM v_usertagsortresult as a
      WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart}
      ORDER BY a.order ASC
      LIMIT ${query.pageSize};
  `
//         return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
//     t0.\`name\` AS \`name\`, t3.价格 as price, t3.复权 / t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`, t4.bonus / t3.复权 as divyield
//     FROM \`t_stocksorderbyusertag\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
//     left join \`l_earning\` as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
//     left join \`l_roe\` as t2 on t0.id=t2.stock 
//     left join t_股票价格复权 as t3 on t0.id= t3.stock
//     left join t_最近年分红 as t4 on t0.id=t4.stock
//     WHERE ta.order > ${query.pageStart}
//     ORDER BY ta.order ASC
//     LIMIT ${query.pageSize};
// ` 
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

  dp: {
    check: (query: any, params: any[]) => {
      return query.user !== undefined && query.user !== null &&
            query.yearlen !== undefined && query.yearlen !== null &&
            query.pageStart !== undefined && query.pageStart !== null &&
            query.pageSize !== undefined && query.pageStart !== null 
    },
    sql: (query: any, params: any[]) => { 
      let blackID = query.blackID === undefined || query.blackID === null ? 0 : query.blackID;
      if (blackID > 0) {
        return `SELECT a.order, \`id\`, a.ma, a.m1, a.m2, a.m3, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
    a.roe, a.bonus / a.exprice as divyield
    FROM v_userselectstock as a
    left join mi.tv_tagstock as b on a.user=b.user and b.tag='${blackID}' and a.id=b.stock
    WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart} and b.stock is null
    ORDER BY a.order ASC
    LIMIT ${query.pageSize};
`
//       return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
//     t0.\`name\` AS \`name\`, t3.价格 as price, t3.复权 / t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`,
//     t3.复权 as priceEx, t5.bonus / t3.复权 as divyield
//     FROM \`t_stocksorderbyuser\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
//     left join l_earning as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
//     left join l_roe as t2 on t0.id=t2.stock 
//     left join t_股票价格复权 as t3 on t0.id= t3.stock
//     left join mi.tv_tagstock as t4 on ta.user=t4.user and t4.tag='${blackID}' and ta.stock=t4.stock
//     left join t_最近年分红 as t5 on t0.id=t5.stock
//     WHERE ta.order > ${query.pageStart} and t4.stock is null
//     ORDER BY ta.order ASC
//     LIMIT ${query.pageSize};
// ` 
      }
      else {
        return `SELECT a.order, \`id\`, a.ma, a.m1, a.m2, a.m3, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
    a.roe, a.bonus / a.exprice as divyield
    FROM v_userselectstock as a
    WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart}
    ORDER BY a.order ASC
    LIMIT ${query.pageSize};
`
//         return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
//     t0.\`name\` AS \`name\`, t3.价格 as price, t3.复权 / t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`, t4.bonus / t3.复权 as divyield
//     FROM \`t_stocksorderbyuser\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
//     left join \`l_earning\` as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
//     left join \`l_roe\` as t2 on t0.id=t2.stock 
//     left join t_股票价格复权 as t3 on t0.id= t3.stock
//     left join t_最近年分红 as t4 on t0.id=t4.stock
//     WHERE ta.order > ${query.pageStart}
//     ORDER BY ta.order ASC
//     LIMIT ${query.pageSize};
// ` 
      }
    },
    createsql: (query: any, parasm: any[]) => {
      let user = query.user as number;
      let userStr = Number.isNaN(user) ? '' : user.toString();
      let ttNameDV = '_tmpdvorderbyuser_' + userStr;
      return `START TRANSACTION;
DELETE FROM t_userselectstock WHERE \`user\`='${user}';
DROP TEMPORARY TABLE IF EXISTS \`${ttNameDV}\`;
CREATE TEMPORARY TABLE \`${ttNameDV}\` (\`no\` int not null auto_increment primary key, stock int not NULL, INDEX (stock)) ENGINE=MyISAM;
insert into \`${ttNameDV}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join t_最近年分红 as b 
  on a.stock = b.stock and b.bonus>0
  order by b.bonus / a.复权 DESC LIMIT 1500;
INSERT INTO t_userselectstock (\`user\`,\`order\`,\`stock\`, m1)
  SELECT '${user}', a.\`no\`, a.stock, (10 - FLOOR((a.\`no\`-1)/150)) AS m1 
  FROM \`${ttNameDV}\` AS a order by a.\`no\` ASC
  limit 400;
COMMIT;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameDV}\`;
` 
//       let user = query.user as number;
//       let userStr = Number.isNaN(user) ? '' : user.toString();
//       let tempTableName = '_tmporderbyuser_' + userStr;
//       return `DROP TEMPORARY TABLE IF EXISTS \`${tempTableName}\`;
// CREATE TEMPORARY TABLE \`${tempTableName}\` (\`no\` INT NOT NULL AUTO_INCREMENT, \`stock\` INT NULL, PRIMARY KEY(\`no\`)) ENGINE=MyISAM;
// delete from t_stocksorderbyuser where \`user\`='${user}';
// insert into \`${tempTableName}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join t_最近年分红 as b 
//   on a.stock = b.stock and b.bonus>0
//   order by b.bonus / a.复权 DESC limit 2000;
// insert into t_stocksorderbyuser (\`user\`, \`order\`, \`stock\`) select '${user}' as \`user\`, \`no\` as \`order\`, \`stock\` from \`${tempTableName}\`;
// ` 
    },
  },

  tagdp: {
    check: (query: any, params: any[]) => {
      return query.user !== undefined && query.user !== null &&
            query.yearlen !== undefined && query.yearlen !== null &&
            query.tag !== undefined && query.tag !== null &&
            query.pageStart !== undefined && query.pageStart !== null &&
            query.pageSize !== undefined && query.pageStart !== null 
    },
    sql: (query: any, params: any[]) => { 
      return `SELECT a.order, \`id\`, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
      a.roe, a.bonus / a.exprice as divyield
      FROM v_usertagsortresult as a
      WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart}
      ORDER BY a.order ASC
      LIMIT ${query.pageSize};
`
//         return `SELECT ta.order, \`id\` AS \`id\`,t0.\`symbol\` AS \`symbol\`,t0.\`market\` AS \`market\`,t0.\`code\` AS \`code\`,
//     t0.\`name\` AS \`name\`, t3.价格 as price, t3.复权 / t1.earning as \`pe\`, t1.earning as \`e\`, t2.roe as \`roe\`, t4.bonus / t3.复权 as divyield
//     FROM \`t_stocksorderbyusertag\` as ta inner join \`tv_股票\` AS t0 on ta.user='${query.user}' and ta.stock = t0.id 
//     left join \`l_earning\` as t1 on t0.id=t1.stock and t1.yearlen = '${query.yearlen}'
//     left join \`l_roe\` as t2 on t0.id=t2.stock 
//     left join t_股票价格复权 as t3 on t0.id= t3.stock
//     left join t_最近年分红 as t4 on t0.id=t4.stock
//     WHERE ta.order > ${query.pageStart}
//     ORDER BY ta.order ASC
//     LIMIT ${query.pageSize};
// ` 
    },
    createsql: (query: any, parasm: any[]) => {
      let user = query.user as number;
      let userStr = Number.isNaN(user) ? '' : user.toString();
      let tempTableName = '_tmporderbyusertag_' + userStr;
      return `DROP TEMPORARY TABLE IF EXISTS \`${tempTableName}\`;
CREATE TEMPORARY TABLE \`${tempTableName}\` (\`no\` INT NOT NULL AUTO_INCREMENT, \`stock\` INT NULL, PRIMARY KEY(\`no\`)) ENGINE=MyISAM;
delete from t_stocksorderbyusertag where \`user\`='${query.user}';
insert into \`${tempTableName}\` (stock) select a.stock as stock from t_股票价格复权 as a 
  inner join mi.tv_tagstock as c on c.user='${query.user}' and c.tag=${query.tag} and c.stock=a.stock
  left join t_最近年分红 as b on a.stock = b.stock
  order by b.bonus / a.复权 DESC limit 2000;
insert into t_stocksorderbyusertag (\`user\`, \`order\`, \`stock\`) select '${query.user}' as \`user\`, \`no\` as \`order\`, \`stock\` from \`${tempTableName}\`;
` 
    },
  },

  peroe: {
    check: (query: any, params: any[]) => {
      return query.user !== undefined && query.user !== null &&
            query.yearlen !== undefined && query.yearlen !== null &&
            query.pageStart !== undefined && query.pageStart !== null &&
            query.pageSize !== undefined && query.pageStart !== null 
    },
    sql: (query: any, params: any[]) => { 
      let blackID = query.blackID === undefined || query.blackID === null ? 0 : query.blackID;
      if (blackID > 0) {
        return `SELECT a.order, \`id\`, a.ma, a.m1, a.m2, a.m3, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
    a.roe, a.bonus / a.exprice as divyield
    FROM v_userselectstock as a
    left join mi.tv_tagstock as b on a.user=b.user and b.tag='${blackID}' and a.id=b.stock
    WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart} and b.stock is null
    ORDER BY a.order ASC
    LIMIT ${query.pageSize};
`
      }
      else {
        return `SELECT a.order, \`id\`, a.ma, a.m1, a.m2, a.m3, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
    a.roe, a.bonus / a.exprice as divyield
    FROM v_userselectstock as a
    WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart}
    ORDER BY a.order ASC
    LIMIT ${query.pageSize};
`
      }
    },
    createsql: (query: any, parasm: any[]) => {
      let user = query.user as number;
      let userStr = Number.isNaN(user) ? '' : user.toString();
      let ttNamePE = '_tmppeorderbyuser_' + userStr;
      let ttNameROE = '_tmproeorderbyuser_' + userStr;
      let ttNameR = '_tmpRorderbyuser_' + userStr;
      return `START TRANSACTION;
DELETE FROM t_userselectstock WHERE \`user\`='${user}';
DROP TEMPORARY TABLE IF EXISTS \`${ttNamePE}\`;
CREATE TEMPORARY TABLE \`${ttNamePE}\` (\`no\` int not null auto_increment primary key, stock int not null, INDEX (stock)) ENGINE=MYISAM;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameROE}\`;
CREATE TEMPORARY TABLE \`${ttNameROE}\` (\`no\` int not null auto_increment primary key, stock int not null, INDEX (stock)) ENGINE=MYISAM;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameR}\`;
CREATE TEMPORARY TABLE \`${ttNameR}\` (\`no\` int not null auto_increment primary key, stock int not null, INDEX (stock)) ENGINE=MYISAM;
insert into \`${ttNamePE}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join l_earning as b 
  on a.stock = b.stock and b.yearlen = '${query.yearlen}' and b.earning > 0
  order by a.复权 / b.earning ASC LIMIT 1500;
INSERT INTO \`${ttNameROE}\` (stock) SELECT stock FROM l_roe ORDER BY roe DESC LIMIT 1500;
INSERT INTO \`${ttNameR}\` (stock) (SELECT a.stock
  FROM \`${ttNamePE}\` AS a 
  JOIN \`${ttNameROE}\` AS b ON a.stock=b.stock
  ORDER BY (5 - FLOOR((a.no-1)/300)) + (5 - FLOOR((b.no-1)/300)) DESC, a.no ASC);
INSERT INTO t_userselectstock (\`user\`,\`order\`,\`stock\`, m1, m2)
  SELECT '${user}', a.no, a.stock, (5 - FLOOR((b.no-1)/300)) AS m1, (5 - FLOOR((c.no-1)/300)) AS m2
  FROM \`${ttNameR}\` AS a 
  JOIN \`${ttNamePE}\` AS b ON a.stock=b.stock
  JOIN \`${ttNameROE}\` AS c ON a.stock=c.stock
  limit 300;
COMMIT;
DROP TEMPORARY TABLE IF EXISTS \`${ttNamePE}\`;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameROE}\`;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameR}\`;
` 
    },
  },

  dvperoe: {
    check: (query: any, params: any[]) => {
      return query.user !== undefined && query.user !== null &&
            query.yearlen !== undefined && query.yearlen !== null &&
            query.pageStart !== undefined && query.pageStart !== null &&
            query.pageSize !== undefined && query.pageStart !== null 
    },
    sql: (query: any, params: any[]) => { 
      let blackID = query.blackID === undefined || query.blackID === null ? 0 : query.blackID;
      if (blackID > 0) {
        return `SELECT a.order, \`id\`, ROUND(a.ma/3,1) as ma, a.m1, a.m2, a.m3, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
    a.roe, a.bonus / a.exprice as divyield
    FROM v_userselectstock as a
    left join mi.tv_tagstock as b on a.user=b.user and b.tag='${blackID}' and a.id=b.stock
    WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart} and b.stock is null
    ORDER BY a.order ASC
    LIMIT ${query.pageSize};
`
      }
      else {
        return `SELECT a.order, \`id\`, ROUND(a.ma/3,1) as ma, a.m1, a.m2, a.m3, a.symbol, a.market, a.code, a.name, a.price, a.exprice / a.e as \`pe\`, a.e,
    a.roe, a.bonus / a.exprice as divyield
    FROM v_userselectstock as a
    WHERE a.user='${query.user}' and a.yearlen='${query.yearlen}' and a.order > ${query.pageStart}
    ORDER BY a.order ASC
    LIMIT ${query.pageSize};
`
      }
    },
    createsql: (query: any, parasm: any[]) => {
      let user = query.user as number;
      let userStr = Number.isNaN(user) ? '' : user.toString();
      let ttNameDV = '_tmpdvorderbyuser_' + userStr;
      let ttNamePE = '_tmppeorderbyuser_' + userStr;
      let ttNameROE = '_tmproeorderbyuser_' + userStr;
      let ttNameR = '_tmpRorderbyuser_' + userStr;
      return `START TRANSACTION;
DELETE FROM t_userselectstock WHERE \`user\`='${user}';
DROP TEMPORARY TABLE IF EXISTS \`${ttNameDV}\`;
CREATE TEMPORARY TABLE \`${ttNameDV}\` (\`no\` int not null auto_increment primary key, stock int not NULL, INDEX (stock)) ENGINE=MyISAM;
DROP TEMPORARY TABLE IF EXISTS \`${ttNamePE}\`;
CREATE TEMPORARY TABLE \`${ttNamePE}\` (\`no\` int not null auto_increment primary key, stock int not null, INDEX (stock)) ENGINE=MYISAM;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameROE}\`;
CREATE TEMPORARY TABLE \`${ttNameROE}\` (\`no\` int not null auto_increment primary key, stock int not null, INDEX (stock)) ENGINE=MYISAM;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameR}\`;
CREATE TEMPORARY TABLE \`${ttNameR}\` (\`no\` int not null auto_increment primary key, stock int not null, ma INT, m1 INT, m2 INT, m3 INT, INDEX (stock)) ENGINE=MYISAM;
insert into \`${ttNamePE}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join l_earning as b 
  on a.stock = b.stock and b.yearlen = '${query.yearlen}' and b.earning > 0
  order by a.复权 / b.earning ASC LIMIT 1500;
insert into \`${ttNameDV}\` (stock) select a.stock as stock from t_股票价格复权 as a inner join t_最近年分红 as b 
  on a.stock = b.stock and b.bonus>0
  order by b.bonus / a.复权 DESC LIMIT 1500;
INSERT INTO \`${ttNameROE}\` (stock) SELECT stock FROM l_roe ORDER BY roe DESC LIMIT 1500;
INSERT INTO \`${ttNameR}\` (stock, ma, m1, m2, m3) (SELECT a.stock,
  (10 - FLOOR((a.\`no\`-1)/150)) + (10 - FLOOR((b.\`no\`-1)/150)) + (10 - FLOOR((c.\`no\`-1)/150)) AS ma,
  (10 - FLOOR((a.\`no\`-1)/150)) AS m1, (10 - FLOOR((b.\`no\`-1)/150)) AS m2, (10 - FLOOR((c.\`no\`-1)/150)) AS m3
  FROM \`${ttNameDV}\` AS a 
  JOIN \`${ttNamePE}\` AS b ON a.stock=b.stock
  JOIN \`${ttNameROE}\` AS c ON a.stock=c.stock
  ORDER BY  ma DESC, (m1+m2) DESC, b.no ASC);
INSERT INTO t_userselectstock (\`user\`,\`order\`,\`stock\`, m1, m2, m3)
  SELECT '${user}', a.no, a.stock, a.m1, a.m2, a.m3 
  FROM \`${ttNameR}\` AS a 
  limit 200;
COMMIT;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameDV}\`;
DROP TEMPORARY TABLE IF EXISTS \`${ttNamePE}\`;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameROE}\`;
DROP TEMPORARY TABLE IF EXISTS \`${ttNameR}\`;
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
    this.firstPage = pageStart !==undefined && pageStart <= 0;
    this.valid = true;
  }

  GetCreateSql() {
    if (this.valid && this.qt.createsql !== undefined)
      return this.qt.createsql(this.query, this.params);
    return undefined;
  }

  GetQuerySql() {
    if (this.valid)
      return this.qt.sql(this.query, this.params);
    return undefined;
  }
}