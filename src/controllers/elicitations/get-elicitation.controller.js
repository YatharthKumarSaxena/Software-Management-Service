// controllers/elicitations/get-elicitation.controller.js

const { getElicitationService } = require("@services/elicitations/get-elicitation.service");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Get Elicitation
 *
 * @route  GET /software-management-service/api/v1/admin/projects/:projectId/elicitations/:elicitationId
 * @access Private – Admin (must be stakeholder of the project)
 *
 * @param projectId - Project ID from URL params
 * @param elicitationId - Elicitation ID from URL params
 *
 * @description Retrieves full elicitation details.
 *
 * @returns {200} Elicitation data retrieved successfully
 * @returns {403} User is not a stakeholder of the project
 * @returns {404} Elicitation not found
 * @returns {500} Internal server error
 */
const getElicitationController = async (req, res) => {
  try {
    const elicitationId = req.elicitation._id;
    const projectId = req.project._id;

    // ── Call service ──────────────────────────────────────────────────
    const result = await getElicitationService({
      elicitationId,
      projectId,
    });

    if (!result.success) {
      logWithTime(`❌ [getElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Success response ──────────────────────────────────────────────
    logWithTime(`✅ [getElicitationController] Elicitation retrieved successfully | ${getLogIdentifiers(req)}`);
    return res.status(result.errorCode).json({
      success: true,
      message: "Elicitation retrieved successfully",
      data: result.data,
    });

  } catch (error) {
    logWithTime(`❌ [getElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getElicitationController };
