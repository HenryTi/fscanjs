import { Router, Request, Response } from 'express';

const eastmoneyRouter: Router = Router();
eastmoneyRouter.get('/finance', async (req: Request, res: Response) => {
  res.json({"eastmoney": 'sacn finance'});
});

eastmoneyRouter.post('/finance', async (req: Request, res: Response) => {

});

export default eastmoneyRouter;