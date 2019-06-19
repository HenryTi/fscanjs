import { Router, Request, Response } from 'express';
import { emulateAll, allStocksAvg, emulateAtDay } from '../magic/emulate';

const magicRouter: Router = Router();
magicRouter.get('/all', async (req: Request, res: Response) => {
  emulateAll();
  res.json({"magic": "emulateAll"});
});

magicRouter.get('/day', async (req: Request, res: Response) => {
  let day:number = Number(req.query['day']);
  emulateAtDay(day);
  res.json({"magic": "emulateday", "day":day});
});

magicRouter.get('/avg', async (req: Request, res: Response) => {
  let day:number = Number(req.query['day']);
  allStocksAvg(day);
  res.json({"magic": "stocksavg", "day":day});
});

export default magicRouter;