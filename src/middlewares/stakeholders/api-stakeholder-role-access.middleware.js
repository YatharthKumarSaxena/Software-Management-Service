const { ProjectRoleTypes, ClientRoleTypes } = require("@configs/enums.config");
const { checkUserRoleFactory } = require("../factory/check-user-role.middleware-factory");

const stakeholderRoleAccessMiddlewares = {  
    createElicitationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    updateElicitationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    deleteElicitationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    createInceptionStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    deleteInceptionStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    freezeInceptionStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    freezeElicitationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    createMeetingStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    cancelMeetingStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    createNegotiationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    updateNegotiationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    deleteNegotiationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    freezeNegotiationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    createSpecificationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    updateSpecificationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    deleteSpecificationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    freezeSpecificationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    createElaborationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    updateElaborationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    deleteElaborationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    freezeElaborationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    createValidationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    updateValidationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    deleteValidationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
    freezeValidationStakeholderRoleAccessMiddleware: checkUserRoleFactory([ProjectRoleTypes.OWNER]),
};
module.exports = {
    stakeholderRoleAccessMiddlewares
};
