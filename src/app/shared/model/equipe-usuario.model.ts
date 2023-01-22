export interface IEquipeUsuario {
    IdUsuario: number;
    usuario: string;
    codEquipe: string;
}

export class EquipeUsuario implements IEquipeUsuario {
    IdUsuario: number;
    usuario: string;
    codEquipe: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static empty() {
        return new EquipeUsuario();
    }

    static getInternalId(model: IEquipeUsuario): string {
        return `${model.usuario}|${model.codEquipe}`;
    }
}
