//importing modules
const csv = require('csv-parser');
const stream = require('stream');

//importing leads model
const leadModel=require('../models/lead.model');
const offerModel=require('../models/offer.model');

// upload leads via csv
async function uploadLeads(req, res) {
  try {
    
    //file not uploaded
    if (!req.file)
       return res.status(400).json({ message: "CSV file is required" });

    //validate file type
    if (req.file.mimetype !== 'text/csv') 
       return res.status(400).json({ message: "Invalid file format" });
    
    //get latest offer
    const offer = await offerModel.findOne().sort({ created_at: -1 });
    if(!offer)return res.status(400).json({ message: "No offers found." });

    const leads=[];
    // Convert buffer to readable stream
    const readableFile = new stream.Readable();
    readableFile.push(req.file.buffer);
    readableFile.push(null);
    
    // parse csv and store leads
    readableFile
      .pipe(csv())
      .on('data', (row) => leads.push({...row, offer:offer._id}))
      .on('end', async () => {
        await leadModel.insertMany(leads);
        return res.status(200).json({ message: "Leads uploaded", count: leads.length });
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to upload leads" });
  }
}

// get all leads for latest offer
async function getLeads() {
  const offer=await offerModel.findOne().sort({ created_at: -1 });
  if(!offer)return [];
  return await leadsModel.find({offer:offer._id}).sort({ created_at: -1 });
}

module.exports = {
  uploadLeads,
  getLeads,
};
