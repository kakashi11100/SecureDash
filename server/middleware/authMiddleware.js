// server/middleware/authMiddleware.js
const { verifyToken } = require('../utils/tokenService');

/**
 * Middleware to intercept incoming HTTP requests, extract the Authorization header,
 * and cryptographically verify the JWT access token.
 */
function protect(expressReq, expressRes, nextStep) {
  const authHeader = expressReq.headers.authorization;

  // 1. Check if the Authorization header exists and uses the proper Bearer scheme
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return expressRes.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // 2. Extract the raw token string
  const tokenString = authHeader.split(' ')[1];

  // 3. Cryptographically check token signature, structural integrity, and expiration
  const decodedPayload = verifyToken(tokenString);
  if (!decodedPayload) {
    return expressRes.status(401).json({ error: 'Invalid or expired access token.' });
  }

  // 4. Attach the decoded identity claims (id, email, role) to the request object
  expressReq.user = decodedPayload;
  
  // Hand off execution to the next middleware or route handler in the chain
  return nextStep();
}

module.exports = { protect };