const { AdminModel } = require("@models/admin.model");
const { fetchEntity } = require("./fetch-entity.service");

/**
 * Fetches an admin from the database based on auth mode or adminId
 * @param {string|null} email - Admin's email address
 * @param {string|null} phone - Admin's full phone number
 * @param {string|null} userId - Admin's custom adminId
 * @returns {Promise<Object|null>} - Returns the admin object if found, null otherwise
 */
const fetchAdmin = async (email = null, phone = null, userId = null) => {
  return await fetchEntity(
    AdminModel,
    email,
    phone,
    userId,
    "Admin",
    "adminId"
  );
};

module.exports = {
  fetchAdmin
};