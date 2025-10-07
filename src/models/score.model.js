const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  ai_points: { type: Number },
  ai_intent: { type: String, enum: ['High', 'Medium', 'Low'] },
  ai_reasoning: { type: String },
  final_score: { type: Number, default: 0 },
  final_intent: { type: String, enum: ['High', 'Medium', 'Low'] },
  created_at: { type: Date, default: Date.now },
});

const scoreModel = mongoose.model('Score', scoreSchema);
module.exports = scoreModel;
