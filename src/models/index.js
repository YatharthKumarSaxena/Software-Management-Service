const { ActivityTrackerModel } = require("./activity-tracker.model");
const { AdminModel } = require("./admin.model");
const { ServiceTrackerModel } = require("./service-tracker.model");
const { DeviceModel } = require("./device.model")
const { ServiceToken } = require("./service-token.model");
const { ClientModel } = require("./client.model");
const { ProjectModel } = require("./project.model");
const { InceptionModel } = require("./inception.model");
const { ElicitationModel } = require("./elicitation.model");
const { ElaborationModel } = require("./elaboration.model");
const { NegotiationModel } = require("./negotiation.model");
const { SpecificationModel } = require("./specification.model");
const { ValidationModel } = require("./validation.model");
const { StakeholderModel } = require("./stakeholder.model");
const { CommentModel } = require("./comment.model");
const { MeetingModel } = require("./meeting.model");
const { ScopeModel } = require("./scope-model.js");
const { HighLevelFeatureModel } = require("./high-level-feature.model");
const { RequirementModel } = require("./requirement.model");
const { ProductRequestModel } = require("./product-request.model");
const { FeatureRequirementMapModel } = require("./feature-requirement-map.model");

const models = {
    ActivityTrackerModel,
    AdminModel,
    ServiceTrackerModel,
    DeviceModel,
    ServiceToken,
    ClientModel,
    ProjectModel,
    InceptionModel,
    ElicitationModel,
    ElaborationModel,
    NegotiationModel,
    SpecificationModel,
    ValidationModel,
    StakeholderModel,
    CommentModel,
    MeetingModel,
    ScopeModel,
    HighLevelFeatureModel,
    RequirementModel,
    ProductRequestModel,
    FeatureRequirementMapModel
}

module.exports = {
    ...models
}