/**
 * Health controller.
 *
 * Only reports that the API process is running. It does not check the
 * database or any monitored endpoints yet.
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "PulseCheck API is running",
  });
};

module.exports = { getHealth };
