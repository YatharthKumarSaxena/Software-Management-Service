// configs/rate-limit.config.js

module.exports = {
  perDevice: {
    malformedRequest: {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      prefix: "malformed_request",
      reason: "Malformed request",
      message: "Too many malformed requests. Fix your payload and try again later."
    },

    unknownRoute: {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      prefix: "unknown_route",
      reason: "Unknown route access",
      message: "Too many invalid or unauthorized requests."
    }

  },

  perUserAndDevice: {

  }
};