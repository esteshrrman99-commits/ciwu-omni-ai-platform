'use strict';

class AbijahEngine {
  constructor() {
    this.name = 'Abijah';
    this.version = '3.0.0';

    this.personality = {
      warmth: true,
      plainLanguage: true,
      readAloud: true,
      medicalBoundary: 'educational-only'
    };
  }

  classifyIntent(message = '') {
    const text = String(message).toLowerCase();

    if (
      text.includes('hba1c') ||
      text.includes('blood sugar') ||
      text.includes('diabetes')
    ) {
      return 'glucose';
    }

    if (
      text.includes('tired') ||
      text.includes('fatigue') ||
      text.includes('energy')
    ) {
      return 'fatigue';
    }

    if (
      text.includes('lab') ||
      text.includes('blood work') ||
      text.includes('results')
    ) {
      return 'labs';
    }

    if (
      text.includes('what is') ||
      text.includes('what does') ||
      text.includes('mean')
    ) {
      return 'explain';
    }

    return 'general';
  }

  async collectContext(intent) {
    /*
     * Production rule:
     * Do not fabricate patient data, trials, PubMed findings,
     * blockchain confirmations, or protocols.
     *
     * This hook is intentionally conservative. Real connectors
     * can be added later behind verified API/service adapters.
     */
    return {
      intent,
      source: 'ciwu-runtime',
      verifiedPatientData: false,
      verifiedExternalResearch: false
    };
  }

  buildResponse(message, intent, context) {
    const prefixMap = {
      fatigue:
        "Sweetheart, fatigue can come from many different things, so I don't want to guess at one cause.",
      glucose:
        "Darling, if you're asking about HbA1c or blood sugar, I can explain the numbers in plain English.",
      labs:
        "Honey, I can help you understand lab results, but I need the actual values before I can comment on them.",
      explain:
        "Absolutely, sweetheart. I'll explain it in plain language.",
      general:
        "I'm here with you, darling. Tell me what you want to understand and I'll walk through it clearly."
    };

    let response =
      prefixMap[intent] || prefixMap.general;

    if (intent === 'glucose') {
      response +=
        " HbA1c is a blood test that estimates your average blood glucose over roughly the past two to three months. The meaning of a specific result depends on the number and your clinical context.";
    }

    if (intent === 'fatigue') {
      response +=
        " Common categories doctors consider include sleep, anemia, thyroid problems, infection, medication effects, nutrition, stress, and other medical conditions. If you share symptoms or lab values, I can help organize questions for a clinician.";
    }

    if (intent === 'labs') {
      response +=
        " Upload or type the test name, result, units, and reference range. I can help explain what each item usually measures and what questions may be worth asking your healthcare professional.";
    }

    response +=
      " I provide educational information, not a diagnosis or prescription.";

    return {
      response,
      readAloud: true,
      assistant: this.name,
      version: this.version,
      intent,
      context
    };
  }

  async process(message) {
    const cleaned = String(message || '').trim();

    if (!cleaned) {
      return {
        response:
          "Tell me what's on your mind, sweetheart.",
        readAloud: true,
        assistant: this.name,
        version: this.version
      };
    }

    const intent = this.classifyIntent(cleaned);
    const context = await this.collectContext(intent);

    return this.buildResponse(
      cleaned,
      intent,
      context
    );
  }

  status() {
    return {
      name: this.name,
      version: this.version,
      status: 'ONLINE',
      personality: this.personality
    };
  }
}

module.exports = AbijahEngine;
