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
  } else if (
    role.includes("manager") ||
    role.includes("lead") ||
    role.includes("principal") ||
    role.includes("architect") ||
    role.includes("specialist") ||
    role.includes("consultant") ||
    role.includes("engineer") ||
    role.includes("analyst")
  ) {
    score += 10;
  }

  const leadIndustry = lead.industry?.toLowerCase() || "";
  const offerUseCases = offer.ideal_use_cases || [];

  if (leadIndustry && offerUseCases.length > 0) {
    const exactMatch = offerUseCases.some((uc) =>
      uc.toLowerCase().includes(leadIndustry)
    );
    if (exactMatch) score += 20;
    else if (
      leadIndustry.includes("tech") &&
      offerUseCases.some((uc) => uc.toLowerCase().includes("software"))
    )
      score += 10;
  }

  const requiredFields = ["name", "role", "company", "industry", "location", "linkedin_bio"];
  const hasAllFields = requiredFields.every((f) => lead[f]);
  if (hasAllFields) score += 10;

  return { ruleScore: score }; 
}

module.exports = { calculateScore };
