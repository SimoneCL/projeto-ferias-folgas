export interface IEvento {
    id: number;
    user: string;
    eventIniDate: string;
    eventEndDate: string;
    type: number|string;
}

export class Evento implements IEvento {
    id: number;
    user: string;
    eventIniDate: string;
    eventEndDate: string;
    type: number|string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IEvento): number {
        return item.id;
    }

    get $id(): number { return this.id; }
    get $eventIniDate(): string { return this.eventIniDate; }
    get $eventEndDate(): string { return this.eventEndDate; }
  

    set $id(value: number) { this.id = value; }
    set $eventIniDate(value: string) { this.eventIniDate = value; }
    set $eventEndDate(value: string) { this.eventEndDate = value; }
  

}
