const router = require('express').Router();
const { adminLogin } = require('../controller/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/admin/login', adminLogin); 


module.exports = router;