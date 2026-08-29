/**
 * Incident model.
 *
 * One row = a period of downtime for a monitor. Opened when an endpoint
 * starts failing and resolved when it recovers. Belongs to one monitor.
 *
 * The open/resolve logic is not part of this phase; this is schema only.
 *
 * Column definitions here must stay in sync with
 * src/migrations/*-create-incidents.js
 */
module.exports = (sequelize, DataTypes) => {
  const Incident = sequelize.define(
    "Incident",
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
        type: DataTypes.ENUM("OPEN", "RESOLVED"),
        allowNull: false,
        defaultValue: "OPEN",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "incidents",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["monitor_id"] },
        { fields: ["status"] },
        { fields: ["started_at"] },
      ],
    }
  );

  Incident.associate = (models) => {
    Incident.belongsTo(models.Monitor, {
      foreignKey: "monitorId",
      as: "monitor",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Incident;
};
