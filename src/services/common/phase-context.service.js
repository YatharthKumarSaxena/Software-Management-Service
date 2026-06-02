const { CONFLICT } = require("@configs/http-status.config");
const { WorkflowModes } = require("@configs/enums.config");

const validatePhaseContext = ({
    phase,
    phaseContext,
    userId
}) => {

    if (!phaseContext) {
        return {
            success: false,
            errorCode: CONFLICT,
            message: `No Active ${phase} Exists`
        };
    }

    if (phaseContext.isFrozen) {
        return {
            success: false,
            errorCode: CONFLICT,
            message: "Cannot perform operation in a frozen phase"
        };
    }

    if (
        userId &&
        phaseContext.workflowMode === WorkflowModes.MODERATION &&
        !phaseContext.contributors.includes(userId)
    ) {
        return {
            success: false,
            errorCode: CONFLICT,
            message: `User is not a contributor for ${phase}`
        };
    }

    return {
        success: true,
        phaseContext
    };
};

module.exports = {
    validatePhaseContext
};