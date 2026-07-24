const http = require('http'); const fs = require('fs');
http.createServer((req,res)=>{let p=req.url==="/"?"/index.html":req.url;fs.readFile(__dirname+"/../public"+p,(err,d)=>{if(err){res.writeHead(404);res.end("404");}else{res.writeHead(200,{ "Content-Type": p.endsWith(".html")?"text/html":"text/plain" });res.end(d);}});}).listen(8080,()=>console.log("🌐 Dashboard at http://localhost:8080"));
