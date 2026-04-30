const { ProjectModel } = require("@/models");
const { RequirementModel } = require("@/models/requirement.model");
const { createDetectCircularLink } = require("../factory/circular-link.service-factory");

const detectCircularProjectLink = createDetectCircularLink({
  model: ProjectModel,
  linkField: "linkedProjectIds"
});

const detectCircularRequirementLink = createDetectCircularLink({
  model: RequirementModel,
  linkField: "linkedRequirements",
  idPath: "requirementId"
});

module.exports = {
  detectCircularProjectLink,
  detectCircularRequirementLink
};