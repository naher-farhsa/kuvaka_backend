// importing modules
const csv = require('csv-parser');
const stream = require('stream');

// importing leads model
const leadModel = require('../models/lead.model');

// upload leads via csv
async function uploadLeads(req, res) {
  try {
    if (!req.file)
      return res.status(400).json({ message: "CSV file is required" });

    if (req.file.mimetype !== 'text/csv')
      return res.status(400).json({ message: "Invalid file format" });

    const leads = [];

    // Convert buffer to readable stream
    const readableFile = new stream.Readable();
    readableFile.push(req.file.buffer);
    readableFile.push(null);

    // parse csv and store leads
    readableFile
      .pipe(csv())
      .on('data', (row) => leads.push(row))
      .on('end', async () => {
        await leadModel.insertMany(leads);
        return res.status(200).json({ message: "Leads uploaded", count: leads.length });
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to upload leads" });
  }
}

// delete all leads
async function deleteAllLeads(req, res) {
  try {
    await leadModel.deleteMany({});
    return res.status(200).json({ message: "All leads deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete leads" });
  }
}

// get all leads
async function getLeads(req, res) {
  try {
    const leads = await leadModel.find();
    return res.status(200).json(leads);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch leads" });
  }
}
module.exports = {
  uploadLeads,
  deleteAllLeads,
  getLeads,
};
