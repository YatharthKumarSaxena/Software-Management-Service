// responses/success/stakeholder.response.js

const { CREATED, OK } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

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
const sendStakeholdersListFetchedSuccess = (res, stakeholders, pagination) => {
  logWithTime(`✅ [sendStakeholdersListFetchedSuccess] Listed ${stakeholders?.length || 0} stakeholders`);
  return res.status(OK).json({
    success: true,
    message: "Stakeholders listed successfully",
    data: stakeholders,
    pagination
  });
};

module.exports = {
  sendStakeholderCreatedSuccess,
  sendStakeholderUpdatedSuccess,
  sendStakeholderDeletedSuccess,
  sendStakeholderFetchedSuccess,
  sendStakeholdersListFetchedSuccess,
};
