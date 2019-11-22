"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hqsina_1 = require("./scan/hqsina");
const historysina_1 = require("./scan/historysina");
const symbolsina_1 = require("./scan/symbolsina");
const sinafiles_1 = require("./scan/sinafiles");
const financesina_1 = require("./scan/financesina");
const cqsina_1 = require("./scan/cqsina");
const updateEarnig_1 = require("./magic/updateEarnig");
const roe_1 = require("./magic/roe");
const updatedividend_1 = require("./magic/updatedividend");
async function startTimer() {
    console.log('start timer.');
    setInterval(() => {
        let dt = new Date();
        let dayInWeek = dt.getDay();
        if (dayInWeek == 0) { //周日
            CheckSundayTask(dt);
        }
        else if (dayInWeek == 6) { //周六
            CheckSaturdayTask(dt);
        }
        else {
            CheckDayTask(dt);
        }
    }, 600000);
}
exports.startTimer = startTimer;
var dayTaskRunning = false;
var downloadSymbolTask = 0;
var downloadHistoryTask = 0;
async function CheckDayTask(dt) {
    if (dayTaskRunning)
        return;
    let day = dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
    let hm = dt.getHours() * 100 + dt.getMinutes();
    if ((hm >= 930 && hm <= 1140) || (hm >= 1300 && hm <= 1520)) {
        dayTaskRunning = true;
        await hqsina_1.scanSinaQuotations();
        dayTaskRunning = false;
    }
    else if (hm >= 1700 && hm < 1900) {
        if (day > downloadSymbolTask) {
            dayTaskRunning = true;
            await symbolsina_1.scanSinaSymbols();
            downloadSymbolTask = day;
            dayTaskRunning = false;
            return;
        }
    }
    if (hm >= 1800 && hm < 2000) {
        if (day > downloadHistoryTask) {
            dayTaskRunning = true;
            await historysina_1.scanSinaHistory(10, 0);
            downloadHistoryTask = day;
            dayTaskRunning = false;
        }
    }
}
var saturdayTaskRunning = false;
var downloadSinaTask = 0;
async function CheckSaturdayTask(dt) {
    if (saturdayTaskRunning)
        return;
    let day = dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
    let hm = dt.getHours() * 100 + dt.getMinutes();
    if (hm >= 100 && hm < 500) {
        if (day > downloadSinaTask) {
            saturdayTaskRunning = true;
            await scanSinaAllFiles();
            downloadSinaTask = day;
            saturdayTaskRunning = false;
            return;
        }
    }
}
async function scanSinaAllFiles() {
    let dt = new Date();
    console.log('scanSinaAllFiles at Saturday Begin  - ' + dt.toLocaleString());
    await sinafiles_1.scanSinaFiles(0, 'finance');
    await sinafiles_1.scanSinaFiles(0, 'balancesheet');
    await sinafiles_1.scanSinaFiles(0, 'profitstatement');
    await sinafiles_1.scanSinaFiles(0, 'stockstructure');
    await financesina_1.scanSinaFinance(0, false);
    await cqsina_1.scanSinaExRight();
    await updatedividend_1.updateAllDividend();
    await updateEarnig_1.updateAllEarning();
    await roe_1.calculateAllRoe();
    dt = new Date();
    console.log('scanSinaAllFiles at Saturday End  - ' + dt.toLocaleString());
}
var sundayTaskRunning = false;
async function CheckSundayTask(dt) {
    if (sundayTaskRunning)
        return;
    let day = dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
    let hm = dt.getHours() * 100 + dt.getMinutes();
    if (hm >= 100) {
        if (day > downloadSinaTask) {
            sundayTaskRunning = true;
            await scanSinaFilesSunday();
            downloadSinaTask = day;
            sundayTaskRunning = false;
            return;
        }
    }
}
async function scanSinaFilesSunday() {
    let dt = new Date();
    console.log('scanSinaFilesSunday Begin  - ' + dt.toLocaleString());
    //await scanSinaExRight();
    dt = new Date();
    console.log('scanSinaFilesSunday End  - ' + dt.toLocaleString());
}
//# sourceMappingURL=timedtask.js.map