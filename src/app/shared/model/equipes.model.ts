export interface IEquipes {
    codEquipe: number;
    descEquipe: string;
    liderEquipe: string;    
}

export class Equipes implements IEquipes {
    codEquipe: number;
    descEquipe: string;
    liderEquipe: string; 
    
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IEquipes): string {
        return `${item.codEquipe}`;
    }
    
}