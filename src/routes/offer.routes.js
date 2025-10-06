//importing express library
const express = require('express');

//creating router instance
const router = express.Router();

//importing offer controller 
const offerController = require('../controllers/offer.controller')

//post route mapping - create offer
router.post('/', offerController.createOffer);

module.exports = router;
