"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Report {
}
exports.Report = Report;
class Reports {
    constructor() {
        this.map = {};
    }
    async load(date) {
        this.date = date;
        this.map = {};
        //throw new Error('implementing!');
    }
}
exports.Reports = Reports;
//# sourceMappingURL=reports.js.map