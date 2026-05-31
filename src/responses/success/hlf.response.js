// responses/success/hlf.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * 201 – High-level feature created successfully.
 */
const sendHlfCreatedSuccess = (res, hlf) => {
  return res.status(CREATED).json({
    success: true,
    message: "High-level feature created successfully.",
    data: { hlf },
  });
};

/**
 * 200 – High-level feature updated successfully.
 */
const sendHlfUpdatedSuccess = (res, hlf) => {
  return res.status(OK).json({
    success: true,
    message: "High-level feature updated successfully.",
    data: { hlf },
  });
};

/**
 * 200 – High-level feature deleted (soft) successfully.
 */
const sendHlfDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "High-level feature deleted successfully.",
  });
};

/**
 * 200 – Single high-level feature fetched successfully.
 */
const sendHlfFetchedSuccess = (res, hlf) => {
  return res.status(OK).json({
    success: true,
    message: "High-level feature fetched successfully.",
    data: { hlf },
  });
};

/**
 * 200 – High-level feature list fetched successfully.
 */
const sendHlfListFetchedSuccess = (res, hlfs, total, page, totalPages) => {
  return res.status(OK).json({
    success: true,
    message: "High-level features fetched successfully.",
    data: {
      hlfs,
      pagination: { total, page, totalPages },
    },
  });
};

/**
 * 200 – High-level feature linked to idea successfully.
 */
const sendHlfLinkedSuccess = (res, message, hlf) => {
  return res.status(OK).json({
    success: true,
    message: message,
    data: { hlf },
  });
};

/**
 * 200 – High-level feature unlinked from idea successfully.
 */
const sendHlfUnlinkedSuccess = (res, message, hlf) => {
  return res.status(OK).json({
    success: true,
    message: message,
    data: { hlf },
  });
};

module.exports = {
  sendHlfCreatedSuccess,
  sendHlfUpdatedSuccess,
  sendHlfDeletedSuccess,
  sendHlfFetchedSuccess,
  sendHlfListFetchedSuccess,
  sendHlfLinkedSuccess,
  sendHlfUnlinkedSuccess,
};
