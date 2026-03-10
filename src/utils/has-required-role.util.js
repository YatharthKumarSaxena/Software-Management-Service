// utils/has-required-role.util.js

/**
 * Checks whether a user (admin or client) holds at least one of the allowed roles.
 *
 * @param {Object}   user         - The authenticated entity object. Must have a `role` field.
 * @param {string[]} allowedRoles - Array of permitted role values (enum values from
 *                                  AdminRoleTypes or ClientRoleTypes).
 * @returns {boolean} true  → user has at least one matching role.
 *                    false → user has no matching role, or arguments are invalid.
 *
 * @example
 * const { AdminRoleTypes } = require("@configs/enums.config");
 *
 * hasRequiredRole(req.admin, [AdminRoleTypes.CEO, AdminRoleTypes.BUSINESS_ANALYST]);
 * // → true  if req.admin.role === "ceo" or "business_analyst"
 * // → false otherwise
 */
const hasRequiredRole = (user, allowedRoles) => {
  if (
    !user ||
    typeof user.role !== "string" ||
    !Array.isArray(allowedRoles) ||
    allowedRoles.length === 0
  ) {
    return false;
  }

  return allowedRoles.includes(user.role);
};

module.exports = { hasRequiredRole };
