export interface ITipoPerfilUsuario {
    idTipoPerfil: number;
    descricaoPerfil: string; 
    gestorPessoas: number | boolean;   
}

export class TipoPerfilUsuario implements ITipoPerfilUsuario {
    idTipoPerfil: number;
    descricaoPerfil: string;
    gestorPessoas: number | boolean;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static of(json: any = {}) {
        return new TipoPerfilUsuario(json);
    }

    static empty() {
        return new TipoPerfilUsuario();
    }

    static fromJson(json: Array<any> = []) {

        const items: Array<ITipoPerfilUsuario> = [];

        for (const values of json) {
            items.push(new TipoPerfilUsuario(values));
        }

        return items;
    }

    static getInternalId(item: ITipoPerfilUsuario): string {
        return `${item.idTipoPerfil}`;
    }
}