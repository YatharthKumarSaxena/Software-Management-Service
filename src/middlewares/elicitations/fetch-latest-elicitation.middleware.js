// middlewares/elicitations/fetch-latest-elicitation.middleware.js

const { ElicitationModel } = require("@models/elicitation.model");
const {
  throwDBResourceNotFoundError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Middleware to fetch the latest elicitation for a project.
 * 
 * Uses version.major DESC ordering to find the latest.
 * 
 * Sets:
 *   - req.elicitation: The latest elicitation document
 *   - req.projectId: Project ID
 *
 * Returns 404 if not found or is soft-deleted.
 */
const fetchLatestElicitationMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    logWithTime(
      `🔍 [fetchLatestElicitationMiddleware] Fetching latest elicitation for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── 1. Query latest by version.major DESC ─────────────────────────
    const latestElicitation = await ElicitationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false // Ensure we only delete if not frozen
    })
      .sort({ "version.major": -1 })
      .lean();

    // ── 2. Guard: Check if found ──────────────────────────────────────
    if (!latestElicitation) {
      logWithTime(
        `⚠️ [fetchLatestElicitationMiddleware] No active elicitation found for project: ${projectId} | ${getLogIdentifiers(req)}`
      );
      return throwDBResourceNotFoundError(res, "Active elicitation");
    }

    // ── 3. Set request context ────────────────────────────────────────
    req.elicitation = latestElicitation;
    req.projectId = projectId;

    logWithTime(
      `✅ [fetchLatestElicitationMiddleware] Latest elicitation found: ${latestElicitation._id} | ${getLogIdentifiers(req)}`
    );
    return next();

  } catch (error) {
    logWithTime(`❌ [fetchLatestElicitationMiddleware] Error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwDBResourceNotFoundError(res, "Elicitation");
  }
};

module.exports = { fetchLatestElicitationMiddleware };
