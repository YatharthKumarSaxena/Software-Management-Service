// responses/success/hlf-requirement-mapping.response.js

const { OK } = require("@/configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Success response handlers for requirement-to-HLF mapping operations.
 * Each handler sends response with appropriate HTTP status code.
 */

// ── FETCH SINGLE MAPPING ───────────────────────────────────────────
const sendMappingFetchSuccess = (res, mapping) => {
  logWithTime(`✅ [sendMappingFetchSuccess] Mapping fetched ID: ${mapping._id}`);
  return res.status(OK).json({
    success: true,
    message: "Mapping fetched successfully",
    data: {
      mapping
    }
  });
};

// ── LIST MAPPINGS ──────────────────────────────────────────────────
const sendMappingListSuccess = (res, mappings, pagination) => {
  logWithTime(`✅ [sendMappingListSuccess] Listed ${mappings.length} mappings`);
  return res.status(OK).json({
    success: true,
    message: "Mappings listed successfully",
    data: {
      mappings,
      pagination: pagination || {}
    }
  });
};

// ── UPDATE MAPPING ─────────────────────────────────────────────────
const sendMappingUpdateSuccess = (res, mapping, message) => {
  logWithTime(`✅ [sendMappingUpdateSuccess] Mapping updated ID: ${mapping._id}`);
  return res.status(OK).json({
    success: true,
    message: message || "Mapping updated successfully",
    data: {
      mapping
    }
  });
};

module.exports = {
  sendMappingFetchSuccess,
  sendMappingListSuccess,
  sendMappingUpdateSuccess
};
