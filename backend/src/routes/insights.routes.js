const { Router } = require("express");

const insightsController = require("../controllers/insights.controller");
const validate = require("../middlewares/validate");
const { monitorIdParamSchema } = require("../validations/monitor.validation");

// Mounted under /api/monitors (see src/routes/index.js).
const router = Router();

router.get(
  "/:id/checks",
  validate(monitorIdParamSchema, "params"),
  insightsController.listChecks
);

router.get(
  "/:id/incidents",
  validate(monitorIdParamSchema, "params"),
  insightsController.listIncidents
);

router.get(
  "/:id/stats",
  validate(monitorIdParamSchema, "params"),
  insightsController.getStats
);

module.exports = router;
