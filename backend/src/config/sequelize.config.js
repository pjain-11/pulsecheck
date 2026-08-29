/**
 * Connection settings consumed by sequelize-cli (db:migrate, etc.).
 *
 * Credentials come from the environment only; see backend/.env.example.
 * All three environments point at the same local database for this
 * personal project.
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
