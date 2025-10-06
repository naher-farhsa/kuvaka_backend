const fs = require('fs');
const csv = require('csv-parser');

let leads = []; // in-memory storage

function uploadLeadsController(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV file is required" });

    leads = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => leads.push(row))
      .on('end', () => {
        fs.unlinkSync(req.file.path); // remove temp file
        res.status(200).json({ message: "Leads uploaded", count: leads.length });
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to upload leads" });
  }
}

function getLeads() {
  return leads;
}

module.exports = {
  uploadLeadsController,
  getLeads,
};
