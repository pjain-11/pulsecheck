const { Router } = require("express");
const healthRoutes = require("./health.routes");
const monitorRoutes = require("./monitor.routes");
const healthCheckRoutes = require("./healthCheck.routes");
const insightsRoutes = require("./insights.routes");
const activityRoutes = require("./activity.routes");

const router = Router();

router.use(healthRoutes);
router.use("/monitors", monitorRoutes);
router.use("/monitors", healthCheckRoutes);
router.use("/monitors", insightsRoutes);
router.use("/activity", activityRoutes);

module.exports = router;
