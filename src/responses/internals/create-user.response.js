const { logWithTime } = require("@utils/time-stamps.util");
const { CREATED } = require("@configs/http-status.config");

/**
 * Response Handlers for Create User
 * 
 * Centralized response management following DRY principle
 * No hardcoded responses in controllers
 */

/**
 * Success Response - User Created (Client or Admin)
 * @param {Object} res - Express response object
 * @param {Object} data - User data (id, firstName, role, type)
 */
const sendUserCreatedSuccess = (res, data) => {
    logWithTime(`✅ ${data.type === 'admin' ? 'Admin' : 'Client'} user created successfully: ${data.id}`);
    return res.status(CREATED).json({
        success: true,
        message: `${data.type === 'admin' ? 'Admin' : 'Client'} created successfully`,
        data: {
            id: data.id,
            firstName: data.firstName,
            role: data.role
        }
    });
};

module.exports = {
    sendUserCreatedSuccess
};
