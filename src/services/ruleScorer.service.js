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
    role.includes("cfo") ||
    role.includes("coo") ||
    role.includes("founder") ||
    role.includes("co-founder") ||
    role.includes("president") ||
    role.includes("head") ||
    role.includes("director") ||
    role.includes("vp")
  ) {
    score += 20;
    reasoning.push("Decision maker role (+20)"); // role - decision maker
  } else if (
    role.includes("manager") || 
    role.includes("lead") || 
    role.includes("principal") || 
    role.includes("architect")|| 
    role.includes("specialist") ||
    role.includes("consultant") ||
    role.includes("engineer") ||
    role.includes("analyst") 
  ) {
    score += 10;
    reasoning.push("Influencer role (+10)"); // role - influencer
  } else {
    reasoning.push("Limited decision influence (+0)"); // role - non-influential
  }

  // industry match (+20, +10, +0)
  const leadIndustry = lead.industry?.toLowerCase() || "";
  const offerUseCases = offer.ideal_use_cases || [];

if (leadIndustry && offerUseCases.length > 0) {
  // exact match if any use case includes the industry
  const exactMatch = offerUseCases.some((uc) =>
    uc.toLowerCase().includes(leadIndustry)
  );

  if (exactMatch) {
    score += 20;
    reasoning.push("Exact ICP industry match (+20)"); // exact match
  } else if (
    leadIndustry.includes("tech") &&
    offerUseCases.some((uc) => uc.toLowerCase().includes("software"))
  ) {
    score += 10;
    reasoning.push("Adjacent industry match (+10)"); // adjacent match
  } else {
    reasoning.push("Non-ideal industry (+0)"); // no match
  }
}


  // data completeness (+10, +0)
  const requiredFields = ["name", "email", "company", "role", "industry"];
  const hasAllFields = requiredFields.every((f) => lead[f]);
  if (hasAllFields) {
    score += 10;
    reasoning.push("Complete data (+10)"); // complete data
  } else {
    reasoning.push("Missing key info (+0)"); // incomplete data
  }

  return {
    ruleScore: score,
    reasoning: reasoning.join("; "), // combine reasonings
  };
}
    
module.exports = { calculateScore };
