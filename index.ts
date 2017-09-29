import { Crawler } from "./src/crawler";
import * as http from "http";

declare let process;
const port = (process && process.env && process.env.PORT) || 8080;
let crawler: Crawler = null;
console.log("Server is listening on port " + port);



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
        crawler.queue("https://sk.wikipedia.org/wiki/Hlavn%C3%A1_str%C3%A1nka");
        crawler.processOneItem().then(data => {
            //message = JSON.stringify(data.tokens);
            res.end(wrapMessage(message));
        });
    }
    else {
        message = "Crawler už existujre";
        res.end(wrapMessage(message));
    }

    
    
}).listen(port);
