import { QueryCreator } from './querycreator';
import { Runner } from './runner';

export class DbQuery {
  private runner:Runner;
  constructor(runner:Runner) {
    this.runner = runner;
  }

  async process(query:any, params:any[]) {
    let spc = new QueryCreator(query, params);
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
