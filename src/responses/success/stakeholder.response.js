// responses/success/stakeholder.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * 201 – Stakeholder created successfully.
 */
const sendStakeholderCreatedSuccess = (res, stakeholder) => {
  return res.status(CREATED).json({
    success: true,
    message: "Stakeholder created successfully.",
    data: { stakeholder },
  });
};

/**
 * 200 – Stakeholder updated successfully.
 */
const sendStakeholderUpdatedSuccess = (res, stakeholder) => {
  return res.status(OK).json({
    success: true,
    message: "Stakeholder updated successfully.",
    data: { stakeholder },
  });
};

/**
 * 200 – Stakeholder deleted (soft) successfully.
 */
const sendStakeholderDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "Stakeholder deleted successfully.",
  });
};

/**
 * 200 – Single stakeholder fetched successfully.
 */
const sendStakeholderFetchedSuccess = (res, stakeholder) => {
  return res.status(OK).json({
    success: true,
    message: "Stakeholder fetched successfully.",
    data: { stakeholder },
  });
};

/**
 * 200 – Stakeholder list fetched successfully.
 */
const sendStakeholdersListFetchedSuccess = (res, stakeholders, total, page, totalPages) => {
  return res.status(OK).json({
    success: true,
    message: "Stakeholders fetched successfully.",
    data: {
      stakeholders,
      pagination: { total, page, totalPages },
    },
  });
};

module.exports = {
  sendStakeholderCreatedSuccess,
  sendStakeholderUpdatedSuccess,
  sendStakeholderDeletedSuccess,
  sendStakeholderFetchedSuccess,
  sendStakeholdersListFetchedSuccess,
};
