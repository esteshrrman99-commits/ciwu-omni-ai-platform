// ABIJAH - Voice Assistant for Web
const Abijah = {
  speaking: false,
  
  init() {
    console.log("👋 Abijah is online!");
    
    // Create floating button
    const btn = document.createElement('button');
    btn.innerHTML = '💬 Talk to Abijah';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #6d4aff;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 15px 25px;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(109, 76, 255, 0.3);
      z-index: 9999;
      transition: transform 0.2s;
    `;
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => this.toggleChat();
    
    document.body.appendChild(btn);
    
    // Welcome message
    setTimeout(() => {
      this.speak("Hello, darling! I'm Abijah. I'm here to help you navigate your health journey. Click me anytime to talk!");
    }, 2000);
  },
  
  speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.1; // Warmer tone
      utterance.rate = 0.95; // Natural pace
      utterance.volume = 1;
      
      // Try to find a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google US English Female'));
      if (femaleVoice) utterance.voice = femaleVoice;
      
      utterance.onstart = () => { this.speaking = true; };
      utterance.onend = () => { this.speaking = false; };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, sweetheart, your browser doesn't support voice. Try Chrome or Safari!");
    }
  },
  
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
  
  toggleChat() {
    // Create chat window
    const existing = document.getElementById('abijah-chat');
    if (existing) {
      existing.remove();
      return;
    }
    
    const chatBox = document.createElement('div');
    chatBox.id = 'abijah-chat';
    chatBox.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      z-index: 9999;
      overflow: hidden;
    `;
    
    chatBox.innerHTML = `
      <div style="background: #6d4aff; color: white; padding: 15px; font-weight: bold;">
        ✨ Abijah - Your Health Companion
        <span style="float: right; cursor: pointer;" onclick="document.getElementById('abijah-chat').remove()">✕</span>
      </div>
      <div id="chat-messages" style="flex: 1; padding: 15px; overflow-y: auto; background: #f9f9f9;">
        <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 10px; border-left: 3px solid #6d4aff;">
          Hello, sweetheart! What can I help you with today?
        </div>
      </div>
      <div style="padding: 15px; background: white; border-top: 1px solid #eee; display: flex;">
        <input type="text" id="chat-input" placeholder="Ask me anything..." style="flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 10px 15px; outline: none;">
        <button id="chat-send" style="margin-left: 10px; background: #6d4aff; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">➤</button>
        <button id="chat-speak" style="margin-left: 10px; background: #6d4aff; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">🔊</button>
      </div>
    `;
    
    document.body.appendChild(chatBox);
    
    // Event listeners
    const input = chatBox.querySelector('#chat-input');
    const sendBtn = chatBox.querySelector('#chat-send');
    const speakBtn = chatBox.querySelector('#chat-speak');
    
    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;
      
      // Add user message
      const messagesDiv = chatBox.querySelector('#chat-messages');
      messagesDiv.innerHTML += `
        <div style="margin-bottom: 10px; padding: 10px; background: #6d4aff; color: white; border-radius: 10px; text-align: right;">
          ${message}
        </div>
      `;
      input.value = '';
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      
      // Call API
      try {
        const response = await fetch('https://ciwu-omni-ai-platform.onrender.com/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        const reply = data.response || "I'm listening, darling. Tell me more.";
        
        // Add Abijah's response
        messagesDiv.innerHTML += `
          <div class="abijah-reply" style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 10px; border-left: 3px solid #6d4aff; position: relative;">
            ${reply}
            <button style="margin-top: 5px; background: none; border: none; color: #6d4aff; cursor: pointer; font-size: 12px;">🔊 Read Aloud</button>
          </div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Add read aloud listener
        const replies = chatBox.querySelectorAll('.abijah-reply');
        const lastReply = replies[replies.length - 1];
        lastReply.querySelector('button').onclick = () => {
          this.speak(reply);
        };
        
      } catch (error) {
        messagesDiv.innerHTML += `
          <div style="margin-bottom: 10px; padding: 10px; background: #fff0f0; color: #c00; border-radius: 10px; border-left: 3px solid #c00;">
            Oh dear, I had trouble connecting. Let's try again soon!
          </div>
        `;
      }
    };
    
    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    speakBtn.onclick = () => {
      // Read the last message
      const replies = chatBox.querySelectorAll('.abijah-reply');
      if (replies.length > 0) {
        const text = replies[replies.length - 1].innerText.replace('🔊 Read Aloud', '').trim();
        this.speak(text);
      }
    };
    
    // Focus input
    input.focus();
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => Abijah.init());
