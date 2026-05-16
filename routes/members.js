const router = require('express').Router();
const { getAllMembers, createMember, updateMember, deleteMember, getExpiringMembers } = require('../controller/memberController');
const { adminMiddleware ,authMiddleware} = require('../middleware/auth');

router.get('/', authMiddleware,adminMiddleware,getAllMembers);
router.get('/expiring',authMiddleware, adminMiddleware, getExpiringMembers);

router.post('/', authMiddleware, adminMiddleware, createMember);
router.put('/:id', authMiddleware, adminMiddleware, updateMember);
router.delete('/:id', authMiddleware, adminMiddleware, deleteMember);

module.exports = router;