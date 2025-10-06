//import controllers and services
const offerController = require("./offerController");
const leadsController = require("./leadsController");
const ruleScorer = require("../services/ruleScorer");
const aiScorer = require("../services/aiScorer");

let results = []; // in-memory leads storage

// run scoring algorithm
async function runScoring(req, res) {
  try {
    // fetch latest offer and all leads
    const offer = offerController.getOffer();
    const leads = leadsController.getLeads();

    if (!offer) return res.status(400).json({ message: "Offer not set" });
    if (!leads || leads.length === 0)
      return res.status(400).json({ message: "No leads uploaded" });

    results = [];
    //rule scoring 
    for (const lead of leads) {
      const { ruleScore, reasoning: ruleReason } = ruleScorer.calculateScore(
        lead,
        offer
      );

      // ai scoring
      const { aiPoints, aiReason } = await aiScorer.getScore(lead, offer);
    
      // final score and intent
      const finalScore = ruleScore + aiPoints;
      const intent = finalScore >= 70 ? "High" : finalScore >= 40 ? "Medium" : "Low";
     
      // store result
      results.push({
        name: lead.name,
        role: lead.role,
        company: lead.company,
        intent,
        score: finalScore,
        reasoning: `${ruleReason} ${aiReason}`,
      });
    }

    return res.status(200).json({ message: "Scoring completed", results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Scoring failed" });
  }
}

// get scoring results
function getResults(req, res) {
  try {
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
