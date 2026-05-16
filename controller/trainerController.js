// const Trainer = require('../models/Trainer');

// // Get all trainers
// const getAllTrainers = async (req, res) => {
//   try {
//     const trainers = await Trainer.find({ isActive: true })
//       .sort({ rating: -1, fullName: 1 });
//     res.status(200).json({
//       success: true,
//       count: trainers.length,
//       data: trainers
//     });
//   } catch (error) {
//     console.error('Error fetching trainers:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // Get single trainer by ID
// const getTrainerById = async (req, res) => {
//   try {
//     const trainer = await Trainer.findById(req.params.id);
//     if (!trainer) {
//       return res.status(404).json({ 
//         success: false, 
//         error: 'Trainer not found' 
//       });
//     }
//     res.status(200).json({
//       success: true,
//       data: trainer
//     });
//   } catch (error) {
//     console.error('Error fetching trainer:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // Create new trainer with image upload
// const createTrainer = async (req, res) => {
//   try {
//     const {
//       fullName,
//       email,
//       phone,
//       specialization,
//       certification,
//       experience,
//       bio,
//       achievements,
//       availableDays,
//       availableTime
//     } = req.body;

//     // Check if trainer already exists
//     const existingTrainer = await Trainer.findOne({ email });
//     if (existingTrainer) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Trainer with this email already exists' 
//       });
//     }

//     // Handle image upload
//     let photoUrl = null;
//     if (req.file) {
//       photoUrl = `/uploads/trainers/${req.file.filename}`;
//     }

//     // Parse achievements if sent as string
//     let parsedAchievements = achievements;
//     if (typeof achievements === 'string') {
//       parsedAchievements = achievements.split(',').filter(a => a.trim());
//     }

//     // Parse availableDays if sent as string
//     let parsedAvailableDays = availableDays;
//     if (typeof availableDays === 'string') {
//       parsedAvailableDays = availableDays.split(',').filter(d => d.trim());
//     }

//     // Parse availableTime if sent as string
//     let parsedAvailableTime = availableTime;
//     if (typeof availableTime === 'string') {
//       parsedAvailableTime = JSON.parse(availableTime);
//     }

//     const trainer = new Trainer({
//       fullName,
//       email,
//       phone,
//       specialization,
//       certification,
//       experience: Number(experience),
//       photo: photoUrl,
//       bio,
//       achievements: parsedAchievements || [],
//       availableDays: parsedAvailableDays || [],
//       availableTime: parsedAvailableTime || { start: '09:00', end: '18:00' }
//     });

//     await trainer.save();

//     res.status(201).json({
//       success: true,
//       message: 'Trainer created successfully',
//       data: trainer
//     });
//   } catch (error) {
//     console.error('Error creating trainer:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // Update trainer with image upload
// const updateTrainer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body, updatedAt: Date.now() };

//     // Handle image upload
//     if (req.file) {
//       updateData.photo = `/uploads/trainers/${req.file.filename}`;
//     }

//     // Parse achievements if sent as string
//     if (updateData.achievements && typeof updateData.achievements === 'string') {
//       updateData.achievements = updateData.achievements.split(',').filter(a => a.trim());
//     }

//     // Parse availableDays if sent as string
//     if (updateData.availableDays && typeof updateData.availableDays === 'string') {
//       updateData.availableDays = updateData.availableDays.split(',').filter(d => d.trim());
//     }

//     // Parse availableTime if sent as string
//     if (updateData.availableTime && typeof updateData.availableTime === 'string') {
//       updateData.availableTime = JSON.parse(updateData.availableTime);
//     }

//     // Convert experience to number
//     if (updateData.experience) {
//       updateData.experience = Number(updateData.experience);
//     }

//     const trainer = await Trainer.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );
    
//     if (!trainer) {
//       return res.status(404).json({ 
//         success: false, 
//         error: 'Trainer not found' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Trainer updated successfully',
//       data: trainer
//     });
//   } catch (error) {
//     console.error('Error updating trainer:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // Delete trainer (soft delete)
// const deleteTrainer = async (req, res) => {
//   try {
//     const trainer = await Trainer.findByIdAndUpdate(
//       req.params.id,
//       { isActive: false, updatedAt: Date.now() },
//       { new: true }
//     );
    
//     if (!trainer) {
//       return res.status(404).json({ 
//         success: false, 
//         error: 'Trainer not found' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Trainer deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting trainer:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // Get trainers by specialization
// const getTrainersBySpecialization = async (req, res) => {
//   try {
//     const { specialization } = req.params;
//     const trainers = await Trainer.find({ 
//       specialization, 
//       isActive: true 
//     }).sort({ rating: -1 });
    
//     res.status(200).json({
//       success: true,
//       count: trainers.length,
//       data: trainers
//     });
//   } catch (error) {
//     console.error('Error fetching trainers by specialization:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // Update trainer rating
// const updateTrainerRating = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { rating } = req.body;
    
//     const trainer = await Trainer.findByIdAndUpdate(
//       id,
//       { rating, updatedAt: Date.now() },
//       { new: true }
//     );
    
//     if (!trainer) {
//       return res.status(404).json({ 
//         success: false, 
//         error: 'Trainer not found' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Trainer rating updated',
//       data: trainer
//     });
//   } catch (error) {
//     console.error('Error updating trainer rating:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// module.exports = {
//   getAllTrainers,
//   getTrainerById,
//   createTrainer,
//   updateTrainer,
//   deleteTrainer,
//   getTrainersBySpecialization,
//   updateTrainerRating
// };


const Trainer = require('../models/Trainer');
const path = require('path');
const fs = require('fs');
// Get all trainers
const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({ isActive: true })
      .sort({ rating: -1, fullName: 1 });
    res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers
    });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get single trainer by ID
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Trainer not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    console.error('Error fetching trainer:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Create new trainer with image upload
const createTrainer = async (req, res) => {
  try {
    console.log('📥 Received create trainer request');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    // Handle FormData - fields might be strings or objects
    let {
      fullName,
      email,
      phone,
      specialization,
      certification,
      experience,
      bio,
      achievements,
      availableDays,
      availableTime
    } = req.body;

    // Check if we have the required fields
    if (!fullName || !email || !phone) {
      console.error('Missing required fields:', { fullName, email, phone });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: fullName, email, and phone are required' 
      });
    }

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Trainer with this email already exists' 
      });
    }

    // Handle image upload
    let photoUrl = null;
    if (req.file) {
      // Save file to disk
      const fs = require('fs');
      const uploadDir = 'uploads/trainers';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `trainer-${uniqueSuffix}${path.extname(req.file.originalname)}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, req.file.buffer);
      photoUrl = `/uploads/trainers/${filename}`;
    }

    // Parse JSON strings if they are strings
    if (achievements && typeof achievements === 'string') {
      achievements = JSON.parse(achievements);
    }
    if (availableDays && typeof availableDays === 'string') {
      availableDays = JSON.parse(availableDays);
    }
    if (availableTime && typeof availableTime === 'string') {
      availableTime = JSON.parse(availableTime);
    }

    const trainer = new Trainer({
      fullName,
      email,
      phone,
      specialization: specialization || 'Strength Training',
      certification: certification || '',
      experience: Number(experience) || 0,
      photo: photoUrl,
      bio: bio || '',
      achievements: achievements || [],
      availableDays: availableDays || [],
      availableTime: availableTime || { start: '09:00', end: '18:00' }
    });

    await trainer.save();

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: trainer
    });
  } catch (error) {
    console.error('❌ Error creating trainer:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update trainer with image upload
const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: Date.now() };

    // Handle image upload
    if (req.file) {
      const fs = require('fs');
      const uploadDir = 'uploads/trainers';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `trainer-${uniqueSuffix}${path.extname(req.file.originalname)}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, req.file.buffer);
      updateData.photo = `/uploads/trainers/${filename}`;
    }

    // Parse JSON strings if they are strings
    if (updateData.achievements && typeof updateData.achievements === 'string') {
      updateData.achievements = JSON.parse(updateData.achievements);
    }
    if (updateData.availableDays && typeof updateData.availableDays === 'string') {
      updateData.availableDays = JSON.parse(updateData.availableDays);
    }
    if (updateData.availableTime && typeof updateData.availableTime === 'string') {
      updateData.availableTime = JSON.parse(updateData.availableTime);
    }

    // Convert experience to number
    if (updateData.experience) {
      updateData.experience = Number(updateData.experience);
    }

    const trainer = await Trainer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!trainer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Trainer not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainer
    });
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete trainer (soft delete)
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!trainer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Trainer not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trainer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get trainers by specialization
const getTrainersBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const trainers = await Trainer.find({ 
      specialization, 
      isActive: true 
    }).sort({ rating: -1 });
    
    res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers
    });
  } catch (error) {
    console.error('Error fetching trainers by specialization:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update trainer rating
const updateTrainerRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    const trainer = await Trainer.findByIdAndUpdate(
      id,
      { rating, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!trainer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Trainer not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trainer rating updated',
      data: trainer
    });
  } catch (error) {
    console.error('Error updating trainer rating:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getTrainersBySpecialization,
  updateTrainerRating
};