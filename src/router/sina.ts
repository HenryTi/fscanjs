import { Router, Request, Response } from 'express';
import { scanSinaSymbols } from '../scan/symbolsina';
import { scanSinaQuotations } from '../scan/hqsina';
import { scanSinaHistory } from '../scan/historysina';
import { scanSinaExRight } from '../scan/cqsina';
import { caclulateExRight } from '../scan/calcexright';
import { scanSinaFinance } from '../scan/financesina';
import { RemoteIsRun } from '../gfuncs';

const sinaRouter: Router = Router();

sinaRouter.get('/calcexrights', async (req: Request, res: Response) => {
  if (RemoteIsRun()) {
    res.json({"sina": "busy"});
    return;
  }
  caclulateExRight();
  res.json({"sina": 'caculate ExRights'});
});

export default sinaRouter;