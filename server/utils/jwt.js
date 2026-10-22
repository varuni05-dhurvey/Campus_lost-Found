const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_campus_lost_found_2026',
    {
      expiresIn: '7d'
    }
  );
};

module.exports = { generateToken };
