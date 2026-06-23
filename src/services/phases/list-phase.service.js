const { createListService } = require("@services/factory/create-list-service.factory")
const { Phases } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");
const {
    INTERNAL_ERROR,
    BAD_REQUEST
} = require("@configs/http-status.config");
const { InceptionModel, ElicitationModel, ElaborationModel, NegotiationModel, SpecificationModel, ValidationModel } = require("@/models");

const listInceptionService = createListService({
    model: InceptionModel,
    hiddenFields: ["__v"]
});

const listElicitationService = createListService({
    model: ElicitationModel,
    hiddenFields: ["__v"]
});

const listElaborationService = createListService({
    model: ElaborationModel,
    hiddenFields: ["__v"]
});

const listNegotiationService = createListService({
    model: NegotiationModel,
    hiddenFields: ["__v"]
})

const listSpecificationService = createListService({
    model: SpecificationModel,
    hiddenFields: ["__v"]
});

const listValidationService = createListService({
    model: ValidationModel,
    hiddenFields: ["__v"]
});

const PhaseToListServiceMap = {
    [Phases.INCEPTION]: listInceptionService,
    [Phases.ELICITATION]: listElicitationService,
    [Phases.ELABORATION]: listElaborationService,
    [Phases.NEGOTIATION]: listNegotiationService,
    [Phases.SPECIFICATION]: listSpecificationService,
    [Phases.VALIDATION]: listValidationService
};

const listPhaseService = async ({
    projectId,
    phaseType,
    filters
}) => {
    try {
        const listService = PhaseToListServiceMap[phaseType];
        if (!listService) {
            return {
                success: false,
                message: "Invalid phase type",
                errorCode: BAD_REQUEST
            };
        }
        const andConditions = [
            {
                field: "projectId",
                operator: "eq",
                value: projectId
            }
        ];

        if (filters?.query) {
            andConditions.push(filters.query);
        }

        const query = {
            and: andConditions
        };
        const result = await listService({
            query: query,
            selectFields: filters?.selectFields,
            pageNumber: filters?.pageNumber,
            pageSize: filters?.pageSize,
            sortField: filters?.sortField,
            sortOrder: filters?.sortOrder
        });
        return result;
    } catch (error) {
        logWithTime(
            `❌ [listPhaseService] ${error.message}`
        );

        return {
            success: false,
            message:
                error.message ||
                "Failed to list phase",
            errorCode: INTERNAL_ERROR
        };
    }
}
module.exports = {
    listPhaseService
};