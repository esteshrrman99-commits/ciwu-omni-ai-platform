console.log("Abijah Loading...");
const btn=document.createElement("button");
btn.innerHTML="💬 Talk to Abijah";
btn.style="position:fixed;bottom:20px;right:20px;background:#6d4aff;color:white;border:none;border-radius:50px;padding:15px 25px;font-size:16px;z-index:9999;cursor:pointer;";
btn.onclick=()=>alert("Abijah is loading, darling! Give me a moment.");
document.body.appendChild(btn);
console.log("Abijah Button Added");
