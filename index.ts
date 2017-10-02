import * as express from "express";
import { Crawler } from "./src/crawler";
import { ElasticHandler } from "./src/ElasticHandler";
import { MessageHandler } from "./src/MessageHandler";
import { PageData } from "./src/pageData";
import { ServerHandler } from "./src/ServerHandler";

const app = express();
const port = process.env.PORT || 8080;

ElasticHandler.ping().then(() => testElastic()).catch((error) => console.log("error"));

const crawler: Crawler = new Crawler();
crawler.queue("https://sk.wikipedia.org/wiki/Hlavn%C3%A1_str%C3%A1nka");

ServerHandler.setCrawler(crawler);

app.get("/", ServerHandler.sendIndex);
app.get("/stats", ServerHandler.getStats);
// app.get("/oneStep", ServerHandler.oneStep);
app.get("/oneStep", (req, res) => {
    crawler.processOneItem().then((data) => {
        ElasticHandler.addAllData(data);
        // ElasticHandler.addTokesData(data.url, data.tokenArray);
        MessageHandler.sendMessage(res, {
            keys: data.tokens.length,
            links: data.linksCount,
            newKeys: data.newTokens,
            newLinks: data.newLinks,
            title: data.wikiTitle,
            url: decodeURI(data.url),
        });
    }).catch((error) => MessageHandler.sendError(res, error));
});
app.get("/load", ServerHandler.loadFile);
app.get("/keys", ServerHandler.keys);

app.listen(port, () => {
    console.log("Example app listening on port " + port + "!");
});

function testElastic() {
    const page1: PageData = new PageData();
    page1.clearedText = "toto je testovacia stranka 1 a je super";
    page1.url = "http://wiki.sk/testovacia+stranka1";
    page1.wikiTitle = "Testovacia stránka 1";
    page1.tokens = ["toto", "je", "testovacia", "stranka", "1", "a", "je", "super"];

    const page2: PageData = new PageData();
    page2.clearedText = "toto je druha testovacia stranka a je este viac super";
    page2.url = "http://wiki.sk/testovacia+stranka2";
    page2.wikiTitle = "Testovacia stránka 2";
    page2.tokens = ["toto", "je", "druha", "testovacia", "stranka", "a", "je", "este", "viac", "super"];

    /*
    ElasticHandler.addPageData(page1).then((data1) => {
        console.log("data1: ", data1);
        ElasticHandler.addPageData(page2).then((data2) => {
            console.log("data2: ", data2);
        }).catch((error) => console.log("error pri addPage2: ", error));
    }).catch((error) => console.log("error pri addPage1: ", error));
    */
    ElasticHandler.setMapping();
    // ElasticHandler.setPageMapping();
    // ElasticHandler.setTokenMapping();
    // ElasticHandler.addTokesData(page1.url, page1.tokens);
    // ElasticHandler.addTokesData(page2.url, page2.tokens);
    // ElasticHandler.addAllData(page1);
    // ElasticHandler.addToQueue(["a", "b", "c", "aa", "a"]);
    /*
    ElasticHandler.setMapping().catch((data) => {
        console.log("data: ", data);
    }).catch((error) => console.error("error: ", error));
    */

    // ElasticHandler.addPagesData([page1, page2]);
    /*
    ElasticHandler.getNumberOfTokens().then((data) => {
        console.log("data: ", data);
    }).catch((error) => console.error("error: ", error));
    */
}
