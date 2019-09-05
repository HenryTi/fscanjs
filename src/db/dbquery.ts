import { QueryCreator } from './querycreator';
import { Runner } from './runner';

export class DbQuery {
  private runner:Runner;
  constructor(runner:Runner) {
    this.runner = runner;
  }

  async process(query:any, params:any[]) {
    let spc = new QueryCreator(query, params);
  }
}
