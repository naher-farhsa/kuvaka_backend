const ruleScorer = require("../services/ruleScorer.service");
const aiScorer = require("../services/aiScorer.service");
const offerModel = require("../models/offer.model");
const leadModel = require("../models/lead.model");
const scoreModel = require("../models/score.model");

// run scoring algorithm
async function runScoring(req, res) {
  try {
    const { offer_id } = req.body;
    if (!offer_id) return res.status(400).json({ message: "offer_id is required" });

    const offer = await offerModel.findById(offer_id);
    if (!offer) return res.status(400).json({ message: "Offer not found" });

    const leads = await leadModel.find().sort({ created_at: -1 });
    if (!leads.length) return res.status(400).json({ message: "No leads uploaded" });

    // clear previous scores for this offer
    await scoreModel.deleteMany({ offer: offer._id });

    for (const lead of leads) {
      const { ruleScore = 0, reasoning: ruleReason = "" } =
        ruleScorer.calculateScore(lead, offer) || {};

      const { aiPoints = 0, aiReason = "" } =
        (await aiScorer.getScore(lead, offer)) || {};

      let finalScore = Number(ruleScore) + Number(aiPoints);
      if (isNaN(finalScore) || !isFinite(finalScore)) finalScore = 0;

      const ai_intent =finalScore >= 70 ? "High" : finalScore >= 40 ? "Medium" : "Low";

      await scoreModel.create({
        lead: lead._id,
        offer: offer._id,
        rule_score: Number(ruleScore) || 0,
        ai_intent,
        ai_reasoning: `${ruleReason} and ${aiReason}`.trim(),
        final_score: finalScore,
      });

      // optional delay to avoid API rate limit
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return res.status(200).json({ message: "Scoring completed" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Scoring failed" });
  }
}

// get scoring results
async function getResults(req, res) {
  try {
    const { offer_id } = req.query;
    if (!offer_id) return res.status(400).json({ message: "offer_id is required" });

    const scores = await scoreModel
      .find({ offer: offer_id })
      .populate("lead", "name role company")
      .sort({ created_at: -1 });

    if (!scores.length) return res.status(400).json({ message: "No scores found" });

    const results = scores.map((s) => ({
      name: s.lead?.name || "Unknown",
      role: s.lead?.role || "N/A",
      company: s.lead?.company || "N/A",
      intent: s.ai_intent,
      score: s.final_score,
      reasoning: s.ai_reasoning,
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
