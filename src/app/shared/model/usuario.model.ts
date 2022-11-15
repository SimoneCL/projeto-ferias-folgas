export interface IUsuario {
    IdUsuario: number;
    usuario: string;
    email: string;
    tipoPerfil: number;
    senha: string;
    equipes: Array<any>;
}

export class Usuario implements IUsuario {
    IdUsuario: number;
    usuario: string;
    email: string;
    tipoPerfil: number;
    senha: string;
    equipes: Array<any>;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(model: IUsuario): string {
        return `${model.IdUsuario}`;
    }
}
