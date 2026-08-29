/**
 * Configuration consumed by sequelize-cli.
 *
 * Migrations and models are NOT part of Phase 1, this file only prepares
 * the connection settings for a later phase.
 */
const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const base = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "pulsecheck",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  dialect: "mysql",
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
