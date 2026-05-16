const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'ak9027484@gmail.com',
        password: 'Test@123',
        role: 'admin',
        fullName: 'System Administrator',
        phone: '8219438976',
        address: 'Main Office',
        isActive: true
      });
      
      await admin.save();
      console.log('\n✅ Admin user created successfully!');
      console.log('📧 Email: ak9027484@gmail.com');
      console.log('🔑 Password: Test@123');
      console.log('👤 Role: Admin\n');
    } else {
      console.log('\n⚠️ Admin user already exists!');
      console.log('📧 Email: ak9027484@gmail.com');
      console.log('🔑 Password: Test@123\n');
    }
    
    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();