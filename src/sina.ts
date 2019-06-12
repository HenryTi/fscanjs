import * as request from 'request';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

var BufferHelper = require('bufferhelper');

export class FechContent {
  event(type: string, value: any) {
    this.onEvent(type, value);
  }

  onEvent(type: string, value: any) {
    switch (type) {
      default: return;
      case 'fechend':
        this.ProcessContent(value);
        break;
    }
  }

  protected ProcessContent(value: string) {
    let $ = cheerio.load(value);
    $("#center").find('tr').each((index: any, element: any) => {
      let t = $(element).find('td');
      t.each((index: any, element: any) => {
        let s = $(element).text();
        console.log(s);
      })
    })
  }

  async fech(url: string):Promise<string> {
    return await this.fechContent(url);
  }

  private async fechContent(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        let req = request.get(url);
        req.on('response', (res) => {
          var bufferHelper = new BufferHelper();
          res.on('data', (chunk) => {
            try {
              bufferHelper.concat(chunk);
            }
            catch(err) {
              reject(err);
            }
          });
          res.on('end', () => {
            try {
              var result = iconv.decode(bufferHelper.toBuffer(), 'GBK');
              //this.event('fechend', result);
              resolve(result);
            }
            catch (err) {
              reject(err);
            }
          });
        });
      }
      catch (reqErr) {
        reject(reqErr);
      }
    });
  }

  async process(url:string): Promise<void> {
    let content = await this.fech(url);
    let $ = cheerio.load(content);
    $("#center").find('tr').each((index: any, element: any) => {
      let t = $(element).find('td');
      t.each((index: any, element: any) => {
        let s = $(element).text();
        console.log(s);
      })
    })
  }
}

export async function scanSina() {

}

// const fechSina = new FechContent();
// export default fechSina;