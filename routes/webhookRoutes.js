const express = require('express');
const router = express.Router();
const { stripeWebhook } = require('../controller/paymentController');

// Webhook needs raw body, so it's separate
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;