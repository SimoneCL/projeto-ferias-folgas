export interface IEventoList {
    user: string;
    eventDate: string;
    type: number|string;
}

export class EventoList implements IEventoList {
    user: string;
    eventDate: string;
    type: number|string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IEventoList): string {
        return item.user;
    }
}
