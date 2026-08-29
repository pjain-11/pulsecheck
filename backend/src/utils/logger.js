/**
 * Minimal logger wrapper so the rest of the code does not call console
 * directly. Can be swapped for a real logger in a later phase.
 */
const logger = {
  info: (...args) => console.log("[info]", ...args),
  warn: (...args) => console.warn("[warn]", ...args),
  error: (...args) => console.error("[error]", ...args),
};

module.exports = logger;
