// controllers/requirements/filter-requirements.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendRequirementFetchSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { UserTypes } = require("@configs/enums.config");

const {
    parseListFilters
} = require("@utils/parse-list-filters.util");


const getRequirementController = async (req, res) => {
  try {

    const filters = parseListFilters(req.query);

    const userType =
      req.admin
        ? UserTypes.USER
        : UserTypes.CLIENT;


    const requirement = req.requirement;

    const result =
      await requirementServices.getRequirementService({
        requirement,
        selectFields: filters.selectFields,
        userType
      });

    if (!result.success) {
      return throwSpecificInternalServerError(
        res, result.message
      );
    }

    logWithTime(
      `✅ Requirement fetched successfully | ${getLogIdentifiers(req)}`
    );
    return sendRequirementFetchSuccess(
      res,
      result.data
    );

  } catch (error) {
    logWithTime(`❌ [getRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getRequirementController };
