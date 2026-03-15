// middlewares/common/fetch-project.middleware.js

const { ProjectModel } = require("@models/project.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwMissingFieldsError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");

/**
 * fetchProjectMiddleware
 *
 * Validates the `:projectId` route param, fetches the project from DB,
 * and attaches it to `req.project` for downstream middlewares and controllers.
 *
 * Returns 400 if projectId is missing or malformed.
 * Returns 404 if no project exists with that id.
 * Returns 400 if the project is soft-deleted (isDeleted === true).
 *
 * Usage in route chain:
 *   router.patch(ROUTE, [...authMiddlewares, fetchProjectMiddleware, ...otherMiddlewares], controller)
 */
const fetchProjectMiddleware = async (req, res, next) => {
  try {
    const projectId = req?.params?.projectId || req?.body?.projectId;

    // ── 1. Param presence ────────────────────────────────────────────
    if (!projectId) {
      return throwMissingFieldsError(res, ["projectId"]);
    }

    // ── 2. Format validation ─────────────────────────────────────────
    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(
        res,
        "Invalid projectId format",
        "projectId must be a valid MongoDB ObjectId string."
      );
    }

    // ── 3. DB lookup ─────────────────────────────────────────────────
    const project = await ProjectModel.findById(projectId);

    if (!project) {
      return throwDBResourceNotFoundError(res, "Project");
    }

    // ── 4. Soft-delete guard ─────────────────────────────────────────
    if (project.isDeleted) {
      return throwBadRequestError(
        res,
        "Project is deleted",
        "This project has been deleted and cannot be accessed."
      );
    }

    // ── 5. Attach and continue ───────────────────────────────────────
    req.project = project;
    return next();

  } catch (error) {
    logMiddlewareError("fetchProjectMiddleware", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchProjectMiddleware };
