// const mongoose = require('mongoose');

// const trainerSchema = new mongoose.Schema({
//   fullName: { 
//     type: String, 
//     required: true,
//     trim: true
//   },
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   phone: { 
//     type: String, 
//     required: true 
//   },
//   specialization: { 
//     type: String, 
//     required: true,
//     enum: ['Strength Training', 'Cardio', 'Yoga', 'CrossFit', 'Bodybuilding', 'Nutrition', 'Rehabilitation', 'HIIT', 'Zumba', 'Pilates']
//   },
//   certification: { 
//     type: String, 
//     required: true 
//   },
//   experience: { 
//     type: Number, 
//     required: true,
//     min: 0,
//     max: 50
//   },
//   photo: { 
//     type: String, 
//     default: null 
//   },
//   bio: { 
//     type: String, 
//     maxlength: 500 
//   },
//   achievements: [{ 
//     type: String 
//   }],
//   availableDays: [{
//     type: String,
//     enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
//   }],
//   availableTime: {
//     start: { type: String, default: '06:00' },
//     end: { type: String, default: '22:00' }
//   },
//   rating: { 
//     type: Number, 
//     default: 0,
//     min: 0,
//     max: 5
//   },
//   totalClients: { 
//     type: Number, 
//     default: 0 
//   },
//   isActive: { 
//     type: Boolean, 
//     default: true 
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   },
//   updatedAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// // Update timestamp on save
// trainerSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model('Trainer', trainerSchema);
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: true 
  },
  specialization: { 
    type: String, 
    required: true,
    enum: ['Strength Training', 'Cardio', 'Yoga', 'CrossFit', 'Bodybuilding', 'Nutrition', 'Rehabilitation', 'HIIT', 'Zumba', 'Pilates']
  },
  certification: { 
    type: String, 
    required: true 
  },
  experience: { 
    type: Number, 
    required: true,
    min: 0,
    max: 50
  },
  photo: { 
    type: String, 
    default: null 
  },
  bio: { 
    type: String, 
    maxlength: 500 
  },
  achievements: [{ 
    type: String 
  }],
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  availableTime: {
    start: { type: String, default: '06:00' },
    end: { type: String, default: '22:00' }
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  totalClients: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save (async/await pattern - no need for next())
trainerSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Trainer', trainerSchema);