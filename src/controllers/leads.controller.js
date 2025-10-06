//importing modules
const fs = require('fs');
const csv = require('csv-parser');

let leads = []; // in-memory leads storage

// upload leads via csv
function uploadLeads(req, res) {
  try {
    
    //file not uploaded
    if (!req.file)
       return res.status(400).json({ message: "CSV file is required" });

    //validate file type
    if (req.file.mimetype !== 'text/csv')
       return res.status(400).json({ message: "Invalid file format" });
    
    //parse csv and store leads
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

// get all leads
function getLeads() {
  return leads;
}

module.exports = {
  uploadLeads,
  getLeads,
};
