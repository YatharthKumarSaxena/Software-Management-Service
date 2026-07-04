// controllers/conversions/get-conversion.controller.js

const { getConversionService } = require("@services/conversions/get-conversion.service");
const { sendConversionFetchedSuccess } = require("@/responses/success/conversion.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { TotalTypes } = require("@configs/enums.config");

const getConversionController = async (req, res) => {
  try {
    const conversion = req.foundConversion || req.conversion;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    const result = await getConversionService({
      conversion,
      selectFields: filters.selectFields,
      userType
    });

    if (!result.success) {
      logWithTime(`❌ [getConversionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getConversionController] Conversion fetched successfully | ${getLogIdentifiers(req)}`);
    return sendConversionFetchedSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ [getConversionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getConversionController };
