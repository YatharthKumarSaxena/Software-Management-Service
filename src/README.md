# Source Code Structure (`src/`)

This directory contains the core application logic organized in a modular, scalable architecture following best practices for Node.js/Express applications with microservice support.

---

## Directory Overview

```
src/
├── app.js                          # Express app configuration and initialization
├── bootstrap/                      # Bootstrap utilities and initialization logic
├── configs/                        # Configuration files for various services
├── controllers/                    # Request handlers (Route Controllers)
├── cron-jobs/                      # Scheduled tasks and background jobs
├── internals/                      # Internal microservice utilities
├── middlewares/                    # Express middleware (authentication, validation, etc.)
├── models/                         # MongoDB/Mongoose schemas and models
├── rate-limiters/                  # Rate limiting configurations
├── responses/                      # Response formatting and error handlers
├── routes/                         # API route definitions
├── services/                       # Business logic and external integrations
└── utils/                          # Utility functions and helpers
```

---

## Module Breakdown

### 1. **app.js**
- Main Express application configuration
- Middleware setup and initialization
- Route registration
- Error handling setup

### 2. **configs/** - Configuration Management
Core configuration files for the application:

| File | Purpose |
|------|---------|
| `db.config.js` | MongoDB connection settings |
| `server.config.js` | Server configuration (port, environment) |
| `redis.config.js` | Redis client initialization and settings |
| `token.config.js` | JWT and service token configuration |
| `security.config.js` | Security-related settings (CORS, headers) |
| `api-role-permissions.config.js` | Role-based access control (RBAC) definitions |
| `enums.config.js` | Application enums and constants |
| `http-status.config.js` | HTTP status codes mapping |
| `headers.config.js` | Standard HTTP headers configuration |
| `microservice.config.js` | Microservice integration settings |
| `rate-limit.config.js` | Rate limiting rules |
| `regex.config.js` | Regex patterns for validation |
| `validation.config.js` | Validation rules and schemas |
| `required-fields.config.js` | Required field definitions per entity |
| `field-definitions.config.js` | Field metadata and definitions |
| `uri.config.js` | Internal and external service URIs |
| `internal-uri.config.js` | Internal service endpoints |
| `system-log-events.config.js` | System logging event types |
| `tracker.config.js` | Activity tracking configuration |
| `reasons.config.js` | Predefined reason codes |
| `validation-sets.config.js` | Validation rule sets |

### 3. **controllers/** - Request Handlers
Controllers handle incoming HTTP requests and delegate to services. Organized by feature:

- **welcome.controller.js** - Welcome/health check endpoints
- **activity-trackers/** - Activity tracking endpoints
- **clients/** - Client management endpoints
- **comments/** - Comment CRUD operations
- **elaborations/** - Elaboration phase endpoints
- **elicitations/** - Elicitation phase endpoints
- **high-level-features/** - HLF management
- **hlf-requirement/** - HLF requirement mapping
- **ideas/** - Idea management
- **inceptions/** - Inception phase endpoints
- **internals/** - Internal service endpoints
- **meetings/** - Meeting management
- **negotiations/** - Negotiation phase endpoints
- **org-project-requests/** - Organization project requests
- **participants/** - Participant management
- **phases/** - Phase management
- **product-requests/** - Product request endpoints
- **product-vision/** - Product vision endpoints
- **projects/** - Project management
- **requirements/** - Requirement management
- **scopes/** - Scope management
- **specifications/** - SRS specification endpoints
- **stakeholders/** - Stakeholder management
- **validations/** - Validation phase endpoints

**Key Pattern:** Each controller imports its corresponding service and middlewares for request validation and authorization.

### 4. **middlewares/** - Express Middleware
Middleware functions for authentication, validation, and request processing:

- **common/** - Cross-cutting middleware (logging, error handling)
- **clients/** - Client authentication and authorization
- **comments/** - Comment-specific middleware
- **elaborations/** - Elaboration phase middleware
- **elicitations/** - Elicitation phase middleware
- **factory/** - Middleware factory for creating reusable middleware
- **handlers/** - Error and response handlers
- **inceptions/** - Inception phase middleware
- **meetings/** - Meeting-specific middleware
- **negotiations/** - Negotiation phase middleware
- **participants/** - Participant middleware
- **product-requests/** - Product request middleware
- **projects/** - Project middleware
- **requirements/** - Requirement middleware
- **scopes/** - Scope middleware
- **specifications/** - Specification middleware
- **stakeholders/** - Stakeholder middleware
- **validations/** - Validation phase middleware

**Key Functions:**
- Authentication (JWT validation, service token verification)
- Authorization (role-based access control)
- Input validation
- Request logging
- Error handling

### 5. **models/** - Data Models
MongoDB/Mongoose schema definitions:

- **admin.model.js** - Admin user model
- **client.model.js** - Client/Organization model
- **comment.model.js** - Comments model
- **device.model.js** - Device tracking model
- **elaboration.model.js** - Elaboration phase data
- **elicitation.model.js** - Elicitation phase data
- **external-interfaces.model.js** - External API integrations
- **project.model.js** - Project information
- **requirement.model.js** - Requirements storage
- *and more* - Additional domain models

### 6. **services/** - Business Logic
Core application business logic, external integrations, and data processing:

- **bootstrap/** - Microservice initialization and setup
- **internal-client/** - Internal service communication
- **notifications/** - Email and notification services
- **requirement-processing/** - Requirement classification and refinement
- **database/** - Database operations and queries
- *Feature-specific services* - QFD, FAST, negotiation logic, etc.

### 7. **routes/** - API Routes
Express route definitions organized by feature:

```
routes/
├── index.js                    # Route aggregation
├── activity-trackers.routes.js
├── clients.routes.js
├── comments.routes.js
├── elaborations.routes.js
├── ... (other domain routes)
└── validations.routes.js
```

**Key Pattern:** Each route file defines endpoints for its domain and binds them to controllers and middleware.

### 8. **responses/** - Response Formatting
Standardized response utilities for consistent API responses:

- **common/error-handler.response.js** - Error response formatting
- **common/success.response.js** - Success response formatting
- Domain-specific response utilities

### 9. **rate-limiters/** - Rate Limiting
Rate limiter configurations to prevent abuse:

- Global rate limiters
- Service-specific rate limiters
- Endpoint-specific rate limiters

### 10. **cron-jobs/** - Scheduled Tasks
Background jobs and scheduled tasks:

```
cron-jobs/
├── index.js                    # Cron job initialization
└── [feature-specific-jobs]     # Domain-specific scheduled tasks
```

Examples:
- Activity log cleanup
- Token rotation
- Requirement versioning
- Report generation

### 11. **internals/** - Microservice Integration
Internal utilities for microservice communication:

- **index.js** - Exports and initializes internal modules
- **microservice.guard.js** - Microservice token validation
- **constants/** - Internal constants
- **internal-client/** - Service-to-service HTTP client
- **redis-session/** - Redis session management
- **service-token/** - Service token generation and validation

### 12. **utils/** - Utility Functions
Reusable utility functions:

- **time-stamps.util.js** - Timestamp and time formatting
- **validators.util.js** - Custom validation functions
- **error-handlers.util.js** - Error processing
- **file-handlers.util.js** - File upload/processing
- Database query helpers
- String transformation utilities
- *and more*

### 13. **bootstrap/** - Initialization
Bootstrap scripts and setup logic:

- Service initialization on startup
- Database migrations
- Configuration loading
- Dependency injection setup

---

## Key Design Patterns

### 1. **MVC (Model-View-Controller)**
- **Models**: Database schemas (MongoDB/Mongoose)
- **Controllers**: Request handlers
- **Views**: JSON API responses

### 2. **Service Layer Pattern**
- Business logic separated from controllers
- Services handle external API calls, database operations, and complex processing
- Controllers delegate to services

### 3. **Middleware Chain**
- Authentication → Authorization → Validation → Controller
- Error handling at each stage
- Request/response logging

### 4. **Configuration Management**
- Environment-specific configurations in `.env`
- Config files provide typed/structured access
- Centralized constants and enums

### 5. **Microservice Architecture**
- Service-to-service communication via HTTP
- Service token authentication between services
- Redis for distributed session management

---

## Module Aliases

The application uses module aliases for cleaner imports. See `package.json` for alias definitions:

```js
// Instead of:
const app = require('../../../../src/app');

// Use:
const { app } = require('@app');

// Available aliases:
@                    // src/
@routes              // src/routes
@controllers         // src/controllers
@middlewares         // src/middlewares
@configs             // src/configs
@utils               // src/utils
@responses           // src/responses
@rate-limiters       // src/rate-limiters
@models              // src/models
@services            // src/services
@cron-jobs           // src/cron-jobs
@internals           // src/internals
```

---

## Getting Started - Example Request Flow

1. **Client sends HTTP request** → Express app receives
2. **Routes match** → Appropriate route handler identified
3. **Middleware chain executes** → Authentication, validation, authorization
4. **Controller invoked** → Extracts request parameters
5. **Service called** → Business logic executes
6. **Model queries database** → MongoDB operation
7. **Response formatted** → Standardized response
8. **Client receives response** → JSON response

---

## Related Documentation

- [Main README](../README.md) - Project overview and setup instructions
- `.env.example` - Environment variable reference
- `package.json` - Dependencies and scripts

---

## Notes

- Ensure all environment variables are properly configured before starting the server
- Database migrations should be run during bootstrap
- Microservice mode can be toggled via `MAKE_IT_MICROSERVICE` in `.env`
- Activity tracking and advanced logging can be configured in `.env`
