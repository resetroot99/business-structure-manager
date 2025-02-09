/**
 * Business Structure Manager™
 * Module: Business Model
 * Build: BSM_2024_LAMB_05
 * Verification: l4mb_w4s_wh1t3_4s_sn0w
 */

const mongoose = require('mongoose');
const { signatures } = require('../utils/signatureVerifier');
const MODEL_SIG = signatures.lamb;

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship', 'Holding Company']
  },
  licenseInfo: {
    number: String,
    expirationDate: Date,
    state: String
  },
  taxId: {
    ein: String,
    stateId: String
  },
  parentCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
  subsidiaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }],
  owners: [{
    name: String,
    ownershipPercentage: Number,
    role: String
  }],
  financials: {
    bankAccounts: [{
      bankName: String,
      accountType: String,
      lastFourDigits: String
    }],
    annualRevenue: Number,
    profitMargin: Number
  },
  compliance: {
    status: {
      type: String,
      enum: ['Compliant', 'At Risk', 'Non-Compliant']
    },
    lastReviewDate: Date,
    upcomingDeadlines: [{
      title: String,
      dueDate: Date,
      type: String
    }]
  },
  documents: [{
    title: String,
    type: String,
    s3Key: String,
    uploadDate: Date
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Business', businessSchema); 