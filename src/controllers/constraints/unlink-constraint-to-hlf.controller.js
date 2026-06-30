// controllers/constraints/unlink-constraint-to-hlf.controller.js

const { unlinkConstraintToHlfService } = require("@services/constraints/unlink-constraint-to-hlf.service");
const { sendConstraintUnlinkedSuccess } = require("@/responses/success/constraint.response");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /constraints/unlink/:constraintId
 * Unlink a constraint from an HLF feature.
 * Category is automatically reset to GLOBAL — no user input needed.
 */
const unlinkConstraintToHlfController = async (req, res) => {
  try {
    const { constraint, inception } = req;

    logWithTime(
      `📍 [unlinkConstraintToHlfController] Unlinking constraint ${constraint._id} from HLF | ${getLogIdentifiers(req)}`
    );

    const result = await unlinkConstraintToHlfService({
      constraint,
      inception,
      unlinkedBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      logWithTime(
        `❌ [unlinkConstraintToHlfController] ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwConflictError(res, result.message);
    }

    logWithTime(`✅ [unlinkConstraintToHlfController] Constraint unlinked from HLF successfully | ${getLogIdentifiers(req)}`);
    return sendConstraintUnlinkedSuccess(res, result.message, result.constraint);

  } catch (error) {
    logWithTime(`❌ [unlinkConstraintToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { unlinkConstraintToHlfController };
