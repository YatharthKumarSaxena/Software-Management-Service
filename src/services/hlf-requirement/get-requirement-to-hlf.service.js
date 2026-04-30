// services/hlf-requirement/get-requirement-to-hlf.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");

/**
 * Filters a requirement-to-HLF mapping based on user role
 * No refetch - mapping is already loaded by middleware
 * 
 * @param {Object} params
 * @param {Object} params.mapping - The mapping object (from middleware)
 * @param {string} [params.userType] - USER (admin) or CLIENT
 * 
 * @returns {{ success: true, mapping }}
 */
const getRequirementToHlfService = async ({ mapping, userType }) => {
  try {
    logWithTime(
      `📍 [getRequirementToHlfService] Filtering mapping for ${userType}`
    );

    // ── CLIENT sees limited fields only ───────────────────────────────
    if (userType === UserTypes.CLIENT) {
      const clientFields = {
        _id: mapping._id,
        featureId: mapping.featureId,
        requirementId: mapping.requirementId,
        relationType: mapping.relationType,
        relationshipNotes: mapping.relationshipNotes,
        status: mapping.status,
        linkedAt: mapping.linkedAt,
        createdAt: mapping.createdAt,
        updatedAt: mapping.updatedAt
      };
      
      logWithTime(`✅ [getRequirementToHlfService] Mapping filtered for CLIENT`);
      return { success: true, mapping: clientFields };
    }

    // ── ADMIN sees all fields ────────────────────────────────────────
    logWithTime(`✅ [getRequirementToHlfService] Mapping returned for ADMIN`);
    return { success: true, mapping };

  } catch (error) {
    logWithTime(`❌ [getRequirementToHlfService] Error: ${error.message}`);
    return { 
      success: false, 
      message: "Error fetching requirement-HLF mapping", 
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { getRequirementToHlfService };
