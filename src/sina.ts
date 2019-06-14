import * as request from 'request';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

var BufferHelper = require('bufferhelper');

export async function fetchSinaContent(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      let req = request.get(url);
      req.on('error', err => {
        reject(err);
      })
      req.on('response', (res) => {
        var bufferHelper = new BufferHelper();
        res.on('data', (chunk) => {
          try {
            bufferHelper.concat(chunk);
          }
          catch (err) {
            reject(err);
          }
        });
        res.on('end', () => {
          try {
            var result = iconv.decode(bufferHelper.toBuffer(), 'GBK');
            resolve(result);
          }
          catch (err) {
            reject(err);
          }
        });
        res.on('error', (err)=>{
          reject(err);
        })
      });
    }
    catch (reqErr) {
      reject(reqErr);
    }
  });
}
