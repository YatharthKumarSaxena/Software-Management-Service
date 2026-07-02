// responses/success/conversion.response.js

const { CREATED, OK } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const sendConversionCreatedSuccess = (res, conversion) => {
  logWithTime(`✅ [sendConversionCreatedSuccess] Conversion created ID: ${conversion._id}`);
  return res.status(CREATED).json({
    success: true,
    message: "Conversion created successfully",
    data: {
      conversion
    }
  });
};

module.exports = { sendConversionCreatedSuccess };
