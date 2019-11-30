export class Stock {
    readonly id: number;
    readonly no: string;
    readonly name: string;

    constructor(id:number, no:string, name:string) {
        this.id = id;
        this.no = no;
        this.name = name;
    }
}

export interface Stocks {
    [id:number]: Stock;
}

export class Market {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}
