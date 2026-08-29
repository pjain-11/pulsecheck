const monitorService = require("../services/monitor.service");
const asyncHandler = require("../utils/asyncHandler");
const { toModelAttributes, serializeMonitor } = require("../utils/monitorMapper");

/**
 * Thin HTTP layer: read the (already validated) request, call the
 * service, shape the response. No business logic here.
 */

const createMonitor = asyncHandler(async (req, res) => {
  const monitor = await monitorService.createMonitor(toModelAttributes(req.body));
  res.status(201).json({
    success: true,
    message: "Monitor created successfully",
    data: serializeMonitor(monitor),
  });
});

const listMonitors = asyncHandler(async (req, res) => {
  const monitors = await monitorService.listMonitors();
  res.json({
    success: true,
    data: monitors.map(serializeMonitor),
  });
});

const getMonitor = asyncHandler(async (req, res) => {
  const monitor = await monitorService.getMonitor(req.params.id);
  res.json({
    success: true,
    data: serializeMonitor(monitor),
  });
});

const updateMonitor = asyncHandler(async (req, res) => {
  const monitor = await monitorService.updateMonitor(
    req.params.id,
    toModelAttributes(req.body)
  );
  res.json({
    success: true,
    message: "Monitor updated successfully",
    data: serializeMonitor(monitor),
  });
});

const deleteMonitor = asyncHandler(async (req, res) => {
  await monitorService.deleteMonitor(req.params.id);
  res.json({
    success: true,
    message: "Monitor deleted successfully",
  });
});

const updateMonitorStatus = asyncHandler(async (req, res) => {
  const monitor = await monitorService.setMonitorActive(
    req.params.id,
    req.body.is_active
  );
  res.json({
    success: true,
    message: "Monitor status updated successfully",
    data: { id: monitor.id, is_active: monitor.isActive },
  });
});

module.exports = {
  createMonitor,
  listMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  updateMonitorStatus,
};
