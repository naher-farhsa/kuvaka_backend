const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * AI Scorer - assigns 10/30/50 points based on classified intent.
 * Uses Gemini 2.0 Flash model for quick inference.
 */
async function getScore(lead, offer) {
  try {
    const contents = [
      {
        text: `Offer Details:
Name: ${offer.name}
Value Proposition: ${offer.value_props}
Ideal Use Cases: ${offer.ideal_use_cases}

Lead Details:
Name: ${lead.name}
Role: ${lead.role}
Company: ${lead.company}
Industry: ${lead.industry}
Email: ${lead.email}

Task:
Classify this lead’s buying intent as High, Medium, or Low.
Explain in 1–2 sentences why. Respond in JSON like:
{ "intent": "High", "reason": "..." }`,
      },
    ];

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction: `You are a B2B lead qualification assistant.
        Return only valid JSON with two keys: intent and reason.
        Do not output markdown or explanations outside JSON.`,
        textInstruction: "Output only JSON.",
      },
    });

    let text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    text = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(text);
    const intent = parsed.intent?.toLowerCase() || "low";
    const aiReason = parsed.reason || "No reasoning provided";

    let aiPoints = 10;
    if (intent === "high") aiPoints = 50;
    else if (intent === "medium") aiPoints = 30;

    return { aiPoints, aiReason };
  } catch (err) {
    console.error("AI Scoring error:", err.message);
    return { aiPoints: 10, aiReason: "Fallback: AI scoring unavailable" };
  }
}

module.exports = { getScore };
