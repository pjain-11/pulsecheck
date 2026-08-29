const express = require("express");
const cors = require("cors");

const routes = require("./src/routes");
const notFound = require("./src/middlewares/notFound");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

// Local development CORS: allow the Next.js dev server to call the API.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
