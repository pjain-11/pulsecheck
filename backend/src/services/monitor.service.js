const { Monitor } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Monitor persistence / business operations. Controllers call into here
 * and never touch the model directly.
 *
 * `status` is intentionally not writable through any of these functions;
 * it will be owned by the monitoring engine in a later phase.
 */

const findByIdOrFail = async (id) => {
  const monitor = await Monitor.findByPk(id);
  if (!monitor) {
    throw new ApiError(404, "Monitor not found");
  }
  return monitor;
};

const createMonitor = (attributes) => Monitor.create(attributes);

const listMonitors = () =>
  // id is the tie-breaker: created_at has second precision, so monitors
  // created within the same second would otherwise order unpredictably.
  Monitor.findAll({ order: [["createdAt", "DESC"], ["id", "DESC"]] });

const getMonitor = (id) => findByIdOrFail(id);

const updateMonitor = async (id, attributes) => {
  const monitor = await findByIdOrFail(id);
  return monitor.update(attributes);
};

const deleteMonitor = async (id) => {
  const monitor = await findByIdOrFail(id);
  // health_checks / incidents are removed by the ON DELETE CASCADE
  // foreign keys defined in the Phase 2 migrations.
  await monitor.destroy();
};

const setMonitorActive = async (id, isActive) => {
  const monitor = await findByIdOrFail(id);
  return monitor.update({ isActive });
};

module.exports = {
  createMonitor,
  listMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  setMonitorActive,
};
