// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/tokenService');

// Connect to our parameterized database
const db = new Database(path.join(__dirname, '../db/securedash.sqlite'));

/**
 * POST /api/auth/login
 * Public endpoint to authenticate users and issue initial token pairs.
 */
router.post('/login', async (expressReq, expressRes) => {
  const { email, password } = expressReq.body;

  if (!email || !password) {
    return expressRes.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Parameterized search preventing SQLi injection
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      // Security Best Practice: Use generic failure messages to prevent user enumeration
      return expressRes.status(401).json({ error: 'Invalid credentials.' });
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return expressRes.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate cryptographic tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save the refresh token in the database to allow token revocation/rotation checking
    db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, user.id);

    // Return the tokens along with the non-sensitive profile state
    return expressRes.json({
      accessToken,
      refreshToken,
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return expressRes.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/refresh
 * Validates a refresh token and issues a clean access token to prevent session dropouts.
 */
router.post('/refresh', (expressReq, expressRes) => {
  const { refreshToken } = expressReq.body;

  if (!refreshToken) {
    return expressRes.status(400).json({ error: 'Refresh token is required.' });
  }

  // 1. Decrypt/Verify signature and expiration
  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    return expressRes.status(401).json({ error: 'Invalid or expired refresh token.' });
  }

  try {
    // 2. Cross-verify against the token stored in the database
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!user || user.refresh_token !== refreshToken) {
      // Token reuse or mismatch detected! Clear token state entirely for safety.
      if (user) db.prepare('UPDATE users SET refresh_token = NULL WHERE id = ?').run(user.id);
      return expressRes.status(403).json({ error: 'Token compromised or revoked.' });
    }

    // 3. Issue clean tokens (Refresh Token Rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(newRefreshToken, user.id);

    return expressRes.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh Error:', error);
    return expressRes.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;