import { Token } from "./Token";

export class PageData {
    public links: { [s: string]: number } ;
    public rawText: string;
    public wikiLinks: string[];
    public wikiTitle: string;
    public clearedText: string;
    public url: string;
    public tokens: any = {};
    public newTokens = 0;
    public newLinks = 0;

    get tokenArray(): string[] {
        const result = [];
        for (const i in this.tokens) {
            if (this.tokens.hasOwnProperty(i)) {
                result.push(this.tokens[i]);
            }
        }
        return result;
    }

    get linksCount(): number {
        let counter = 0;

        for (const i in this.links) {
            if (this.links.hasOwnProperty(i)) {
                counter++;
            }
        }
        return counter;
    }
    get tokensCount(): number {
        let counter = 0;
        for (const i in this.tokens) {
            if (this.tokens.hasOwnProperty(i)) {
                counter++;
            }
        }
        return counter;
    }
}
