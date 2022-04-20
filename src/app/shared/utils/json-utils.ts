export class JsonUtils {

    /* nao compara objetos filhos ou array, somente os atributos principais */
    public static compareObjects(objInitial: any, objFinal: any): boolean {
        for (const key in objInitial) { // obtém as chaves do objeto
            // se o valor for diferente de objeto (caso events)
            if (typeof objInitial[key] !== 'object') {
                if (objInitial[key] === undefined || objFinal[key] === undefined) {
                    if (objInitial[key] !== objFinal[key]) {
                        return false;
                    }
                } else {
                    const objIn: string = String(objInitial[key]).toUpperCase();
                    const objFim: string = String(objFinal[key]).toUpperCase();
                    if (objIn !== objFim) {
                        if (JsonUtils.convertSpecialCharacters(objIn) !== JsonUtils.convertSpecialCharacters(objFim)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true; /* iguais */
    }

    public static convertSpecialCharacters(strConteudo: string): string {
        strConteudo = strConteudo.replace('Ç', 'C');
        strConteudo = strConteudo.replace('ç', 'c');
        strConteudo = strConteudo.replace('Á', 'A');
        strConteudo = strConteudo.replace('á', 'a');
        strConteudo = strConteudo.replace('Ã', 'A');
        strConteudo = strConteudo.replace('ã', 'a');
        strConteudo = strConteudo.replace('É', 'E');
        strConteudo = strConteudo.replace('é', 'e');
        strConteudo = strConteudo.replace('Í', 'I');
        strConteudo = strConteudo.replace('í', 'i');
        strConteudo = strConteudo.replace('Ó', 'O');
        strConteudo = strConteudo.replace('ó', 'o');
        strConteudo = strConteudo.replace('Ú', 'U');
        strConteudo = strConteudo.replace('ú', 'u');
        return strConteudo;
    }
}
