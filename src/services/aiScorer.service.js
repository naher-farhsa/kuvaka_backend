const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ----- Config -----
const BATCH_SIZE = 5;              // process 5 leads per request
const RETRY_LIMIT = 3;             // max retry attempts
const RETRY_DELAY_MS = 15000;      // 15s between retries

/**
 * Helper to wait before retry
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * AI Batch Scorer - processes multiple leads together in one Gemini call
 */
async function getScore(leads, offer) {
  const batchedResults = [];

  // Split leads into chunks
  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);  //5 leads per batch

    let attempt = 0;       // attempt counter
    let success = false;  // track if batch was successful

    while (!success && attempt < RETRY_LIMIT) { 
      try {
        console.log(`Processing batch ${i / BATCH_SIZE + 1}...`); 

        const contents = [
          {
            text: `You are a B2B lead qualification AI.
            Offer Details:
            - Name: ${offer.name}
            - Value Proposition: ${offer.value_props.join(", ")}
            - Ideal Use Cases: ${offer.ideal_use_cases.join(", ")}

            Task: Classify each lead’s buying intent as High, Medium, or Low and explain briefly why.

            Respond strictly in JSON array format:
            [ { "name": "<lead name>", "intent": "High|Medium|Low", "reason": "<why>" } ]

            Leads:
            ${batch.map((lead, idx) => `${idx + 1}. ${lead.name}, ${lead.role}, ${lead.company}, ${lead.industry}`)
              .join("\n")
            }`,
          },
        ];

        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents,
        });
 
        let text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        text = text.replace(/```json|```/g, "").trim();

        const parsed = JSON.parse(text);

        // Map results back to the right leads
        for (const r of parsed) {
          const lead = batch.find((l) => l.name === r.name);
          if (!lead) continue;

          let aiPoints = 10;
          if (r.intent?.toLowerCase() === "high") aiPoints = 50;
          else if (r.intent?.toLowerCase() === "medium") aiPoints = 30;

          batchedResults.push({
            ...lead,
            aiPoints,
            aiReason: r.reason || "No reasoning provided",
          });
        }

        success = true; // batch done
      } catch (err) {
        attempt++;
        console.warn(
          `Rate limit or fetch error (attempt ${attempt}): ${err.message}`
        );
        if (attempt < RETRY_LIMIT) {
          console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await delay(RETRY_DELAY_MS);
        } else {
          console.error("❌ Skipping batch after max retries.");
        }
      }
    }
  }
  return batchedResults;
}

module.exports = {getScore};
