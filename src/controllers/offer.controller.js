const offers = []; // in-memory storage

function createOfferController(req, res) {
  try {
    const { name, value_props, ideal_use_cases } = req.body;

    // Offer already exists check
    const existingOffer = offers.find(o => o.name === name);
    if (existingOffer) {
      return res.status(400).json({ message: "Offer already exists" });
    }

    const offer = { name, value_props, ideal_use_cases };
    offers.push(offer);

    return res.status(201).json({ message: "Offer saved", offer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create offer" });
  }
}

function getOffer() {
  return offers[offers.length - 1] || null; // return latest offer
}

module.exports = {
  createOfferController,
  getOffer,
};
