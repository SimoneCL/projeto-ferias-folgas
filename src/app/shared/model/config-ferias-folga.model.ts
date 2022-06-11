import { PoDatepickerRange } from '@po-ui/ng-components';
import { GeneralUtils } from '../utils/general-utils';

export class ConfiguracaoFeriasFolga {
    public datePickerRange: PoDatepickerRange;
   
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
   
    public static atualizaPeriodo(config: ConfiguracaoFeriasFolga) {
        if (config) {
            // const ultimoDia = new Date(); // Hoje
            // const primeiroDia = new Date(ultimoDia.getTime() - ((config.recorrenteUltimosDias - 1) * 24 * 60 * 60 * 1000));
            // config.datePickerRange = { start: GeneralUtils.convertDateToISODate(primeiroDia), end: GeneralUtils.convertDateToISODate(ultimoDia) };
        }
    }

    public static rangeDataValido(config: ConfiguracaoFeriasFolga): boolean {
        if (config && config.datePickerRange && config.datePickerRange.start !== '' && config.datePickerRange.end !== '') {
            return true;
        }
        return false;
    }
}
