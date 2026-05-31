// responses/success/scope.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * 201 – Scope created successfully.
 */
const sendScopeCreatedSuccess = (res, scope) => {
  return res.status(CREATED).json({
    success: true,
    message: "Scope created successfully.",
    data: { scope },
  });
};

/**
 * 200 – Scope updated successfully.
 */
const sendScopeUpdatedSuccess = (res, scope) => {
  return res.status(OK).json({
    success: true,
    message: "Scope updated successfully.",
    data: { scope },
  });
};

/**
 * 200 – Scope deleted (soft) successfully.
 */
const sendScopeDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "Scope deleted successfully.",
  });
};

/**
 * 200 – Single scope fetched successfully.
 */
const sendScopeFetchedSuccess = (res, scope) => {
  return res.status(OK).json({
    success: true,
    message: "Scope fetched successfully.",
    data: { scope },
  });
};

/**
 * 200 – Scope list fetched successfully.
 */
const sendScopesListFetchedSuccess = (res, scopes, total, page, totalPages) => {
  return res.status(OK).json({
    success: true,
    message: "Scopes fetched successfully.",
    data: {
      scopes,
      pagination: { total, page, totalPages },
    },
  });
};

/**
 * 200 – Scope linked to HLF successfully.
 */
const sendScopeLinkedSuccess = (res, message, scope) => {
  return res.status(OK).json({
    success: true,
    message: message,
    data: { scope },
  });
};

/**
 * 200 – Scope unlinked from HLF successfully.
 */
const sendScopeUnlinkedSuccess = (res,message, scope) => {
  return res.status(OK).json({
    success: true,
    message: message,
    data: { scope },
  });
};

module.exports = {
  sendScopeCreatedSuccess,
  sendScopeUpdatedSuccess,
  sendScopeDeletedSuccess,
  sendScopeFetchedSuccess,
  sendScopesListFetchedSuccess,
  sendScopeLinkedSuccess,
  sendScopeUnlinkedSuccess,
};
