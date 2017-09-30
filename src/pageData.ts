import { Token } from './Token';

export class PageData{
    links: { [s: string]: number } ;
    rawText: string;
    wikiTitle: string;
    clearedText: string;
    tokens: any = {};
}