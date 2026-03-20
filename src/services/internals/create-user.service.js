const { AdminModel, ClientModel } = require("@/models/index");
const { SYSTEM_LOG_EVENTS, SERVICE_NAMES } = require("@/configs/system-log-events.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logSuccess, logFailure, logError } = require("@services/audit/service-tracker.service");
const { ClientTypes } = require("@/configs/enums.config");

/**
 * Create User Service (Admin Panel Integration)
 * Creates either Client or Admin based on type
 */

const createUser = async ({ type, id, firstName = null, role, organizationIds = [], requestedBy }) => {
  try {

    console.log(organizationIds);
    // 1️⃣ Validate input
    if (!type || !id || !role) {
      logFailure(
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
        "CREATE_USER",
        "User creation failed: Missing required fields (type, id, or role)",
        {
          executedBy: requestedBy || "ADMIN_PANEL",
          metadata: { type, id, firstName, role }
        }
      );

      return {
        success: false,
        message: "type, id, and role are required"
      };
    }

    // 2️⃣ Validate type
    if (type !== "user" && type !== "admin") {
      logFailure(
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
        "CREATE_USER",
        `Invalid type provided: ${type}. Must be 'user' or 'admin'`,
        {
          executedBy: requestedBy || "ADMIN_PANEL",
          metadata: { type, id, firstName, role }
        }
      );

      return {
        success: false,
        message: "type must be either 'user' or 'admin'"
      };
    }

    // 3️⃣ Create user based on type
    if (type === "user") {
      // Create Client
      const existingClient = await ClientModel.findOne({ clientId: id });

      if (existingClient) {
        logFailure(
          SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
          SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
          "CREATE_USER",
          `Client with id ${id} already exists`,
          {
            executedBy: requestedBy || "ADMIN_PANEL",
            targetId: id,
            metadata: { type, attemptedId: id }
          }
        );

        return {
          success: false,
          message: "Client with this ID already exists"
        };
      }

      let clientType = ClientTypes.INDIVIDUAL;
      if (organizationIds.length === 1) {
        clientType = ClientTypes.ORGANIZATION;
      } else if (organizationIds.length > 1) {
        clientType = ClientTypes.MULTI_ORGANIZATION;
      }

      const client = await ClientModel.create({
        clientId: id,
        firstName,
        role,
        clientType,
        organizationIds,
        isActive: true
      });

      // Log Success
      logSuccess(
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
        "CREATE_USER",
        `Client created successfully: ${id}`,
        {
          executedBy: requestedBy || "ADMIN_PANEL",
          targetId: client.clientId,
          metadata: {
            clientId: client.clientId,
            firstName: client.firstName,
            role: client.role
          }
        }
      );

      logWithTime(
        `✅ [${SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER}] Client created: ${id}`
      );

      return {
        success: true,
        message: "Client created successfully",
        data: {
          id: client.clientId,
          firstName: client.firstName,
          role: client.role,
          type: "user"
        }
      };

    } else {
      // Create Admin
      const existingAdmin = await AdminModel.findOne({ adminId: id });

      if (existingAdmin) {
        logFailure(
          SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
          SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
          "CREATE_USER",
          `Admin with id ${id} already exists`,
          {
            executedBy: requestedBy || "ADMIN_PANEL",
            targetId: id,
            metadata: { type, attemptedId: id }
          }
        );

        return {
          success: false,
          message: "Admin with this ID already exists"
        };
      }

      const admin = await AdminModel.create({
        adminId: id,
        firstName,
        role,
        isActive: true
      });

      // Log Success
      logSuccess(
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
        "CREATE_USER",
        `Admin created successfully: ${id}`,
        {
          executedBy: requestedBy || "ADMIN_PANEL",
          targetId: admin.adminId,
          metadata: {
            adminId: admin.adminId,
            firstName: admin.firstName,
            role: admin.role
          }
        }
      );

      logWithTime(
        `✅ [${SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER}] Admin created: ${id}`
      );

      return {
        success: true,
        message: "Admin created successfully",
        data: {
          id: admin.adminId,
          firstName: admin.firstName,
          role: admin.role,
          type: "admin"
        }
      };
    }

  } catch (err) {
    // Handle specific Mongoose validation errors
    if (err.name === "ValidationError") {
      const validationErrors = Object.keys(err.errors).map(key => err.errors[key].message);
      
      logError(
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
        "CREATE_USER",
        `Validation error during user creation: ${validationErrors.join(", ")}`,
        {
          executedBy: requestedBy || "ADMIN_PANEL",
          metadata: { type, id, firstName, role, error: validationErrors }
        }
      );

      return {
        success: false,
        message: "Validation error",
        error: validationErrors.join(", ")
      };
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      logError(
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
        "CREATE_USER",
        `Duplicate ${type} ID: ${id}`,
        {
          executedBy: requestedBy || "ADMIN_PANEL",
          metadata: { type, id, error: "Duplicate key" }
        }
      );

      return {
        success: false,
        message: `${type === 'admin' ? 'Admin' : 'Client'} with this ID already exists`
      };
    }

    // Log unexpected errors
    logError(
      SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
      SYSTEM_LOG_EVENTS.ADMIN_PANEL_CREATE_USER,
      "CREATE_USER",
      `Unexpected error during user creation: ${err.message}`,
      {
        executedBy: requestedBy || "ADMIN_PANEL",
        metadata: { type, id, firstName, role, error: err.message }
      }
    );

    return {
      success: false,
      message: "User creation failed",
      error: err.message
    };
  }
};

module.exports = {
  createUser
};
