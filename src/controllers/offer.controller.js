//importing offer model
const offerModel=require('../models/offer.model')

// create a new offer
async function createOffer(req, res) {
  try {
    const { name, value_props, ideal_use_cases } = req.body;

    // all fields required
    if (!name || !value_props || !ideal_use_cases) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // offer must be unique by name
    const existing = await offerModel.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Offer already exists" });
    }
    
    // save offer to db
    const offer = await offerModel.create({ name, value_props, ideal_use_cases });

    return res.status(201).json({ message: "Offer saved", offer });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create offer" });
  }
}
// delete all offer
async function deleteAllOffer(req,res){
  try{
    await offerModel.deleteMany({});
    return res.status(200).json({message:"All offers deleted"});
  }catch(err){
    console.error(err);
    return res.status(500).json({message:"Failed to delete offers"});
  }
}
// get latest offer
async function getOffer() {
  return await offerModel.findOne().sort({ created_at: -1 }); 
}

module.exports = {
  createOffer,
  deleteAllOffer,
  getOffer,
};
