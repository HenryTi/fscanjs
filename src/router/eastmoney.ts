import { Router, Request, Response } from 'express';
import { scanEastmoney } from '../scan/eastmoney';

const eastmoneyRouter: Router = Router();
eastmoneyRouter.get('/finance', async (req: Request, res: Response) => {
  scanEastmoney();
  res.json({"eastmoney": 'scan finance'});
});

eastmoneyRouter.post('/finance', async (req: Request, res: Response) => {

});

export default eastmoneyRouter;