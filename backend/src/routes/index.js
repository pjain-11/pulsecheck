const { Router } = require("express");
const healthRoutes = require("./health.routes");
const monitorRoutes = require("./monitor.routes");
const healthCheckRoutes = require("./healthCheck.routes");

const router = Router();

router.use(healthRoutes);
router.use("/monitors", monitorRoutes);
router.use("/monitors", healthCheckRoutes);

module.exports = router;
