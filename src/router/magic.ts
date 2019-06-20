import { Router, Request, Response } from 'express';
import { emulateAll, allStocksAvg, emulateAtDay } from '../magic/emulate';
import { calculateAllRoe } from '../magic/roe';

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
  let begin:number = Number(req.query['begin']);
  let end:number = Number(req.query['end']);
  allStocksAvg(begin, end);
  res.json({"magic": "stocksavg", "begin":begin, "end":end});
});

magicRouter.get('/roe', async (req: Request, res: Response) => {
  calculateAllRoe();
  res.json({"magic": "calculateAllRoe"});
});
export default magicRouter;