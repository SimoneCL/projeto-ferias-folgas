import { Evento } from "./evento.model";

export interface IEventoUser {
    id: number;
    user: string;
    events: Array<Evento>;
}

export class EventoUser implements IEventoUser {
    id: number;
    user: string;
    events: Array<Evento>;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IEventoUser): string {
        return item.user;
    }

    get $user(): string { return this.user; }
    
    set $user(value: string) { this.user = value; }
}
