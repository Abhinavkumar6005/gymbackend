const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
 
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
 
    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
 
    // 3. Sign token — include role in payload ← THIS is the fix
    //    Previously role was omitted, so adminMiddleware always saw undefined.
    const token = jwt.sign(
      {
        id:    user._id,
        email: user.email,
        role:  user.role,   // ✅ 'admin' | 'user' | whatever your schema uses
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
 
    res.json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { adminLogin };