const { createUser } = require("@services/internals/create-user.service");
const {
    sendUserCreatedSuccess
} = require("@/responses/internals/create-user.response");
const {
    throwMissingFieldsError,
    throwConflictError,
    throwInternalServerError,
    throwSpecificInternalServerError,
    throwBadRequestError
} = require("@/responses/common/error-handler.response");

/**
 * Controller: Create User (Admin Panel Integration)
 * 
 * @route POST /api/v1/internal/admin-panel/create-user
 * @access Internal (Admin Panel Service ONLY)
 * 
 * @description Creates either a Client or Admin user based on the type parameter
 * - type: "user" → Creates Client in ClientModel
 * - type: "admin" → Creates Admin in AdminModel
 * 
 * @body {string} type - User type: "user" or "admin"
 * @body {string} id - Unique identifier (clientId or adminId)
 * @body {string} firstName - User's first name (optional, depends on config)
 * @body {string} role - User role (must match ClientRoleTypes or AdminRoleTypes)
 * 
 * @returns {201} User created successfully
 * @returns {400} Missing required fields or invalid type
 * @returns {409} User with this ID already exists
 * @returns {500} Internal server error
 */

const createUserController = async (req, res) => {
    try {
        // Extract data from request body
        const { type, id, firstName, role, organizationIds } = req.body;

        // Extract requesting service info if available
        const requestedBy = req.serviceAuth?.serviceName || "ADMIN_PANEL";

        // Call service
        const result = await createUser({ 
            type, 
            id, 
            firstName, 
            role, 
            organizationIds,
            requestedBy 
        });

        // Handle service response
        if (!result.success) {
            // Check error type based on message
            if (result.message === "type, id, and role are required") {
                return throwMissingFieldsError(res, ["type", "id", "role"]);
            }
            
            if (result.message === "type must be either 'user' or 'admin'") {
                return throwBadRequestError(
                    res,
                    "Invalid type parameter",
                    "type must be either 'user' or 'admin'"
                );
            }

            if (result.message === "Client with this ID already exists" || 
                result.message === "Admin with this ID already exists") {
                return throwConflictError(
                    res,
                    result.message,
                    "Please use a different ID or update the existing user."
                );
            }

            if (result.message === "Validation error") {
                return throwBadRequestError(
                    res,
                    "Validation error",
                    result.error
                );
            }

            // Generic creation failed error
            return throwSpecificInternalServerError(res, result.error || "User creation failed");
        }

        // Success response
        return sendUserCreatedSuccess(res, result.data);

    } catch (err) {
        // Unexpected error handling
        return throwInternalServerError(res, err);
    }
};

module.exports = {
    createUserController
};
