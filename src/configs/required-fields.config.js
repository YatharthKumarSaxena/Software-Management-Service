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

const createProjectField    = getRequiredFields(FieldDefinitions.CREATE_PROJECT);
const updateProjectField    = getRequiredFields(FieldDefinitions.UPDATE_PROJECT);
const onHoldProjectField  = getRequiredFields(FieldDefinitions.ON_HOLD_PROJECT);
const abortProjectField     = getRequiredFields(FieldDefinitions.ABORT_PROJECT);
const completeProjectField  = getRequiredFields(FieldDefinitions.COMPLETE_PROJECT);
const resumeProjectField    = getRequiredFields(FieldDefinitions.RESUME_PROJECT);
const deleteProjectField    = getRequiredFields(FieldDefinitions.DELETE_PROJECT);
const archiveProjectField   = getRequiredFields(FieldDefinitions.ARCHIVE_PROJECT);

// ── Stakeholder ──────────────────────────────────────────────────────────────
const createStakeholderField = getRequiredFields(FieldDefinitions.CREATE_STAKEHOLDER);
const updateStakeholderField = getRequiredFields(FieldDefinitions.UPDATE_STAKEHOLDER);
const deleteStakeholderField = getRequiredFields(FieldDefinitions.DELETE_STAKEHOLDER);

// ── Product Request ───────────────────────────────────────────────────────────
const createProductRequestField = getRequiredFields(FieldDefinitions.CREATE_PRODUCT_REQUEST);
const updateProductRequestField = getRequiredFields(FieldDefinitions.UPDATE_PRODUCT_REQUEST);
const deleteProductRequestField = getRequiredFields(FieldDefinitions.DELETE_PRODUCT_REQUEST);
const approveProductRequestField = getRequiredFields(FieldDefinitions.APPROVE_PRODUCT_REQUEST);
const rejectProductRequestField = getRequiredFields(FieldDefinitions.REJECT_PRODUCT_REQUEST);

module.exports = {
    createProjectField,
    updateProjectField,
    onHoldProjectField,
    abortProjectField,
    completeProjectField,
    resumeProjectField,
    deleteProjectField,
    archiveProjectField,
    createStakeholderField,
    updateStakeholderField,
    deleteStakeholderField,
    createProductRequestField,
    updateProductRequestField,
    deleteProductRequestField,
    approveProductRequestField,
    rejectProductRequestField
};