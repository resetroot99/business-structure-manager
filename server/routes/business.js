const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const auth = require('../middleware/auth');
const { uploadToS3 } = require('../utils/s3Upload');

// Get all businesses for user
router.get('/', auth, async (req, res) => {
  try {
    const businesses = await Business.find({ createdBy: req.userId })
      .populate('parentCompany', 'name')
      .populate('subsidiaries', 'name');
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new business
router.post('/', auth, async (req, res) => {
  try {
    const business = new Business({
      ...req.body,
      createdBy: req.userId
    });
    await business.save();
    res.status(201).json(business);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update business structure
router.patch('/:id/structure', auth, async (req, res) => {
  try {
    const { parentCompany } = req.body;
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (parentCompany) {
      const parent = await Business.findById(parentCompany);
      if (!parent) {
        return res.status(404).json({ message: 'Parent company not found' });
      }
      
      business.parentCompany = parentCompany;
      parent.subsidiaries.push(business._id);
      await parent.save();
    }

    await business.save();
    res.json(business);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 