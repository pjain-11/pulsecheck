const { Router } = require("express");

const monitorController = require("../controllers/monitor.controller");
const validate = require("../middlewares/validate");
const {
  createMonitorSchema,
  updateMonitorSchema,
  updateMonitorStatusSchema,
  monitorIdParamSchema,
} = require("../validations/monitor.validation");

const router = Router();

router.post("/", validate(createMonitorSchema), monitorController.createMonitor);

router.get("/", monitorController.listMonitors);

router.get(
  "/:id",
  validate(monitorIdParamSchema, "params"),
  monitorController.getMonitor
);

router.put(
  "/:id",
  validate(monitorIdParamSchema, "params"),
  validate(updateMonitorSchema),
  monitorController.updateMonitor
);

router.delete(
  "/:id",
  validate(monitorIdParamSchema, "params"),
  monitorController.deleteMonitor
);

router.patch(
  "/:id/status",
  validate(monitorIdParamSchema, "params"),
  validate(updateMonitorStatusSchema),
  monitorController.updateMonitorStatus
);

module.exports = router;
