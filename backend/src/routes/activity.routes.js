const { Router } = require("express");

const insightsController = require("../controllers/insights.controller");

// Mounted at /api/activity (see src/routes/index.js).
// Cross-monitor feed of the most recent health checks, for the dashboard.
const router = Router();

router.get("/", insightsController.getRecentActivity);

module.exports = router;
