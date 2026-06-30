// responses/success/constraint.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * 201 – Constraint created successfully.
 */
const sendConstraintCreatedSuccess = (res, constraint) => {
  return res.status(CREATED).json({
    success: true,
    message: "Constraint created successfully.",
    data: { constraint },
  });
};

/**
 * 200 – Constraint updated successfully.
 */
const sendConstraintUpdatedSuccess = (res, constraint) => {
  return res.status(OK).json({
    success: true,
    message: "Constraint updated successfully.",
    data: { constraint },
  });
};

/**
 * 200 – Constraint deleted (soft) successfully.
 */
const sendConstraintDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "Constraint deleted successfully.",
  });
};

/**
 * 200 – Single constraint fetched successfully.
 */
const sendConstraintFetchedSuccess = (res, constraint) => {
  return res.status(OK).json({
    success: true,
    message: "Constraint fetched successfully.",
    data: { constraint },
  });
};

/**
 * 200 – Constraint list fetched successfully.
 */
const sendConstraintsListFetchedSuccess = (res, constraints, total, page, totalPages) => {
  return res.status(OK).json({
    success: true,
    message: "Constraints fetched successfully.",
    data: {
      constraints,
      pagination: { total, page, totalPages },
    },
  });
};

/**
 * 200 – Constraint linked to HLF successfully.
 */
const sendConstraintLinkedSuccess = (res, message, constraint) => {
  return res.status(OK).json({
    success: true,
    message: message,
    data: { constraint },
  });
};

/**
 * 200 – Constraint unlinked from HLF successfully.
 */
const sendConstraintUnlinkedSuccess = (res, message, constraint) => {
  return res.status(OK).json({
    success: true,
    message: message,
    data: { constraint },
  });
};

module.exports = {
  sendConstraintCreatedSuccess,
  sendConstraintUpdatedSuccess,
  sendConstraintDeletedSuccess,
  sendConstraintFetchedSuccess,
  sendConstraintsListFetchedSuccess,
  sendConstraintLinkedSuccess,
  sendConstraintUnlinkedSuccess,
};
