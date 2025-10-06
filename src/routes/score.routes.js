//importing express library
const express = require('express');

//creating router instance
const router = express.Router();

//importing score controller
const scoreController = require('../controllers/score.controller');

//post route mapping - run scoring algorithm
router.post('/run', scoreController.runScoring);

//post route mapping - get scoring results
router.get('/results', scoreController.getResults);

module.exports = router;
