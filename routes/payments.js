const router = require('express').Router();
const {
  createOrder,
  verifyAndProcessPayment,
  razorpayWebhook,
  getMemberPayments,
  getReceipt,
    deletePayment,
  processManualPayment,
} = require('../controller/paymentController');

// ─── Razorpay Flow ───────────────────────────────────────────────────────────
router.post('/create-order', createOrder);
router.post('/verify', verifyAndProcessPayment);
router.post('/webhook', razorpayWebhook);

// ─── Manual / Cash ───────────────────────────────────────────────────────────
router.post('/manual', processManualPayment);

// ─── Read ────────────────────────────────────────────────────────────────────
router.get('/member/:memberId', getMemberPayments);
router.get('/receipt/:receiptNumber', getReceipt);
router.delete('/:paymentId', deletePayment);

module.exports = router;