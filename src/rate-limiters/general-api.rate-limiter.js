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

const createHLFRateLimiter = createRateLimiter(perUserAndDevice.createHLF);
const updateHLFRateLimiter = createRateLimiter(perUserAndDevice.updateHLF);
const deleteHLFRateLimiter = createRateLimiter(perUserAndDevice.deleteHLF);
const getHLFRateLimiter    = createRateLimiter(perUserAndDevice.getHLF);
const listHLFsRateLimiter  = createRateLimiter(perUserAndDevice.listHLFs);

const createProductVisionRateLimiter = createRateLimiter(perUserAndDevice.createProductVision);
const updateProductVisionRateLimiter = createRateLimiter(perUserAndDevice.updateProductVision);
const deleteProductVisionRateLimiter = createRateLimiter(perUserAndDevice.deleteProductVision);
const getProductVisionRateLimiter    = createRateLimiter(perUserAndDevice.getProductVision);

const createInceptionRateLimiter = createRateLimiter(perUserAndDevice.createInception);
const getInceptionRateLimiter    = createRateLimiter(perUserAndDevice.getInception);
const listInceptionsRateLimiter  = createRateLimiter(perUserAndDevice.listInceptions);
const deleteInceptionRateLimiter = createRateLimiter(perUserAndDevice.deleteInception);
const freezeInceptionRateLimiter = createRateLimiter(perUserAndDevice.freezeInception);
const getLatestInceptionRateLimiter = createRateLimiter(perUserAndDevice.getLatestInception);

const createElicitationRateLimiter = createRateLimiter(perUserAndDevice.createElicitation);
const updateElicitationRateLimiter = createRateLimiter(perUserAndDevice.updateElicitation);
const deleteElicitationRateLimiter = createRateLimiter(perUserAndDevice.deleteElicitation);
const freezeElicitationRateLimiter = createRateLimiter(perUserAndDevice.freezeElicitation);
const getElicitationRateLimiter    = createRateLimiter(perUserAndDevice.getElicitation);
const getLatestElicitationRateLimiter = createRateLimiter(perUserAndDevice.getLatestElicitation);
const listElicitationsRateLimiter  = createRateLimiter(perUserAndDevice.listElicitations);

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
    createHLFRateLimiter,
    updateHLFRateLimiter,
    deleteHLFRateLimiter,
    getHLFRateLimiter,
    listHLFsRateLimiter,
    createProductVisionRateLimiter,
    updateProductVisionRateLimiter,
    deleteProductVisionRateLimiter,
    getProductVisionRateLimiter,
    getInceptionRateLimiter,
    listInceptionsRateLimiter,
    deleteInceptionRateLimiter,
    freezeInceptionRateLimiter,
    getLatestInceptionRateLimiter,
    createElicitationRateLimiter,
    updateElicitationRateLimiter,
    deleteElicitationRateLimiter,
    freezeElicitationRateLimiter,
    getElicitationRateLimiter,
    getLatestElicitationRateLimiter,
    listElicitationsRateLimiter,
    createInceptionRateLimiter
}