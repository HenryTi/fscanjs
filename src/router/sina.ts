import { Router, Request, Response } from 'express';
import { scanSinaSymbols } from '../scan/symbolsina';
import { scanSinaQuotations } from '../scan/hqsina';
import { scanSinaHistory } from '../scan/historysina';
import { scanSinaExRight } from '../scan/cqsina';
import { caclulateExRight } from '../scan/calcexright';
import { scanSinaFinance } from '../scan/financesina';
import { RemoteIsRun } from '../gfuncs';

const sinaRouter: Router = Router();
sinaRouter.get('/history', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"sina": "busy"});
    return;
  }
  let len:number = Number(req.query['len']);
  let start:number = Number(req.query['start']);
  if (len > 0 && len <= 5000) {
    scanSinaHistory(len, start);
  }
  res.json({"sina": "scan history ", "len":len, "start":start});
});

sinaRouter.post('/history', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"sina": "busy"});
    return;
  }
  let len:number = Number(req.body['len']);
  let start:number = Number(req.body['start']);
  if (len > 0 && len <= 5000) {
    scanSinaHistory(len, start);
  }
  res.json({"sina": "scan history ", "len":len, "start":start});
});

sinaRouter.get('/symbols', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"sina": "busy"});
    return;
  }
  scanSinaSymbols();
  res.json({"sina": 'scan symbols'});
});

sinaRouter.get('/quotations', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"sina": "busy"});
    return;
  }
  scanSinaQuotations();
  res.json({"sina": 'scan quotations'});
});

sinaRouter.get('/exrights', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"sina": "busy"});
    return;
  }
  scanSinaExRight();
  res.json({"sina": 'scan ExRights'});
});

sinaRouter.get('/calcexrights', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"sina": "busy"});
    return;
  }
  caclulateExRight();
  res.json({"sina": 'caculate ExRights'});
});

sinaRouter.get('/finance', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"sina": "busy"});
    return;
  }
  let start:number = Number(req.query['start']);
  if (isNaN(start) || start < 0) {
    start = 0;
  }
  scanSinaFinance(start);
  res.json({"sina": "scan finance ", "start":start});
});

export default sinaRouter;