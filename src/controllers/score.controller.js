//import models and services
const ruleScorer = require("../services/ruleScorer.service");
const aiScorer = require("../services/aiScorer.service");
const offerModel = require("../models/offer.model");
const leadModel = require("../models/lead.model");  
const scoreModel = require("../models/score.model");

// run scoring algorithm
async function runScoring(req, res) {
  try {
    // fetch latest offer and all leads
    const offer = await offerModel.findOne().sort({create_at:-1});
    if (!offer) return res.status(400).json({ message: "Offer not set" });

    const leads = await leadModel.find({offer:offer._id});
    if (!leads.length) return res.status(400).json({ message: "No leads uploaded" });

     // clear previous scores for same offer
    await scoreModel.deleteMany({ lead: { $in: leads.map(l => l._id) } });

     // batch process leads scoring - avoidai api overload error
    for (const lead of leads) {
      const { ruleScore, reasoning: ruleReason } = ruleScorer.calculateScore(lead, offer);
      const { aiPoints, aiReason } = await aiScorer.getScore(lead, offer);
      const finalScore = ruleScore + aiPoints;
      const ai_intent =
        finalScore >= 70 ? "High" : finalScore >= 40 ? "Medium" : "Low";

      await scoreModel.create({
        lead: lead._id,
        rule_score: ruleScore,
        ai_intent,
        ai_reasoning: `${ruleReason} and ${aiReason}`,
        final_score: finalScore,
      });

      // optional delay (1s between API calls)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return res.status(200).json({ message: "Scoring completed"});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Scoring failed" });
  }
}

// get scoring results
async function getResults(req, res) {
  try {
    
    // fetch all scores with lead details
    const scores = await scoreModel.find().populate("lead", "name role company").sort({ created_at: -1 });
    
    if (!scores.length)return res.status(400).json({ message: "No scores found" });  

    const results = scores.map((s) => ({
      name: s.lead.name,
      role: s.lead.role,
      company: s.lead.company,
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
