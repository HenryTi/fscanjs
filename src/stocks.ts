import * as fs from 'fs';
import * as path from 'path';
import { getRunner } from './uq-api/db';

const jsonPath = '../data/shsz.json';

getRunner('mi').then(async (runner) => {
  let p = path.resolve(__dirname, jsonPath);
  let content:string = fs.readFileSync(p, 'utf-8');
  let arr = JSON.parse(content); 
 
  let promiseArr: Promise<void>[] = [];
  for (let item of arr) {
    try {
      let {market, code, name, short} = item;
      let row:any[] = [undefined, market, code, name, short];
      promiseArr.push(runner.tuidSave('股票', 35, undefined, row));
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
