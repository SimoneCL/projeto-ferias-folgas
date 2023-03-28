export interface IEvento {
    id: number;
    idUsuario: number;
    dataEventoIni: string;
    dataEventoFim: string;
    codTipo: number | string;
}

export class Evento implements IEvento {
    id: number;
    idUsuario: number;
    dataEventoIni: string;
    dataEventoFim: string;
    codTipo: number | string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(model: IEvento): string {
        return `${model.id};${model.idUsuario}`; //deixei ponto e virgula, pois no mock não funciona com pipe depois alterar
    }
    static FormataStringData(data) {
        var dia = data.split("/")[0];
        var mes = data.split("/")[1];
        var ano = data.split("/")[2];

        return ("0" + dia).slice(-2) + '/' + ("0" + mes).slice(-2);
        // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
    }

    static dayOffType(literals: {}): Array<any> {
        return [
            { value: 1, color: 'color-01', label: literals['vacation'] },
            { value: 2, color: 'color-08', label: literals['holidayBridge'] },
            { value: 3, color: 'color-10', label: literals['resetDay'] },
        ];
    }

}
