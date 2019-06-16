import { Router, Request, Response } from 'express';
import { scanSinaSymbols } from '../scan/symbolsina';
import { scanSinaQuotations } from '../scan/hqsina';
import { scanSinaHistory } from '../scan/historysina';

const sinaRouter: Router = Router();
sinaRouter.get('/history', async (req: Request, res: Response) => {
  let len:number = Number(req.query['len']);
  if (len > 0 && len <= 3000) {
    scanSinaHistory(len);
  }
  res.json({"sina": 'scan history'});
});

sinaRouter.post('/history', async (req: Request, res: Response) => {
  let len:number = Number(req.body['len']);
  if (len > 0 && len <= 3000) {
    scanSinaHistory(len);
  }
  res.json({"sina": 'scan history'});
});

sinaRouter.get('/symbols', async (req: Request, res: Response) => {
  scanSinaSymbols();
  res.json({"sina": 'scan symbols'});
});

sinaRouter.get('/quotations', async (req: Request, res: Response) => {
  scanSinaQuotations();
  res.json({"sina": 'scan quotations'});
});

export default sinaRouter;