export interface ILogin {
    user: string;
    email: string;
    password: string;    
}

export class Login implements ILogin {
    user: string;
    email: string;
    password: string; 

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: ILogin): string {
        return item.user;
    }
}