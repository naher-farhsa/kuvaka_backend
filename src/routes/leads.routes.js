//importing express library
const express = require('express');

//creating router instance
const router = express.Router();

//importing leads controller
const leadsController = require('../controllers/leads.controller');

//importing multer for csv file uploads
const multer = require('multer');

//configuring multer to use memory storage
const upload = multer({storage:multer.memoryStorage()});

//post route mapping - upload leads via csv
router.post('/upload', upload.single('file'), leadsController.uploadLeads);

module.exports = router;
