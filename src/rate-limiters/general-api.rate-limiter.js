// middlewares/rate-limiters/apiRateLimiters.js
const { createRateLimiter } = require("./create.rate-limiter");
const { perUserAndDevice } = require("@configs/rate-limit.config");


const welcomeAdminRateLimiter = createRateLimiter(perUserAndDevice.welcomeAdmin);
const welcomeClientRateLimiter = createRateLimiter(perUserAndDevice.welcomeClient);

const createProjectRateLimiter   = createRateLimiter(perUserAndDevice.createProject);
const updateProjectRateLimiter   = createRateLimiter(perUserAndDevice.updateProject);
const onHoldProjectRateLimiter   = createRateLimiter(perUserAndDevice.onHoldProject);
const abortProjectRateLimiter    = createRateLimiter(perUserAndDevice.abortProject);
const completeProjectRateLimiter = createRateLimiter(perUserAndDevice.completeProject);
const resumeProjectRateLimiter   = createRateLimiter(perUserAndDevice.resumeProject);
const deleteProjectRateLimiter   = createRateLimiter(perUserAndDevice.deleteProject);
const archiveProjectRateLimiter  = createRateLimiter(perUserAndDevice.archiveProject);
const activateProjectRateLimiter = createRateLimiter(perUserAndDevice.activateProject);
const changeProjectOwnerRateLimiter = createRateLimiter(perUserAndDevice.changeProjectOwner);
const getProjectRateLimiter      = createRateLimiter(perUserAndDevice.getProject);
const getProjectsRateLimiter     = createRateLimiter(perUserAndDevice.getProjects);

const createStakeholderRateLimiter = createRateLimiter(perUserAndDevice.createStakeholder);
const updateStakeholderRateLimiter = createRateLimiter(perUserAndDevice.updateStakeholder);
const deleteStakeholderRateLimiter = createRateLimiter(perUserAndDevice.deleteStakeholder);
const getStakeholderRateLimiter    = createRateLimiter(perUserAndDevice.getStakeholder);
const getStakeholdersRateLimiter   = createRateLimiter(perUserAndDevice.getStakeholders);

const clientGetProjectRateLimiter      = createRateLimiter(perUserAndDevice.clientGetProject);
const clientListProjectsRateLimiter    = createRateLimiter(perUserAndDevice.clientListProjects);
const clientGetStakeholderRateLimiter  = createRateLimiter(perUserAndDevice.clientGetStakeholder);
const clientListStakeholdersRateLimiter = createRateLimiter(perUserAndDevice.clientListStakeholders);

const createProductRequestRateLimiter = createRateLimiter(perUserAndDevice.createProductRequest);
const updateProductRequestRateLimiter = createRateLimiter(perUserAndDevice.updateProductRequest);
const deleteProductRequestRateLimiter = createRateLimiter(perUserAndDevice.deleteProductRequest);
const getProductRequestRateLimiter    = createRateLimiter(perUserAndDevice.getProductRequest);
const listProductRequestsRateLimiter   = createRateLimiter(perUserAndDevice.listProductRequests);
const cancelProductRequestRateLimiter = createRateLimiter(perUserAndDevice.cancelProductRequest);
const approveProductRequestRateLimiter = createRateLimiter(perUserAndDevice.approveProductRequest);
const rejectProductRequestRateLimiter = createRateLimiter(perUserAndDevice.rejectProductRequest);

const createOrgProjectRequestRateLimiter = createRateLimiter(perUserAndDevice.createOrgProjectRequest);
const getOrgProjectRequestRateLimiter = createRateLimiter(perUserAndDevice.getOrgProjectRequest);
const listMyOrgProjectRequestsRateLimiter = createRateLimiter(perUserAndDevice.listMyOrgProjectRequests);
const listProjectOrgRequestsRateLimiter = createRateLimiter(perUserAndDevice.listProjectOrgRequests);
const updateOrgProjectRequestRateLimiter = createRateLimiter(perUserAndDevice.updateOrgProjectRequest);
const withdrawOrgProjectRequestRateLimiter = createRateLimiter(perUserAndDevice.withdrawOrgProjectRequest);
const approveOrgProjectRequestRateLimiter = createRateLimiter(perUserAndDevice.approveOrgProjectRequest);
const rejectOrgProjectRequestRateLimiter = createRateLimiter(perUserAndDevice.rejectOrgProjectRequest);

const createCommentRateLimiter = createRateLimiter(perUserAndDevice.createComment);
const updateCommentRateLimiter = createRateLimiter(perUserAndDevice.updateComment);
const deleteCommentRateLimiter = createRateLimiter(perUserAndDevice.deleteComment);
const getCommentRateLimiter    = createRateLimiter(perUserAndDevice.getComment);
const listCommentsRateLimiter  = createRateLimiter(perUserAndDevice.listComments);
const listHierarchicalCommentsRateLimiter = createRateLimiter(perUserAndDevice.listHierarchicalComments);
const getMyActivityRateLimiter = createRateLimiter(perUserAndDevice.getMyActivity);
const getActivityByIdRateLimiter = createRateLimiter(perUserAndDevice.getActivityById);
const listActivityRateLimiter = createRateLimiter(perUserAndDevice.listActivity);

const createScopeRateLimiter = createRateLimiter(perUserAndDevice.createScope);
const updateScopeRateLimiter = createRateLimiter(perUserAndDevice.updateScope);
const deleteScopeRateLimiter = createRateLimiter(perUserAndDevice.deleteScope);
const getScopeRateLimiter    = createRateLimiter(perUserAndDevice.getScope);
const listScopesRateLimiter  = createRateLimiter(perUserAndDevice.listScopes);
const linkScopeToHlfRateLimiter = createRateLimiter(perUserAndDevice.linkScopeToHLF);
const unlinkScopeToHlfRateLimiter = createRateLimiter(perUserAndDevice.unlinkScopeFromHLF);

const createHLFRateLimiter = createRateLimiter(perUserAndDevice.createHLF);
const updateHLFRateLimiter = createRateLimiter(perUserAndDevice.updateHLF);
const deleteHLFRateLimiter = createRateLimiter(perUserAndDevice.deleteHLF);
const getHLFRateLimiter    = createRateLimiter(perUserAndDevice.getHLF);
const listHLFsRateLimiter  = createRateLimiter(perUserAndDevice.listHLFs);
const linkHLFtoIdeaRateLimiter = createRateLimiter(perUserAndDevice.linkHLFtoIdea);
const unlinkHLFFromIdeaRateLimiter = createRateLimiter(perUserAndDevice.unlinkHLFFromIdea);

const createIdeaRateLimiter  = createRateLimiter(perUserAndDevice.createIdea);
const updateIdeaRateLimiter  = createRateLimiter(perUserAndDevice.updateIdea);
const deleteIdeaRateLimiter  = createRateLimiter(perUserAndDevice.deleteIdea);
const getIdeaRateLimiter     = createRateLimiter(perUserAndDevice.getIdea);
const listIdeasRateLimiter   = createRateLimiter(perUserAndDevice.listIdeas);
const acceptIdeaRateLimiter  = createRateLimiter(perUserAndDevice.acceptIdea);
const rejectIdeaRateLimiter  = createRateLimiter(perUserAndDevice.rejectIdea);
const deferIdeaRateLimiter   = createRateLimiter(perUserAndDevice.deferIdea);
const reopenIdeaRateLimiter  = createRateLimiter(perUserAndDevice.reopenIdea);
const revokeIdeaRateLimiter  = createRateLimiter(perUserAndDevice.revokeIdea);

const createProductVisionRateLimiter = createRateLimiter(perUserAndDevice.createProductVision);
const updateProductVisionRateLimiter = createRateLimiter(perUserAndDevice.updateProductVision);
const deleteProductVisionRateLimiter = createRateLimiter(perUserAndDevice.deleteProductVision);
const getProductVisionRateLimiter    = createRateLimiter(perUserAndDevice.getProductVision);

const addParticipantRateLimiter = createRateLimiter(perUserAndDevice.addParticipant);
const removeParticipantRateLimiter = createRateLimiter(perUserAndDevice.removeParticipant);
const updateParticipantRateLimiter = createRateLimiter(perUserAndDevice.updateParticipant);
const getParticipantRateLimiter = createRateLimiter(perUserAndDevice.getParticipant);
const listParticipantsRateLimiter = createRateLimiter(perUserAndDevice.listParticipants);

// ── Meeting rate limiters ────────────────────────────────────────────────────
const createMeetingRateLimiter = createRateLimiter(perUserAndDevice.createMeeting);
const updateMeetingRateLimiter = createRateLimiter(perUserAndDevice.updateMeeting);
const cancelMeetingRateLimiter = createRateLimiter(perUserAndDevice.cancelMeeting);
const getMeetingRateLimiter = createRateLimiter(perUserAndDevice.getMeeting);
const listMeetingsRateLimiter = createRateLimiter(perUserAndDevice.listMeetings);

// ── Meeting scheduling operations rate limiters ───────────────────────────────
const scheduleMeetingRateLimiter = createRateLimiter(perUserAndDevice.scheduleMeeting);
const rescheduleMeetingRateLimiter = createRateLimiter(perUserAndDevice.rescheduleMeeting);
const startMeetingRateLimiter = createRateLimiter(perUserAndDevice.startMeeting);
const endMeetingRateLimiter = createRateLimiter(perUserAndDevice.endMeeting);
const freezeMeetingRateLimiter = createRateLimiter(perUserAndDevice.freezeMeeting);

const createPhaseRateLimiter = createRateLimiter(perUserAndDevice.createPhase);
const updatePhaseStatusRateLimiter = createRateLimiter(perUserAndDevice.updatePhaseStatus);
const updatePhaseSettingsRateLimiter = createRateLimiter(perUserAndDevice.updatePhaseSettings);
const deletePhaseRateLimiter = createRateLimiter(perUserAndDevice.deletePhase);
const getPhaseRateLimiter = createRateLimiter(perUserAndDevice.getPhase);
const getLatestPhaseRateLimiter = createRateLimiter(perUserAndDevice.getLatestPhase);
const listPhasesRateLimiter = createRateLimiter(perUserAndDevice.listPhases);

const createRequirementRateLimiter = createRateLimiter(perUserAndDevice.createRequirement);
const createRequirementInBulkRateLimiter = createRateLimiter(perUserAndDevice.createRequirementInBulk);
const listRequirementsRateLimiter = createRateLimiter(perUserAndDevice.listRequirements);
const getRequirementRateLimiter = createRateLimiter(perUserAndDevice.getRequirement)

// ── Constraint rate limiters ──────────────────────────────────────────────
const createConstraintRateLimiter = createRateLimiter(perUserAndDevice.createConstraint);
const updateConstraintRateLimiter = createRateLimiter(perUserAndDevice.updateConstraint);
const deleteConstraintRateLimiter = createRateLimiter(perUserAndDevice.deleteConstraint);
const getConstraintRateLimiter    = createRateLimiter(perUserAndDevice.getConstraint);
const listConstraintsRateLimiter  = createRateLimiter(perUserAndDevice.listConstraints);
const linkConstraintToHlfRateLimiter   = createRateLimiter(perUserAndDevice.linkConstraintToHlf);
const unlinkConstraintToHlfRateLimiter = createRateLimiter(perUserAndDevice.unlinkConstraintToHlf);


module.exports = {
    welcomeAdminRateLimiter,
    welcomeClientRateLimiter,
    createProjectRateLimiter,
    updateProjectRateLimiter,
    onHoldProjectRateLimiter,
    abortProjectRateLimiter,
    completeProjectRateLimiter,
    resumeProjectRateLimiter,
    deleteProjectRateLimiter,
    archiveProjectRateLimiter,
    activateProjectRateLimiter,
    changeProjectOwnerRateLimiter,
    getProjectRateLimiter,
    getProjectsRateLimiter,
    createStakeholderRateLimiter,
    updateStakeholderRateLimiter,
    deleteStakeholderRateLimiter,
    getStakeholderRateLimiter,
    getStakeholdersRateLimiter,
    clientGetProjectRateLimiter,
    clientListProjectsRateLimiter,
    clientGetStakeholderRateLimiter,
    clientListStakeholdersRateLimiter,
    createProductRequestRateLimiter,
    updateProductRequestRateLimiter,
    deleteProductRequestRateLimiter,
    getProductRequestRateLimiter,
    listProductRequestsRateLimiter,
    cancelProductRequestRateLimiter,
    approveProductRequestRateLimiter,
    rejectProductRequestRateLimiter,
    createOrgProjectRequestRateLimiter,
    getOrgProjectRequestRateLimiter,
    listMyOrgProjectRequestsRateLimiter,
    listProjectOrgRequestsRateLimiter,
    updateOrgProjectRequestRateLimiter,
    withdrawOrgProjectRequestRateLimiter,
    approveOrgProjectRequestRateLimiter,
    rejectOrgProjectRequestRateLimiter,
    activateProjectRateLimiter,
    getMyActivityRateLimiter,
    getActivityByIdRateLimiter,
    listActivityRateLimiter,
    createCommentRateLimiter,
    updateCommentRateLimiter,
    deleteCommentRateLimiter,
    getCommentRateLimiter,
    listCommentsRateLimiter,
    listHierarchicalCommentsRateLimiter,
    createScopeRateLimiter,
    updateScopeRateLimiter,
    deleteScopeRateLimiter,
    getScopeRateLimiter,
    listScopesRateLimiter,
    linkScopeToHlfRateLimiter,
    unlinkScopeToHlfRateLimiter,
    createHLFRateLimiter,
    updateHLFRateLimiter,
    deleteHLFRateLimiter,
    getHLFRateLimiter,
    listHLFsRateLimiter,
    linkHLFtoIdeaRateLimiter,
    unlinkHLFFromIdeaRateLimiter,
    createIdeaRateLimiter,
    updateIdeaRateLimiter,
    deleteIdeaRateLimiter,
    getIdeaRateLimiter,
    listIdeasRateLimiter,
    acceptIdeaRateLimiter,
    rejectIdeaRateLimiter,
    deferIdeaRateLimiter,
    reopenIdeaRateLimiter,
    revokeIdeaRateLimiter,
    createProductVisionRateLimiter,
    updateProductVisionRateLimiter,
    deleteProductVisionRateLimiter,
    getProductVisionRateLimiter,
    addParticipantRateLimiter,
    removeParticipantRateLimiter,
    updateParticipantRateLimiter,
    getParticipantRateLimiter,
    listParticipantsRateLimiter,
    createMeetingRateLimiter,
    updateMeetingRateLimiter,
    cancelMeetingRateLimiter,
    getMeetingRateLimiter,
    listMeetingsRateLimiter,
    scheduleMeetingRateLimiter,
    rescheduleMeetingRateLimiter,
    startMeetingRateLimiter,
    endMeetingRateLimiter,
    freezeMeetingRateLimiter,
    createPhaseRateLimiter,
    updatePhaseStatusRateLimiter,
    updatePhaseSettingsRateLimiter,
    deletePhaseRateLimiter,
    getPhaseRateLimiter,
    getLatestPhaseRateLimiter,
    listPhasesRateLimiter,
    createRequirementRateLimiter,
    listRequirementsRateLimiter,
    getRequirementRateLimiter,
    createRequirementInBulkRateLimiter,
    createConstraintRateLimiter,
    updateConstraintRateLimiter,
    deleteConstraintRateLimiter,
    getConstraintRateLimiter,
    listConstraintsRateLimiter,
    linkConstraintToHlfRateLimiter,
    unlinkConstraintToHlfRateLimiter
}
