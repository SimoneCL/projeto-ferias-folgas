export interface IFeriados {
    idFeriado: number;
    data: string;
    tipoFeriado: string;
    descricao: string;
    pontoFacultativo: boolean;
    dataFormat: string;
}

export class Feriados implements IFeriados {
    idFeriado: number;
    data: string;
    tipoFeriado: string;
    descricao: string; 
    pontoFacultativo: boolean;
    dataFormat: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IFeriados): number {
        return item.idFeriado;
    }

    static formataData(data) {
        var dia = data.split("/")[0];
        var mes = data.split("/")[1];
        var ano = data.split("/")[2];

        return  ano + '-' + ("0" + mes).slice(-2) + '-' + ("0" + dia).slice(-2) ;
        // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
    }
   
    static formatoDataList(data) {
        const [dataFormato]  =  data.split('T');
        
        var dia = dataFormato.split("-")[2];
        var mes = dataFormato.split("-")[1];
        var ano = dataFormato.split("-")[0];
        return ("0" + dia).slice(-2) + '/' + ("0" + mes).slice(-2) + '/' + ano;
        // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
    }
    
}