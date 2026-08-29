"use strict";

/**
 * Creates the `monitors` table.
 *
 * Must run before health_checks and incidents, which reference it.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("monitors", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(2048),
        allowNull: false,
      },
      method: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "GET",
      },
      expected_status_code: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 200,
      },
      status: {
        type: Sequelize.ENUM("UP", "DOWN", "UNKNOWN"),
        allowNull: false,
        defaultValue: "UNKNOWN",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      check_interval: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      timeout: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10000,
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

    await queryInterface.addIndex("monitors", ["is_active"], {
      name: "monitors_is_active_idx",
    });
  },

  async down(queryInterface) {
    // Dropping the table also drops its indexes and the ENUM type.
    await queryInterface.dropTable("monitors");
  },
};
