export interface IEquipeUsuario {
    idUsuario: number;
    codEquipe: string;
}

export class EquipeUsuario implements IEquipeUsuario {
    idUsuario: number;
    codEquipe: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static empty() {
        return new EquipeUsuario();
    }

    static getInternalId(model: IEquipeUsuario): string {
        return `${model.idUsuario}|${model.codEquipe}`;
    }
}
