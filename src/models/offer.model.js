const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value_props: { type: [String], default: [] },
  ideal_use_cases: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
});

const offerModel=mongoose.model('Offer', offerSchema);

module.exports=offerModel;