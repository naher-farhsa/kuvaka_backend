const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  company: { type: String },
  industry: { type: String },
  location: { type: String },
  linkedin_bio: { type: String },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  created_at: { type: Date, default: Date.now },
});

const leadModel=mongoose.model('leads', leadSchema);
module.exports=leadModel;
    