// controllers/product-requests/create-product-request.controller.js

const { createProductRequestService } = require("@services/product-requests");
const { sendProductRequestCreatedSuccess } = require("@/responses/success/product-request.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST } = require("@configs/http-status.config");

/**
 * Controller: Create Product Request
 *
 * @route  POST /software-management-service/api/v1/stakeholder/product-requests
 * @access Private – Stakeholder
 *
 * @body {string} title                 - Product request title
 * @body {string} description           - Product request description
 * @body {string} projectType           - Type of project
 * @body {string} projectCategory       - Category of project
 * @body {string} requestedBy           - Client ID (from authenticated client)
 * @body {string} priority              - Priority level
 * @body {number} expectedTimelineInDays  - Expected timeline in days
 * @body {number} [budget]              - Optional budget
 *
 * @returns {201} Product request created successfully
 * @returns {400} Missing / invalid fields
 * @returns {500} Internal server error
 */
const createProductRequestController = async (req, res) => {
  try {
    const requestedBy = req.client; // Get client ID from authenticated client

    const {
      title,
      description,
      projectType,
      projectCategory,
      priority,
      expectedTimelineInDays,
      budget
    } = req.body;

    // ── Call service ────────────────────────────────────────────────────
    const result = await createProductRequestService({
      title,
      description,
      projectType,
      projectCategory,
      requestedBy,
      priority,
      expectedTimelineInDays,
      budget,
      auditContext: {
        user: requestedBy,
        device: req.device,
        requestId: req.requestId,
      },
    });

    // ── Handle response based on errorCode ──────────────────────────────
    if (!result.isSuccess) {
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(`❌ [createProductRequestController] Bad request: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.description);
      }

      logWithTime(`❌ [createProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [createProductRequestController] Product request created successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestCreatedSuccess(res, result.data.productRequest);

  } catch (error) {
    logWithTime(`❌ [createProductRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createProductRequestController };
