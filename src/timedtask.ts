import { scanSinaQuotations } from "./scan/hqsina";
import { scanSinaHistory } from "./scan/historysina";
import { scanSinaSymbols } from "./scan/symbolsina";

export async function startTimer() {
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

var dayTaskRunning: boolean = false;
var downloadSymbolTask: number = 0;
var downloadHistoryTask: number = 0;
async function CheckDayTask(dt: Date) {
  if (dayTaskRunning)
    return;
  let day = dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
  let hm = dt.getHours() * 100 + dt.getMinutes();
  if ((hm >= 930 && hm <= 1140) || (hm >= 1300 && hm <= 1520)) {
    dayTaskRunning = true;
    await scanSinaQuotations();
    dayTaskRunning = false;
  }
  else if (hm >= 1700) {
    if (day > downloadSymbolTask) {
      dayTaskRunning = true;
      await scanSinaSymbols();
      downloadSymbolTask = day;
      dayTaskRunning = false;
    }
  }
  else if (hm >= 1800) {
    if (day > downloadHistoryTask) {
      dayTaskRunning = true;
      await scanSinaHistory(10, 0);
      downloadHistoryTask = day;
      dayTaskRunning = false;
    }
  }
}

async function CheckSundayTask(dt: Date) {

}

async function CheckSaturdayTask(dt: Date) {

}