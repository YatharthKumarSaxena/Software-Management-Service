const { logMiddlewareError } = require("@utils/log-error.util");
const { DeviceModel } = require("@models/device.model");
const { throwAccessDeniedError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const isDeviceBlocked = async (req, res, next) => {
    try {

        let device = req.device;

        const dbDevice = await DeviceModel.findOne({ deviceUUID: device.deviceUUID }).select("isBlocked");
        
        if (dbDevice && dbDevice.isBlocked === true) {
            logMiddlewareError("isDeviceBlocked", "Device is blocked", req);
            return throwAccessDeniedError(
                res,
                "Your Device is currently blocked. Please contact support for assistance if you believe this is an error."
            );
        }

        logWithTime(`✅ Device (${device.deviceUUID}) is not blocked`);

        return next();

    } catch (err) {
        logMiddlewareError("isDeviceBlocked", "Internal error during device blocked check", req);
        return throwInternalServerError(res, err);
    }
}

module.exports = {
    isDeviceBlocked
}