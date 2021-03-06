// const fs = require("fs");

import * as fs from "fs";
import { JSDOM } from "jsdom";
import * as request from "request";
import { FileManager } from "./FileManager";
import { PageData } from "./pageData";
import { Tokenizer } from "./Tokenizer";
import { Utils } from "./Utils";

const window = new JSDOM().window;
const document = window.document;
const $ = require("jquery")(window);
const wikiData = {};

export class Crawler {
    private _queue: Array<string|any> = [];
    private _maxConnections = 10;
    private _callback = null;
    private _timeGap = 1000;
    private _countLimit = 400;
    private _runningConnections = 0;
    private _keyList: any = {};

    constructor(params: any = {}) {
        if (typeof params.maxConnections === "number") {
            this._maxConnections = params.maxConnections;
        }
        if (typeof params.callback === "function") {
            this._callback = params.callback;
        }
    }

    public processOneItem(): Promise<PageData> {
        if (this._queue.length === 0 ) {
            return new Promise((success, reject) => reject("prázdny zoznam URL"));
        }
        if (this._runningConnections === this._maxConnections) {
            return new Promise((success, reject) => reject("maximálny počet pripojení"));
        }
        const result = this.processItem(this._queue[0]);
        console.log("po pridaní existuje " + this._queue.length + " záznamov (" + Utils.sizeOf(this._keyList) + " keys)");
        this._queue.splice(0, 1);
        return result;
    }
    public start(): Promise<string> {
        return new Promise((success, reject) => {
            if (this._queue.length === 0 ) {
                reject("prázdny zoznam URL");
            }
            if (this._runningConnections === this._maxConnections) {
                reject("maximálny počet pripojení");
            }

            let counter = 0;
            const rec = () => {
                counter++;
                console.log("vola sa to " + counter + " krat (" + this.keysSize + " keys)");
                this.processOneItem().then((data) => {
                    if (counter < this._countLimit) {
                        setTimeout(() => rec(), this._timeGap);
                    } else {
                        success("úspech");
                    }
                }).catch((error) => console.log("error: ", error));
            };
            rec();
        });
    }

    public store(): void {
        const finalString = JSON.stringify({
            keyList: this._keyList,
            queue: this._queue,
            wikiData,
        });
        fs.writeFile("./data.json", finalString, (err) => {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    }

    public load(): Promise<void> {
        return new Promise((succes, reject) => {
            fs.readFile("./data.json", "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }
                const parsedData = JSON.parse(data);
                for (const wikiItem in parsedData.wikiData) {
                    if (parsedData.wikiData.hasOwnProperty(wikiItem)) {
                        wikiData[wikiItem] = parsedData.wikiData[wikiItem];
                    }
                }
                this._keyList = parsedData.keyList;
                /*
                const keyListChanged = [];
                for(let i in this._keyList) {
                    const undiagriticsElement = Utils.removeAccent(i);
                    if (keyListChanged[undiagriticsElement]) {
                        keyListChanged[undiagriticsElement] += this._keyList[i];
                    } else {
                        keyListChanged[undiagriticsElement] = this._keyList[i];
                    }
                }
                this._keyList= keyListChanged;
                */
                this._queue = parsedData.queue;
                succes();
            });
        });
    }
    public queue(arg: string|any[]) {
        if (Array.isArray(arg)) {
            arg.forEach((e) => this._queue.push(e));
        } else {
            this._queue.push(arg);
        }
    }
    private getContentOf(url: string): Promise<string> {
        return new Promise((success, reject) => {
            request(url, (error, response, html) => {
                if (error) {
                    reject(error);
                    return;
                }
                success(html);
            });
        });
    }
    private processLinks(body: JQuery): any  {
        const links = {};
        const wikiLinks = [];
        const thisArg = this;
        body.find("a").each(function(){
            const link = $(this).attr("href");
            if (links[link]) {
                links[link]++;
            } else {
                links[link] = 1;

                const wikiPageRegex = new RegExp("^\/wiki\/*", "g");
                const wikiPortalRegex = new RegExp("^\/wiki\/Port%C3%A1l:*", "g");
                const wikiCategoryRegex = new RegExp("^\/wiki\/Kateg%C3%B3ria:*", "g");
                const wikiWikipediaRegex = new RegExp("^\/wiki\/Wikip%C3%A9dia:*", "g");
                const wikiDiscussionRegex = new RegExp("^\/wiki\/Diskusia:*", "g");
                const wikiFileRegex = new RegExp("^\/wiki\/S%C3%BAbor:*", "g");
                const wikiExtraRegex = new RegExp("^\/wiki\/%C5%A0peci%C3%A1lne:*", "g");
                const wikiHelpRegex = new RegExp("^\/wiki\/Pomoc:*", "g");
                if (wikiPageRegex.test(link) && !wikiPortalRegex.test(link)
                                            && !wikiCategoryRegex.test(link)
                                            && !wikiWikipediaRegex.test(link)
                                            && !wikiDiscussionRegex.test(link)
                                            && !wikiFileRegex.test(link)
                                            && !wikiExtraRegex.test(link)
                                            && !wikiHelpRegex.test(link)
                                        ) {
                    // console.log("+link: ", link);
                    wikiLinks.push("https://sk.wikipedia.org" + link);
                    thisArg._queue.push("https://sk.wikipedia.org" + link);
                } else {
                    // console.log("-link: ", link);
                }
                // firstHeading
            }
        });

        return {links, wikiLinks};
    }
    private processText(body: JQuery): string {
        return body.text();
    }
    private clearText(text: string): string {
        // replace ...
        // replace •
        // replace ·
        return text.replace(/[\n\t•·\+\\/\-\–\*\[\]\(\)\{\.\}\@\$\|""\:,;\%_=\?\>\<„“]/g, " ");
    }
    private processHTML(content: string): PageData {
        const body: JQuery = $(content);
        body.find("script").remove();
        const result = new PageData();
        const oldLinksCount = this._queue.length;
        const links = this.processLinks(body);
        result.links = links.links;
        result.wikiLinks = links.wikiLinks;
        result.newLinks = this._queue.length - oldLinksCount;
        result.rawText = this.processText(body);
        result.clearedText = this.clearText(result.rawText);
        result.tokens = Tokenizer.tokenize(result.clearedText);

        result.tokens.forEach((element) => {
            const undiagriticsElement = Utils.removeAccent(element);
            if (this._keyList[undiagriticsElement]) {
                this._keyList[undiagriticsElement]++;
            } else {
                result.newTokens++;
                this._keyList[undiagriticsElement] = 1;
            }
        });

        result.wikiTitle = body.find("#firstHeading").text();
        return result;
    }

    private processItem(arg: string|any): Promise<PageData> {
        console.log("spracovava sa: ", decodeURI(arg));
        return new Promise((success, reject) => {

            if (typeof arg === "string") {
                this.getContentOf(arg).then((content) => {
                    if (wikiData[arg]) {
                        console.log("------------------------------------------");
                        // reject("Stránka " + arg + " už bola spracovaná");
                        console.log("Stránka " + arg + " už bola spracovaná");
                        // return;
                    }else {
                        wikiData[arg] = this.processHTML(content);
                        wikiData[arg].url = arg;
                    }

                    success(wikiData[arg]);
                }).catch((error) => reject(error));
            } else {
                if (typeof arg.html === "string") {
                    success(this.processHTML(arg.html));
                }
            }
        });
    }
    get linkSize(): number {
        return Utils.sizeOf(wikiData);
    }
    get keysSize(): number {
        return Utils.sizeOf(this._keyList);
    }
    get keysSorted(): any[][] {
        const result = [];

        for (const key in this._keyList) {
            if (this._keyList.hasOwnProperty(key)) {
                result.push([key, this._keyList[key]]);
            }
        }

        result.sort((a, b) => b[1] - a[1]);
        return result;
    }

    get queueSize(): number {
        return this._queue.length;
    }
}
