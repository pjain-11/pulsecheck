"use strict";

/**
 * Creates the `incidents` table.
 *
 * Depends on `monitors` (monitor_id foreign key).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("incidents", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      monitor_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "monitors", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("OPEN", "RESOLVED"),
        allowNull: false,
        defaultValue: "OPEN",
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("incidents", ["monitor_id"], {
      name: "incidents_monitor_id_idx",
    });
    await queryInterface.addIndex("incidents", ["status"], {
      name: "incidents_status_idx",
    });
    await queryInterface.addIndex("incidents", ["started_at"], {
      name: "incidents_started_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("incidents");
  },
};
