// server/routes/metrics.js
const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const db = new Database(path.join(__dirname, '../db/securedash.sqlite'));

/**
 * GET /api/metrics
 * Access: Viewer, Analyst, Admin
 */
router.get('/', protect, authorize(['Viewer', 'Analyst', 'Admin']), (expressReq, expressRes) => {
  try {
    const userRole = expressReq.user.role;

    if (userRole === 'Viewer') {
      // Data Scoping: Viewers only get 'summary' metadata, hiding sensitive operational details
      const summaryData = db.prepare('SELECT metric_name, value FROM metrics WHERE scope = ?').all('summary');
      return expressRes.json({ data: summaryData, scope: 'summary_restricted' });
    }

    // Analysts and Admins get full clearance for all metrics data records
    const allData = db.prepare('SELECT metric_name, value, scope FROM metrics').all();
    return expressRes.json({ data: allData, scope: 'unrestricted' });
  } catch (error) {
    console.error('Metrics Route Error:', error);
    return expressRes.status(500).json({ error: 'Internal server error processing metrics.' });
  }
});

module.exports = router;