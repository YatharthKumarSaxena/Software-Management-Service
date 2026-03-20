const { updateClientOrganizationsService } = require("@services/internals/update-client-organizations.service");
const { sendUpdateClientOrganizationsSuccess } = require("@responses/internals/common.response");
const {
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Update Client Organizations Controller
 * Updates client's organization memberships
 * Soft-deletes associated stakeholder roles when organization is removed
 * Called by Admin Panel service
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.clientId - The custom client ID
 * @param {string} req.body.removedOrgId - Organization ID to remove (optional)
 *   → Triggers automatic soft-deletion of client's stakeholder roles in that organization
 *   → Reason: ORGANIZATION_REMOVED_FROM_CLIENT (audit trail maintained)
 * @param {string} req.body.addedOrgId - Organization ID to add (optional)
 * @param {string} req.body.adminId - The adminId who triggered the update
 * @param {string} req.body.requestId - Request ID for tracking
 * @param {string} req.requestId - Request ID from middleware
 * @param {Object} res - Express response object
 */
const updateClientOrganizations = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { removedOrgId, addedOrgId, adminId, requestId } = req.body;

    // Validate that adminId is provided
    if (!adminId) {
      return throwSpecificInternalServerError(res, "adminId is required in request body");
    }

    // At least one operation should be requested 
    if (!removedOrgId && !addedOrgId) {
      return throwSpecificInternalServerError(
        res,
        "At least one of removedOrgId or addedOrgId must be provided"
      );
    }

    // Extract request tracking details
    const finalRequestId = requestId || req.requestId;

    // Call the update service
    const result = await updateClientOrganizationsService(
      clientId,
      removedOrgId,
      addedOrgId,
      adminId,
      finalRequestId
    );

    // Handle failure responses
    if (!result.success) {
      // Conflict error: Client not found
      if (result.type === "Conflict") {
        return throwConflictError(
          res,
          result.message,
          `Please verify the client ID (${clientId}) is correct and not deleted.`
        );
      }

      // Other errors: Internal server error
      return throwSpecificInternalServerError(res, result.message);
    }

    // Success response
    return sendUpdateClientOrganizationsSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ Error in updateClientOrganizations controller: ${error.message}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  updateClientOrganizations
};
