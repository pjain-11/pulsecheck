const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  port: toNumber(process.env.PORT, 5000),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: toNumber(process.env.DB_PORT, 3306),
    name: process.env.DB_NAME || "pulsecheck",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },
};

module.exports = env;
