// controllers/requirements/filter-requirements.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
  throwBadRequestError
} = require("@/responses/common/error-handler.response");
const { sendRequirementFetchSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { UserTypes } = require("@configs/enums.config");

const {
    validateAndParseJson
} = require("@utils/validate-json-query.util");

const {
    parseListFilters
} = require("@utils/parse-list-filters.util");


const getRequirementController = async (req, res) => {
  try {
    if (req.query?.selectFields) {
      const validationResult = validateAndParseJson(
        req.query.selectFields,
        "selectFields"
      );

      if (!validationResult.success) {
        return throwBadRequestError(
          res,
          validationResult.message
        );
      }
    }

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
