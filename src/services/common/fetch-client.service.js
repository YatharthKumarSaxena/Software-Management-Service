const { ClientModel } = require("@models/client.model");
const { fetchEntity } = require("./fetch-entity.service");

/**
 * Fetches a client from the database based on auth mode or userId
 * @param {string|null} email - Client's email address
 * @param {string|null} phone - Client's full phone number
 * @param {string|null} userId - Client's custom userId
 * @returns {Promise<Object|null>} - Returns the client object if found, null otherwise
 */

const fetchClient = async (email = null, phone = null, userId = null) => {
  return await fetchEntity(
    ClientModel,
    email,
    phone,
    userId,
    "Client",
    "clientId"
  );
};

module.exports = {
  fetchClient
};