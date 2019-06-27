import { Router, Request, Response } from 'express';
import { emulateAll, allStocksAvg, emulateAtDay } from '../magic/emulatemagic';
import { calculateAllRoe } from '../magic/roe';
import { updateAllEarning } from '../magic/updateEarnig';
import { RemoteIsRun } from '../gfuncs';

const magicRouter: Router = Router();
magicRouter.get('/all', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"magic": "busy"});
    return;
  }
  emulateAll();
  res.json({"magic": "emulateAll"});
});

magicRouter.get('/day', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"magic": "busy"});
    return;
  }
  let day:number = Number(req.query['day']);
  emulateAtDay(day);
  res.json({"magic": "emulateday", "day":day});
});

magicRouter.get('/avg', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"magic": "busy"});
    return;
  }
  let begin:number = Number(req.query['begin']);
  let end:number = Number(req.query['end']);
  allStocksAvg(begin, end);
  res.json({"magic": "stocksavg", "begin":begin, "end":end});
});

magicRouter.get('/roe', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"magic": "busy"});
    return;
  }
  calculateAllRoe();
  res.json({"magic": "calculateAllRoe"});
});

magicRouter.get('/updateearning', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"magic": "busy"});
    return;
  }
  updateAllEarning();
  res.json({"magic": "updateAllEarning"});
});

export default magicRouter;