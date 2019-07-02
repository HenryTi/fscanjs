import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import * as config from 'config';
import sinaRouter from './router/sina';
import eastmoneyRouter from './router/eastmoney';
import { doTest } from './test';
import magicRouter from './router/magic';

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
(async function () {

  let connection = config.get<any>("connection");
  if (connection === undefined || connection.host === '0.0.0.0') {
    console.log("mysql connection must defined in config/default.json or config/production.json");
    return;
  }

  let app = express();
  app.use(express.static('public'));
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
  app.use(bodyParser.json());
  app.set('json replacer', (key: any, value: any) => {
    if (value === null) return undefined;
    return value;
  });

  app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let s = req.socket;
    let p = '';
    if (req.method !== 'GET') p = JSON.stringify(req.body);
    console.log('%s:%s - %s %s %s', s.remoteAddress, s.remotePort, req.method, req.originalUrl, p);
    try {
      await next();
    }
    catch (e) {
      console.error(e);
    }
  });

  app.use('/fsjs/sina', sinaRouter);
  app.use('/fsjs/eastmoney', eastmoneyRouter);
  app.use('/fsjs/magic', magicRouter);
  app.use('/hello', dbHello);

  function dbHello(req: Request, res: Response) {
    let db = req.params.db;
    res.json({ "hello": 'fscanjs: hello, db is ' + db });
  }

  let port = config.get<number>('port');
  console.log('port=', port);

  app.listen(port, async () => {
    console.log('fscanjs listening on port ' + port);
    let connection = config.get<any>("connection");
    let { host, user } = connection;
    console.log('process.env.NODE_ENV: %s\nDB host: %s, user: %s',
      process.env.NODE_ENV,
      host,
      user);
  });
})();
