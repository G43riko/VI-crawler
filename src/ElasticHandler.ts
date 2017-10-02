const elasticsearch = require("elasticsearch");
import { PageData } from "./pageData";
const client = new elasticsearch.Client({
    host: "localhost:9200",
    log: "trace",
});

const INDEX_KEY = "crawler";
const TOKEN_KEY = "token";
const PAGE_KEY = "page";

function updateTokenData(url, token): Promise<any> {
    return client.update({
        index: INDEX_KEY,
        type: TOKEN_KEY,
        id: token,
        body: {
            script: {
                source: "ctx._source.pages.add(params.url)",
                lang: "painless",
                params: { url },
            },
        },
    });
}
function createTokenData(url, token): Promise<any> {
    return client.create({
        index: INDEX_KEY,
        type: TOKEN_KEY,
        id: token,
        body: {
            pages: [ url ],
            created: new Date(),
        },
    });
}

export class ElasticHandler {
    public static ping(): Promise<any> {
        return client.ping({
            requestTimeout: 3000,
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

    public static addTokeData(url: string, token: string) {
        client.exists({
            index: INDEX_KEY,
            type: TOKEN_KEY,
            id: token,
        }, (error, exists) => {
            if (exists === true) {
                return updateTokenData(url, token);
            } else {
                return createTokenData(url, token);
            }
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
    private static setMapping(): Promise<any> {
        return Promise.all([this.setPageMapping(), this.setTokenMapping()]);
    }
    private static setTokenMapping(): Promise<any> {
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
    private static setPageMapping(): Promise<any> {
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
