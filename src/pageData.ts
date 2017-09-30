import { Token } from './Token';

export class PageData{
    links: { [s: string]: number } ;
    rawText: string;
    wikiTitle: string;
    clearedText: string;
    url: string;
    tokens: any = {};
    newTokens = 0;
    newLinks = 0;

    get linksCount(): number {
        let counter = 0;
        
        for(let i in this.links){
            if(this.links.hasOwnProperty(i)){
                counter++;
            }
        }
        return counter;
    }
    get tokensCount(): number {
        let counter = 0;
        for(let i in this.tokens){
            if(this.tokens.hasOwnProperty(i)){
                counter++;
            }
        }
        return counter;
    }
}