import { Router, Request, Response } from 'express';
import { getRunner, Runner, DbQuery } from '../db';
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

sqlRouter.post('/query', async (req: Request, res: Response) => {
  let query = req.body['query'];
  let params = req.body['params'] as any[];

  let runner = await getRunner(Const_dbname);
  try {
    let dbproc = new DbQuery(runner);
    let r = await dbproc.process(query, params);
    res.json({ok:true, res: r});
  }
  catch (error) {
    res.json({ok:false, error:JSON.stringify(error)});
  }
  finally {
    res.end();
  }
});

export default sqlRouter;