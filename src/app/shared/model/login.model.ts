export interface ILogin {
    idUsuario: number;
    usuario: string;
    email: string;
    tipoPerfil: number;
    senha: string;

}

export class Login implements ILogin {
    idUsuario: number;
    usuario: string;
    email: string;
    tipoPerfil: number;
    senha: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static of(json: any = {}) {
        return new Login(json);
    }

    static empty() {
        return new Login();
    }

    static fromJson(json: Array<any> = []) {

        const items: Array<ILogin> = [];

        for (const values of json) {
            items.push(new Login(values));
        }

        return items;
    }

    static getInternalId(item: ILogin): string {
        return `${item.email}`;
    }
}