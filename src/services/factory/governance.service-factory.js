const { errorMessage } = require("@/utils/log-error.util");
const { logWithTime } = require("@/utils/time-stamps.util");

const resolvePhaseGovernance = ({
    phase
}) => {

    return {
        workflowMode: phase.workflowMode || null,
        contributors: phase.contributors || [],
        reviewers: phase.reviewers || [],
        approvers: phase.approvers || [],
        requirementGovernanceMode: phase.requirementGovernanceMode || null
    };
};

const createRequirementGovernanceResolver = ({
    action,
    authorityType
}) => {

    if (!action) {
        throw new Error("Action is required to create a requirement governance resolver.");
    }

    if (!authorityType) {
        throw new Error("Authority type is required to create a requirement governance resolver.");
    }

    return ({
        project,
        phase,
        requirement,
        requestedBy
    }) => {

        try {

            logWithTime(
                `[${action}] Governance Resolution Started`
            );

            const requiredFields = [];

            if (!project) requiredFields.push("project");
            if (!phase) requiredFields.push("phase");
            if (!requirement) requiredFields.push("requirement");
            if (!requestedBy) requiredFields.push("requestedBy");

            if (requiredFields.length) {
                return {
                    success: false,
                    message: `Missing required fields: ${requiredFields.join(", ")}`
                };
            }

            


        } catch (error) {
            logWithTime(
                `[${action}] Governance Resolution Failed.`
            );
            errorMessage(error);
            return {
                success: false,
                message: `Governance resolution failed: ${error.message}`
            }
        }
    };
};