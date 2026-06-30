// controllers/high-level-features/get-hlf.controller.js

const { getHlfService } = require("@services/high-level-features/get-hlf.service");
const { sendHlfFetchedSuccess } = require("@/responses/success/hlf.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { UserTypes } = require("@configs/enums.config");

const getHlfController = async (req, res) => {
  try {
    const hlf = req.foundHlf || req.hlf;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;

    const result = await getHlfService({
      hlf,
      selectFields: filters.selectFields,
      userType
    });

    if (!result.success) {
      logWithTime(`❌ [getHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getHlfController] High-level feature fetched successfully | ${getLogIdentifiers(req)}`);
    return sendHlfFetchedSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ [getHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getHlfController };
