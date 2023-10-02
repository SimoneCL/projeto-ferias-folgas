export interface ITipoPerfilUsuario {
    idTipoPerfil: number;
    descricaoPerfil: string;    
}

export class TipoPerfilUsuario implements ITipoPerfilUsuario {
    query(arg0: undefined[], arg1: undefined[], arg2: number, arg3: number) {
      throw new Error('Method not implemented.');
    }
    idTipoPerfil: number;
    descricaoPerfil: string;

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