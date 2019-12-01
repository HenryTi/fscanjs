"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Step {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    get first() {
        return this.current = this.start;
    }
    get next() {
        return this.current = new Date(this.current.setDate(this.current.getDate() + 1));
    }
    get isGoing() {
        return this.current < this.end;
    }
}
exports.Step = Step;
class YearStep extends Step {
    get next() {
        return this.current = new Date(this.current.setFullYear(this.current.getFullYear() + 1));
    }
}
exports.YearStep = YearStep;
//# sourceMappingURL=step.js.map