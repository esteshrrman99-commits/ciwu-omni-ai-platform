#!/bin/bash
cd ~/universal_env/apps/myai
mkdir -p sdk
echo 'class C{constructor(u="http://127.0.0.1:10000/api"){this.u=u}async chat(m){return fetch(this.u+"/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:m})}).then(r=>r.json())}stats(){return this.chat("stats")}query(e){return this.chat("query "+e)}}if(typeof module!=="undefined")module.exports=C;' > sdk/client.js
echo 'const C=require("./client.js");const a=new C();a.stats().then(s=>console.log(s.response));a.query("Bitcoin").then(q=>console.log(q.response));' > sdk/test.js
echo "✅ SDK created in ./sdk/"
