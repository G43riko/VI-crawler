import * as http from "http";
declare let process;

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Hello World!');
}).listen((process && process.env && process.env.PORT) || 8080);
