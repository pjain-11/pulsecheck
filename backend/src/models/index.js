const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Registers every model against the shared Sequelize instance and wires
 * up the associations. Import from here, e.g.:
 *
 *   const { Monitor, HealthCheck, Incident } = require("./models");
 */
const models = {
  Monitor: require("./Monitor")(sequelize, DataTypes),
  HealthCheck: require("./HealthCheck")(sequelize, DataTypes),
  Incident: require("./Incident")(sequelize, DataTypes),
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
