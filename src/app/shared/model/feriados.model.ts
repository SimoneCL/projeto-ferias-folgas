export interface IFeriados {
    data: string;
    tipoFeriado: string;
    descricao: string;
    pontoFacultativo: boolean;
}

export class Feriados implements IFeriados {
    data: string;
    tipoFeriado: string;
    descricao: string; 
    pontoFacultativo: boolean;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IFeriados): string {
        return `${item.data}`;
    }
    
}