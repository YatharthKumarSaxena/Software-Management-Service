// controllers/requirements/filter-requirements.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendRequirementsListingSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");

/**
 * POST /projects/:projectId/requirements/filter
 * Filter requirements across project based on criteria.
 */
const filterRequirementsController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      statuses,
      assignees,
      phases,
      priorities,
      types,
      searchTerm,
      pagination,
      sort
    } = req.body;

    logWithTime(
      `📍 [filterRequirementsController] Filtering requirements | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;
    const userId = user?.adminId || user?.clientId;

    const result = await requirementServices.filterRequirementsService({
      projectId,
      filters: {
        statuses,
        assignees,
        phases,
        priorities,
        types,
        searchTerm
      },
      pagination,
      sort,
      auditContext: {
        user: {
          ...user,
          userType,
          userId
        },
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(`❌ [filterRequirementsController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }
      logWithTime(`❌ [filterRequirementsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [filterRequirementsController] Filter completed | ${getLogIdentifiers(req)}`);
    return sendRequirementsListingSuccess(res, result.requirements, result.metadata);

  } catch (error) {
    logWithTime(`❌ [filterRequirementsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { filterRequirementsController };
