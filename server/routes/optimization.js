const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const auth = require('../middleware/auth');

// Get optimization suggestions for a business structure
router.get('/suggestions/:businessId', auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId)
      .populate('subsidiaries')
      .populate('parentCompany');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Generate structure optimization suggestions
    const suggestions = await generateStructureSuggestions(business);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get compliance recommendations
router.get('/compliance/:businessId', auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    
    const complianceChecks = {
      licenseStatus: checkLicenseStatus(business.licenseInfo),
      taxCompliance: checkTaxCompliance(business.taxId),
      documentationStatus: checkDocumentation(business.documents),
      recommendations: []
    };

    res.json(complianceChecks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions for generating suggestions
function generateStructureSuggestions(business) {
  const suggestions = [];

  // Check for holding company opportunity
  if (!business.parentCompany && business.subsidiaries.length > 2) {
    suggestions.push({
      type: 'STRUCTURE',
      recommendation: 'Consider creating a holding company',
      reason: 'Multiple subsidiaries could benefit from centralized management and tax efficiency',
      steps: [
        'Form a new holding company',
        'Transfer ownership of subsidiaries',
        'Consult tax professional for optimal structure'
      ]
    });
  }

  // Check for liability exposure
  if (business.entityType === 'Sole Proprietorship' && business.financials?.annualRevenue > 100000) {
    suggestions.push({
      type: 'LEGAL',
      recommendation: 'Consider converting to LLC',
      reason: 'Higher revenue increases liability exposure',
      steps: [
        'File LLC formation documents',
        'Obtain new EIN',
        'Update licenses and permits'
      ]
    });
  }

  return suggestions;
}

function checkLicenseStatus(licenseInfo) {
  if (!licenseInfo?.expirationDate) {
    return {
      status: 'UNKNOWN',
      message: 'License information not provided'
    };
  }

  const daysUntilExpiration = Math.ceil(
    (new Date(licenseInfo.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) {
    return {
      status: 'EXPIRED',
      message: 'License has expired',
      action: 'Immediate renewal required'
    };
  }

  if (daysUntilExpiration < 30) {
    return {
      status: 'WARNING',
      message: `License expires in ${daysUntilExpiration} days`,
      action: 'Begin renewal process'
    };
  }

  return {
    status: 'VALID',
    message: 'License is current'
  };
}

function checkTaxCompliance(taxId) {
  return {
    status: taxId?.ein ? 'VALID' : 'INCOMPLETE',
    message: taxId?.ein ? 'Tax ID is registered' : 'Federal Tax ID (EIN) missing',
    recommendations: [
      'Ensure quarterly tax payments are current',
      'Maintain accurate financial records',
      'Schedule annual tax review'
    ]
  };
}

function checkDocumentation(documents) {
  const requiredDocs = [
    'Formation Documents',
    'Operating Agreement',
    'EIN Documentation',
    'Business License'
  ];

  const missingDocs = requiredDocs.filter(doc => 
    !documents?.some(d => d.title.toLowerCase().includes(doc.toLowerCase()))
  );

  return {
    status: missingDocs.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
    missingDocuments: missingDocs,
    recommendations: missingDocs.map(doc => `Upload ${doc}`)
  };
}

module.exports = router; 