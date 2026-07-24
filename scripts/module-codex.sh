#!/bin/bash
cd ~/universal_env/apps/myai
mkdir -p public
echo '<!DOCTYPE html><html><head><title>CIWU</title><style>body{background:#0a0a0f;color:#fff;font-family:sans-serif;padding:20px}.card{background:#1a1a2e;padding:20px;border-radius:10px;margin:10px 0}h1{color:#6d4aff}</style></head><body><h1>🧠 CIWU Dashboard</h1><div class="card"><h3>Status</h3><p id="s">Checking...</p></div><div class="card"><h3>Stats</h3><p id="st">Loading...</p></div><button onclick="load()">Refresh</button><script>async function load(){try{const h=await fetch("http://127.0.0.1:10000/api/health").then(r=>r.json());document.getElementById("s").innerText=h.status+": "+h.message;const s=await fetch("http://127.0.0.1:10000/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:"stats"})}).then(r=>r.json());document.getElementById("st").innerText=s.response;}catch(e){document.getElementById("s").innerText="Offline";}}</script></body></html>' > public/index.html
cat > scripts/dash-server.js << 'JS'
const http = require('http'); const fs = require('fs');
http.createServer((req,res)=>{let p=req.url==="/"?"/index.html":req.url;fs.readFile(__dirname+"/../public"+p,(err,d)=>{if(err){res.writeHead(404);res.end("404");}else{res.writeHead(200,{ "Content-Type": p.endsWith(".html")?"text/html":"text/plain" });res.end(d);}});}).listen(8080,()=>console.log("🌐 Dashboard at http://localhost:8080"));
JS
node scripts/dash-server.js &
sleep 2
echo "✅ Dashboard launched!"
