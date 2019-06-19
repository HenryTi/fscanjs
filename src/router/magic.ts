import { Router, Request, Response } from 'express';
import { emulateAll } from '../magic/emulate';

const magicRouter: Router = Router();
magicRouter.get('/magicall', async (req: Request, res: Response) => {
  emulateAll();
  res.json({"magic": "emulateAll"});
});

export default magicRouter;