const app = require("./app");
const env = require("./src/config/env");
const logger = require("./src/utils/logger");

const server = app.listen(env.port, () => {
  logger.info(`PulseCheck API listening on http://localhost:${env.port}`);
});

const shutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down.`);
  server.close(() => process.exit(0));
};

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});
