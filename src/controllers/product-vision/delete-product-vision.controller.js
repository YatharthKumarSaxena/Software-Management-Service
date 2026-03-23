// controllers/product-vision/delete-product-vision.controller.js

const { deleteProductVisionService } = require("@services/product-vision/delete-product-vision.service");
const { sendProductVisionDeletedSuccess } = require("@/responses/success/product-vision.response");

const {
    throwBadRequestError,
    throwInternalServerError,
    throwSpecificInternalServerError,
    getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { PriorityLevels } = require("@/configs/enums.config");
const { OK } = require("@/configs/http-status.config");

const deleteProductVisionController = async (req, res) => {
    try {
        const { deletionReasonDescription } = req.body;
        const deletedBy = req.admin.adminId;

        const inception = req.inception;
        const project = req.project;

        // ── Check if deletion reason is required based on project criticality ─────
        if (project.projectCriticality === PriorityLevels.HIGH && !deletionReasonDescription) {
            logWithTime(`❌ [deleteProductVisionController] Missing deletion reason for HIGH criticality project | ${getLogIdentifiers(req)}`);
            return throwBadRequestError(
                res,
                "Deletion reason is required",
                "This project has HIGH criticality. Deletion reason description is mandatory."
            );
        }

        // ── Call service ──────────────────────────────────────
        const result = await deleteProductVisionService({
            inception,
            project,
            deletionReasonDescription: deletionReasonDescription || null,
            deletedBy,
            auditContext: {
                user: req.admin,
                device: req.device,
                requestId: req.requestId,
            },
        });

        if (!result.success) {
            if (result.message === "Validation error") {
                logWithTime(`❌ [deleteProductVisionController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
                return throwBadRequestError(res, result.message, result.error);
            }

            logWithTime(`❌ [deleteProductVisionController] ${result.message} | ${getLogIdentifiers(req)}`);
            return throwSpecificInternalServerError(res, result.message);
        }

        if (result.message === "Product vision is already empty") {
            logWithTime(`⚠️ [deleteProductVisionController] Product vision already empty | ${getLogIdentifiers(req)}`);
            return res.status(OK).json({
                success: true,
                message: "Product vision is already empty. No action taken."
            });
        }

        logWithTime(`✅ [deleteProductVisionController] Product vision deleted successfully | ${getLogIdentifiers(req)}`);
        return sendProductVisionDeletedSuccess(res);

    } catch (error) {
        logWithTime(`❌ [deleteProductVisionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
        errorMessage(error);
        return throwInternalServerError(res, error);
    }
};

module.exports = { deleteProductVisionController };
