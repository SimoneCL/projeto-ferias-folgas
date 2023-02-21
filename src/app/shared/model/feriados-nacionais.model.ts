export interface IFeriadosNacionais {
    date: string;
    name: string;
    type: string;
}

export class FeriadosNacionais implements IFeriadosNacionais {
    date: string;
    name: string;
    type: string; 

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IFeriadosNacionais): string {
        return `${item.date}`;
    }
    
}