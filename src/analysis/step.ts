export class Step {
    protected start: Date;
    protected end: Date;
    protected current: Date;

    constructor(start:Date, end:Date) {
        this.start = start;
        this.end = end;
    }

    get first():Date {
        return this.current = this.start;
    }

    get next():Date {
        return this.current = new Date(this.current.setDate(this.current.getDate()+1));
    }

    get isGoing():boolean {
        return this.current < this.end;
    }
}

export class YearStep extends Step {
    get next():Date {
        return this.current = new Date(this.current.setFullYear(this.current.getFullYear()+1));
    }
}
