export interface IUsuario {
    idUsuario: number;
    nomeUsuario: string;
    email: string;
    tipoPerfil: number;
    senha: string;
}

export class Usuario implements IUsuario {
    idUsuario: number;
    nomeUsuario: string;
    email: string;
    tipoPerfil: number;
    senha: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(model: IUsuario): string {
        return `${model.idUsuario}`;
    }
}
