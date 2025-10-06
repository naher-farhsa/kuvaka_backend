//importing express library
const express = require('express');

//creating router instance
const router = express.Router();

//importing offer controller 
const offerController = require('../controllers/offer.controller');

//post route mapping - create offer
router.post('/', offerController.createOffer);
//get route mapping - get latest offer
router.get('/latest', offerController.getOffer);
//delete route mapping - delete all offers
router.delete('/delete', offerController.deleteAllOffer);

module.exports = router;
