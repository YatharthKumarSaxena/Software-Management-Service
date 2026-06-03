/**
 * REQUIRED FIELDS CONFIG (Auto-Generated)
 * 
 * DO NOT MANUALLY EDIT THIS FILE!
 * 
 * These arrays are automatically derived from:
 * @see field-definitions.config.js (Single Source of Truth)
 * 
 * To add/remove/modify required fields:
 * → Edit FieldDefinitions in field-definitions.config.js
 * → Changes will automatically reflect here
 */

const { getRequiredFields } = require("@/utils/field-definition.util");
const { FieldDefinitions } = require("./field-definitions.config");

// AUTO-GENERATED REQUIRED FIELDS

const requiredFields = {
    createProjectField: getRequiredFields(FieldDefinitions.CREATE_PROJECT),
    updateProjectField: getRequiredFields(FieldDefinitions.UPDATE_PROJECT),
    onHoldProjectField:getRequiredFields(FieldDefinitions.ON_HOLD_PROJECT),
    abortProjectField   :getRequiredFields(FieldDefinitions.ABORT_PROJECT),
    completeProjectField:getRequiredFields(FieldDefinitions.COMPLETE_PROJECT),
    resumeProjectField  :getRequiredFields(FieldDefinitions.RESUME_PROJECT),
    deleteProjectField  :getRequiredFields(FieldDefinitions.DELETE_PROJECT),
    archiveProjectField :getRequiredFields(FieldDefinitions.ARCHIVE_PROJECT),
    activateProjectField :getRequiredFields(FieldDefinitions.ACTIVATE_PROJECT),
    changeProjectOwnerField :getRequiredFields(FieldDefinitions.CHANGE_PROJECT_OWNER),

    // ── Stakeholder ──────────────────────────────────────────────────────────────
    createStakeholderField:getRequiredFields(FieldDefinitions.CREATE_STAKEHOLDER),
    updateStakeholderField:getRequiredFields(FieldDefinitions.UPDATE_STAKEHOLDER),
    deleteStakeholderField:getRequiredFields(FieldDefinitions.DELETE_STAKEHOLDER),

    // ── Product Request ───────────────────────────────────────────────────────────
    createProductRequestField:getRequiredFields(FieldDefinitions.CREATE_PRODUCT_REQUEST),
    updateProductRequestField:getRequiredFields(FieldDefinitions.UPDATE_PRODUCT_REQUEST),
    deleteProductRequestField:getRequiredFields(FieldDefinitions.DELETE_PRODUCT_REQUEST),
    approveProductRequestField:getRequiredFields(FieldDefinitions.APPROVE_PRODUCT_REQUEST),
    rejectProductRequestField:getRequiredFields(FieldDefinitions.REJECT_PRODUCT_REQUEST),

    // ── Scope ────────────────────────────────────────────────────────────────────
    createScopeField:getRequiredFields(FieldDefinitions.CREATE_SCOPE),
    updateScopeField:getRequiredFields(FieldDefinitions.UPDATE_SCOPE),
    deleteScopeField:getRequiredFields(FieldDefinitions.DELETE_SCOPE),

    // ── High-Level Feature ────────────────────────────────────────────────────────
    createHlfField:getRequiredFields(FieldDefinitions.CREATE_HLF),
    updateHlfField:getRequiredFields(FieldDefinitions.UPDATE_HLF),
    deleteHlfField:getRequiredFields(FieldDefinitions.DELETE_HLF),

    // ── Product Vision ────────────────────────────────────────────────────────
    createProductVisionField:getRequiredFields(FieldDefinitions.CREATE_PRODUCT_VISION),
    updateProductVisionField:getRequiredFields(FieldDefinitions.UPDATE_PRODUCT_VISION),
    deleteProductVisionField:getRequiredFields(FieldDefinitions.DELETE_PRODUCT_VISION),

    // ── Comment ───────────────────────────────────────────────────────────────
    createCommentField:getRequiredFields(FieldDefinitions.CREATE_COMMENT),
    updateCommentField:getRequiredFields(FieldDefinitions.UPDATE_COMMENT),
    deleteCommentField:getRequiredFields(FieldDefinitions.DELETE_COMMENT),
    commentEntityField:getRequiredFields(FieldDefinitions.COMMENT_ENTITY),

    // ── Idea ──────────────────────────────────────────────────────────────
    createIdeaField:getRequiredFields(FieldDefinitions.CREATE_IDEA),
    updateIdeaField:getRequiredFields(FieldDefinitions.UPDATE_IDEA),
    deleteIdeaField:getRequiredFields(FieldDefinitions.DELETE_IDEA),
    acceptIdeaField:getRequiredFields(FieldDefinitions.ACCEPT_IDEA),
    rejectIdeaField:getRequiredFields(FieldDefinitions.REJECT_IDEA),
    deferIdeaField:getRequiredFields(FieldDefinitions.DEFER_IDEA),
    reopenIdeaField:getRequiredFields(FieldDefinitions.REOPEN_IDEA),
    revokeIdeaField:getRequiredFields(FieldDefinitions.REVOKE_IDEA),

    // ── Inception ────────────────────────────────────────────────────────────────
    deleteInceptionField:getRequiredFields(FieldDefinitions.DELETE_INCEPTION),

    // ── Elicitation ───────────────────────────────────────────────────────────────
    createElicitationField:getRequiredFields(FieldDefinitions.CREATE_ELICITATION),
    updateElicitationField:getRequiredFields(FieldDefinitions.UPDATE_ELICITATION),
    deleteElicitationField:getRequiredFields(FieldDefinitions.DELETE_ELICITATION),

    // ── Negotiation ───────────────────────────────────────────────────────────────
    createNegotiationField:getRequiredFields(FieldDefinitions.CREATE_NEGOTIATION),
    updateNegotiationField:getRequiredFields(FieldDefinitions.UPDATE_NEGOTIATION),
    deleteNegotiationField:getRequiredFields(FieldDefinitions.DELETE_NEGOTIATION),

    // ── Specification ───────────────────────────────────────────────────────────────
    deleteSpecificationField:getRequiredFields(FieldDefinitions.DELETE_SPECIFICATION),

    // ── Elaboration ───────────────────────────────────────────────────────────────
    createElaborationField:getRequiredFields(FieldDefinitions.CREATE_ELABORATION),
    updateElaborationField:getRequiredFields(FieldDefinitions.UPDATE_ELABORATION),
    deleteElaborationField:getRequiredFields(FieldDefinitions.DELETE_ELABORATION),

    // ── Validation ───────────────────────────────────────────────────────────────
    deleteValidationField:getRequiredFields(FieldDefinitions.DELETE_VALIDATION),

    createMeetingField: getRequiredFields(FieldDefinitions.CREATE_MEETING),
    updateMeetingField: getRequiredFields(FieldDefinitions.UPDATE_MEETING),
    cancelMeetingField: getRequiredFields(FieldDefinitions.CANCEL_MEETING),
    scheduleMeetingField: getRequiredFields(FieldDefinitions.SCHEDULE_MEETING),
    rescheduleMeetingField: getRequiredFields(FieldDefinitions.RESCHEDULE_MEETING),
    addParticipantField: getRequiredFields(FieldDefinitions.ADD_PARTICIPANT),
    updateParticipantField: getRequiredFields(FieldDefinitions.UPDATE_PARTICIPANT),
    removeParticipantField: getRequiredFields(FieldDefinitions.REMOVE_PARTICIPANT),

    // ── Org Project Request ───────────────────────────────────────────────────────
    createOrgProjectRequestField: getRequiredFields(FieldDefinitions.CREATE_ORG_PROJECT_REQUEST),
    updateOrgProjectRequestField: getRequiredFields(FieldDefinitions.UPDATE_ORG_PROJECT_REQUEST),
    approveOrgProjectRequestField: getRequiredFields(FieldDefinitions.APPROVE_ORG_PROJECT_REQUEST),
    rejectOrgProjectRequestField: getRequiredFields(FieldDefinitions.REJECT_ORG_PROJECT_REQUEST),

    // ── Requirement ───────────────────────────────────────────────────────────────
    createRequirementField: getRequiredFields(FieldDefinitions.CREATE_REQUIREMENT),
    updateRequirementField: getRequiredFields(FieldDefinitions.UPDATE_REQUIREMENT),
    deleteRequirementField: getRequiredFields(FieldDefinitions.DELETE_REQUIREMENT),
    transitionRequirementToReviewField: getRequiredFields(FieldDefinitions.TRANSITION_REQUIREMENT_TO_REVIEW),
    issueRequirementField: getRequiredFields(FieldDefinitions.ISSUE_REQUIREMENT),
    acceptRequirementField: getRequiredFields(FieldDefinitions.ACCEPT_REQUIREMENT),
    rejectRequirementField: getRequiredFields(FieldDefinitions.REJECT_REQUIREMENT),
    assignRequirementField: getRequiredFields(FieldDefinitions.ASSIGN_REQUIREMENT),
    unassignRequirementField: getRequiredFields(FieldDefinitions.UNASSIGN_REQUIREMENT),
    revokeRequirementField: getRequiredFields(FieldDefinitions.REVOKE_REQUIREMENT),
    deferRequirementField: getRequiredFields(FieldDefinitions.DEFER_REQUIREMENT),
    linkRequirementToHlfField: getRequiredFields(FieldDefinitions.LINK_REQUIREMENT_TO_HLF),
    revertToDraftField: getRequiredFields(FieldDefinitions.REVERT_TO_DRAFT),
    assignCollaboratorField: getRequiredFields(FieldDefinitions.ASSIGN_COLLABORATOR),
    unassignCollaboratorField: getRequiredFields(FieldDefinitions.UNASSIGN_COLLABORATOR),
    updateRequirementToHlfField: getRequiredFields(FieldDefinitions.UPDATE_REQUIREMENT_TO_HLF),
    unlinkRequirementToHlfField: getRequiredFields(FieldDefinitions.UNLINK_REQUIREMENT_TO_HLF),

    phaseRoleActionField: getRequiredFields(FieldDefinitions.PHASE_ROLE_ACTION),
}

module.exports = {
    requiredFields
};