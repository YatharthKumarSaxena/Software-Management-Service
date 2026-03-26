// services/elicitations/get-elicitation.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Retrieves a single elicitation with full data.
 *
 * @param {Object} params
 * @param {string} params.elicitationId - Elicitation ID
 * @param {string} params.projectId     - Project ID
 *
 * @returns {Object} { errorCode, success: true, data } | { errorCode, success: false, message }
 */
const getElicitationService = async ({
  elicitationId,
  projectId
}) => {
  try {

    // ── Fetch elicitation with populated refs ────────────────────────
    const elicitation = await ElicitationModel.findById(elicitationId)
      .populate('projectId', 'name description');

    if (!elicitation) {
      logWithTime(`❌ [getElicitationService] Elicitation not found: ${elicitationId}`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Elicitation not found"
      };
    }

    // ── Verify it belongs to the project ─────────────────────────────
    if (elicitation.projectId._id.toString() !== projectId.toString()) {
      logWithTime(`❌ [getElicitationService] Elicitation does not belong to project ${projectId}`);
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Elicitation does not belong to the specified project"
      };
    }

    logWithTime(`✅ [getElicitationService] Elicitation retrieved successfully: ${elicitationId}`);
    return {
      errorCode: OK,
      success: true,
      data: { elicitation }
    };

  } catch (error) {
    logWithTime(`❌ [getElicitationService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return {
        errorCode: BAD_REQUEST,
        success: false,
        message: "Validation error: " + error.message
      };
    }
    return {
      errorCode: INTERNAL_ERROR,
      success: false,
      message: "Internal error while retrieving elicitation"
    };
  }
};

module.exports = { getElicitationService };
