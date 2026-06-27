const express = require("express");
const cookieParser = require("cookie-parser");

const { globalLimiter } = require("@rate-limiters/global.rate-limiter");
const { handlers } = require("@/middlewares/handlers/index");
const { unknownRouteHandler, malformedJsonHandler, duplicateQueryParameterHandler } = handlers;
const { corsMiddleware } = require("@middlewares/common/cors.middleware");

const app = express();

const jsonParser = express.json;

// Order is VERY IMPORTANT

// 1. CORS
app.use(corsMiddleware);

// 2. Global rate limiter
app.use(globalLimiter);

// 3. JSON parser
app.use(jsonParser());

// 4. Cookie parser
app.use(cookieParser());

// 5. Malformed JSON handler
app.use(malformedJsonHandler);

// 6. Duplicate query parameter handler
app.use(duplicateQueryParameterHandler);

// 7. Routes
require("@routes/index")(app);

// 8. Unknown route handler
app.use(unknownRouteHandler);

module.exports = { app };