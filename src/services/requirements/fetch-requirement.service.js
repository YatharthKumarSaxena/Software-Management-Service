// services/requirements/fetch-requirement.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");

/**
 * Filters requirement based on user role - only shows relevant fields to CLIENT
 * No refetch - requirement is already loaded by middleware
 *
 * @param {Object} params
 * @param {Object} params.requirement - Requirement object (from middleware)
 * @param {string} [params.userType] - USER (admin) or CLIENT
 * @param {string} [params.userId] - User/Client ID for filtering
 *
 * @returns {{ success: true, requirement }}
 */
const fetchRequirementService = async ({ requirement, userType, userId }) => {
  try {
    logWithTime(
      `📍 [fetchRequirementService] Filtering requirement for ${userType}`
    );

    // ── CLIENT sees limited fields only ────────────────────────────
    if (userType === UserTypes.CLIENT) {
      const clientFields = {
        _id: requirement._id,
        title: requirement.title,
        description: requirement.description,
        type: requirement.type,
        status: requirement.status,
        priority: requirement.priority,
        tags: requirement.tags,
        acceptanceCriteria: requirement.acceptanceCriteria,
        parentFeatureId: requirement.parentFeatureId,
        linkedRequirements: requirement.linkedRequirements,
        timeline: requirement.timeline,
        attachments: requirement.attachments,
        createdAt: requirement.createdAt,
        updatedAt: requirement.updatedAt,
        entityId: requirement.entityId,
        entityType: requirement.entityType,
        _metadata: {
          isEditable: requirement.status === 'DRAFT',
          isPending: ['DRAFT', 'UNDER_REVIEW'].includes(requirement.status),
          isFinalized: ['ACCEPTED', 'REJECTED', 'ISSUED'].includes(requirement.status)
        }
      };
      
      logWithTime(`✅ [fetchRequirementService] Requirement filtered for CLIENT`);
      return { success: true, requirement: clientFields };
    }

    // ── ADMIN sees all fields ─────────────────────────────────────────
    const metadata = {
      isEditable: requirement.status === 'DRAFT',
      isPending: ['DRAFT', 'UNDER_REVIEW'].includes(requirement.status),
      isFinalized: ['ACCEPTED', 'REJECTED', 'ISSUED'].includes(requirement.status)
    };

    logWithTime(`✅ [fetchRequirementService] Requirement filtered for ADMIN`);
    return { success: true, requirement: { ...requirement, _metadata: metadata } };

  } catch (error) {
    logWithTime(`❌ [fetchRequirementService] Error: ${error.message}`);
    return { success: false, message: "Internal error while filtering requirement", errorCode: INTERNAL_ERROR, error: error.message };
  }
};

module.exports = { fetchRequirementService };
