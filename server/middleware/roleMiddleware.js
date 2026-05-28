// server/middleware/roleMiddleware.js

/**
 * Higher-order middleware to enforce access controls against the authenticated user's role claim.
 * @param {string[]} allowedRoles - Array of roles allowed to interact with the route (e.g., ['Analyst', 'Admin'])
 */
function authorize(allowedRoles) {
  return (expressReq, expressRes, nextStep) => {
    // 1. Defensive Check: Ensure the authentication middleware ran prior to this check
    if (!expressReq.user || !expressReq.user.role) {
      return expressRes.status(500).json({ error: 'Security context missing on server.' });
    }

    const clientRole = expressReq.user.role;

    // 2. Perform exact matching against authorized tiers
    if (!allowedRoles.includes(clientRole)) {
      // Access Denied. The architecture blocks unauthorized entry regardless of frontend UI layout.
      return expressRes.status(403).json({ 
        error: `Forbidden. Your role (${clientRole}) lacks sufficient privileges for this operation.` 
      });
    }

    // Access granted! Proceed forward.
    return nextStep();
  };
}

module.exports = { authorize };