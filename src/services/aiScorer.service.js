const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ----- Config -----
const BATCH_SIZE = 5; // process 5 leads per request
const RETRY_LIMIT = 3; // max retry attempts
const RETRY_DELAY_MS = 15000; // 15s between retries

// Max time per batch: up to 45s (3 attempts x 15s delay)


/*** Helper to wait before retry */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//Total time per batch: up to 45s (3 attempts x 15s delay)

/*** AI Batch Scorer - processes 5 leads together in one Gemini call */
async function getScore(leads, offer) {
  const batchedResults = [];

  //Split leads into batches of BATCH_SIZE
  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);
    if (!batch.length) continue; // skip empty batch

    let attempt = 0; // attempt counter
    let success = false; //batch success flag

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

Lead Scoring Context (for reasoning only):
- Role relevance: decision maker (High), influencer (Medium), else (Low) 
- Industry match: exact ICP (High), adjacent (Medium), else (Low)

Task: Classify each lead’s buying intent as High, Medium, or Low and explain in 1–2 lines reasoning.

Respond strictly in JSON array format:
[ { "name": "<lead name>", "ai_intent": "High|Medium|Low", "ai_reason": "<why>" } ]

Leads:
${batch
  .map(
    (lead, idx) =>
      `${idx + 1}. ${lead.name}, ${lead.role}, ${lead.company}, ${lead.industry}`
  )
  .join("\n")}
            `,
          },
        ];

        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents,
        });
        // extract text response
        let text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        text = text.replace(/```json|```/g, "").trim();

        // json parsing
        let parsed = [];
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          console.error("❌ JSON parse error for batch:", err.message);
          parsed = [];
        }

        // map results back to right leads
        for (const r of parsed) {
          const lead = batch.find((l) => l.name === r.name);
          if (!lead) continue;

          batchedResults.push({
            ...lead,
            ai_intent: r.ai_intent?.trim() || "Low",
            ai_reason: r.ai_reason?.trim() || "No reasoning provided",
          });
        }

        console.log("Batch results:", parsed); 

        success = true;
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
  console.log(batchedResults);
  
  return batchedResults;  // return all processed results
}

module.exports = { getScore };
