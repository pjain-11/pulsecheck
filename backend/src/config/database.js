const { Sequelize } = require("sequelize");
const env = require("./env");

/**
 * Shared Sequelize instance used by the models and by the CLI config.
 *
 * Requiring this file does not open a connection; Sequelize connects
 * lazily on the first query. Schema changes are applied through
 * migrations (src/migrations), not sequelize.sync().
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
