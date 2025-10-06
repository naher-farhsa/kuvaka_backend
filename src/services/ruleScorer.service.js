/**
 * Rule-based scoring (max 50 points)
 * Criteria:
 *  - Role relevance: decision maker (+20), influencer (+10)
 *  - Industry match: exact ICP (+20), adjacent (+10)
 *  - Data completeness: all fields present (+10)
 */

// rule-based scoring
function calculateScore(lead, offer) {
  let score = 0;
  let reasoning = [];

  // role relevance (+20, +10, +0)
  const role = lead.role?.toLowerCase() || "";
  if (
    role.includes("ceo") ||
    role.includes("cto") ||
    role.includes("cmo") ||
    role.includes("founder") ||
    role.includes("co-founder") ||
    role.includes("head") ||
    role.includes("director") ||
    role.includes("vp")
  ) {
    score += 20;
    reasoning.push("Decision maker role (+20)"); // role - decision maker
  } else if (role.includes("manager") || role.includes("lead")) {
    score += 10;
    reasoning.push("Influencer role (+10)"); // role - influencer
  } else {
    reasoning.push("Limited decision influence (+0)"); // role - non-influential
  }

  // industry match (+20, +10, +0)
  const leadIndustry = lead.industry?.toLowerCase() || "";
  const offerUseCase = offer.ideal_use_cases?.toLowerCase() || "";

  if (leadIndustry && offerUseCase) {
    if (offerUseCase.includes(leadIndustry)) {
      score += 20;
      reasoning.push("Exact ICP industry match (+20)"); // industry - exact match
    } else if (
      leadIndustry.includes("tech") &&
      offerUseCase.includes("software")
    ) {
      score += 10;
      reasoning.push("Adjacent industry match (+10)"); // industry - adjacent match
    } else {
      reasoning.push("Non-ideal industry (+0)"); // industry - no match
    }
  }

  // data completeness (+10, +0)
  const requiredFields = ["name", "email", "company", "role", "industry"];
  const hasAllFields = requiredFields.every((f) => lead[f]);
  if (hasAllFields) {
    score += 10;
    reasoning.push("Complete data (+10)"); // data - complete
  } else {
    reasoning.push("Missing key info (+0)"); // data - incomplete
  }

  return {
    ruleScore: score,
    reasoning: reasoning.join("; "), // combine reasonings
  };
}
    
module.exports = { calculateScore };
