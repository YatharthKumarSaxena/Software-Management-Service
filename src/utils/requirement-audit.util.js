// utils/requirement-audit.util.js

/**
 * Prepare audit data for activity tracker.
 * Extracts relevant fields from old and new requirement objects.
 *
 * @param {Object} oldRequirement - Previous requirement state
 * @param {Object} newRequirement - New requirement state
 * @returns {Object} - { oldData, newData } for audit logging
 */
const prepareRequirementAuditData = (oldRequirement, newRequirement) => {
  // Fields that should be tracked for changes
  const trackedFields = [
    'requirementStatement',
    'description',
    'priority',
    'category',
    'state',
    'highLevelFeatureId',
    'featureMappedAt',
    'featureMappedBy',
    'docVersion',
    'isDeleted',
    'deletionReasonType',
    'deletionReasonDescription'
  ];

  const oldData = {};
  const newData = {};

  trackedFields.forEach(field => {
    oldData[field] = oldRequirement?.[field] || null;
    newData[field] = newRequirement?.[field] || null;
  });

  return { oldData, newData };
};

/**
 * Prepare summary of changes for activity tracker message.
 *
 * @param {Object} oldData - Old data snapshot
 * @param {Object} newData - New data snapshot
 * @returns {string} - Summary of changes
 */
const getAuditSummary = (oldData, newData) => {
  const changes = [];

  if (oldData?.state !== newData?.state) {
    changes.push(`State: ${oldData?.state} → ${newData?.state}`);
  }

  if (oldData?.requirementStatement !== newData?.requirementStatement) {
    changes.push(`Statement updated`);
  }

  if (oldData?.priority !== newData?.priority) {
    changes.push(`Priority: ${oldData?.priority} → ${newData?.priority}`);
  }

  if (oldData?.category !== newData?.category) {
    changes.push(`Category: ${oldData?.category} → ${newData?.category}`);
  }

  if (oldData?.highLevelFeatureId !== newData?.highLevelFeatureId) {
    if (newData?.highLevelFeatureId) {
      changes.push(`Mapped to feature`);
    } else {
      changes.push(`Unmapped from feature`);
    }
  }

  if (oldData?.docVersion?.minor !== newData?.docVersion?.minor) {
    changes.push(`Version updated`);
  }

  return changes.length > 0 ? changes.join("; ") : "No changes tracked";
};

module.exports = {
  prepareRequirementAuditData,
  getAuditSummary
};
