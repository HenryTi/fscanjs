import { Router, Request, Response } from 'express';

const sinaRouter: Router = Router();
sinaRouter.get('/history', async (req: Request, res: Response) => {
  let r = req;
  let a = 1;
  res.json({"sina": 'scan history'});
});

sinaRouter.post('/history', async (req: Request, res: Response) => {

});

sinaRouter.get('/symbols', async (req: Request, res: Response) => {
  let r = req;
  let a = 1;
  res.json({"sina": 'scan symbols'});
});


export default sinaRouter;