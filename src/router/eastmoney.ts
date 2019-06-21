import { Router, Request, Response } from 'express';
import { scanEastmoney } from '../scan/eastmoney';
import { RemoteIsRun } from '../gfuncs';

const eastmoneyRouter: Router = Router();
eastmoneyRouter.get('/finance', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"eastmoney": "busy"});
    return;
  }
  scanEastmoney();
  res.json({"eastmoney": 'scan finance'});
});

eastmoneyRouter.post('/finance', async (req: Request, res: Response) => {

});

export default eastmoneyRouter;