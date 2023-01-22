export interface IEquipes {
    codEquipe: number;
    descEquipe: string;    
}

export class Equipes implements IEquipes {
    codEquipe: number;
    descEquipe: string;
    
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IEquipes): string {
        return `${item.codEquipe}`;
    }
    
}