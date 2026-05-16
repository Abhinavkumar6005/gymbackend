const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: String,
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  membershipStart: { type: Date, required: true },
  membershipEnd: { type: Date, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'expired', 'suspended', 'cancelled', 'pending'], default: 'active' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  amountPaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  // Explicitly define indexes
  indexes: [
    { email: 1 }, // Keep email unique index
    // Remove any username index
  ]
});

// Drop any existing username index when the app starts (one-time)
if (process.env.NODE_ENV === 'development') {
  const conn = mongoose.connection;
  conn.once('open', async () => {
    try {
      await conn.db.collection('members').dropIndex('username_1');
      console.log('Dropped old username index');
    } catch (err) {
      // Index doesn't exist, ignore error
    }
  });
}

module.exports = mongoose.model('Member', memberSchema);