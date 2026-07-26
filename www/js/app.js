document.addEventListener('DOMContentLoaded', async () => {
  const chatWindow = document.getElementById('chat-window');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  // Stats loader
  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      document.getElementById('entity-count').textContent = data.entities || 0;
      document.getElementById('relation-count').textContent = data.relations || 0;
      document.getElementById('knowledge-count').textContent = data.knowledge || 0;
    } catch(err) { console.error('Stats error:', err); }
  }
  fetchStats();
  setInterval(fetchStats, 10000);

  // Chat with typing indicator
  async function sendMessage() {
    const msg = userInput.value.trim();
    if(!msg) return;
    
    // User message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-message user';
    userDiv.textContent = msg;
    chatWindow.appendChild(userDiv);
    userInput.value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message system';
    typingDiv.id = 'typing';
    typingDiv.textContent = '⚡ Processing...';
    chatWindow.appendChild(typingDiv);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({message:msg})
      });
      const data = await res.json();
      
      // Remove typing indicator
      document.getElementById('typing')?.remove();
      
      // Show response formatted
      const sysDiv = document.createElement('div');
      sysDiv.className = 'chat-message system';
      sysDiv.innerHTML = data.response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/⚡/g, '⚡').replace(/🧬/g, '🧬').replace(/🩺/g, '🩺').replace(/💰/g, '💰');
      chatWindow.appendChild(sysDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch(err) {
      document.getElementById('typing')?.remove();
      const sysDiv = document.createElement('div');
      sysDiv.className = 'chat-message system';
      sysDiv.textContent = '⚠ Connection error. Try again.';
      chatWindow.appendChild(sysDiv);
    }
  }

  sendBtn.onclick = sendMessage;
  userInput.onkeypress = (e) => { if(e.key==='Enter') sendMessage(); };
  
  // Enter key on input
  userInput.focus();
});
