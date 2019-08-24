import { Router, Request, Response } from 'express';
import { getRunner, Runner } from '../db';
import { Const_dbname } from '../const';
const sqlRouter: Router = Router();

sqlRouter.post('/call', async (req: Request, res: Response) => {
  let sqlprocess = req.body['call']
  let params = req.body['params'];

  let runner = await getRunner(Const_dbname);
  try {
    let r = await runner.call(sqlprocess, params);
    res.json({ok:true, res: r});
  } catch (error) {
    res.json({ok:false, error:JSON.stringify(error)});
  }
  finally {
    res.end();
  }
});

export default sqlRouter;