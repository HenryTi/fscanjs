import { Router, Request, Response } from 'express';
import { emulateAll, allStocksAvg, emulateAtDay } from '../magic/emulate';

const magicRouter: Router = Router();
magicRouter.get('/magicall', async (req: Request, res: Response) => {
  emulateAll();
  res.json({"magic": "emulateAll"});
});

magicRouter.get('/magicday', async (req: Request, res: Response) => {
  let day:number = Number(req.query['day']);
  emulateAtDay(day);
  res.json({"magic": "emulateday", "day":day});
});

export default magicRouter;