/**
 * HealthCheck model.
 *
 * One row = the result of a single check against a monitor's endpoint.
 * Belongs to exactly one monitor.
 *
 * Column definitions here must stay in sync with
 * src/migrations/*-create-health-checks.js
 */
module.exports = (sequelize, DataTypes) => {
  const HealthCheck = sequelize.define(
    "HealthCheck",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      monitorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("UP", "DOWN"),
        allowNull: false,
      },
      // HTTP status code returned by the endpoint (null on network errors).
      statusCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Response time in milliseconds (null when the request never completed).
      responseTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Timeout / network / error details.
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // When the check actually ran.
      checkedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "health_checks",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["monitor_id"] }, { fields: ["checked_at"] }],
    }
  );

  HealthCheck.associate = (models) => {
    HealthCheck.belongsTo(models.Monitor, {
      foreignKey: "monitorId",
      as: "monitor",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return HealthCheck;
};
