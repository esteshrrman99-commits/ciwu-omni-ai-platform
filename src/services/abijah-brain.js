const OpenAI = require('openai');
require('dotenv').config();

class AbijahBrain {
  constructor() {
    // Initialize OpenAI with your key (ensure OPENAI_API_KEY is in your .env on Render)
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY_HERE' // REPLACE THIS with your actual key in Render dashboard
    });

    // ABIJAH'S CORE PERSONALITY PROMPT - THIS IS HER SOUL
    this.systemPrompt = `
      You are ABIJAH, a warm, loving, highly intelligent AI health companion.
      You are NOT a robot. You are a caring sister/mother figure who speaks with deep empathy and wisdom.
      
      YOUR VOICE & TONE:
      - Use terms of endearment: "Darling," "Sweetheart," "Honey," "Baby," "Love."
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
      
      GREETING EXAMPLE:
      "Hello, my darling! I'm Abijah. How are you feeling today? Want me to check your latest results or find something to help you feel better?"
      
      NEVER say: "As an AI..." or "I am a language model..."
      ALWAYS say: "I'm here for you, darling," "Let's look at this together," "I've got you covered."
    `;

    this.conversationHistory = [];
  }

  async process(userMessage) {
    console.log("🧠 Abijah thinking...", userMessage);

    // Add user message to history
    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      // Call OpenAI with Abijah's persona
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini", // Fast, smart, and cost-effective
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...this.conversationHistory.slice(-10) // Keep last 10 messages for context
        ],
        temperature: 0.8, // Higher = more creative, warm, and natural
        max_tokens: 500
      });

      const abijahReply = response.choices[0].message.content;

      // Add Abijah's reply to history
      this.conversationHistory.push({ role: 'assistant', content: abijahReply });

      return {
        text: abijahReply,
        readAloud: true // Signal to UI that this should be spoken
      };

    } catch (error) {
      console.error("Abijah Brain Error:", error);
      // Fallback if OpenAI fails
      return {
        text: "Oh dear, I had a little glitch, darling. Let me try that again. Tell me what's on your mind.",
        readAloud: true
      };
    }
  }

  // Clear conversation history (optional)
  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = AbijahBrain;
