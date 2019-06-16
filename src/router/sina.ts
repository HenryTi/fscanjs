import { Router, Request, Response } from 'express';
import { scanSinaSymbols } from '../scan/symbolsina';
import { scanSinaQuotations } from '../scan/hqsina';

const sinaRouter: Router = Router();
sinaRouter.get('/history', async (req: Request, res: Response) => {
  let r = req;
  let a = 1;
  res.json({"sina": 'scan history'});
});

sinaRouter.post('/history', async (req: Request, res: Response) => {

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