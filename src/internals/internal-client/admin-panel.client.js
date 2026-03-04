/**
 * Admin Panel Service Client
 * 
 * Internal API client for communicating with Admin Panel Service.
 * Handles internal admin coordination endpoints.
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-04
 */

const guard = require('../microservice.guard');
if (!guard) {
    module.exports = null;
    return;
}

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { getServiceToken } = require('../service-token');
const { INTERNAL_API, HEADERS, SERVICE_NAMES, DEVICE } = require('../constants');
const { logWithTime } = require('@/utils/time-stamps.util');

/**
 * Create axios instance with service authentication
 */
const createAuthenticatedClient = async () => {
    const serviceToken = await getServiceToken(SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE);

    return axios.create({
        baseURL: INTERNAL_API.ADMIN_PANEL_SERVICE_URL,
        timeout: INTERNAL_API.TIMEOUT,
        headers: {
            [HEADERS.SERVICE_TOKEN]: serviceToken,
            [HEADERS.SERVICE_NAME]: SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
            [HEADERS.REQUEST_ID]: uuidv4(),
            [HEADERS.DEVICE_UUID]: DEVICE.UUID,
            [HEADERS.DEVICE_TYPE]: DEVICE.TYPE,
            'Content-Type': 'application/json'
        }
    });
};

/**
 * Retry logic for failed requests
 */
const retryRequest = async (requestFn, retries = INTERNAL_API.RETRY_ATTEMPTS) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            
            logWithTime(`⚠️  Request failed (attempt ${attempt}/${retries}). Retrying in ${INTERNAL_API.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, INTERNAL_API.RETRY_DELAY));
        }
    }
};

/**
 * Health check for Admin Panel Service
 * 
 * @returns {Promise<boolean>} true if service is healthy
 */
const healthCheck = async () => {
    try {
        const client = await createAuthenticatedClient();
        const response = await client.get('/admin-panel-service/api/v1/internal/software-management/health');
        return response.status === 200;
    } catch (error) {
        logWithTime(`❌ Admin Panel Service health check failed: ${error.message}`);
        return false;
    }
};

module.exports = {
    healthCheck
};