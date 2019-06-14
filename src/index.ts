import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { getRunner } from './uq-api/db';
import { scanEastmoney } from './scan/eastmoney';
import * as _ from 'lodash'
import { fetchSinaContent } from './scan/sina';
import { scanSinaQuotations } from './scan/hqsina';
import { scanSinaSymbols } from './scan/symbolsina';
import { scanSinaHistory } from './scan/historysina';
import * as express from 'express';

let app=express();
let dir = __dirname;

let p1 = path.join(__dirname, '../../data');
let p2 = path.resolve(__dirname, '../../data')
let afds = 8;

//scanSinaQuotations();

scanSinaHistory(10);

//scanSinaSymbols();

//scanEastmoney();

let a =1;
