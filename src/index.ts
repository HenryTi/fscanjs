import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import * as sina from './sina';
import { getRunner } from './uq-api/db';
import { scanEastmoney } from './eastmoney';
import * as _ from 'lodash'

var BufferHelper = require('bufferhelper');


const urlOptions = {
  uri: 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/600036/displaytype/4.phtml',
  //encoding: 'GB18030',
};

let s = new sina.FechContent();
//s.fech(urlOptions.uri);

const uris = [
  'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/600036/displaytype/4.phtml',
];

async function processUris() {
  for (let uri of uris) {
    await s.process(uri);
  }
}

//processUris();

const jsonPath = '../data/shsz.json';
let s1 = '123,456,678.9';
let arr = s1.split(',');
var str = arr.join('').substring(0,64);

var ssss = '134124312431242fgregtergtregaergregtregear'.substring(0,5);
let a1 =2;
scanEastmoney();

let a =1;
