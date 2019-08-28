import * as fs from 'fs';
import * as path from 'path';
import { getRunner, Runner } from '../db';
import { Const_dbname } from '../const';

/*
const jsonPath = '../data/shsz.json';

getRunner(Const_dbname).then(async (runner) => {
  let p = path.resolve(__dirname, jsonPath);
  let content:string = fs.readFileSync(p, 'utf-8');
  let arr = JSON.parse(content); 
 
  let promiseArr: Promise<void>[] = [];
  for (let item of arr) {
    try {
      let {market, code, name} = item;
      market = (market as string).toUpperCase().trim();
      let symbol = (market as string).toLowerCase() + code;
      let row:any[] = [undefined, symbol, market, code, name, undefined];
      promiseArr.push(runner.call('tv_股票$save', row));
      if (promiseArr.length >= 100) {
        await Promise.all(promiseArr);
        promiseArr.splice(0, promiseArr.length);
      }
    }
    catch (err) {
      console.error(err);
    }
  }
  if (promiseArr.length > 0) {
    try {
      await Promise.all(promiseArr);
    }
    catch (err) {
      console.error(err);
    }
  }
});

let a =1;
*/