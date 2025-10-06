const offers = []; // in-memory offer storage

// create a new offer
function createOffer(req, res) {
  try {
    const { name, value_props, ideal_use_cases } = req.body;

    // all fields required
    if (!name || !value_props || !ideal_use_cases) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // offer must be unique by name
    const existingOffer = offers.find(o => o.name === name);
    if (existingOffer) {
      return res.status(400).json({ message: "Offer already exists" });
    }
    
    // save offer
    const offer = { name, value_props, ideal_use_cases };
    offers.push(offer);

    return res.status(201).json({ message: "Offer saved", offer });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create offer" });
  }
}
// get latest offer
function getOffer() {
  return offers[offers.length - 1] || null; 
}

module.exports = {
  createOffer,
  getOffer,
};
