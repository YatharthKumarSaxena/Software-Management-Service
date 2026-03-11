// middlewares/common/active-project-guard.middleware.js

const { ProjectStatus } = require("@configs/enums.config");
const {
  throwBadRequestError,
  logMiddlewareError,
  throwInternalServerError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * activeProjectGuard
 *
 * Must be used AFTER fetchProjectMiddleware (which attaches req.project).
 *
 * Allows the request to proceed only when the project's status is
 * ACTIVE or DRAFT. All other statuses (ON_HOLD, COMPLETED, ABORTED,
 * ARCHIVED) cause a 400 "Project is not active" response.
 *
 * Typical use-case: mutations that should only touch live projects
 * (e.g. update project details, change phase, etc.).
 *
 * Usage in route chain:
 *   router.patch(ROUTE, [...authMiddlewares, fetchProjectMiddleware, activeProjectGuardMiddleware, ...], controller)
 */
const activeProjectGuardMiddleware = (req, res, next) => {
  try {
    const project = req.project;

    // Safety: fetchProjectMiddleware must run first
    if (!project) {
      logMiddlewareError("activeProjectGuard", "req.project is not set – fetchProjectMiddleware must run first", req);
      return throwBadRequestError(res, "Project not loaded", "Internal middleware ordering error.");
    }

    const allowedStatuses = [ProjectStatus.ACTIVE, ProjectStatus.DRAFT];

    if (!allowedStatuses.includes(project.projectStatus)) {
      logMiddlewareError("activeProjectGuard",`Request denied as Project Status is found to be ${project.projectStatus}`,req);
      return throwBadRequestError(
        res,
        `Project is not active or draft.`,
        `This operation is only allowed on ACTIVE or DRAFT projects. Current status: ${project.projectStatus}`
      );
    }

    logWithTime(`✅ Project is found as ${project.projectStatus}`);

    return next();
  } catch (error) {
    logMiddlewareError("activeProjectGuard", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { activeProjectGuardMiddleware };
