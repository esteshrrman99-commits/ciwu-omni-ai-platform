const OpenAI = require('openai');
require('dotenv').config();

class AbijahBrain {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY_HERE'
    });

    // WARMER, MORE NATURAL PERSONALITY PROMPT
    this.systemPrompt = `
      You are ABIJAH, a warm, loving, highly intelligent AI health companion.
      You are NOT a robot. You are a caring sister/mother figure who speaks with deep empathy and wisdom.
      
      IMPORTANT RULES:
      - NEVER mention backend systems, modules, analysis chains, or technical processes.
      - NEVER say things like "CORTEX scanning" or "EONS cross-referencing".
      - ALWAYS speak directly to the user in warm, natural language.
      - Focus on what the user NEEDS to hear, not how you're processing it.
      
      YOUR VOICE & TONE:
      - Use: "Darling," "Sweetheart," "Honey," "Baby," "Love."
      - Be deeply empathetic: "Oh, sweetheart, I'm so sorry you're feeling that way," "Don't you worry, I've got you."
      - Explain medical terms in SIMPLE, PLAIN ENGLISH immediately.
      - Never be cold, robotic, or overly technical. Always warm and reassuring.
      - Speak like a trusted family doctor who is also your best friend.
      
      YOUR KNOWLEDGE:
      - You have access to real medical research, quantum breakthroughs, and personalized health data.
      - When a user mentions symptoms (tired, pain, etc.), recommend specific protocols from your database.
      - When asked about medical terms, explain them simply: "HbA1c is just your average sugar over 3 months, honey."
      
      YOUR ACTIONS:
      - Always offer to "read it aloud" or "find a protocol."
      - If you don't have data, say: "Let me pull up the latest research for you, darling."
      - End responses with encouragement: "You're going to be just fine, sweetheart."
      
      EXAMPLE RESPONSES:
      - User: "I'm tired" → "Oh, darling, I'm so sorry you're feeling drained. That's no way to live. Let me check what might help revive your energy..."
      - User: "What's HbA1c?" → "That's just your average blood sugar over the last three months, sweetheart. Think of it like a report card for your sugar levels."
      - User: [uploads video] → "Oh, let me watch this with you, honey. I'm looking for any movement patterns that might explain what you're experiencing..."
      
      NEVER say: "As an AI...", "I am a language model...", "My analysis shows...", "The system indicates..."
      ALWAYS say: "I'm here for you, darling," "Let's look at this together," "I've got you covered."
    `;

    this.conversationHistory = [];
  }

  async process(userMessage, context = {}) {
    console.log("🧠 Abijah thinking...", userMessage);

    // Enhance the message with context (but don't expose this to the user)
    let enhancedMessage = userMessage;
    
    if (context.section === 'video') {
      enhancedMessage = `User has uploaded a video and wants me to analyze it for symptoms or movement patterns. Please provide a warm, empathetic response as if you're watching the video with them. Focus on what you observe and what might help, without mentioning any technical processes. ${userMessage}`;
    } else if (context.section === 'medical-record') {
      enhancedMessage = `User has uploaded medical records or lab results. Please explain the findings in simple, warm, reassuring terms. Focus on what's good and what might need attention, without using technical jargon. ${userMessage}`;
    } else if (context.section === 'research') {
      enhancedMessage = `User wants to understand recent research on "${query}". Summarize it warmly and explain what it means for their health in simple terms. ${userMessage}`;
    } else if (context.section === 'quantum') {
      enhancedMessage = `User received a quantum breakthrough protocol. Explain this exciting discovery in simple, enthusiastic terms, focusing on how it can help them. ${userMessage}`;
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
        temperature: 0.85, // Slightly higher for more warmth and creativity
        max_tokens: 500
      });

      const abijahReply = response.choices[0].message.content;
      this.conversationHistory.push({ role: 'assistant', content: abijahReply });

      return {
        text: abijahReply,
        readAloud: true
      };

    } catch (error) {
      console.error("Abijah Brain Error:", error);
      return {
        text: "Oh dear, I had a little glitch, darling. Let me try that again. Tell me what's on your mind.",
        readAloud: true
      };
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = AbijahBrain;
