
import { Crawler } from "./crawler";
import { MessageHandler } from "./MessageHandler";

let crawler: Crawler;

export class ServerHandler {
    public static setCrawler(_crawler: Crawler) {
        crawler = _crawler;
    }
    public static getStats(req, res) {
        MessageHandler.sendMessage(res, {
            keys: crawler.keysSize,
            links: crawler.linkSize,
            queue: crawler.queueSize,
        });
    }
    public static sendIndex(req, res) {
        res.sendFile("./index.html", { root : __dirname + "/.."});
    }
    public static oneStep(req, res) {
        crawler.processOneItem().then((data) => {
            MessageHandler.sendMessage(res, {
                keys: data.tokens.length,
                links: data.linksCount,
                newKeys: data.newTokens,
                newLinks: data.newLinks,
                title: data.wikiTitle,
                url: decodeURI(data.url),
            });
        }).catch((error) => MessageHandler.sendError(res, error));
    }

    public static loadFile(req, res) {
        crawler.load().then((e) => {
            MessageHandler.sendMessage(res, "loaded");
        }).catch((error) => MessageHandler.sendError(res, error));
    }
    public static keys(req, res) {
        crawler.load().then((e) => {
            // crawler.start().then(data => crawler.store()).catch(data => console.log("--------"+data));
            const sordedKeys = crawler.keysSorted;
            console.log("sortedKeysSize: " + sordedKeys.length);
            for (let i = 0 ; i < 10 ; i++) {
                console.log(sordedKeys[i]);
            }
        }).catch((error) => MessageHandler.sendError(res, error));

        MessageHandler.sendMessage(res, crawler.keysSorted);
    }
}
