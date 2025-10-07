// importing models and services
const ruleScorer = require("../services/ruleScorer.service");
const aiScorer = require("../services/aiScorer.service");
const offerModel = require("../models/offer.model");
const leadModel = require("../models/lead.model");
const scoreModel = require("../models/score.model");

// run scoring for an offer
async function runScoring(req, res) {
  try {
    const { offer_id } = req.body;
    if (!offer_id)
      return res.status(400).json({ message: "offer_id is required" });

    const offer = await offerModel.findById(offer_id);
    if (!offer) return res.status(400).json({ message: "Offer not found" });

    const leads = await leadModel.find().sort({ created_at: -1 });
    if (!leads.length) return res.status(400).json({ message: "No leads uploaded" });

    // clear previous scores for this offer
    await scoreModel.deleteMany({ offer: offer._id });

    // calculate AI results for all leads
    let aiResults = await aiScorer.getScore(leads, offer);

    // Normalize AI results: extract name, intent, reason (handle _doc structure)
    aiResults = aiResults.map((a) => ({
      name: a.name || a._doc?.name,
      ai_intent: a.ai_intent,
      ai_reason: a.ai_reason,
    }));

    // Remove duplicates by lead name (keep first occurrence)
    const seen = new Set();
    aiResults = aiResults.filter((a) => {
      const nameKey = a.name?.trim().toLowerCase();
      if (!nameKey || seen.has(nameKey)) return false;
      seen.add(nameKey);
      return true;
    });

    for (const lead of leads) {
      // match AI result by normalized name
      const aiData = aiResults.find(
        (a) => a.name?.trim().toLowerCase() === lead.name?.trim().toLowerCase()
      );

      const aiIntent = aiData?.ai_intent || "Low";
      const aiReason = aiData?.ai_reason || "No AI response";

      // calculate AI points
      let aiPoints = 10;
      if (aiIntent.toLowerCase() === "high") aiPoints = 50;
      else if (aiIntent.toLowerCase() === "medium") aiPoints = 30;

      // calculate rule-based score
      const { ruleScore = 0 } = ruleScorer.calculateScore(lead, offer) || {};

      // final score = AI points + ruleScore
      const finalScore = aiPoints + ruleScore;

      // determine final intent based on combined score
      const finalIntent =
        finalScore >= 70 ? "High" : finalScore >= 40 ? "Medium" : "Low";

      // save score record
      await scoreModel.create({
        lead: lead._id,
        offer: offer._id,
        ai_points: aiPoints,
        ai_intent: aiIntent,
        final_score: finalScore,
        final_intent: finalIntent,
        ai_reasoning: aiReason, // only AI reasoning
      });
    }

    return res.status(200).json({ message: "Scoring completed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Scoring failed" });
  }
}

// get scores for an offer
async function getResults(req, res) {
  try {
    const { offer_id } = req.body;
    if (!offer_id)
      return res.status(400).json({ message: "offer_id is required" });

    const scores = await scoreModel
      .find({ offer: offer_id })
      .populate("lead", "name role company")
      .sort({ created_at: -1 });

    if (!scores.length) return res.status(400).json({ message: "No scores found" });

    const results = scores.map((s) => ({
      name: s.lead?.name || "Unknown",
      role: s.lead?.role || "N/A",
      company: s.lead?.company || "N/A",
      intent: s.final_intent,
      score: s.final_score,
      reasoning: s.ai_reasoning, // only AI reasoning
    }));

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch results" });
  }
}

module.exports = {
  runScoring,
  getResults,
};
