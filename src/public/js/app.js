document.addEventListener('DOMContentLoaded', async () => {
  const chatWindow = document.getElementById('chat-window');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      document.getElementById('entity-count').textContent = data.entities || 0;
      document.getElementById('relation-count').textContent = data.relations || 0;
      document.getElementById('knowledge-count').textContent = data.knowledge || 0;
    } catch(err) {
      console.error('Stats load failed:', err);
    }
  }
  fetchStats();
  setInterval(fetchStats, 10000);

  async function sendMessage() {
    const msg = userInput.value.trim();
    if(!msg) return;
    
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-message user';
    userDiv.textContent = msg;
    chatWindow.appendChild(userDiv);
    userInput.value = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({message:msg})
      });
      const data = await res.json();
      const sysDiv = document.createElement('div');
      sysDiv.className = 'chat-message system';
      sysDiv.textContent = data.response || 'Processing...';
      chatWindow.appendChild(sysDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch(err) {
      const sysDiv = document.createElement('div');
      sysDiv.className = 'chat-message system';
      sysDiv.textContent = 'Connection error.';
      chatWindow.appendChild(sysDiv);
    }
  }

  sendBtn.onclick = sendMessage;
  userInput.onkeypress = (e) => { if(e.key==='Enter') sendMessage(); };
});
