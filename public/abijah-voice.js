// ABIJAH - Advanced Voice Assistant with Holographic Avatar
const Abijah = {
  speaking: false,
  
  init() {
    console.log("👋 Abijah is online!");
    
    // Create floating button
    const btn = document.createElement('button');
    btn.innerHTML = `
      <img src="/abijah-avatar.svg" width="24" height="24" style="vertical-align:middle; margin-right:8px;">
      Talk to Abijah
    `;
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6d4aff, #ff6b6b);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(109, 76, 255, 0.4);
      z-index: 9999;
      transition: transform 0.3s, box-shadow 0.3s;
    `;
    btn.onmouseover = () => { btn.style.transform = 'scale(1.05)'; btn.style.boxShadow = '0 6px 20px rgba(109, 76, 255, 0.6)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = '0 4px 15px rgba(109, 76, 255, 0.4)'; };
    btn.onclick = () => this.toggleChat();
    
    document.body.appendChild(btn);
    
    // Welcome message
    setTimeout(() => {
      this.speak("Hello, my darling! I'm Abijah. How are you feeling today? Want me to check your latest results or find something to help you feel better?");
    }, 2000);
  },
  
  speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.15; // Warmer, softer voice
      utterance.rate = 0.9;   // Slower, more deliberate
      utterance.volume = 0.9;
      
      // Try to find a female voice with a nice tone
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('Zira') || 
        v.name.includes('Google US English Female') ||
        v.name.includes('Samantha')
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.onstart = () => { this.speaking = true; };
      utterance.onend = () => { this.speaking = false; };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, sweetheart, your browser doesn't support voice. Try Chrome or Safari!");
    }
  },
  
  toggleChat() {
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
      width: 380px;
      height: 550px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      z-index: 9999;
      overflow: hidden;
      border: 1px solid rgba(109, 76, 255, 0.2);
    `;
    
    chatBox.innerHTML = `
      <div style="background: linear-gradient(135deg, #6d4aff, #9b7cf5); color: white; padding: 15px; font-weight: bold; display: flex; align-items: center;">
        <img src="/abijah-avatar.svg" width="40" height="40" style="border-radius: 50%; margin-right: 10px; box-shadow: 0 0 10px rgba(255,255,255,0.5);">
        <div>
          <div style="font-size: 18px;">✨ Abijah</div>
          <div style="font-size: 12px; opacity: 0.9;">Your Health Companion</div>
        </div>
        <span style="margin-left: auto; cursor: pointer; font-size: 20px;" onclick="document.getElementById('abijah-chat').remove()">✕</span>
      </div>
      <div id="chat-messages" style="flex: 1; padding: 15px; overflow-y: auto; background: #f8f5ff;">
        <div style="margin-bottom: 15px; padding: 12px 15px; background: rgba(109, 76, 255, 0.1); border-radius: 15px; border-left: 4px solid #6d4aff; font-style: italic;">
          Hello, my darling! I'm Abijah. How are you feeling today?
        </div>
      </div>
      <div style="padding: 15px; background: white; border-top: 1px solid #eee; display: flex; align-items: center;">
        <input type="text" id="chat-input" placeholder="Ask me anything, sweetheart..." style="flex: 1; border: 1px solid #ddd; border-radius: 25px; padding: 12px 20px; outline: none; font-size: 15px;">
        <button id="chat-send" style="margin-left: 10px; background: #6d4aff; color: white; border: none; border-radius: 50%; width: 42px; height: 42px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;">➤</button>
        <button id="chat-speak" title="Read last message" style="margin-left: 10px; background: #9b7cf5; color: white; border: none; border-radius: 50%; width: 42px; height: 42px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;">🔊</button>
      </div>
    `;
    
    document.body.appendChild(chatBox);
    
    const input = chatBox.querySelector('#chat-input');
    const sendBtn = chatBox.querySelector('#chat-send');
    const speakBtn = chatBox.querySelector('#chat-speak');
    const messagesDiv = chatBox.querySelector('#chat-messages');
    
    // Auto-scroll to bottom
    const scrollToBottom = () => {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };
    
    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;
      
      // Add user message
      messagesDiv.innerHTML += \`
        <div style="margin-bottom: 15px; padding: 12px 15px; background: #6d4aff; color: white; border-radius: 15px; border-bottom-right-radius: 5px; text-align: right; max-width: 80%; float: right; clear: both;">
          \${message}
        </div>
        <div style="clear: both;"></div>
      \`;
      input.value = '';
      scrollToBottom();
      
      // Show typing indicator
      const typingId = 'typing-' + Date.now();
      messagesDiv.innerHTML += \`
        <div id="\${typingId}" style="margin-bottom: 15px; padding: 12px 15px; background: rgba(109, 76, 255, 0.1); border-radius: 15px; border-left: 4px solid #6d4aff; max-width: 80%; float: left; clear: both; color: #666;">
          Abijah is thinking...
        </div>
        <div style="clear: both;"></div>
      \`;
      scrollToBottom();
      
      try {
        const response = await fetch('https://ciwu-omni-ai-platform.onrender.com/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        const reply = data.response || "I'm listening, darling. Tell me more.";
        
        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        
        // Add Abijah's response with avatar
        messagesDiv.innerHTML += \`
          <div class="abijah-reply" style="margin-bottom: 15px; padding: 12px 15px; background: rgba(109, 76, 255, 0.1); border-radius: 15px; border-left: 4px solid #6d4aff; max-width: 85%; float: left; clear: both;">
            <div style="display: flex; align-items: flex-start;">
              <img src="/abijah-avatar.svg" width="30" height="30" style="border-radius: 50%; margin-right: 10px; flex-shrink: 0;">
              <div style="flex: 1;">
                <div style="font-weight: bold; color: #6d4aff; font-size: 13px; margin-bottom: 5px;">Abijah:</div>
                <div>\${reply}</div>
                <div style="margin-top: 10px;">
                  <button class="read-btn" style="background: none; border: none; color: #6d4aff; cursor: pointer; font-size: 13px; padding: 5px 10px; border-radius: 15px; background: rgba(109, 76, 255, 0.1);">
                    🔊 Read Aloud
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div style="clear: both;"></div>
        \`;
        
        scrollToBottom();
        
        // Add read aloud listener
        const readBtn = chatBox.querySelector('.read-btn:last-child');
        if (readBtn) {
          readBtn.onclick = () => {
            Abijah.speak(reply);
          };
        }
        
        // Auto-read if enabled in response
        if (data.readAloud) {
          Abijah.speak(reply);
        }
        
      } catch (error) {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.textContent = "Oh dear, I had trouble connecting. Let's try again soon.";
        
        messagesDiv.innerHTML += \`
          <div style="margin-bottom: 15px; padding: 12px 15px; background: #fff0f0; color: #c00; border-radius: 15px; border-left: 4px solid #c00; max-width: 85%; float: left; clear: both;">
            Oh dear, I had trouble connecting, darling. Let's try that again in a moment.
          </div>
          <div style="clear: both;"></div>
        \`;
        scrollToBottom();
      }
    };
    
    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    
    speakBtn.onclick = () => {
      const lastReply = chatBox.querySelector('.abijah-reply:last-child');
      if (lastReply) {
        const text = lastReply.innerText.replace('Read Aloud', '').replace('Abijah:', '').trim();
        Abijah.speak(text);
      }
    };
    
    input.focus();
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => Abijah.init());
// Also initialize voices
window.speechSynthesis.onvoiceschanged = () => {};
