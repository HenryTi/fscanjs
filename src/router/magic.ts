import { Router, Request, Response } from 'express';
import { emulateAll, allStocksAvg } from '../magic/emulate';

const magicRouter: Router = Router();
magicRouter.get('/magicall', async (req: Request, res: Response) => {
  allStocksAvg();
  res.json({"magic": "emulateAll"});
});

export default magicRouter;