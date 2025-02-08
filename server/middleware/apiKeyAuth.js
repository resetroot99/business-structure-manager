/**
 * Business Structure Manager™
 * Copyright © 2024 [Your Name/Company Name]
 */

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  next();
};

module.exports = apiKeyAuth; 