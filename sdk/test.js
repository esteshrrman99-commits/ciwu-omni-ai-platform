const C=require("./client.js");const a=new C();a.stats().then(s=>console.log(s.response));a.query("Bitcoin").then(q=>console.log(q.response));
