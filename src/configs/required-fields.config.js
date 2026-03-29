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

    // ── Inception ────────────────────────────────────────────────────────────────
    deleteInceptionField:getRequiredFields(FieldDefinitions.DELETE_INCEPTION),

    // ── Elicitation ───────────────────────────────────────────────────────────────
    createElicitationField:getRequiredFields(FieldDefinitions.CREATE_ELICITATION),
    updateElicitationField:getRequiredFields(FieldDefinitions.UPDATE_ELICITATION),
    deleteElicitationField:getRequiredFields(FieldDefinitions.DELETE_ELICITATION),

    createMeetingField: getRequiredFields(FieldDefinitions.CREATE_MEETING),
    updateMeetingField: getRequiredFields(FieldDefinitions.UPDATE_MEETING),
    cancelMeetingField: getRequiredFields(FieldDefinitions.CANCEL_MEETING),
    addParticipantField: getRequiredFields(FieldDefinitions.ADD_PARTICIPANT),
    updateParticipantField: getRequiredFields(FieldDefinitions.UPDATE_PARTICIPANT),
    removeParticipantField: getRequiredFields(FieldDefinitions.REMOVE_PARTICIPANT)
}

module.exports = {
    requiredFields
};