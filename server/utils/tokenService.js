// server/utils/tokenService.js
const jwt = require('jsonwebtoken');
const path = require('path');

// Dynamically resolves the .env file path relative to this file's folder.
// This is fully network-safe and portable across separate operating systems.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRY = process.env.JWT_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Generate a short-lived Access Token containing the user's identity and RBAC role claim.
 */
function generateAccessToken(user) {
  if (!JWT_SECRET) {
    throw new Error("Cryptographic failure: JWT_SECRET environment variable is missing.");
  }
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
}

/**
 * Generate a long-lived Refresh Token.
 */
function generateRefreshToken(user) {
  if (!JWT_SECRET) {
    throw new Error("Cryptographic failure: JWT_SECRET environment variable is missing.");
  }
  return jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
}

/**
 * Verify a given token (Access or Refresh) using our secret key.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; 
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};