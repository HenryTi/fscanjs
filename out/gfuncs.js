"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let remoteIsRunning = false;
function RemoteIsRun() {
    return remoteIsRunning;
}
exports.RemoteIsRun = RemoteIsRun;
function RemoteRun(v) {
    remoteIsRunning = v;
}
exports.RemoteRun = RemoteRun;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function checkNumberNaNToZero(s) {
    if (s == '--')
        return 0;
    let s1 = s.split(',').join('');
    let ret = Number(s1);
    if (isNaN(ret))
        return 0;
    return ret;
}
exports.checkNumberNaNToZero = checkNumberNaNToZero;
function checkToDateInt(str) {
    let s = str.split('-').join('');
    let ret = parseInt(s);
    if (isNaN(ret))
        return undefined;
    return ret;
}
exports.checkToDateInt = checkToDateInt;
function checkDateToYearInt(str) {
    let s = str.split('-');
    let ret = parseInt(s[0]);
    if (isNaN(ret))
        return undefined;
    return ret;
}
exports.checkDateToYearInt = checkDateToYearInt;
function checkToDateIntHK(str) {
    let s = str.split('/').join('');
    let ret = parseInt(s);
    if (isNaN(ret))
        return undefined;
    return ret;
}
exports.checkToDateIntHK = checkToDateIntHK;
function LogWithTime(info) {
    let dt = new Date();
    console.log(info + ' - ' + dt.toLocaleString());
}
exports.LogWithTime = LogWithTime;
//# sourceMappingURL=gfuncs.js.map