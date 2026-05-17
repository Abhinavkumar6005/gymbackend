// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const cookieParser = require('cookie-parser');
// const multer = require('multer');
// const path = require('path');

// dotenv.config();

// const app = express();
// const upload = multer({ 
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });
// app.use((req, res, next) => {
//   console.log(`📨 ${req.method} ${req.url}`);
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cookie');
//   res.header('Access-Control-Allow-Credentials', 'true');

//   if (req.method === 'OPTIONS') {
//     console.log('✅ Preflight OPTIONS request handled');
//     return res.sendStatus(200);
//   }
//   next();
// });
// app.use(upload.any()); // This handles multipart/form-data

// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// // Add these at the TOP of your routes (after app = express())

// // Root route - handles GET requests to /
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Ironforge Gym API is running! 🏋️',
//     status: 'active',
//     timestamp: new Date().toISOString()
//   });
// });

// // HEAD route - Render uses this for health checks
// app.head('/', (req, res) => {
//   res.status(200).end();
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'healthy',
//     uptime: process.uptime(),
//     timestamp: new Date().toISOString()
//   });
// });

// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/plans', require('./routes/plans'));
// app.use('/api/members', require('./routes/members'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/trainers', require('./routes/trainers.js'));

// app.use((req, res) => {
//   console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
//   res.status(404).json({ error: 'Route not found' });
// });

// app.use((err, req, res, next) => {
//   console.error(`🔥 Error: ${err.message}`);
//   res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
// });

// mongoose.connect(process.env.MONGODB_URI )
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB error:', err.message));

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ALLOWED ORIGINS - Add your Vercel frontend URLs here
const allowedOrigins = [
  'http://localhost:3000',
  'https://gymfrontend.vercel.app',
  'https://gymfrontend-3h7cs8e9a-abhinav-kumars-projects-5d899f3e.vercel.app',
  'https://gymbackend-bt9z.onrender.com/'
];

// CORS middleware - UPDATED VERSION
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if the origin is allowed
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight OPTIONS request handled');
    return res.sendStatus(200);
  }
  
  console.log(`📨 ${req.method} ${req.url} from ${origin || 'unknown'}`);
  next();
});

app.use(upload.any()); // This handles multipart/form-data

// Updated CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route - handles GET requests to /
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ironforge Gym API is running! 🏋️',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// HEAD route - Render uses this for health checks
app.head('/', (req, res) => {
  res.status(200).end();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/members', require('./routes/members'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/trainers', require('./routes/trainers.js'));

app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(`🔥 Error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));