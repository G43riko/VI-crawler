export class Utils {
    public static removeAccent(word: string): string {
        const accentedCharacters  = "áäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽàèìòùáéíóúýâêîôûãñõäëïöüÿÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸ";
        const normalCharacters    = "aacdeillnoorstuyzAACDEILLNOORSTUYZaeiouaeiouyaeiouanoaeiouyAEIOUAEIOUYAEIOUANOAEIOUY";
        const result = [];
        for (const i of word) {
            const index = accentedCharacters.indexOf(word[i]);
            result[result.length] = index >= 0 ? normalCharacters[index] : word[i];
        }
        return result.join("");
    }

    public static sizeOf(arg: any[]|string|object): number {
        if (Array.isArray(arg) || typeof arg === "string") {
            return arg.length;
        }
        let counter = 0;
        if (typeof arg === "object") {
            for (const key in arg) {
                if (arg.hasOwnProperty(key)) {
                    counter++;
                }
            }
        }
        return counter;
    }
}
