import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import * as config from 'config';
import sinaRouter from './router/sina';
import eastmoneyRouter from './router/eastmoney';
import { fetchSinaContent } from './scan/sina';
import * as cheerio from 'cheerio';
import { scanSinaExRight } from './scan/cqsina';
import { getRunner, Runner } from './uq-api/db';
import { DefaultUnit } from './const';
import { packParam } from './uq-api/core/packParam';
import { emulateAtDay, emulateAll, allStocksAvg } from './magic/emulate';

export async function doTest(){
  //emulateAll();
  //allStocksAvg();
}
//scanItem({ symbol: 'sz000001', code: "000001" });

async function scanItem(item: any) {
  let { symbol, code } = item as { symbol: string, code: string };
  let url = 'https://money.finance.sina.com.cn/corp/go.php/vISSUE_ShareBonus/stockid/' + code + '.phtml';
  let content = await fetchSinaContent(url);
  try {
    let $ = cheerio.load(content);
    let t1 = $('#sharebonus_1>td');
    let tableOne = $('#sharebonus_1 > tbody');
    tableOne.find('>tr').map((index:number, element:CheerioElement) => {
      let value:any[] = [];
      $(element).find('>td').map((i:number, e:CheerioElement) => {
        value.push($(e).text());
      });
      let d = 1
    });
    let arr = tableOne.find('>td');

    let tableTwo = $('#sharebonus_2 tbody');
    let arr2 = tableTwo.find('>tr');
    let a = 1;
    $('#sharebonus_2>tbody>tr').map((index:number, element:CheerioElement) => {
      let value:any[] = [];
      $(element).find('>td').map((i:number, e:CheerioElement) => {
        value.push($(e).text());
      });
      let bb =1;
    });
  }
  catch (err) {
    let e = err;
  }
}