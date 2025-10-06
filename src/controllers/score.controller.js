//import controller and service modules
const offerController = require('./offerController');
const leadsController = require('./leadsController');
const ruleScorer = require('../services/ruleScorer');
const aiScorer = require('../services/aiScorer');

let results = []; // in-memory storage

//run scoring process
function runScoringController(req, res) {
  try {
    const offer = offerController.getOffer();
    const leads = leadsController.getLeads();

    if (!offer) return res.status(400).json({ message: "Offer not set" });
    if (!leads || leads.length === 0) return res.status(400).json({ message: "No leads uploaded" });

    results = [];

    // Iterate without async/await if AI call can be synchronous placeholder
    leads.forEach((lead) => {
      const { ruleScore, reasoning: ruleReason } = ruleScorer.calculateScore(lead, offer);
      const { aiPoints, aiReason } = aiScorer.getScore(lead, offer); // sync placeholder

      const finalScore = ruleScore + aiPoints;
      const intent = finalScore >= 70 ? 'High' : finalScore >= 40 ? 'Medium' : 'Low';

      results.push({
        name: lead.name,
        role: lead.role,
        company: lead.company,
        intent,
        score: finalScore,
        reasoning: `${ruleReason} ${aiReason}`
      });
    });

    return res.status(200).json({ message: "Scoring completed", results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Scoring failed" });
  }
}



module.exports = {
  runScoringController
};
