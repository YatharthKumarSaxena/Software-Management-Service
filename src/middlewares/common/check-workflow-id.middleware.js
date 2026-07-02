const { REQUEST_HEADERS } = require('@configs/headers.config');
const { throwInvalidResourceError, logMiddlewareError } = require('@/responses/common/error-handler.response');
const { logWithTime } = require('@/utils/time-stamps.util');
const { isValidUUID } = require('@/utils/id-validators.util');

const workflowIdMiddleware = (req, res, next) => {
  const incomingWorkflowId = req.workflowId || req.headers[REQUEST_HEADERS.WORKFLOW_ID];
  let workflowId = incomingWorkflowId?.trim();
  if (workflowId && !isValidUUID(workflowId)) {
    logMiddlewareError('checkWorkflowId', `Invalid Workflow ID: ${workflowId}`,req);
    return throwInvalidResourceError(res, 'Workflow ID', 'Workflow ID is not a valid UUID');
  }

  if (!workflowId) {
    workflowId = null;
  }

  req.workflowId = workflowId;
  logWithTime(`✅ Workflow ID: ${workflowId} verified`);

  return next();
};

module.exports = {
    workflowIdMiddleware
}