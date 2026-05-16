
// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//   memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
//   amount: { type: Number, required: true },
//   paymentDate: { type: Date, default: Date.now },
//   paymentForMonths: { type: Number, required: true },
//   transactionId: { type: String, unique: true },
//   paymentMethod: { type: String, enum: ['cash', 'card', 'online'], required: true },
//   receiptNumber: { type: String, unique: true },
//   notes: String,
//   processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
// });

// module.exports = mongoose.model('Payment', paymentSchema);

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentForMonths: { type: Number, required: true },
  transactionId: { type: String, unique: true, sparse: true }, // Added sparse: true to allow null for cash payments
  paymentMethod: { type: String, enum: ['cash', 'card', 'online', 'upi'], required: true }, // Added 'upi'
  receiptNumber: { type: String, unique: true },
  notes: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

module.exports = mongoose.model('Payment', paymentSchema);