const express=require('express');
const router=express.Router();
const {isAuthenticate}=require('../middleware/auth');
const { processPayment, sendStripApiKey } = require('../controllers/paymentController');

router.route('/payment/process').post(isAuthenticate,processPayment);

router.route('/stripeapikey').get(isAuthenticate,sendStripApiKey);

module.exports=router;