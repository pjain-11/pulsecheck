"use strict";

/**
 * Creates the `health_checks` table.
 *
 * Depends on `monitors` (monitor_id foreign key).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("health_checks", {
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
        type: Sequelize.ENUM("UP", "DOWN"),
        allowNull: false,
      },
      status_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      response_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      checked_at: {
        type: Sequelize.DATE,
        allowNull: false,
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

    await queryInterface.addIndex("health_checks", ["monitor_id"], {
      name: "health_checks_monitor_id_idx",
    });
    await queryInterface.addIndex("health_checks", ["checked_at"], {
      name: "health_checks_checked_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("health_checks");
  },
};
