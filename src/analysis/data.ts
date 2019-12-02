import { Runner, getRunner } from "../db";
import { Const_dbname } from "../const";

function getDayNum(date: Date): number {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + (date.getDate());
}

class Data {
    private runner: Runner;

    async init() {
        this.runner = await getRunner(Const_dbname);
    }

    async getPricesFromDay(date:Date):Promise<any[]> {
        let dayNum = getDayNum(date);
        return await this.runner.tableFromProc('getPricesFromDay', [dayNum]);
    }
}

export const data = new Data();

