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

const sendConversionsListFetchedSuccess = (res, conversions, totalCount, currentPage, totalPages) => {
  logWithTime(`✅ [sendConversionsListFetchedSuccess] Fetched ${conversions.length} conversions`);
  return res.status(OK).json({
    success: true,
    message: "Conversions fetched successfully",
    data: {
      conversions,
      pagination: {
        totalCount,
        currentPage,
        totalPages
      }
    }
  });
};

const sendConversionFetchedSuccess = (res, conversion) => {
  logWithTime(`✅ [sendConversionFetchedSuccess] Fetched Conversion ID: ${conversion._id}`);
  return res.status(OK).json({
    success: true,
    message: "Conversion fetched successfully",
    data: {
      conversion
    }
  });
};

module.exports = {
    sendConversionCreatedSuccess,
    sendConversionsListFetchedSuccess,
    sendConversionFetchedSuccess
};
