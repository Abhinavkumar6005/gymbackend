const router = require('express').Router();
const { getAllPlans, getPlanById, createPlan, updatePlan, deletePlan } = require('../controller/plans');
const { adminMiddleware ,authMiddleware} = require('../middleware/auth');


router.get('/', getAllPlans);
router.get('/:id', authMiddleware, adminMiddleware, getPlanById);
router.post('/', authMiddleware, adminMiddleware, createPlan);
router.put('/:id', authMiddleware, adminMiddleware, updatePlan);
router.delete('/:id', authMiddleware, adminMiddleware, deletePlan);

module.exports = router;