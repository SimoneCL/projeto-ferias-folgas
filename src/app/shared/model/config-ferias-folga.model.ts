import { PoDatepickerRange } from '@po-ui/ng-components';

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
    public static dataValida(date: Date) {
        // Converte strings em número
        const dia = date.getDate();
        const mes = date.getMonth() + 1;
        const ano = date.getFullYear();

        // Dias de cada mês, incluindo ajuste para ano bissexto
        const diasNoMes = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

        // Atualiza os dias do mês de fevereiro para ano bisexto
        if (ano % 400 === 0 || ano % 4 === 0 && ano % 100 !== 0) {
            diasNoMes[2] = 29
        }

        // Regras de validação:
        // Mês deve estar entre 1 e 12, e o dia deve ser maior que zero
        if (mes < 1 || mes > 12 || dia < 1) {
            return false
        }
        // Valida número de dias do mês
        else if (dia > diasNoMes[mes]) {
            return false
        }
        else if (ano < 2010) {
            return false
        }

        // Passou nas validações
        return true
    }


    public static rangeDataValido(config: ConfiguracaoFeriasFolga): boolean {
        if (config && config.datePickerRange && config.datePickerRange.start !== '' && config.datePickerRange.end !== '') {
            ConfiguracaoFeriasFolga.dataValida(new Date(config.datePickerRange.start))
            ConfiguracaoFeriasFolga.dataValida(new Date(config.datePickerRange.end))
            if (ConfiguracaoFeriasFolga.dataValida(new Date(config.datePickerRange.start)) === false) {
                return false;
            }
            if (ConfiguracaoFeriasFolga.dataValida(new Date(config.datePickerRange.end)) === false) {
                return false;
            }
            return true;
        }
        return false;
    }
}
