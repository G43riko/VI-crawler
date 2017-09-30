export class Utils {
    static removeAccent(word): string {
        const accentedCharacters  = "áäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽàèìòùáéíóúýâêîôûãñõäëïöüÿÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸ";
        const normalCharacters    = "aacdeillnoorstuyzAACDEILLNOORSTUYZaeiouaeiouyaeiouanoaeiouyAEIOUAEIOUYAEIOUANOAEIOUY";
        const result = [];
        for (let i = 0 ; i < word.length ; i++) {
            const index = accentedCharacters.indexOf(word[i]);
            result[result.length] = index >= 0 ? normalCharacters[index] : word[i];
        }
        return result.join("");
    }
}