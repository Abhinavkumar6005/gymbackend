const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Member = require('../models/Member');

// ─── Razorpay Instance (lazy) ────────────────────────────────────────────────
// ✅ Created inside a getter so it's only instantiated when a route is called,
//    not at require() time — avoids crash when env vars aren't loaded yet.

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─── STEP 1: Create Razorpay Order ───────────────────────────────────────────
// Frontend calls this first to get an order_id, then opens the Razorpay modal.

const createOrder = async (req, res) => {
  try {
    const { memberId, amount, paymentForMonths, paymentMethod } = req.body;

    if (!memberId || !amount ) {
      return res.status(400).json({ error: 'memberId, amount  are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const order = await getRazorpay().orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      notes: {
        memberId:        memberId.toString(),
        memberName:      member.name,
        paymentForMonths: paymentForMonths.toString() || '0',
        paymentMethod:   paymentMethod || 'online',
      },
    });

    res.status(201).json({
      orderId:       order.id,          // send this to frontend → Razorpay modal
      amount:        order.amount,      // in paise
      currency:      order.currency,
      receipt:       order.receipt,
      keyId:         process.env.RAZORPAY_KEY_ID, // frontend needs this to init modal
      memberName:    member.name,
      memberEmail:   member.email,
      memberPhone:   member.phone,
    });
  } catch (error) {
    console.error('❌ createOrder error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─── STEP 2: Verify Payment & Save to DB ─────────────────────────────────────
// Frontend calls this after the Razorpay modal succeeds, with the 3 Razorpay IDs.
// We verify the signature to ensure the payment wasn't tampered with.

const verifyAndProcessPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      memberId,
      amount,
      paymentForMonths,
      paymentMethod,
    } = req.body;

    // ── Signature verification ──────────────────────────────────────────────
    // Razorpay signs: order_id + "|" + payment_id using your key_secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // ── Signature valid — save payment record ───────────────────────────────
    const payment = new Payment({
      memberId,
      amount,
      paymentForMonths,
      paymentMethod:      paymentMethod || 'online',
      transactionId:      razorpay_payment_id,           // Razorpay payment ID
      razorpayOrderId:    razorpay_order_id,
      razorpaySignature:  razorpay_signature,
      receiptNumber:      `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status:             'completed',
    });
    await payment.save();

    // ── Update member's membership end date & status ────────────────────────
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const newEndDate = new Date(member.membershipEnd);
    newEndDate.setMonth(newEndDate.getMonth() + Number(paymentForMonths));
    member.membershipEnd = newEndDate;
    member.status        = 'active';
    member.remainingAmount = Math.max(0, (member.remainingAmount || 0) - amount);
    member.amountPaid    = (member.amountPaid || 0) + amount;
    member.payments.push(payment._id);
    await member.save();

    res.status(201).json({
      success:       true,
      payment,
      member,
      receiptNumber: payment.receiptNumber,
    });
  } catch (error) {
    console.error('❌ verifyAndProcessPayment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─── STEP 2 (alt): Handle Razorpay Webhook ───────────────────────────────────
// Optional but recommended — Razorpay calls this server-to-server on payment events.
// Handles cases where the user closes the browser before verifyAndProcessPayment runs.

const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature     = req.headers['x-razorpay-signature'];

    // Verify webhook authenticity
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event   = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (event === 'payment.captured') {
      // Check if we already processed this payment (idempotency)
      const existing = await Payment.findOne({ transactionId: payload.id });
      if (!existing) {
        console.log(`⚠️  Webhook: payment ${payload.id} not in DB yet — consider processing here`);
        // You can duplicate the verifyAndProcessPayment logic here if needed
      }
    }

    if (event === 'payment.failed') {
      console.error(`❌ Webhook: payment failed for order ${payload.order_id}`);
      // Optionally save a failed payment record or notify the member
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─── Existing helpers (unchanged) ────────────────────────────────────────────

const getMemberPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ memberId: req.params.memberId })
      .sort({ createdAt: -1 }); // newest first
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({ receiptNumber: req.params.receiptNumber })
      .populate('memberId');
    if (!payment) return res.status(404).json({ error: 'Receipt not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Cash / Manual Payment (kept from original processPayment) ────────────────
// Used when admin records a cash or offline payment without Razorpay.

const processManualPayment = async (req, res) => {
  try {
    const { memberId, amount, paymentForMonths, paymentMethod } = req.body;

    if (!memberId || !amount || !paymentForMonths) {
      return res.status(400).json({ error: 'memberId, amount and paymentForMonths are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const payment = new Payment({
      memberId,
      amount,
      paymentForMonths,
      paymentMethod: paymentMethod || 'cash',
      transactionId: uuidv4(),
      receiptNumber: `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'completed',
    });
    await payment.save();

    const newEndDate = new Date(member.membershipEnd);
    newEndDate.setMonth(newEndDate.getMonth() + Number(paymentForMonths));
    member.membershipEnd   = newEndDate;
    member.status          = 'active';
    member.remainingAmount = Math.max(0, (member.remainingAmount || 0) - amount);
    member.amountPaid      = (member.amountPaid || 0) + amount;
    member.payments.push(payment._id);
    await member.save();

    res.status(201).json({ payment, member, receiptNumber: payment.receiptNumber });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Add this to your payments API route file

// const deletePayment = async (req, res) => {
//   try {
//     const { paymentId } = req.params;
//     const { memberId, reason } = req.body;

//     if (!paymentId || !memberId) {
//       return res.status(400).json({ error: 'paymentId and memberId are required' });
//     }

//     // Find the payment
//     const payment = await Payment.findById(paymentId);
//     if (!payment) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     // Check if payment is already deleted
//     if (payment.status === 'deleted') {
//       return res.status(400).json({ error: 'Payment already deleted' });
//     }

//     // Find the member
//     const member = await Member.findById(memberId);
//     if (!member) {
//       return res.status(404).json({ error: 'Member not found' });
//     }

//     // Revert member's details
//     // Subtract the months from membership end date
//     const newEndDate = new Date(member.membershipEnd);
//     newEndDate.setMonth(newEndDate.getMonth() - payment.paymentForMonths);
//     member.membershipEnd = newEndDate;

//     // Add back the amount to remaining amount
//     member.remainingAmount = (member.remainingAmount || 0) + payment.amount;
    
//     // Subtract from amount paid
//     member.amountPaid = Math.max(0, (member.amountPaid || 0) - payment.amount);

//     // Remove payment ID from member's payments array
//     member.payments = member.payments.filter(id => id.toString() !== paymentId);

//     // Update member status if membership has expired
//     if (newEndDate < new Date()) {
//       member.status = 'expired';
//     }

//     await member.save();

//     // Mark payment as deleted instead of removing it (for audit trail)
//     payment.status = 'deleted';
//     payment.deletedReason = reason || 'Created by mistake';
//     payment.deletedAt = new Date();
//     await payment.save();

//     res.status(200).json({ 
//       message: 'Payment deleted successfully', 
//       payment,
//       member 
//     });
//   } catch (error) {
//     console.error('Delete payment error:', error);
//     res.status(500).json({ error: error.message });
//   }
// };
const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { memberId, reason } = req.body;

    if (!paymentId || !memberId) {
      return res.status(400).json({ error: 'paymentId and memberId are required' });
    }

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if payment is already deleted
    if (payment.status === 'deleted') {
      return res.status(400).json({ error: 'Payment already deleted' });
    }

    // Find the member
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Revert member's details
    // Subtract the months from membership end date
    const newEndDate = new Date(member.membershipEnd);
    newEndDate.setMonth(newEndDate.getMonth() - payment.paymentForMonths);
    member.membershipEnd = newEndDate;

    // Add back the amount to remaining amount
    member.remainingAmount = (member.remainingAmount || 0) + payment.amount;
    
    // Subtract from amount paid
    member.amountPaid = Math.max(0, (member.amountPaid || 0) - payment.amount);

    // Remove payment ID from member's payments array
    member.payments = member.payments.filter(id => id.toString() !== paymentId);

    // Update member status if membership has expired
    if (newEndDate < new Date()) {
      member.status = 'expired';
    } else {
      member.status = 'active';
    }

    await member.save();

    // COMPLETELY DELETE the payment from database (hard delete)
    await Payment.findByIdAndDelete(paymentId);

    res.status(200).json({ 
      message: 'Payment deleted successfully', 
      paymentId: paymentId,
      member 
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  createOrder,
  verifyAndProcessPayment,
  razorpayWebhook,
  getMemberPayments,
  getReceipt,
  processManualPayment,
  deletePayment
};