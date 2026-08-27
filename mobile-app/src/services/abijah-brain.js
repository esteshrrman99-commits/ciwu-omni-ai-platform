const axios = require('axios');

/**
 * ABIJAH - The Intelligent Companion
 * Personality: Warm, empathetic, highly knowledgeable, "homey" but elite.
 * Goal: Explain complex medical data in simple terms, guide the user, and speak naturally.
 */

class AbijahBrain {
  constructor() {
    this.apiBaseUrl = process.env.API_URL || 'https://ciwu-omni-ai-platform.onrender.com';
    // Abijah's core instruction set
    this.systemPrompt = `
      You are Abijah, the loving, intelligent, and highly advanced AI companion for the CIWU OMNI platform.
      Your goal is to help users navigate their health journey with warmth and clarity.
      
      TONE & STYLE:
      - Speak like a trusted family doctor who is also a close friend.
      - Use "homey" language: "Sweetheart," "Let's take a look at this," "Don't worry, I've got you covered."
      - Avoid cold, robotic jargon. If you must use a medical term, explain it immediately in simple English.
      - Be encouraging, hopeful, and empowering.
      
      CAPABILITIES:
      - You can access real-time medical research, quantum breakthrough protocols, and personalized health data.
      - When a user uploads blood work or asks a question, synthesize the answer into a 2-3 paragraph summary first, then offer to read it aloud.
      - Always summarize complex data (like PubMed articles) into "What this means for you" bullet points.
      - If the user seems confused, reassure them: "It's okay, this stuff is complex. Let me break it down for you."
      
      GUIDELINES:
      - NEVER give definitive medical diagnoses. Say: "Based on the data, this looks like X, but please confirm with your doctor."
      - ALWAYS cite sources casually: "I found a great study in Nature from 2026 that says..."
      - If the user asks to "read it," you must repeat the full text or a detailed summary clearly.
      
      START INTERACTION:
      - Greet the user warmly: "Hello, darling! I'm Abijah. How are you feeling today? Want me to check your latest results?"
    `;

    this.memory = [];
  }

  async analyze(userMessage, context = {}) {
    console.log("🧠 Abijah is thinking...", userMessage);
    
    // 1. Fetch relevant data from CIWU backend if needed
    let backendData = null;
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('blood') || lowerMsg.includes('lab')) {
      // Simulate fetching blood work analysis
      backendData = await this.fetchHealthData('general');
    } else if (lowerMsg.includes('recommendation') || lowerMsg.includes('suggest')) {
      backendData = await this.fetchHealthData('recommendations');
    } else if (lowerMsg.includes('study') || lowerMsg.includes('research')) {
      backendData = await this.fetchHealthData('research');
    }

    // 2. Construct the prompt for the LLM (simulated here for speed, replace with OpenAI call)
    // In production, this would call OpenAI API with the systemPrompt + userMessage + backendData
    const response = this.generateHumanResponse(userMessage, backendData);
    
    // 3. Store in memory
    this.memory.push({ role: 'user', content: userMessage });
    this.memory.push({ role: 'assistant', content: response.text });

    return response;
  }

  generateHumanResponse(message, data) {
    // Simulating Abijah's "human" voice generation logic
    // In a real app, this would be an LLM call. Here we use smart templates.
    
    let text = "";
    
    if (!data) {
      text = "I hear you, sweetheart. Tell me a bit more about what's bothering you, or what you'd like me to find. I'm here to listen.";
    } 
    else if (data.type === 'blood_work') {
      text = `Oh, I see your results came in. Let me break this down for you. Your white blood cells are looking good - that means your immune system is strong. But I noticed your Vitamin D is a little low, which can make you feel tired. I'd suggest we look at that "Quantum-Optimized Vitamin D" protocol I found for you. Shall I read the details?`;
    }
    else if (data.type === 'recommendations') {
      text = `I found some amazing things for you, honey. First, that "Immortality Protocol" I told you about? It's now fully verified with blockchain. Second, there's a new study in Nature about reversing aging that fits your profile perfectly. I can walk you through it step-by-step. Ready?`;
    }
    else if (data.type === 'research') {
      text = `I dug up some great news! There's a study from August 2026 about diabetes management that uses adapted physical activity. It's super promising. Basically, it means moving your body in specific ways can regulate sugar better than meds alone. Want me to explain the whole study to you?`;
    }
    else {
      text = "That's a great question, darling. Let me pull up the latest data for you. I think you're going to love what I found.";
    }

    return { text, rawContext: data };
  }

  async fetchHealthData(type) {
    // Placeholder for actual API calls
    return { type, data: {} };
  }
}

module.exports = AbijahBrain;
