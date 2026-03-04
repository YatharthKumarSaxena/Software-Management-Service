const { ActivityTrackerModel } = require("./activity-tracker.model");
const { AdminModel } = require("./admin.model");
const { ServiceTrackerModel } = require("./service-tracker.model");
const { DeviceModel } = require("./device.model")
const { ServiceToken } = require("./service-token.model");

const models = {
    ActivityTrackerModel,
    AdminModel,
    ServiceTrackerModel,
    DeviceModel,
    ServiceToken
}

module.exports = {
    ...models
}