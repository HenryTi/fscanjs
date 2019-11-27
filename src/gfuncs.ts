let remoteIsRunning:boolean = false;
export function RemoteIsRun() {
  return remoteIsRunning;
}
export function RemoteRun(v:boolean) {
  remoteIsRunning = v;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function checkNumberNaNToZero(s: string) {
  if (s == '--')
    return 0;
  let s1 = s.split(',').join('');
  let ret = Number(s1);
  if (isNaN(ret))
    return 0;
  return ret;
}

export function checkToDateInt(str: string) {
  let s = str.split('-').join('');
  let ret = parseInt(s);
  if (isNaN(ret))
    return undefined;
  return ret;
}

export function checkDateToYearInt(str: string) {
  let s = str.split('-');
  let ret = parseInt(s[0]);
  if (isNaN(ret))
    return undefined;
  return ret;
}

export function checkToDateIntHK(str: string) {
  let s = str.split('/').join('');
  let ret = parseInt(s);
  if (isNaN(ret))
    return undefined;
  return ret;
}

export function LogWithTime(info:string) {
  let dt = new Date();
  console.log(info + ' - ' + dt.toLocaleString());
}

