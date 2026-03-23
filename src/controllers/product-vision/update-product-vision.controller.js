// controllers/product-vision/update-product-vision.controller.js

const { updateProductVisionService } = require("@services/product-vision/update-product-vision.service");
const { sendProductVisionUpdatedSuccess } = require("@/responses/success/product-vision.response");

const {
    throwBadRequestError,
    throwInternalServerError,
    throwSpecificInternalServerError,
    getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

const updateProductVisionController = async (req, res) => {
    try {
        const { productVision } = req.body;
        const updatedBy = req.admin.adminId;

        const inception = req.inception;
        const project = req.project;

        // ── Call service ──────────────────────────────────────
        const result = await updateProductVisionService({
            inception,
            project,
            productVision,
            updatedBy,
            auditContext: {
                user: req.admin,
                device: req.device,
                requestId: req.requestId,
            },
        });

        if (!result.success) {
            if (result.message === "Validation error") {
                logWithTime(`❌ [updateProductVisionController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
                return throwBadRequestError(res, result.message, result.error);
            }

            logWithTime(`❌ [updateProductVisionController] ${result.message} | ${getLogIdentifiers(req)}`);
            return throwSpecificInternalServerError(res, result.message);
        }

        if (result.message === "No changes detected") {
            logWithTime(`⚠️ [updateProductVisionController] No changes detected | ${getLogIdentifiers(req)}`);
            const { OK } = require("@/configs/http-status.config");
            return res.status(OK).json({
                success: true,
                message: "No changes detected. Product vision remains unchanged.",
                data: { inception: result.inception }
            });
        }

        logWithTime(`✅ [updateProductVisionController] Product vision updated successfully | ${getLogIdentifiers(req)}`);
        return sendProductVisionUpdatedSuccess(res, result.inception);

    } catch (error) {
        logWithTime(`❌ [updateProductVisionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
        errorMessage(error);
        return throwInternalServerError(res, error);
    }
};

module.exports = { updateProductVisionController };
