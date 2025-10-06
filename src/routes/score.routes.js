//importing express library
const express = require('express');

//creating router instance
const router = express.Router();

//importing score controller
const scoreController = require('../controllers/scoreController');

//post route mapping - run scoring algorithm
router.post('/score', scoreController.runScoring);

//post route mapping - get scoring results
router.get('/results', scoreController.getResults);

module.exports = router;
