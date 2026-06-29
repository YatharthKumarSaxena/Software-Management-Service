require("module-alias/register");

const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

// Load and expand environment variables
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

// Boot Configuration
require("@bootstrap/env.defaults").applyEnvDefaults();
require("@bootstrap/env.validator").validateEnvironment();

const mongoose = require("mongoose");

// Polyfill for Node.js < 22
global.WebSocket = require("ws");

const { app } = require("@app");
const { DB_URL } = require("@configs/db.config");
const { PORT_NUMBER } = require("@configs/server.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");

(async () => {
    try {


        // MongoDB Connection
        await mongoose.connect(DB_URL);
        logWithTime("✅ Connection established with MongoDB Successfully");

        // Microservice Initialization
        try {
            const {
                initializeMicroservice,
                setupTokenRotationScheduler
            } = require("@services/bootstrap/microservice-init.service");

            await initializeMicroservice();
            setupTokenRotationScheduler();

        } catch (err) {
            logWithTime("⚠️ Microservice initialization failed");
            errorMessage(err);
        }

        // Start Server
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
