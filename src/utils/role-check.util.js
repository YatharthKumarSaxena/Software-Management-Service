// utils/role-check.util.js

const { ClientRoleTypes, ProjectRoleTypes } = require("@configs/enums.config");

/**
 * Checks whether the given role belongs to admin or client
 * @param {string} role
 * @returns {{ isAdmin: boolean, isClient: boolean }}
 */
const checkUserRoleType = (role) => {

  const isAdmin = Object.values(ProjectRoleTypes).includes(role);
  const isClient = Object.values(ClientRoleTypes).includes(role);

  return {
    isAdmin,
    isClient
  };
};

module.exports = { checkUserRoleType };