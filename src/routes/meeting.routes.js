const express = require("express");
const {
  meetingControllers
} = require("@/controllers/meetings");

const {
  meetingMiddlewares
} = require("@/middlewares/meetings");

const { MEETING_ROUTES } = require("@configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { projectMiddlewares } = require("@/middlewares/projects");
const { stakeholderMiddlewares } = require("@/middlewares/stakeholders");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");
const {
  CREATE_MEETING,
  UPDATE_MEETING,
  CANCEL_MEETING,
  GET_MEETING,
  LIST_MEETINGS,
  SCHEDULE_MEETING,
  RESHEDULE_MEETING,
  START_MEETING,
  END_MEETING,
  FREEZE_MEETING
} = MEETING_ROUTES

const meetingRouter = express.Router();

meetingRouter.post(
  CREATE_MEETING,[
    ...baseAuthAdminMiddlewares,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.createMeetingStakeholderRoleAccessMiddleware,

    // Request validation
    meetingMiddlewares.createMeetingPresenceMiddleware,
    meetingMiddlewares.createMeetingValidationMiddleware
  ],
  meetingControllers.createMeetingController
)

meetingRouter.patch(
  CANCEL_MEETING,[
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.cancelMeetingStakeholderRoleAccessMiddleware,

    // Meeting validations
    meetingMiddlewares.meetingStatusGuardMiddleware,
    meetingMiddlewares.validateUserIsParticipantMiddleware,

    // Request validation
    meetingMiddlewares.cancelMeetingPresenceMiddleware,
    meetingMiddlewares.cancelMeetingValidationMiddleware

  ],
  meetingControllers.cancelMeetingController
)

meetingRouter.patch(
  UPDATE_MEETING ,[
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,

    // Meeting validations
    meetingMiddlewares.meetingStatusGuardMiddleware,
    meetingMiddlewares.validateUserIsParticipantMiddleware,

    // Request validation
    meetingMiddlewares.updateMeetingPresenceMiddleware,
    meetingMiddlewares.updateMeetingValidationMiddleware

  ],
  meetingControllers.updateMeetingController
)

meetingRouter.get(
  GET_MEETING, [
    ...baseAuthClientOrAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    meetingMiddlewares.validateUserIsParticipantMiddleware
  ],
  meetingControllers.getMeetingController
)

meetingRouter.get(
  LIST_MEETINGS, [
    ...baseAuthClientOrAdminMiddlewares,

    // Project (from projectId)
    projectMiddlewares.fetchProjectMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder

  ],
  meetingControllers.listMeetingsController
)

meetingRouter.patch(
  SCHEDULE_MEETING, [
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,
    meetingMiddlewares.meetingStatusGuardMiddleware, // Ensure meeting is in DRAFT status before scheduling

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    meetingMiddlewares.validateUserIsParticipantMiddleware,

    // Request validation
    meetingMiddlewares.scheduleMeetingPresenceMiddleware,
    meetingMiddlewares.scheduleMeetingValidationMiddleware

  ],
  meetingControllers.scheduleMeetingController
)

meetingRouter.patch(
  RESHEDULE_MEETING, [
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    meetingMiddlewares.validateUserIsParticipantMiddleware,

    // Request validation
    meetingMiddlewares.rescheduleMeetingPresenceMiddleware,
    meetingMiddlewares.rescheduleMeetingValidationMiddleware

  ],
  meetingControllers.rescheduleMeetingController
)

meetingRouter.patch(
  END_MEETING, [
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    meetingMiddlewares.validateUserIsParticipantMiddleware

  ],
  meetingControllers.endMeetingController
)

meetingRouter.patch(
  START_MEETING, [
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    meetingMiddlewares.validateUserIsParticipantMiddleware

  ],
  meetingControllers.startMeetingController
)

meetingRouter.patch(
  FREEZE_MEETING, [
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.freezeMeetingStakeholderRoleAccessMiddleware,
    meetingMiddlewares.validateUserIsParticipantMiddleware

  ],
  meetingControllers.freezeMeetingController
)

module.exports = {
  meetingRouter
};
