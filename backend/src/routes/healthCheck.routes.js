const { Router } = require("express");

const healthCheckController = require("../controllers/healthCheck.controller");
const validate = require("../middlewares/validate");
const { monitorIdParamSchema } = require("../validations/monitor.validation");

// Mounted under /api/monitors (see src/routes/index.js).
const router = Router();

router.post(
  "/:id/check",
  validate(monitorIdParamSchema, "params"),
  healthCheckController.runCheck
);

module.exports = router;
