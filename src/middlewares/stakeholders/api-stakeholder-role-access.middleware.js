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
};
module.exports = {
    stakeholderRoleAccessMiddlewares
};
