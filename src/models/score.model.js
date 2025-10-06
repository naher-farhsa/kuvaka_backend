const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'leads', required: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'offers', required: true },
  rule_score: { type: Number, default: 0 },
  ai_intent: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  ai_reasoning: { type: String },
  final_score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

const scoreModel=mongoose.model('scores', scoreSchema);
module.exports = scoreModel;
