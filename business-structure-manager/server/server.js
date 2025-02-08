/**
 * Business Structure Manager™
 * Copyright © 2024 [Your Name/Company Name]. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Build: BSM_2024_MARY_01
 * Verification: m4ry_h4d_4_l1ttl3_l4mb
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const optimizationRoutes = require('./routes/optimization');
const { signatures } = require('./utils/signatureVerifier');
const BUILD_ID = signatures.mary;

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/optimization', optimizationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 