const elasticsearch = require("elasticsearch");
import { PageData } from "./pageData";
const client = new elasticsearch.Client({
    host: "localhost:9200",
    log: "trace",
});

const INDEX_KEY = "crawler";
const TOKEN_KEY = "token";
const PAGE_KEY = "page";
// const QUEUE_KEY = "queue";

export class ElasticHandler {
    public static ping(): Promise<any> {
        return client.ping({
            requestTimeout: 3000,
        });
    }

    public static addToQueue(data: string[]): Promise<any> {
        const requestBody = [];
        data.forEach((item) => {
            requestBody.push({ create:  { _index: INDEX_KEY, _type: PAGE_KEY, _id: item } });
            requestBody.push({
                created : 1234,
                lastVisit: null,
            });
        });
        return client.bulk({
            body: requestBody,
        });
    }

    public static addPageData(data: PageData): Promise<any> {
        return client.create({
            index: INDEX_KEY,
            type: PAGE_KEY,
            id: data.url,
            body: {
                clearedText: data.clearedText,
                wikiTitle: data.wikiTitle,
                created: new Date(),
                lastVisit: new Date(),
            },
        });
    }

    public static addPagesData(data: PageData[]): Promise<any> {
        const requestBody = [];
        data.forEach((item) => {
            requestBody.push({ index:  { _index: INDEX_KEY, _type: PAGE_KEY, _id: item.url } });
            requestBody.push({
                clearedText: item.clearedText,
                wikiTitle: item.wikiTitle,
                created: new Date(),
                lastVisit: new Date(),
            });
        });
        return client.bulk({
            body: requestBody,
        });
    }

    public static existToken(token): Promise<boolean> {
        return client.exists({
            index: INDEX_KEY,
            type: TOKEN_KEY,
            id: token,
        });
    }

    public static existPage(page): Promise<boolean> {
        return client.exists({
            index: INDEX_KEY,
            type: PAGE_KEY,
            id: page,
        });
    }

    public static addTokesData(url: string, data: string[]): Promise<any> {
        const requestBody = [];
        data.forEach((item) => {
            requestBody.push({ update : {_type : TOKEN_KEY, _index : INDEX_KEY, _id : item}});
            requestBody.push({
                script : {
                    source: "if(!ctx._source.pages.contains(params.url)){ctx._source.pages.add(params.url)}",
                    params: { url },
                },
                upsert: {
                    pages: [url],
                    created: new Date(),
                },
            });
        });
        return client.bulk({
            body: requestBody,
        });
    }

    public static addAllData(data: PageData): Promise<any> {
        this.addToQueue(data.wikiLinks);
        return Promise.all([this.addPageData(data), this.addTokesData(data.url, data.tokenArray)]);
    }

    public static createIndex(): Promise<any> {
        return client.indices.create({
            index: INDEX_KEY,
        });
    }

    public static deleteIndex(): Promise<any> {
        return client.indices.detele({
            index: INDEX_KEY,
        });
    }

    public static addTokenData(url: string, token: string): Promise<any> {
        return client.update({
            index: INDEX_KEY,
            type: TOKEN_KEY,
            id: token,
            body: {
                script : {
                    source: "ctx._source.pages.add(params.url)",
                    lang: "painless",
                    params: { url },
                },
                upsert: {
                    pages: [url],
                    created: new Date(),
                },
            },
        });
    }

    public static getNumberOfPages(): Promise<number> {
        return new Promise((succes, reject) => {
            client.count({
                index: INDEX_KEY,
                type: PAGE_KEY,
            }).then((data) => succes(data.count)).catch(reject);
        });
    }

    public static getNumberOfTokens(): Promise<number> {
        return new Promise((succes, reject) => {
            client.count({
                index: INDEX_KEY,
                type: TOKEN_KEY,
            }).then((data) => succes(data.count)).catch(reject);
        });
    }

    public static setMapping(): Promise<any> {
        return Promise.all([this.setPageMapping(), this.setTokenMapping()]);
    }

    public static setTokenMapping(): Promise<any> {
        return client.indices.putMapping({
            index: INDEX_KEY,
            type: TOKEN_KEY,
            body: {
                properties: {
                    pages: {
                        type: "string",
                    },
                    created: {
                        type: "date",
                    },
                },
            },
        });
    }

    public static setPageMapping(): Promise<any> {
        return client.indices.putMapping({
            index: INDEX_KEY,
            type: PAGE_KEY,
            body: {
                properties: {
                    clearedText: {
                        type: "text",
                    },
                    wikiTitle: {
                        type: "text",
                    },
                    created: {
                        type: "date",
                    },
                    lastVisit: {
                        type: "date",
                    },
                },
            },
        });
    }
}
