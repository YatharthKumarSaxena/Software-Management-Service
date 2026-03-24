// routes/activity-tracker.routes.js

const express = require("express");
const activityTrackerRouter = express.Router();

const { ACTIVITY_TRACKER_ROUTES } = require("@/configs/uri.config");
const { baseAuthClientOrAdminMiddlewares, baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { activityTrackerControllers } = require("@controllers/activity-trackers");

const {
  GET_MY_ACTIVITY,
  LIST_ACTIVITY,
  GET_ACTIVITY
} = ACTIVITY_TRACKER_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthClientOrAdminMiddlewares (for GET_MY_ACTIVITY)
//     OR baseAuthAdminMiddlewares (for LIST_ACTIVITY)
//  2. Controller
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /software-management-service/api/v1/activity-trackers/my-activity
 * Get current user's recent activity (admin and client both accessible)
 * Shows: description, eventType, timestamp
 * 
 * Query params:
 * - page (default: 1)
 * - limit (default: 20, max: 50)
 */
activityTrackerRouter.get(
  GET_MY_ACTIVITY,
  [
    ...baseAuthClientOrAdminMiddlewares,
  ],
  activityTrackerControllers.getMyActivityController
);

/**
 * GET /software-management-service/api/v1/activity-trackers/list
 * List all activities with full details (Admin only)
 * Shows: all activity tracker fields
 * 
 * Query params:
 * - userId (optional - filter by specific user)
 * - eventType (optional - filter by event type)
 * - dateFrom (optional - filter from date)
 * - dateTo (optional - filter to date)
 * - page (default: 1)
 * - limit (default: 20, max: 100)
 */
activityTrackerRouter.get(
  LIST_ACTIVITY,
  [
    ...baseAuthAdminMiddlewares,
  ],
  activityTrackerControllers.listActivityController
);

/**
 * GET /software-management-service/api/v1/activity-trackers/get/:activityId
 * Get complete activity details by ID (Admin only)
 * Admin can only view activities they performed
 * Shows: all activity tracker fields (eventType, description, userData, timestamp, adminActions, etc)
 * 
 * Params:
 * - activityId (required - MongoDB ObjectId)
 */
activityTrackerRouter.get(
  GET_ACTIVITY,
  [
    ...baseAuthAdminMiddlewares,
  ],
  activityTrackerControllers.getActivityController
);

module.exports = { activityTrackerRouter };
