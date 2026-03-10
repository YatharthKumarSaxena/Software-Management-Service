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
const abortProjectField     = getRequiredFields(FieldDefinitions.ABORT_PROJECT);
const completeProjectField  = getRequiredFields(FieldDefinitions.COMPLETE_PROJECT);
const resumeProjectField    = getRequiredFields(FieldDefinitions.RESUME_PROJECT);
const deleteProjectField    = getRequiredFields(FieldDefinitions.DELETE_PROJECT);
const archiveProjectField   = getRequiredFields(FieldDefinitions.ARCHIVE_PROJECT);

module.exports = {
    createProjectField,
    updateProjectField,
    abortProjectField,
    completeProjectField,
    resumeProjectField,
    deleteProjectField,
    archiveProjectField,
};