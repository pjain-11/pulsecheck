/**
 * Monitor model.
 *
 * One row = one HTTP API endpoint the user wants to keep an eye on.
 * A monitor has many health checks and many incidents.
 *
 * Column definitions here must stay in sync with
 * src/migrations/*-create-monitors.js
 */
module.exports = (sequelize, DataTypes) => {
  const Monitor = sequelize.define(
    "Monitor",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(2048),
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "GET",
      },
      expectedStatusCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 200,
      },
      status: {
        type: DataTypes.ENUM("UP", "DOWN", "UNKNOWN"),
        allowNull: false,
        defaultValue: "UNKNOWN",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // Minutes between automated checks.
      checkInterval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      // Request timeout in milliseconds.
      timeout: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10000,
      },
    },
    {
      tableName: "monitors",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["is_active"] }],
    }
  );

  Monitor.associate = (models) => {
    // foreignKey is the attribute name; `underscored: true` maps it to the
    // monitor_id column on the child tables.
    Monitor.hasMany(models.HealthCheck, {
      foreignKey: "monitorId",
      as: "healthChecks",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    Monitor.hasMany(models.Incident, {
      foreignKey: "monitorId",
      as: "incidents",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Monitor;
};
