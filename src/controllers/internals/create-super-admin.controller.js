const { createSuperAdmin } = require("@services/internals/create-super-admin.service");
const {
    sendSuperAdminCreatedSuccess
} = require("@/responses/internals/create-super-admin.response");
const {
    throwMissingFieldsError,
    throwConflictError,
    throwInternalServerError
} = require("@/responses/common/error-handler.response");

/**
 * Controller: Create Super Admin (Bootstrap)
 * 
 * @route POST /api/internal/bootstrap/create-super-admin
 * @access Internal (Service-to-service or direct bootstrap)
 * 
 * @description Creates the initial super admin account during system bootstrap
 * This should typically be called once during system initialization
 * 
 * @body {string} adminId - Unique admin identifier
 * @body {string} firstName - Super admin's first name
 * 
 * @returns {201} Super admin created successfully
 * @returns {400} Missing required fields
 * @returns {409} Super admin already exists
 * @returns {500} Internal server error
 */

const createSuperAdminController = async (req, res) => {
    try {
        // Extract data from request body
        const { adminId, firstName } = req.body;

        // Call service
        const result = await createSuperAdmin({ adminId, firstName });

        // Handle service response
        if (!result.success) {
            // Check error type based on message
            if (result.message === "adminId and firstName are required") {
                return throwMissingFieldsError(res, ["adminId", "firstName"]);
            }
            
            if (result.message === "Super admin already exists") {
                return throwConflictError(
                    res,
                    "A super admin account has already been created. Only one super admin is allowed.",
                    "If you need to modify the super admin, please contact system administrator."
                );
            }
            
            // Generic creation failed error
            return throwInternalServerError(res, new Error(result.error || "Super admin creation failed"));
        }

        // Success response
        return sendSuperAdminCreatedSuccess(res, result.data);

    } catch (err) {
        // Unexpected error handling
        return throwInternalServerError(res, err);
    }
};

module.exports = {
    createSuperAdminController
};
