// utils/resolve-stakeholder-name.util.js

const { AdminModel }  = require("@models/admin.model");
const { ClientModel } = require("@models/client.model");

/**
 * Resolves the firstName for a single stakeholderId by checking
 * AdminModel (via adminId) and then ClientModel (via clientId).
 *
 * @param {string} stakeholderId - Custom USR-prefixed ID
 * @returns {Promise<string|null>} firstName if found, null otherwise
 */
const resolveStakeholderName = async (stakeholderId) => {
  if (!stakeholderId) return null;

  const admin = await AdminModel.findOne({ adminId: stakeholderId }, { firstName: 1 }).lean();
  if (admin) return admin.firstName ?? null;

  const client = await ClientModel.findOne({ clientId: stakeholderId }, { firstName: 1 }).lean();
  if (client) return client.firstName ?? null;

  return null;
};

/**
 * Enriches an array of stakeholder documents by appending a `name` field
 * resolved from AdminModel or ClientModel.
 * Uses a single batched lookup per collection for efficiency.
 *
 * @param {Object[]} stakeholders - Array of stakeholder documents (must have `stakeholderId`)
 * @returns {Promise<Object[]>} Same array with `name` field added to each entry
 */
const enrichStakeholdersWithName = async (stakeholders) => {
  if (!stakeholders || stakeholders.length === 0) return stakeholders;

  const ids = stakeholders.map((s) => s.stakeholderId).filter(Boolean);

  // Batch-fetch from both collections
  const [admins, clients] = await Promise.all([
    AdminModel.find(
      { adminId: { $in: ids } },
      { adminId: 1, firstName: 1 }
    ).lean(),
    ClientModel.find(
      { clientId: { $in: ids } },
      { clientId: 1, firstName: 1 }
    ).lean(),
  ]);

  // Build lookup map: id → firstName
  const nameMap = {};
  for (const a of admins)  nameMap[a.adminId]  = a.firstName ?? null;
  for (const c of clients) nameMap[c.clientId] = c.firstName ?? null;

  return stakeholders.map((s) => ({
    ...s,
    name: nameMap[s.stakeholderId] ?? null,
  }));
};

module.exports = { resolveStakeholderName, enrichStakeholdersWithName };
