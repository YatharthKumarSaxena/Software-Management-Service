require("dotenv").config();
require("module-alias/register");

const mongoose = require("mongoose");

const { app } = require("@app");
const { DB_URL } = require("@configs/db.config");
const { PORT_NUMBER } = require("@configs/server.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");

(async () => {
    try {

        // 🔑 DATABASE CONNECTION (CORRECT WAY)
        await mongoose.connect(DB_URL);
        logWithTime("✅ Connection established with MongoDB Successfully");

        // 🚀 Start Server
        app.listen(PORT_NUMBER, () => {
            logWithTime(`🚀 Server running on port ${PORT_NUMBER}`);
            require("@cron-jobs");
            logWithTime("✅ Cron Jobs Initialized");
        });

    } catch (err) {
        logWithTime("❌ MongoDB Connection Failed");
        errorMessage(err);
        process.exit(1);
    }
})();