// controllers/constraints/link-constraint-to-hlf.controller.js

const { linkConstraintToHlfService } = require("@services/constraints/link-constraint-to-hlf.service");
const { sendConstraintLinkedSuccess } = require("@/responses/success/constraint.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { FORBIDDEN } = require("@/configs/http-status.config");

/**
 * PATCH /constraints/link/:constraintId/:hlfId
 * Link a constraint to an HLF feature.
 * Category is automatically set to LOCAL — no user input needed.
 */
const linkConstraintToHlfController = async (req, res) => {
  try {
    const { constraint, hlf, inception } = req;

    logWithTime(
      `📍 [linkConstraintToHlfController] Linking constraint ${constraint._id} to HLF ${hlf._id} | ${getLogIdentifiers(req)}`
    );

    const result = await linkConstraintToHlfService({
      constraint,
      hlf,
      inception,
      linkedBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.errorCode === FORBIDDEN) {
        logWithTime(
          `🚫 [linkConstraintToHlfController] Access denied: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }
      logWithTime(
        `❌ [linkConstraintToHlfController] ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwConflictError(res, result.message);
    }

    logWithTime(`✅ [linkConstraintToHlfController] Constraint linked to HLF successfully | ${getLogIdentifiers(req)}`);
    return sendConstraintLinkedSuccess(res, result.message, result.constraint);

  } catch (error) {
    logWithTime(`❌ [linkConstraintToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { linkConstraintToHlfController };
