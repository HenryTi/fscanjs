import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun, LogWithTime } from '../gfuncs';

export interface TradeDay {
  day: number,
  dayno: number,
  year: number,
  seasonno: number,
  monthno: number
}

let tradeDays: TradeDay[] = [];

export async function initTradeDay(runner:Runner, begin: number, end: number) {
  try {
    let sqlStr = `select \`day\`, \`dayno\`, \`year\`, \`seasonno\`, \`monthno\` 
from t_dayindex where \`day\`>=${begin} and \`day\`<=${end}`;
    let ret = await runner.sql(sqlStr, []);
    if (Array.isArray(ret))
    {
      tradeDays = ret;
    }
  }
  catch(e) {
    let a = e;
  }
}

export function getNextTradeDay(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day > day)
      return item;
  }

  return undefined;
}

export function getTradeDayAt(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day >= day)
      return item;
  }

  return undefined;
}

export function isMonthBegin(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day === day) {
      if (i <= 0)
        return false;
      let lastItem = tradeDays[i-1];
      if (item.monthno !== lastItem.monthno)
        return true;
      return false;
    }
    else if (item.day > day)
      return false;
  }

  return false;
}

export function isMonthEnd(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day === day) {
      if (i >= tradeDays.length - 1)
        return false;
      let nextItem = tradeDays[i-1];
      if (item.monthno !== nextItem.monthno)
        return true;
      return false;
    }
    else if (item.day > day)
      return false;
  }

  return false;
}

export function isSeasonBegin(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day === day) {
      if (i <= 0)
        return false;
      let lastItem = tradeDays[i-1];
      if (item.seasonno !== lastItem.seasonno)
        return true;
      return false;
    }
    else if (item.day > day)
      return false;
  }

  return false;
}

export function isSeasonEnd(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day === day) {
      if (i >= tradeDays.length - 1)
        return false;
      let nextItem = tradeDays[i-1];
      if (item.seasonno !== nextItem.seasonno)
        return true;
      return false;
    }
    else if (item.day > day)
      return false;
  }

  return false;
}

export function isYearBegin(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day === day) {
      if (i <= 0)
        return false;
      let lastItem = tradeDays[i-1];
      if (item.year !== lastItem.year)
        return true;
      return false;
    }
    else if (item.day > day)
      return false;
  }

  return false;
}

export function isYearEnd(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day === day) {
      if (i >= tradeDays.length - 1)
        return false;
      let nextItem = tradeDays[i-1];
      if (item.year !== nextItem.year)
        return true;
      return false;
    }
    else if (item.day > day)
      return false;
  }

  return false;
}

export function getLastTradeDay(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day >= day) {
      if (i > 0) {
        return tradeDays[i-1].day;
      }
      break;
    }
  }
  return day;
}

export function getTrdaeDayDif(begin:number, end:number) {
  let bi: TradeDay;
  let i = 0;
  for (; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day >= begin) {
      bi = item;
      break;
    }
  }

  for (; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day >= end) {
      if (bi !== undefined) {
        return item.dayno - bi.dayno;
      }
      break;
    }
  }

  return undefined;
}