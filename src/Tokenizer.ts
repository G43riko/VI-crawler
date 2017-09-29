import { Token } from './Token';
function isIn() {

}
export class Tokenizer{
    static tokenize(data: string): string[] {
        const result: string[] = [];
        const splitted = data.split(" ");
        splitted.forEach(e => {
            if (e.length === 0 || e === '"') {
                return;
            }
            result.push(e.toLocaleLowerCase());
        });
        result.push("dlzka: " + result.length);
        // replace "\n"
        // replace "\t"
        // replace "· "

        // replace ".?!-"
        return result;
    }
}