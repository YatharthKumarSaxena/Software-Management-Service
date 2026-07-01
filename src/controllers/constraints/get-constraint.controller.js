// controllers/constraints/get-constraint.controller.js

const { getConstraintService } = require("@services/constraints/get-constraint.service");
const { sendConstraintFetchedSuccess } = require("@/responses/success/constraint.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { TotalTypes } = require("@configs/enums.config");

const getConstraintController = async (req, res) => {
  try {
    const constraint = req.foundConstraint || req.constraint;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    const result = await getConstraintService({
      constraint,
      selectFields: filters.selectFields,
      userType
    });

    if (!result.success) {
      logWithTime(`❌ [getConstraintController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getConstraintController] Constraint fetched successfully | ${getLogIdentifiers(req)}`);
    return sendConstraintFetchedSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ [getConstraintController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getConstraintController };
