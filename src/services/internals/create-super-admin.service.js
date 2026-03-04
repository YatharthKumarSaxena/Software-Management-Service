const { AdminModel } = require("@/models/index");
const { AdminTypes } = require("@configs/enums.config");
const { SYSTEM_LOG_EVENTS, SERVICE_NAMES } = require("@/configs/system-log-events.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logSuccess, logFailure, logError } = require("@services/audit/service-tracker.service");
const { errorMessage } = require("@/responses/common/error-handler.response");

/**
 * Create Super Admin (Bootstrap Service)
 * Used during system initialization
 */

const createSuperAdmin = async ({ adminId, firstName }) => {
  try {

    // 1️⃣ Validate input
    if (!adminId || !firstName) {
      logFailure(
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        SYSTEM_LOG_EVENTS.BOOTSTRAP_SUPER_ADMIN,
        "CREATE_SUPER_ADMIN",
        "Super admin creation failed: Missing required fields (adminId or firstName)",
        {
          executedBy: "SYSTEM",
          metadata: { adminId, firstName }
        }
      );

      return {
        success: false,
        message: "adminId and firstName are required"
      };
    }

    // 2️⃣ Check if SUPER_ADMIN already exists
    const existingSuperAdmin = await AdminModel.findOne({
      adminType: AdminTypes.SUPER_ADMIN
    });

    if (existingSuperAdmin) {
      logFailure(
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        SYSTEM_LOG_EVENTS.BOOTSTRAP_SUPER_ADMIN,
        "CREATE_SUPER_ADMIN",
        `Super admin already exists: ${existingSuperAdmin.adminId}`,
        {
          executedBy: "SYSTEM",
          targetId: existingSuperAdmin.adminId,
          metadata: { attemptedAdminId: adminId }
        }
      );

      return {
        success: false,
        message: "Super admin already exists"
      };
    }

    // 3️⃣ Create Super Admin
    const superAdmin = await AdminModel.create({
      adminId,
      firstName,
      adminType: AdminTypes.SUPER_ADMIN,
      createdBy: "SYSTEM",
      isActive: true
    });

    // 4️⃣ Log Success
    logSuccess(
      SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
      SYSTEM_LOG_EVENTS.BOOTSTRAP_SUPER_ADMIN,
      "CREATE_SUPER_ADMIN",
      `Super admin created successfully: ${adminId}`,
      {
        executedBy: "SYSTEM",
        targetId: superAdmin.adminId,
        metadata: {
          adminId: superAdmin.adminId,
          firstName: superAdmin.firstName,
          adminType: superAdmin.adminType
        }
      }
    );

    logWithTime(
      `✅ [${SYSTEM_LOG_EVENTS.BOOTSTRAP_SUPER_ADMIN}] Super admin created: ${adminId}`
    );

    return {
      success: true,
      message: "Super admin created successfully",
      data: {
        adminId: superAdmin.adminId,
        adminType: superAdmin.adminType,
        firstName: superAdmin.firstName
      }
    };

  } catch (err) {

    // Log error to service tracker
    logError(
      SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
      SYSTEM_LOG_EVENTS.CRITICAL_ERROR,
      "CREATE_SUPER_ADMIN",
      `Super admin bootstrap failed: ${err.message}`,
      {
        executedBy: "SYSTEM",
        metadata: {
          error: err.message,
          stack: err.stack,
          adminId: adminId || null
        }
      }
    );

    logWithTime(
      `❌ [${SYSTEM_LOG_EVENTS.CRITICAL_ERROR}] Super admin bootstrap failed: ${err.message}`
    );
    
    errorMessage(err);

    // Return error instead of throwing
    return {
      success: false,
      message: "Super admin creation failed",
      error: err.message
    };
  }
};

module.exports = {
  createSuperAdmin
};