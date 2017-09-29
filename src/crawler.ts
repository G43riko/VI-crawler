import { Tokenizer } from './Tokenizer';

import * as request from "request";
import { PageData } from "./pageData";
import * as jsdom from "jsdom";
const window = new jsdom.JSDOM().window;
const document = window.document;
const $ = require("jquery")(window);

export class Crawler {
    private _queue:(string|any)[] = [];
    private _maxConnections = 10;
    private _callback = null;
    private _timeGap = 1000;
    private _runningConnections = 0;
    constructor(params: any = {}) {
        if (typeof params.maxConnections === "number") {
            this._maxConnections = params.maxConnections
        }
        if (typeof params.callback === "function") {
            this._callback = params.callback;
        }
        
    }

    public queue(arg: string|any[]) {
        if(Array.isArray(arg)) {
            arg.forEach(e => this._queue.push(e));
        }
        else {
            this._queue.push(arg);
        }
        
    }
    private getContentOf(url: string): Promise<string> {
        return new Promise((success, reject) => {
            request(url, function(error, response, html){
                if(error){
                    reject(error);
                    return;
                }
                success(html);
            });
        })
    }
    private processLinks(body: JQuery):{ [s: string]: number }  {
        const links = {};
        body.find("a").each(function(){
            const link = $(this).attr("href");
            if(links[link]) {
                links[link]++;
            }
            else {
                links[link] = 1;
                
                const wikiPageRegex = new RegExp("^\/wiki\/*", "g")
                const wikiPortalRegex = new RegExp("^\/wiki\/Port%C3%A1l:*", "g")
                const wikiCategoryRegex = new RegExp("^\/wiki\/Kateg%C3%B3ria:*", "g")
                const wikiWikipediaRegex = new RegExp("^\/wiki\/Wikip%C3%A9dia:*", "g")
                const wikiDiscussionRegex = new RegExp("^\/wiki\/Diskusia:*", "g")
                const wikiFileRegex = new RegExp("^\/wiki\/S%C3%BAbor:*", "g")
                const wikiExtraRegex = new RegExp("^\/wiki\/%C5%A0peci%C3%A1lne:*", "g")
                const wikiHelpRegex = new RegExp("^\/wiki\/Pomoc:*", "g")
                if(wikiPageRegex.test(link) && !wikiPortalRegex.test(link) 
                                            && !wikiCategoryRegex.test(link) 
                                            && !wikiWikipediaRegex.test(link)
                                            && !wikiDiscussionRegex.test(link)
                                            && !wikiFileRegex.test(link)
                                            && !wikiExtraRegex.test(link)
                                            && !wikiHelpRegex.test(link)
                                        ) {
                    console.log("+link: ", link);
                }
                else {
                    // console.log("-link: ", link);
                }
                // firstHeading
            }
        });

        return links;
    }
    private processText(body: JQuery): string {
        return body.text();
    }
    private clearText(text: string): string {
        // replace ...
        // replace •
        // replace ·
        return text.replace(/[\n\t•·\+\\/\-\–\*\[\]\(\)\{\.\}\@\$\|"'\:,;\%_=\?\>\<„“]/g, " ");
    }
    private processHTML(content: string): PageData {
        const body: JQuery = $(content);
        body.find('script').remove();
        const result = new PageData();

        result.links = this.processLinks(body);
        result.rawText = this.processText(body);
        result.clearedText = this.clearText(result.rawText);
        result.tokens = Tokenizer.tokenize(result.clearedText);
        return result;
    }

    private processItem(arg: string|any): Promise<any>{
        return new Promise((success, reject) => {
            if (typeof arg === "string") {
                this.getContentOf(arg).then(content => success(this.processHTML(content))).catch(error => reject(error));
            }
            else {
                if(typeof arg.html === "string"){
                    success(this.processHTML(arg.html));
                }
            }
        })
    }
    processOneItem(): Promise<any>{
        if (this._queue.length === 0 ) {
            return;
        }
        if (this._runningConnections === this._maxConnections) {
            return;
        }
        const result = this.processItem(this._queue[0])
        this._queue.splice(0, 1);
        return result;
    }
    start(): void {
        if (this._queue.length === 0 ) {
            return;
        }
        if (this._runningConnections === this._maxConnections) {
            return;
        }
    }   

    get queueSize(): number {
        return this._queue.length;
    }

    
}