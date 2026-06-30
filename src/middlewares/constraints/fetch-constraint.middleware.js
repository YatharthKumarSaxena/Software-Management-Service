// middlewares/constraints/fetch-constraint.middleware.js

const { ConstraintModel } = require("@models/constraints.model");

const {
    createFetchModelMiddleware
} = require("../factory/fetch-model.middleware-factory");

/**
 * Fetches a constraint by :constraintId from params.
 * Attaches req.constraint and req.projectId (from the constraint document).
 *
 * Follows the same factory pattern as fetchRequirementMiddleware.
 */
const fetchConstraintMiddleware =
    createFetchModelMiddleware({
        model: ConstraintModel,
        modelName: "Constraint",

        idParamName: "constraintId",
        requestKey: "constraint",

        additionalQuery: {
            isDeleted: false
        },

        attachFields: [
            {
                source: "projectId",
                target: "projectId"
            }
        ]
    });

module.exports = {
    fetchConstraintMiddleware
};
