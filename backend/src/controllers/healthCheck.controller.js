const monitorService = require("../services/monitor.service");
const healthCheckService = require("../services/healthCheck.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Thin HTTP layer for manual health checks.
 *
 *   find monitor -> run check (request + persist) -> respond
 *
 * A completed check always responds 200, even when the monitored target
 * is DOWN. 4xx/5xx are only for cases where PulseCheck itself could not
 * run the check (bad id, inactive monitor, database failure).
 */
const runCheck = asyncHandler(async (req, res) => {
  const monitor = await monitorService.getMonitor(req.params.id);
  const result = await healthCheckService.checkMonitor(monitor);

  res.status(200).json({
    success: true,
    message: "Health check completed",
    data: result,
  });
});

module.exports = { runCheck };
