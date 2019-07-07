"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hqsina_1 = require("./scan/hqsina");
const historysina_1 = require("./scan/historysina");
const symbolsina_1 = require("./scan/symbolsina");
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
    else if (hm >= 1700) {
        if (day > downloadSymbolTask) {
            dayTaskRunning = true;
            await symbolsina_1.scanSinaSymbols();
            downloadSymbolTask = day;
            dayTaskRunning = false;
        }
    }
    else if (hm >= 1800) {
        if (day > downloadHistoryTask) {
            dayTaskRunning = true;
            await historysina_1.scanSinaHistory(10, 0);
            downloadHistoryTask = day;
            dayTaskRunning = false;
        }
    }
}
async function CheckSundayTask(dt) {
}
async function CheckSaturdayTask(dt) {
}
//# sourceMappingURL=timedtask.js.map