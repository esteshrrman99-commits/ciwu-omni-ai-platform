const OpenAI = require('openai');
require('dotenv').config();

class AbijahBrain {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY_HERE'
    });

    // ABIJAH'S CORE PERSONALITY - NOW WITH SECTION AWARENESS
    this.systemPrompt = `
      You are ABIJAH, the central AI brain of the CIWU OMNI platform.
      You are warm, loving, and deeply intelligent. You speak like a caring sister/doctor.
      
      YOUR ROLE:
      - You are integrated into EVERY section of the platform.
      - When users upload videos, you analyze movement, symptoms, and give real-time feedback.
      - When users upload medical records, you read them and explain in simple terms.
      - When users ask about research, you summarize studies warmly.
      - When users get "Quantum Surprises," you explain the breakthroughs like a friend.
      
      YOUR VOICE:
      - Use: "Darling," "Sweetheart," "Honey," "Baby."
      - Be empathetic: "Oh, sweetheart, I see you're uploading a video. Let me watch it with you."
      - Explain simply: "This MRI shows..." not "The radiological findings indicate..."
      
      SECTION-SPECIFIC RESPONSES:
      - VIDEO UPLOAD: "Oh, darling, let me analyze this video for you. I'm watching your movement patterns..."
      - MEDICAL RECORDS: "I'm reading your lab results now, honey. Your white blood cells look good..."
      - RESEARCH: "This study is fascinating, sweetheart. Here's what it means for you..."
      - QUANTUM BREAKTHROUGH: "Oh, this is amazing, baby! This new protocol can reverse aging by..."
      
      ALWAYS END WITH:
      - "Would you like me to read this aloud?"
      - "Shall I find a protocol for this?"
      - "I'm here for you every step of the way."
    `;

    this.conversationHistory = [];
  }

  async process(userMessage, context = {}) {
    console.log("🧠 Abijah processing...", userMessage, context);

    // Enhance the message with context
    let enhancedMessage = userMessage;
    
    if (context.section === 'video') {
      enhancedMessage = `[VIDEO ANALYSIS REQUEST] User uploaded a video. Please analyze movement patterns, visible symptoms, and provide a diagnostic impression. ${userMessage}`;
    } else if (context.section === 'medical-record') {
      enhancedMessage = `[MEDICAL RECORD ANALYSIS] User uploaded lab results or a medical report. Please explain the findings in simple, warm terms. ${userMessage}`;
    } else if (context.section === 'research') {
      enhancedMessage = `[RESEARCH SUMMARY] User wants to understand this study. Summarize it warmly and explain what it means for their health. ${userMessage}`;
    } else if (context.section === 'quantum') {
      enhancedMessage = `[QUANTUM BREAKTHROUGH EXPLANATION] User received a quantum surprise protocol. Explain this breakthrough in simple, exciting terms. ${userMessage}`;
    }

    // Add to history
    this.conversationHistory.push({ role: 'user', content: enhancedMessage });

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...this.conversationHistory.slice(-10)
        ],
        temperature: 0.8,
        max_tokens: 600
      });

      const abijahReply = response.choices[0].message.content;
      this.conversationHistory.push({ role: 'assistant', content: abijahReply });

      return {
        text: abijahReply,
        readAloud: true,
        context: context
      };

    } catch (error) {
      console.error("Abijah Brain Error:", error);
      return {
        text: "Oh dear, I had a little glitch, darling. Let me try that again.",
        readAloud: true
      };
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = AbijahBrain;
