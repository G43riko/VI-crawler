import { Crawler } from "./src/crawler";
import * as http from "http";
import * as express from "express";

const app = express();
const port = process.env.PORT || 8080;
const crawler: Crawler = new Crawler();
crawler.queue("https://sk.wikipedia.org/wiki/Hlavn%C3%A1_str%C3%A1nka");

app.get('/', function (req, res) {
  // res.send('Hello World!')
    res.sendFile("./index.html", { root : __dirname});
})
app.get("/stats", function(req, res){
    res.send({
        keys: crawler.keysSize,
        queue: crawler.queueSize,
        links: crawler.linkSize
    })
})

app.get("/oneStep", function(req, res){
    crawler.processOneItem().then(data => {
        res.send({
            url: decodeURI(data.url),
            title: data.wikiTitle,
            links: data.linksCount,
            newLinks: data.newLinks,
            keys: data.tokens.length,
            newKeys: data.newTokens
        })
    }).catch(error => console.error(error));
})

app.get("/load", function(req, res) {
    crawler.load().then(e => {
        res.send("loaded");
    }).catch(error => res.send("load error: " + JSON.stringify(res)));
})
app.get("/keys", function(req, res) {
    crawler.load().then(e => {
        // crawler.start().then(data => crawler.store()).catch(data => console.log("--------"+data));
        const sordedKeys = crawler.keysSorted;
        console.log("sortedKeysSize: " + sordedKeys.length);
        for(let i=0 ; i<10 ; i++){
            console.log(sordedKeys[i]);
        }
    });

    res.send(crawler.keysSorted);
})

app.listen(port, function () {
  console.log("Example app listening on port " + port + "!")
})



/*
http.createServer(function (req, res) {
    function wrapMessage(message) {
        return `
            <!doctype html>
            <html>
                
                <head lang="SK">
                    <meta charset="utf-8">
                    <title>Crawler</title>
                    <base href="/">
                </head>
                
                <body class="light">
                ` + message + `
                </body>
            </html>`;
    }
    res.writeHead(200, {"Content-Type": "text/html"});
    let message = "Hello World!"
    if(!crawler) {
        crawler = new Crawler();
        // crawler.queue("https://sk.wikipedia.org/wiki/Hlavn%C3%A1_str%C3%A1nka");
        crawler.load().then(e => {
            // crawler.start().then(data => crawler.store()).catch(data => console.log("--------"+data));
            const sordedKeys = crawler.keysSorted;
            console.log("sortedKeysSize: " + sordedKeys.length);
            for(let i=0 ; i<10 ; i++){
                console.log(sordedKeys[i]);
            }
            
        });
        
        
    }
    else {
        message = "Crawler už existujre";
        res.end(wrapMessage(message));
    }

    
    
}).listen(port);
*/