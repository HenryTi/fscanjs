import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun, LogWithTime } from '../gfuncs';
import { data } from "./data";
import { Trader } from './trader';

export interface TradeDay {
  day: number,
  dayno: number,
  year: number,
  seasonno: number,
  monthno: number,
  isNewMonth?: boolean,
  isNewYear?: boolean
}

let tradeDayMaps: { [day:number]: TradeDay} = {};
let tradeDayNoMaps: { [no:number]: TradeDay} = {}
let tradeDays: TradeDay[] = [];

export async function initTradeDay(begin: number, end: number) {
  tradeDays = await data.getTradDays(begin, end) as TradeDay[];
  for (let item of tradeDays) {
    tradeDayMaps[item.day] = item;
    tradeDayNoMaps[item.dayno] = item;
  }
}

export function getNextTradeDay(day:number) {
  let r = tradeDayMaps[day];
  if (r !== undefined) {
    return tradeDayNoMaps[r.dayno+1];
  }
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day >= day) {
      return item;
    }
  }

  return undefined;
}

export function tradeDayToNext(tradeDay: TradeDay) {
  return tradeDayNoMaps[tradeDay.dayno + 1];
}

export function getTradeDayAt(day:number) {
  return tradeDayMaps[day];
}

export function getLastTradeDay(day:number) {
  for (let i = 0; i < tradeDays.length; ++i) {
    let item = tradeDays[i];
    if (item.day >= day) {
      if (i > 0) {
        return tradeDays[i-1];
      }
      break;
    }
  }
  return undefined;
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