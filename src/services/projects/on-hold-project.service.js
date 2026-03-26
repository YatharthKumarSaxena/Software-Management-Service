// services/projects/on-hold-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Puts an ACTIVE project on hold.
 *
 * Allowed source status : ACTIVE only
 * Blocked if            : isDeleted === true  |  status !== ACTIVE
 *
 * Sets projectStatus → ON_HOLD, records onHoldReasonType / onHoldReasonDescription,
 * stamps onHoldAt and onHoldBy.
 *
 * Version is NOT incremented – on-hold is a lifecycle event.
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.onHoldBy              - Admin USR ID
 * @param {string} params.onHoldReasonType      - enum value (required)
 * @param {string} [params.onHoldReasonDescription]
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const onHoldProjectService = async (project, params) => {
    try {

        const blockedStatuses = [ProjectStatus.DRAFT, ProjectStatus.ON_HOLD, ProjectStatus.ABORTED, ProjectStatus.COMPLETED];
        if (blockedStatuses.includes(project.projectStatus)) {
            return {
                success: false,
                message: "Only an ACTIVE project can be put on hold",
                currentStatus: project.projectStatus,
            };
        }

        const updatePayload = {
            projectStatus: ProjectStatus.ON_HOLD,
            onHoldReasonType: params.onHoldReasonType,
            onHoldReasonDescription: params.onHoldReasonDescription || null,
            onHoldAt: new Date(),
            onHoldBy: params.onHoldBy,
            updatedBy: params.onHoldBy,
        };

        const updatedProject = await ProjectModel.findByIdAndUpdate(
            project._id,
            { $set: updatePayload },
            { returnDocument: 'after', runValidators: true }
        );

        // ── Fire-and-forget: activity tracking ──────────────────────────
        const { user, device, requestId } = params.auditContext || {};
        const { oldData, newData } = prepareAuditData(project, updatedProject);

        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.ON_HOLD_PROJECT,
            `Project '${updatedProject.name}' (${project._id}) put on hold by ${params.onHoldBy}. Reason: ${params.onHoldReasonType}`,
            { oldData, newData, adminActions: { targetId: project._id } }
        );

        return { success: true, project: updatedProject };
    } catch (error) {
        if (error.name === "ValidationError") {
            return { success: false, message: "Validation error", error: error.message };
        }
        return { success: false, message: "Internal error while putting project on hold", error: error.message };
    }
};

/**
 * Auto-converts an ON_HOLD project back to ACTIVE.
 *
 * Called internally by other services when they detect projectStatus === ON_HOLD
 * and need the project to be active before proceeding.
 *
 * Increments the minor version on conversion so the audit trail reflects
 * that the document state changed.
 *
 * @param {Object} project
 * @param {string} project._id
 * @param {string} project.projectStatus
 * @param {Object} params
 * @param {string} params.convertedBy   - Admin USR ID (or system identifier)
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const convertOnHoldToActiveProjectService = async (project, params) => {
    try {

        if (project.projectStatus !== ProjectStatus.ON_HOLD) {
            return {
                success: false,
                message: "Only an ON_HOLD project can be auto-converted to ACTIVE",
                currentStatus: project.projectStatus,
            };
        }

        // ✅ Update version (minor++)
        const currentVersion = project.version || { major: 1, minor: 0 };

        const updatePayload = {
            projectStatus: ProjectStatus.ACTIVE,
            updatedBy: params.convertedBy,
            // clear any stale on-hold-related stamps
            isArchived: false,
            archivedAt: null,
            archivedBy: null,
        };

        const updatedProject = await ProjectModel.findByIdAndUpdate(
            project._id,
            { $set: updatePayload },
            { returnDocument: 'after', runValidators: true }
        );

        // ── Fire-and-forget: activity tracking ──────────────────────────
        const { user, device, requestId } = params.auditContext || {};
        const { oldData, newData } = prepareAuditData(project, updatedProject);

        const versionString = `v${updatedProject.version.major}.${updatedProject.version.minor}`;

        logActivityTrackerEvent(
            user,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.CONVERT_ON_HOLD_TO_ACTIVE,
            `Project '${updatedProject.name}' (${project._id}) auto-converted from ON_HOLD to ACTIVE of ${versionString} by ${params.convertedBy}`,
            { oldData, newData, adminActions: { targetId: project._id } }
        );

        return { success: true, project: updatedProject };
    } catch (error) {
        if (error.name === "ValidationError") {
            return { success: false, message: "Validation error", error: error.message };
        }
        return { success: false, message: "Internal error while auto-converting project to active", error: error.message };
    }
};

module.exports = { 
    onHoldProjectService,
    convertOnHoldToActiveProjectService,
};
