// middlewares/inceptions/fetch-latest-inception.middleware.js

const { InceptionModel } = require("@models/inception.model");
const {
  throwDBResourceNotFoundError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Middleware to fetch the latest inception for a project.
 * 
 * Uses version.major DESC ordering to find the latest.
 * Assumes req.project is already set by fetchProjectMiddleware.
 * 
 * Sets:
 *   - req.inception: The latest inception document
 *   - req.projectId: Project ID (from req.project._id)
 *
 * Returns 404 if not found or is soft-deleted.
 */
const fetchLatestInceptionMiddleware = async (req, res, next) => {
  try {
    const projectId = req.project._id || req.params.projectId;

    logWithTime(
      `🔍 [fetchLatestInceptionMiddleware] Fetching latest inception for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── 1. Query latest by version.major DESC ─────────────────────────
    const latestInception = await InceptionModel.findOne({
      projectId,
      isDeleted: false
    })
      .sort({ "version.major": -1 })
      .lean();

    // ── 2. Guard: Check if found ──────────────────────────────────────
    if (!latestInception) {
      logWithTime(
        `⚠️ [fetchLatestInceptionMiddleware] No active inception found for project: ${projectId} | ${getLogIdentifiers(req)}`
      );
      return throwDBResourceNotFoundError(res, "Active inception");
    }

    // ── 3. Set request context ────────────────────────────────────────
    req.inception = latestInception;
    req.projectId = projectId;

    logWithTime(
      `✅ [fetchLatestInceptionMiddleware] Latest inception found: ${latestInception._id} | ${getLogIdentifiers(req)}`
    );
    return next();

  } catch (error) {
    logWithTime(`❌ [fetchLatestInceptionMiddleware] Error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwDBResourceNotFoundError(res, "Inception");
  }
};

module.exports = { fetchLatestInceptionMiddleware };
