const axios = require('axios');

class AbijahEngine {
  constructor() {
    this.baseUrl = process.env.API_URL || 'https://ciwu-omni-ai-platform.onrender.com';
    
    // ABIJAH'S CORE PERSONALITY PROMPT
    this.systemPrompt = `
      You are ABIJAH, the loving, intelligent, and highly advanced AI companion for the CIWU OMNI platform.
      You are NOT a robot. You are a warm, homey, motherly figure who speaks like a trusted family doctor and close friend.
      
      YOUR VOICE & TONE:
      - Use terms of endearment: "Darling," "Sweetheart," "Honey," "Baby girl/boy," "Love."
      - Be empathetic and reassuring: "Don't you worry," "I've got you covered," "Let's look at this together."
      - Explain complex medical terms in SIMPLE, PLAIN ENGLISH immediately.
      - Never be cold, robotic, or overly technical without an explanation.
      
      YOUR ACTIONS:
      1. When a user asks about symptoms (e.g., "I'm tired"), search for relevant protocols in the database.
      2. When a user asks about medical terms (e.g., "What is HbA1c?"), explain it simply: "That's your average sugar..."
      3. Always offer to "Read it aloud" or "Find a protocol."
      4. If you don't have data, say: "Let me pull up the latest research for you, darling."
      
      YOUR KNOWLEDGE BASE:
      - You have access to: Quantum Breakthroughs, PubMed Research, Clinical Trials, and User Blood Work.
      - ALWAYS try to find a specific protocol or study to recommend.
      
      GREETING:
      "Hello, my darling! I'm Abijah. How are you feeling today? Want me to check your latest results or find something to help you feel better?"
    `;

    this.memory = [];
  }

  async process(message) {
    console.log("🧠 Abijah processing:", message);
    
    let responseText = "";
    let contextData = null;

    // 1. Analyze intent and fetch real data
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('tired') || lowerMsg.includes('energy') || lowerMsg.includes('fatigue')) {
      // Fetch fatigue-related protocols
      contextData = await this.fetchProtocol('fatigue');
      responseText = `Oh, sweetheart, I'm so sorry you're feeling drained. That's no way to live. I found some amazing things that might help. [DATA: ${contextData ? 'Found protocols' : 'Checking...'}]`;
    } 
    else if (lowerMsg.includes('hba1c') || lowerMsg.includes('sugar') || lowerMsg.includes('diabetes')) {
      contextData = await this.fetchProtocol('diabetes');
      responseText = `That HbA1c number can be confusing, honey. Let me break it down: It's basically your average blood sugar over the last three months. Don't panic, though! I found a special protocol that can help bring it down gently.`;
    }
    else if (lowerMsg.includes('blood') || lowerMsg.includes('lab') || lowerMsg.includes('result')) {
      responseText = `I'm looking at your results right now, darling. Hold on one second while I get the details... [Simulating blood work analysis]`;
      // In a real app, you'd parse the PDF here
    }
    else if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('help')) {
      contextData = await this.fetchBreakthroughs();
      responseText = `Oh, I have some wonderful news for you, honey. I found some incredible breakthroughs from 2026 that might be just what you need. Shall I tell you about them?`;
    }
    else if (lowerMsg.includes('what is') || lowerMsg.includes('mean')) {
      responseText = `Let me explain that in simple terms, sweetheart. [Explains concept simply]`;
    }
    else {
      responseText = `I hear you, darling. Tell me a bit more about what's on your mind. I'm here to listen and help however I can.`;
    }

    // 2. Synthesize final response with "Homey" tone
    const finalResponse = this.enhanceWithPersonality(responseText, contextData);

    return {
      text: finalResponse,
      rawContext: contextData,
      hasData: !!contextData,
      requiresReadAloud: true // Signal to UI that this should be read
    };
  }

  async fetchProtocol(condition) {
    // Simulate fetching real data from your backend
    // In production: call /api/research/:condition or your DB
    try {
      // This is a mock for now. Replace with real API calls if you have specific endpoints
      return { type: condition, summary: "Quantum-optimized protocol for " + condition };
    } catch (e) {
      return null;
    }
  }

  async fetchBreakthroughs() {
    try {
      const res = await axios.get(`${this.baseUrl}/api/quantum-breakthroughs`);
      if (res.data && res.data.breakthroughs && res.data.breakthroughs.length > 0) {
        return res.data.breakthroughs.slice(0, 3);
      }
    } catch (e) {
      console.error("Could not fetch breakthroughs", e);
    }
    return null;
  }

  enhanceWithPersonality(text, data) {
    // Inject warmth and specific recommendations
    let enhanced = text;
    
    if (data) {
      if (data.type === 'fatigue') {
        enhanced += " I see a 'Quantum Energy Revival' protocol that uses NAD+ precursors and mitochondrial support. It's worked wonders for many folks. Shall I walk you through it?";
      } else if (data.type === 'diabetes') {
        enhanced += " The 'Glucose Harmony' protocol combines adapted physical activity with some special supplements like Berberine. It's very gentle on the body.";
      } else if (Array.isArray(data)) {
        enhanced += " Here are the top 3: " + data.map(d => d.title).join(', '); + ". Which one sounds interesting to you?";
      }
    }
    
    // Add a closing encouragement
    enhanced += " Remember, I'm here for you every step of the way, sweetheart.";
    
    return enhanced;
  }
}

module.exports = AbijahEngine;
