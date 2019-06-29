import * as _ from 'lodash';
import {getDb, Db} from './db';

const runners: {[name:string]: Runner} = {};

export async function getRunner(name:string):Promise<Runner> {
    name = name.toLowerCase();
    let runner = runners[name];
    if (runner === null) return;
    if (runner === undefined) {
        let db = getDb(name);
        let isExists = await db.exists();
        if (isExists === false) {
            runners[name] = null;
            return;
        }
        runner = new Runner(db);
        runners[name] = runner;
    }
    //await runner.init();
    return runner;
}

export class Runner {
    private db:Db;
    private setting: {[name:string]: any};

    constructor(db:Db) {
        this.db = db;
        this.setting = {};
    }

    getDb():string {return this.db.getDbName()}

    async sql(sql:string, params:any[]): Promise<any> {
        return await this.db.sql(sql, params);
    }

    async call(proc:string, params:any[]): Promise<any> {
        return await this.db.call(proc, params);
    }    

    async callEx(proc:string, params:any[]): Promise<any> {
        return await this.db.callEx(proc, params);
    }    

    async query(query:string, params:any[]): Promise<any> {
        return await this.db.call(query, params);
    }

    async createDatabase(): Promise<void> {
        return await this.db.createDatabase();
    }

    async tableFromProc(proc:string, params:any[]):Promise<any[]> {
        return await this.db.tableFromProc(proc, params);
    }

    async tablesFromProc(proc:string, params:any[]):Promise<any[][]> {
        return await this.db.tablesFromProc(proc, params);
    }

    async initResDb(resDbName:string): Promise<void> {
        await this.db.initResDb(resDbName);
    }

}
