const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// simple delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * AI Scorer - assigns 10/30/50 points based on classified intent.
 * Uses Gemini 2.0 Flash model for quick inference.
 */
async function getScore(lead, offer, retries = 3) {
  const payload = [
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
      Task:
        Classify this lead’s buying intent as High, Medium, or Low.
        Explain briefly. Respond in JSON: { "intent": "...", "reason": "..." }`,
    },
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: payload,
      });
      
      //replace ```json and ``` and parse JSON
      let text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      text = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      
      // extract intent and reasoning
      const intent = parsed.intent?.toLowerCase() || "low";
      const aiReason = parsed.reason || "No reasoning provided";
      
      //assign points
      let aiPoints = 10;
      if (intent === "high") aiPoints = 50;
      else if (intent === "medium") aiPoints = 30;
      return { aiPoints, aiReason };

    } catch (err) {
      if (err.message.includes("429") && attempt < retries) {
        console.warn(`Rate limit hit, retrying attempt ${attempt}...`);
        await delay(15000); // wait 15s before retry
      } else {
        console.error("AI Scoring error:", err.message);
        return { aiPoints: 10, aiReason: "Fallback: AI scoring unavailable" };
      }
    }
  }
}

module.exports = { getScore };
