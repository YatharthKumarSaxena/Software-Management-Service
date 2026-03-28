// middlewares/admins/field-validation.middleware.js

const { FieldDefinitions } = require("@configs/field-definitions.config");
const { getValidationSet } = require("@utils/field-definition.util");

const validationSets = {
    createProjectValidationSet: getValidationSet(FieldDefinitions.CREATE_PROJECT),
    updateProjectValidationSet: getValidationSet(FieldDefinitions.UPDATE_PROJECT),
    onHoldProjectValidationSet: getValidationSet(FieldDefinitions.ON_HOLD_PROJECT),
    abortProjectValidationSet: getValidationSet(FieldDefinitions.ABORT_PROJECT),
    completeProjectValidationSet: getValidationSet(FieldDefinitions.COMPLETE_PROJECT),
    resumeProjectValidationSet: getValidationSet(FieldDefinitions.RESUME_PROJECT),
    deleteProjectValidationSet: getValidationSet(FieldDefinitions.DELETE_PROJECT),
    archiveProjectValidationSet: getValidationSet(FieldDefinitions.ARCHIVE_PROJECT),
    activateProjectValidationSet: getValidationSet(FieldDefinitions.ACTIVATE_PROJECT),
    changeProjectOwnerValidationSet: getValidationSet(FieldDefinitions.CHANGE_PROJECT_OWNER),
    createStakeholderValidationSet: getValidationSet(FieldDefinitions.CREATE_STAKEHOLDER),
    updateStakeholderValidationSet: getValidationSet(FieldDefinitions.UPDATE_STAKEHOLDER),
    deleteStakeholderValidationSet: getValidationSet(FieldDefinitions.DELETE_STAKEHOLDER),
    createProductRequestValidationSet: getValidationSet(FieldDefinitions.CREATE_PRODUCT_REQUEST),
    updateProductRequestValidationSet: getValidationSet(FieldDefinitions.UPDATE_PRODUCT_REQUEST),
    deleteProductRequestValidationSet: getValidationSet(FieldDefinitions.DELETE_PRODUCT_REQUEST),
    approveProductRequestValidationSet: getValidationSet(FieldDefinitions.APPROVE_PRODUCT_REQUEST),
    rejectProductRequestValidationSet: getValidationSet(FieldDefinitions.REJECT_PRODUCT_REQUEST),
    createScopeValidationSet: getValidationSet(FieldDefinitions.CREATE_SCOPE),
    updateScopeValidationSet: getValidationSet(FieldDefinitions.UPDATE_SCOPE),
    deleteScopeValidationSet: getValidationSet(FieldDefinitions.DELETE_SCOPE),
    createHlfValidationSet: getValidationSet(FieldDefinitions.CREATE_HLF),
    updateHlfValidationSet: getValidationSet(FieldDefinitions.UPDATE_HLF),
    deleteHlfValidationSet: getValidationSet(FieldDefinitions.DELETE_HLF),
    createProductVisionValidationSet: getValidationSet(FieldDefinitions.CREATE_PRODUCT_VISION),
    updateProductVisionValidationSet: getValidationSet(FieldDefinitions.UPDATE_PRODUCT_VISION),
    deleteProductVisionValidationSet: getValidationSet(FieldDefinitions.DELETE_PRODUCT_VISION),
    commentEntityValidationSet: getValidationSet(FieldDefinitions.COMMENT_ENTITY),
    createCommentValidationSet: getValidationSet(FieldDefinitions.CREATE_COMMENT),
    updateCommentValidationSet: getValidationSet(FieldDefinitions.UPDATE_COMMENT),
    deleteCommentValidationSet: getValidationSet(FieldDefinitions.DELETE_COMMENT),
    deleteInceptionValidationSet: getValidationSet(FieldDefinitions.DELETE_INCEPTION),
    createElicitationValidationSet: getValidationSet(FieldDefinitions.CREATE_ELICITATION),
    updateElicitationValidationSet: getValidationSet(FieldDefinitions.UPDATE_ELICITATION),
    deleteElicitationValidationSet: getValidationSet(FieldDefinitions.DELETE_ELICITATION)

};

module.exports = { validationSets };