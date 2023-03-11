export interface ITipoEvento {
    codTipo: number;
    descTipoEvento: string;
}

export class TipoEvento implements ITipoEvento {
    codTipo: number;
    descTipoEvento: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(model: ITipoEvento): string {
        return `${model.codTipo}`; //deixei ponto e virgula, pois no mock não funciona com pipe depois alterar
    }
  
    static dayOffType(literals: {}): Array<any> {
        return [
            { value: 1, color: 'color-01', label: literals['vacation'] },
            { value: 2, color: 'color-08', label: literals['holidayBridge'] },
            { value: 3, color: 'color-10', label: literals['resetDay'] },
        ];
    }

}
