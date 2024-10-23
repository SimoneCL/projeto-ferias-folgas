export interface IUsuarioSubstituto {
    usuario_id: number;
    substituto_id: number;
}

export class UsuarioSubstituto implements IUsuarioSubstituto {
    usuario_id: number;
    substituto_id: number;
    
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(model: IUsuarioSubstituto): number {
        return model.substituto_id;
    }
}
