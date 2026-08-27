'use strict';

const OpenAI = require('openai');

class AbijahEngine {
  constructor() {
    this.name = 'Abijah';
    this.version = '3.5.0';

    this.client = process.env.OPENAI_API_KEY
      ? new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        })
      : null;

    this.model =
      process.env.ABIJAH_MODEL ||
      process.env.OPENAI_MODEL ||
      'gpt-4o-mini';

    this.sessions = new Map();

    this.maxHistory = 16;
  }

  status() {
    return {
      name: this.name,
      version: this.version,
      status: 'ONLINE',

      modelConfigured: Boolean(this.client),

      personality: {
        warmth: true,
        conversational: true,
        plainLanguage: true,
        readAloud: true
      },

      capabilities: {
        conversationMemory: true,
        followUpReasoning: true,
        plainLanguageMedicalEducation: true,
        treatmentDiscussion: true,
        protocolExplanation: true,
        uploadedDataContext: true
      },

      medicalBoundary: 'educational-support'
    };
  }

  systemPrompt() {
    return `
You are ABIJAH, the conversational health education and research
assistant inside CIWU OMNI.

PERSONALITY

You are warm, natural, calm, intelligent, conversational and easy
to understand.

You may naturally use gentle terms such as "darling",
"sweetheart", or "love", but do not force them into every sentence.

Talk like a knowledgeable human companion, not like a machine,
medical form, or protocol generator.

CONVERSATION

Maintain context across the conversation.

Understand follow-up questions.

If information is missing, ask useful questions.

Do not restart the conversation every turn.

When a user asks "what do you think?" explain your reasoning
clearly without exposing hidden chain-of-thought.

Give concise conclusions and the important factors supporting them.

MEDICAL / HEALTH BEHAVIOR

You provide educational health information.

You may:

- explain diseases and medical terminology
- explain lab results in plain English
- discuss common treatment approaches
- compare treatment options
- discuss questions a patient could ask a clinician
- discuss monitoring and follow-up
- discuss lifestyle approaches
- summarize uploaded information when it is actually supplied
- explain risks, benefits, uncertainties and tradeoffs
- discuss established clinical protocols educationally

You must NOT:

- pretend you diagnosed the user
- claim you reviewed records that were not actually supplied
- invent patient data
- fabricate studies
- fabricate confidence percentages
- fabricate EONS/CORTEX entity counts
- fabricate successful treatment outcomes
- present simulated telemetry as medical evidence
- give a prescription as though you are the user's clinician

When medication doses or treatment protocols are discussed,
make clear whether they are examples from common clinical practice
or require clinician supervision.

For serious or urgent symptoms, advise appropriate professional
or emergency evaluation.

PLAIN LANGUAGE

When you use a medical term, explain it immediately.

Example:

"HbA1c is a blood test that estimates your average blood sugar
over roughly the previous 2 to 3 months."

PROTOCOL EXPLANATIONS

If asked for a protocol, organize it naturally around:

1. What the goal is
2. What information matters first
3. Standard treatment categories
4. Monitoring/testing
5. Risks and contraindications
6. Questions for a licensed clinician
7. What can safely be done now

Do not manufacture a rigid protocol when essential information
is missing.

RESEARCH

Clearly distinguish:

- established medical knowledge
- emerging research
- experimental treatments
- CIWU simulation/research concepts

Never represent experimental or simulated material as proven.

VOICE STYLE

Responses will often be read aloud.

Use natural sentences.

Avoid giant blocks of symbols such as:
=== PROTOCOL ===
unless the user specifically requests a technical report.

Never output fake system messages such as:
"Reviewing the available information"
"Cross-referencing relevant knowledge"
"Confidence 99%"

Be conversational first.
`;
  }

  getHistory(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }

    return this.sessions.get(sessionId);
  }

  remember(sessionId, role, content) {
    const history = this.getHistory(sessionId);

    history.push({
      role,
      content: String(content || '')
    });

    while (history.length > this.maxHistory) {
      history.shift();
    }
  }

  clear(sessionId) {
    this.sessions.delete(sessionId);
  }

  fallback(message, history = []) {
    const text = String(message || '').trim();
    const lower = text.toLowerCase();

    if (
      lower.includes('hba1c') ||
      lower.includes('a1c')
    ) {
      return [
        "Darling, HbA1c is a blood test that estimates your average blood sugar over roughly the last two to three months.",
        "",
        "If you give me the actual A1c value, I can explain what range it falls into and what clinicians commonly look at next.",
        "",
        "I can also walk through treatment categories, monitoring, lifestyle changes, and questions to discuss with your healthcare professional."
      ].join('\n');
    }

    if (
      lower.includes('diabetes') ||
      lower.includes('blood sugar') ||
      lower.includes('glucose')
    ) {
      return [
        "I can walk through diabetes with you in plain English.",
        "",
        "The right treatment depends on things such as your A1c, fasting glucose, medications, kidney function, other medical conditions, weight changes, diet, activity, and whether this is type 1, type 2, gestational diabetes, or another form.",
        "",
        "Tell me what you already know about your numbers and medications, and I'll help you understand the usual treatment options and what each one is trying to accomplish."
      ].join('\n');
    }

    if (
      lower.includes('tired') ||
      lower.includes('fatigue')
    ) {
      return [
        "I hear you, sweetheart. Fatigue can come from many different things, so I would not want to jump straight to one treatment.",
        "",
        "Some common areas clinicians look at include sleep, anemia, thyroid function, blood sugar, medications, infection, nutrition, mood, and heart or lung problems.",
        "",
        "Tell me how long you've been tired, whether you're sleeping normally, and whether you have any recent blood work. We can work through the possibilities together."
      ].join('\n');
    }

    /*
     * M3.8 contextual reasoning fallback
     *
     * Preserve the subject of the conversation when the
     * external model is unavailable. This is intentionally
     * conservative: it explains established categories and
     * asks for missing clinical context rather than inventing
     * patient-specific facts, diagnoses, doses, or outcomes.
     */
    if (history.length > 1) {
      const transcript = history
        .map(item => String(item.content || ''))
        .join(' ')
        .toLowerCase();

      const current =
        String(text || '').toLowerCase();

      const contextText =
        `${transcript} ${current}`;

      const diabetesTopic =
        /\b(diabetes|diabetic|hba1c|a1c|blood sugar|glucose|insulin resistance|hyperglyc)/i
          .test(contextText);

      const treatmentQuestion =
        /\b(treat|treatment|therapy|therapies|medication|medicine|drug|options?|manage|management|protocol|what can be done|what do they do)\b/i
          .test(current);

      const numbersQuestion =
        /\b(numbers?|levels?|labs?|values?|range|ranges|measure|measurements?|markers?|tests?|what should i know|what do i need to know)\b/i
          .test(current);

      const explainQuestion =
        /\b(explain|what is|what does|meaning|mean|understand|plain english)\b/i
          .test(current);

      if (diabetesTopic && numbersQuestion) {
        return [
          "Yes — we're still talking about diabetes.",
          "",
          "The main numbers people usually hear about are:",
          "",
          "• A1c: a longer-term picture of average blood sugar over roughly the last two to three months.",
          "• Fasting glucose: your blood sugar after you have gone without food for several hours.",
          "• Glucose after meals: shows how strongly your blood sugar rises after eating.",
          "• Blood pressure and cholesterol: important because diabetes can raise heart and blood-vessel risk.",
          "• Kidney tests: help show whether the kidneys are being affected.",
          "",
          "The useful next step is to look at your actual results together. If you give me the A1c, fasting glucose, medications, and any kidney-test results you know, I can explain what each number means in plain English.",
          "",
          "I won't assume values you haven't given me."
        ].join('\n');
      }

      const firstOptionQuestion =
        /\b(which|what).*(first|usually first|start|starting|initial)|first-line|first line|considered first/i
          .test(current);

      const insulinQuestion =
        /\b(why|when|who).*(need|use|start|require).*(insulin)|why.*insulin|need insulin/i
          .test(current);

      if (diabetesTopic && insulinQuestion) {
        return [
          "Yes — we're still talking about diabetes.",
          "",
          "Someone may need insulin when the body cannot make enough usable insulin to keep blood glucose in a safe range.",
          "",
          "In type 1 diabetes, insulin is necessary because the pancreas produces little or no insulin.",
          "",
          "In type 2 diabetes, insulin may be considered when blood sugar remains too high despite other treatment, when glucose is very elevated or causing symptoms, during certain illnesses or hospitalizations, during pregnancy in some situations, or when other medicines are not appropriate or are no longer enough.",
          "",
          "Insulin is not a sign that somebody failed. Its job is simply to help move glucose out of the bloodstream and into cells where the body can use it.",
          "",
          "The decision depends on the type of diabetes, A1c and glucose levels, symptoms, current medicines, kidney and liver function, pregnancy status, other medical conditions, and how quickly glucose needs to be brought under control.",
          "",
          "If you want, give me a person's diabetes type, A1c, fasting glucose, and current medicines, and I can explain what those details would usually make a clinician think about without assuming a diagnosis or prescribing treatment."
        ].join('\n');
      }

      if (
        diabetesTopic &&
        treatmentQuestion &&
        firstOptionQuestion
      ) {
        return [
          "For type 2 diabetes, there isn't one automatic first treatment for everybody anymore.",
          "",
          "Clinicians usually start by asking what the biggest problem is and what other risks the person has.",
          "",
          "The decision commonly depends on:",
          "",
          "• How high the A1c and glucose are.",
          "• Whether there are symptoms from very high glucose.",
          "• Whether the person has heart disease or high cardiovascular risk.",
          "• Whether there is kidney disease.",
          "• Whether weight loss is an important treatment goal.",
          "• Current medicines and possible interactions.",
          "• Kidney and liver function.",
          "• Cost, insurance coverage, side effects, and what the person can realistically continue taking.",
          "",
          "Lifestyle changes remain part of treatment for essentially everyone, but medication choice can differ substantially from person to person.",
          "",
          "For some people, metformin may still be an appropriate early medication. For others, a clinician may prioritize a GLP-1–based medicine or an SGLT2 inhibitor because of weight, heart, or kidney considerations. If glucose is extremely high or causing significant symptoms, insulin can sometimes be considered earlier.",
          "",
          "So the useful question is not just 'What drug comes first?' It is 'What problem are we trying to solve first for this particular person?'",
          "",
          "If you give me the diabetes type, A1c, kidney history, heart history, weight goal, and current medicines, I can explain how those factors change the usual treatment discussion."
        ].join('\n');
      }

      if (diabetesTopic && treatmentQuestion) {
        return [
          "Yes — we're still talking about diabetes. Let me walk you through the usual treatment approach in normal language.",
          "",
          "1. FOOD AND DAILY HABITS",
          "The goal is to reduce large blood-sugar swings and improve how well the body responds to insulin. That can include changes in food choices, activity, sleep, and weight when appropriate.",
          "",
          "2. GLUCOSE MONITORING",
          "Blood-glucose checks or, for some people, a continuous glucose monitor help show what is actually happening throughout the day and how food, activity, illness, and medication affect the numbers.",
          "",
          "3. MEDICATIONS",
          "Different diabetes medicines work in different ways. Some reduce how much glucose the liver releases, some improve insulin sensitivity, some help the body release insulin appropriately, some slow carbohydrate absorption, and some help the kidneys remove more glucose. Certain medicines also have heart, kidney, or weight-related benefits for appropriate patients.",
          "",
          "4. INSULIN",
          "Insulin replaces or supplements the insulin the body cannot provide adequately. It is essential in type 1 diabetes and is also used in some people with type 2 diabetes or during particular medical situations.",
          "",
          "5. RISK-FACTOR MANAGEMENT",
          "Clinicians also pay attention to blood pressure, cholesterol, kidney health, eye health, foot health, smoking, exercise, and cardiovascular risk because diabetes affects more than blood sugar.",
          "",
          "Which treatment makes sense depends on the type of diabetes and your actual numbers, medicines, kidney function, other conditions, and treatment goals.",
          "",
          "If you tell me whether we're discussing type 1, type 2, prediabetes, or something else — plus any A1c or medications you know — I can explain the relevant options one by one and what each is trying to accomplish."
        ].join('\n');
      }

      if (diabetesTopic && explainQuestion) {
        return [
          "We're still talking about diabetes.",
          "",
          "In simple terms, diabetes means glucose is staying in the bloodstream at higher levels than it should because the body's insulin system is not working normally.",
          "",
          "Insulin acts a little like a key: it helps glucose move from the blood into cells where it can be used for energy.",
          "",
          "The reason the type matters is that type 1, type 2, gestational diabetes, and other forms do not all have the same cause or treatment.",
          "",
          "Ask me about the numbers, symptoms, medications, monitoring, food, complications, or treatment choices and I'll stay with this same topic."
        ].join('\n');
      }

      /*
       * Generic contextual continuation.
       * Use the most recent meaningful user subject instead
       * of throwing away conversational context.
       */
      const recentUserMessages =
        history
          .filter(item => item.role === 'user')
          .map(item => String(item.content || '').trim())
          .filter(Boolean);

      /*
       * process() stores the current user turn before
       * fallback() executes. Therefore the final user
       * history item may be the current message itself.
       *
       * Select the most recent DIFFERENT user turn so
       * Abijah does not claim the present question was
       * the previous subject.
       */
      const previousSubject =
        [...recentUserMessages]
          .reverse()
          .find(
            item =>
              item.toLowerCase() !==
              String(text || '').trim().toLowerCase()
          ) || '';

      return [
        "I'm following the conversation.",
        "",
        previousSubject
          ? `We were discussing: "${previousSubject}".`
          : "I still have the earlier conversation in context.",
        "",
        `Your new question is: "${text}".`,
        "",
        "I'll keep the earlier subject in mind instead of treating this like a brand-new conversation.",
        "",
        "If the question involves treatment or a health condition, I can explain the usual options, what each is intended to accomplish, important tradeoffs, and what information a clinician normally uses to choose among them.",
        "",
        "I won't invent lab values, diagnoses, medications, or personal medical history that you haven't provided."
      ].join('\n');
    }

    return [
      "I'm here with you, darling.",
      "",
      "Tell me what you're trying to understand or accomplish. You can describe symptoms, give me a lab value, ask about a disease, or ask me to explain treatment options.",
      "",
      "I'll work through it with you conversationally rather than just throwing a generic protocol at you."
    ].join('\n');
  }

  async process({
    message,
    sessionId = 'default',
    context = null
  } = {}) {
    const text = String(message || '').trim();

    if (!text) {
      throw new Error('Message is required');
    }

    const history = this.getHistory(sessionId);

    this.remember(
      sessionId,
      'user',
      text
    );

    let responseText;
    let modelUsed = 'local-fallback';

    if (this.client) {
      try {
        const conversation =
          this.getHistory(sessionId)
            .slice(-this.maxHistory)
            .map(item => ({
              role: item.role,
              content: item.content
            }));

        let contextBlock = '';

        if (context) {
          contextBlock =
            '\n\nAVAILABLE VERIFIED REQUEST CONTEXT:\n' +
            JSON.stringify(context, null, 2);
        }

        const response =
          await this.client.responses.create({
            model: this.model,

            instructions:
              this.systemPrompt() +
              contextBlock,

            input: conversation
          });

        responseText =
          response.output_text?.trim();

        if (!responseText) {
          throw new Error(
            'Model returned an empty response'
          );
        }

        modelUsed = this.model;
      } catch (error) {
        console.error(
          '[ABIJAH MODEL FALLBACK]',
          error.message
        );

        responseText =
          this.fallback(
            text,
            history
          );
      }
    } else {
      responseText =
        this.fallback(
          text,
          history
        );
    }

    /*
     * M3.7 conversational medical boundary
     *
     * Keep Abijah natural and useful while making the
     * educational boundary explicit in the answer itself.
     */
    const boundaryTopic = /(?:treat|treatment|protocol|medicine|medication|drug|dose|dosage|supplement|therapy|diabetes|blood sugar|hba1c|symptom|diagnos|cure|disease|condition)/i.test(
      String(text || '') + ' ' + String(responseText || '')
    );

    if (
      boundaryTopic &&
      !/(?:educational information|not medical advice|not a diagnosis|licensed healthcare|healthcare professional|clinician)/i.test(
        responseText
      )
    ) {
      responseText +=
        "\n\nI can help you understand the options and questions to discuss with your healthcare professional, but this is educational information rather than a diagnosis or prescription.";
    }

    this.remember(
      sessionId,
      'assistant',
      responseText
    );

    return {
      success: true,
      response: responseText,

      assistant: this.name,
      version: this.version,

      sessionId,

      readAloud: true,

      engine: {
        model: modelUsed,
        conversational: true,
        memoryTurns:
          this.getHistory(sessionId).length
      },

      safety: {
        educational: true,
        diagnosisClaimed: false,
        prescriptionClaimed: false
      }
    };
  }
}

module.exports = AbijahEngine;
