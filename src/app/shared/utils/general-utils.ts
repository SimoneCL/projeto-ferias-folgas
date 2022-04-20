export class GeneralUtils {

    public static adjustStringField(field: string): string {
        if (!field) { // undefined
            return '';
        }
        return field;
    }

    public static adjustNumberField(field: number): number {
        if (!field) { // undefined
            return 0;
        }
        return Number(field);
    }

    public static convertDateToISODate(date: Date) {
        if (date) {
            const getMonth = date.getMonth() + 1;
            const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            const month = getMonth < 10 ? '0' + getMonth : getMonth;
            const year = date.getFullYear();
            return year + '-' + month + '-' + day;
        }
        return null;
    }
}
