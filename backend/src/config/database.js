const { Sequelize } = require("sequelize");
const env = require("./env");

/**
 * Shared Sequelize instance.
 *
 * Phase 1 only prepares the connection. Models, migrations and
 * sequelize.sync() are intentionally left for a later phase, so nothing
 * here connects to MySQL on startup.
 */
const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password || null,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
