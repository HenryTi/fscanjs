"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tradeday_1 = require("./tradeday");
class Step {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.current = this.start;
        this.current.isNewMonth = true;
        this.current.isNewYear = true;
    }
    get first() {
        return this.current;
    }
    get next() {
        let nd = tradeday_1.tradeDayToNext(this.current);
        nd.isNewMonth = nd.monthno != this.current.monthno;
        nd.isNewYear = nd.year != this.current.year;
        return this.current = nd;
    }
    get isGoing() {
        return this.current.day < this.end.day;
    }
}
exports.Step = Step;
//# sourceMappingURL=step.js.map