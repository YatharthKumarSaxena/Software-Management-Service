const { StakeholderModel } = require("@models/stakeholder.model");
const { logMiddlewareError } = require("@utils/log-error.util");
const { throwAccessDeniedError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const checkUserIsStakeholder = async (req, res, next) => {
    try {
        const userId = req?.admin?.adminId || req?.client?.clientId; // JWT verification middleware ne inject kiya hai
        const project = req.project;

        const isStakeholder = await StakeholderModel.exists({ userId, projectId: project.projectId });

        if (!isStakeholder) {
            logMiddlewareError("checkUserIsStakeholder", `User ${userId} is not a stakeholder of project ${project.projectId}`, req);
            return throwAccessDeniedError(res, "You do not have permission to perform this action on the specified project.");
        }

        logWithTime(`✅ User ${userId} is a stakeholder of project ${project.projectId}`);

        return next();
    } catch (err) {
        logMiddlewareError("checkUserIsStakeholder", `Unexpected error: ${err.message}`, req);
        return throwInternalServerError(res, err);
    }
}

module.exports = {
    checkUserIsStakeholder
}