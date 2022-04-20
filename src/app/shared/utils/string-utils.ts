import { JsonUtils } from "./json-utils";

export class StringUtils {

    public static capitalizeFirstLetter(literal: string): string {
        return literal.charAt(0).toUpperCase() + literal.slice(1).toLowerCase();
    }

    public static compareOpenEdgeStrings(string1: string, string2: string):boolean {
        return JsonUtils.convertSpecialCharacters(string1).toLowerCase() !== JsonUtils.convertSpecialCharacters(string2).toLowerCase();
    }
}
