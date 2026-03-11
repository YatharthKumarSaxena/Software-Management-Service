// middlewares/stakeholders/role-guard.middleware.js
//
// Enforces that:
//   • Admin users (USR-ID resolved to an AdminModel doc)  only get AdminRoleTypes roles.
//   • Client users (USR-ID resolved to a ClientModel doc) only get ClientRoleTypes roles.
//   • Cross-assignment (e.g. client given an admin project-role) returns 400.
//
// On success, sets req.stakeholderUser = { entity, entityType: "admin" | "client" }
// so the controller can derive organizationId, etc.

const { ProjectRoleTypes, ClientRoleTypes } = require("@configs/enums.config");
const { fetchAdmin }  = require("@services/common/fetch-admin.service");
const { fetchClient } = require("@services/common/fetch-client.service");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

const ADMIN_ROLES  = new Set(Object.values(ProjectRoleTypes));
const CLIENT_ROLES = new Set(Object.values(ClientRoleTypes));

/**
 * Resolves a userId → entity, validates role type match, sets req.stakeholderUser.
 *
 * @param {string} userId - USR-prefixed custom user ID
 * @param {string} role   - Proposed role value
 * @param {Object} res    - Express response
 * @param {Function} next - Express next
 * @param {Object} req    - Express request (for error logging)
 */
const _resolveAndGuard = async (userId, role, req, res, next) => {
  // 1. Try to resolve as admin
  const adminEntity = await fetchAdmin(null, null, userId);

  if (adminEntity) {
    if (!ADMIN_ROLES.has(role)) {
      logMiddlewareError(
        "roleGuardMiddleware",
        `Admin user ${userId} cannot be assigned client role "${role}"`,
        req
      );
      return throwBadRequestError(
        res,
        "Role type mismatch",
        `User ${userId} is an admin. Admin users must be assigned an admin project role. ` +
        `Valid admin roles: ${[...ADMIN_ROLES].join(", ")}.`
      );
    }
    logWithTime(`✅ [roleGuard] Admin ${userId} role "${role}" is valid.`);
    req.stakeholderUser = { entity: adminEntity, entityType: "admin" };
    return next();
  }

  // 2. Try to resolve as client
  const clientEntity = await fetchClient(null, null, userId);

  if (clientEntity) {
    if (!CLIENT_ROLES.has(role)) {
      logMiddlewareError(
        "roleGuardMiddleware",
        `Client user ${userId} cannot be assigned admin role "${role}"`,
        req
      );
      return throwBadRequestError(
        res,
        "Role type mismatch",
        `User ${userId} is a client. Client users must be assigned a client role. ` +
        `Valid client roles: ${[...CLIENT_ROLES].join(", ")}.`
      );
    }
    logWithTime(`✅ [roleGuard] Client ${userId} role "${role}" is valid.`);
    req.stakeholderUser = { entity: clientEntity, entityType: "client" };
    return next();
  }

  // 3. User not found anywhere
  logMiddlewareError("roleGuardMiddleware", `User ${userId} not found as admin or client`, req);
  return throwDBResourceNotFoundError(res, `User with ID "${userId}"`);
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE guard – reads userId + role from req.body
// ─────────────────────────────────────────────────────────────────────────────
const createStakeholderRoleGuardMiddleware = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return throwBadRequestError(res, "Missing fields", "userId and role are required.");
    }

    return await _resolveAndGuard(userId, role, req, res, next);
  } catch (error) {
    logMiddlewareError("createStakeholderRoleGuard", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE guard – userId comes from the already-fetched req.stakeholder.userId
// (which equals stakeholderId in the model); role comes from req.body
// ─────────────────────────────────────────────────────────────────────────────
const updateStakeholderRoleGuardMiddleware = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId   = req.stakeholder?.stakeholderId; // stakeholderId === userId in the model

    if (!userId || !role) {
      return throwBadRequestError(res, "Missing fields", "Stakeholder userId and new role are required.");
    }

    return await _resolveAndGuard(userId, role, req, res, next);
  } catch (error) {
    logMiddlewareError("updateStakeholderRoleGuard", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  createStakeholderRoleGuardMiddleware,
  updateStakeholderRoleGuardMiddleware,
};
