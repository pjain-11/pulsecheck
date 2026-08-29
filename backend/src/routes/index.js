const { Router } = require("express");
const healthRoutes = require("./health.routes");
const monitorRoutes = require("./monitor.routes");

const router = Router();

router.use(healthRoutes);
router.use("/monitors", monitorRoutes);

module.exports = router;
