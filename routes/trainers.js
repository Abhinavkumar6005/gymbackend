const express = require('express');
const router = express.Router();
const {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getTrainersBySpecialization,
  updateTrainerRating
} = require('../controller/trainerController.js');

const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes (anyone can view trainers)
router.get('/', getAllTrainers);
router.get('/:id', getTrainerById);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, createTrainer);
router.put('/:id', authMiddleware, adminMiddleware, updateTrainer);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTrainer);
router.get('/specialization/:specialization', getTrainersBySpecialization);
router.put('/:id/rating', authMiddleware, updateTrainerRating);
module.exports = router;