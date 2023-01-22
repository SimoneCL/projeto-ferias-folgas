export interface IUsuario {
    IdUsuario: number;
    usuario: string;
    email: string;
    tipoPerfil: number;
    senha: string;
}

export class Usuario implements IUsuario {
    IdUsuario: number;
    usuario: string;
    email: string;
    tipoPerfil: number;
    senha: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(model: IUsuario): string {
        return `${model.IdUsuario}`;
    }
}
