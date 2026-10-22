// services/ai-model/ai-model.service.js

const axios = require("axios");
const { ProjectModel } = require("@models/project.model");
const { InceptionModel } = require("@models/inception.model");
const { IdeaModel } = require("@models/idea.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Returns the sanitized base URL for AI model service.
 * Handles both trailing slashes and ensures /re-model-service prefix is properly present.
 */
const getAiModelBaseUrl = () => {
  let url = (process.env.AI_MODEL_SERVICE_URL || "https://re-ai-model-service.onrender.com").trim().replace(/\/+$/, "");
  if (!url.endsWith("/re-model-service")) {
    url = `${url}/re-model-service`;
  }
  return url;
};

/**
 * Returns common headers required by AI model service.
 */
const getAiHeaders = (deviceUuid) => {
  const rawDeviceType = (process.env.DEVICE_TYPE || "laptop").toLowerCase();
  const validDeviceType = ["mobile", "tablet", "laptop"].includes(rawDeviceType)
    ? rawDeviceType
    : "laptop";

  return {
    "Content-Type": "application/json",
    "x-device-uuid": deviceUuid || process.env.DEVICE_UUID || "00000000-0000-4000-8000-000000000001",
    "x-device-type": validDeviceType,
    "x-device-name": process.env.DEVICE_NAME || "Server"
  };
};

/**
 * Calls Convert Content to English API.
 * Converts rawTitle and rawDescription to standard English.
 * Returns need_clarification boolean indicating whether content is meaningful or gibberish.
 *
 * @param {Object} params
 * @param {string} params.rawTitle - Raw title
 * @param {string} [params.rawDescription] - Raw description
 * @param {string} [params.deviceUuid] - Device UUID header
 * @returns {Promise<{ success: boolean, data?: { title: string, description: string, need_clarification: boolean }, message?: string, errorCode?: number }>}
 */
const convertContentToEnglishService = async ({
  rawTitle,
  rawDescription,
  deviceUuid
}) => {
  try {
    const baseUrl = getAiModelBaseUrl();
    const endpoint = `${baseUrl}/api/v1/llm/convert-content-to-english`;

    const payload = {
      rawTitle: rawTitle?.trim()
    };

    if (rawDescription && typeof rawDescription === "string" && rawDescription.trim().length > 0) {
      payload.rawDescription = rawDescription.trim();
    }

    const headers = getAiHeaders(deviceUuid);

    logWithTime(`🤖 [convertContentToEnglish] Calling AI service at ${endpoint}`);

    const response = await axios.post(endpoint, payload, {
      headers,
      timeout: 30000
    });

    const data = response?.data;

    if (!data || !data.success || !data.data) {
      logWithTime(`❌ [convertContentToEnglish] Unexpected response from AI service: ${JSON.stringify(data)}`);
      return {
        success: false,
        message: data?.message || "Failed to convert content with AI model service",
        errorCode: BAD_REQUEST
      };
    }

    return {
      success: true,
      data: {
        title: data.data.title,
        description: data.data.description,
        need_clarification: Boolean(data.data.need_clarification)
      },
      message: data.message
    };
  } catch (error) {
    logWithTime(`❌ [convertContentToEnglish] Error calling AI service: ${error.message}`);
    if (error.response?.data) {
      logWithTime(`❌ [convertContentToEnglish] AI service error response: ${JSON.stringify(error.response.data)}`);
      return {
        success: false,
        message: error.response.data.message || error.message,
        errorCode: error.response.status === 400 ? BAD_REQUEST : INTERNAL_ERROR
      };
    }
    return {
      success: false,
      message: "AI model service is currently unavailable. Please try again later.",
      errorCode: INTERNAL_ERROR
    };
  }
};

/**
 * Calls Classify Entity API.
 * Uses linear_svm model to classify entity type and generate class probability scores.
 *
 * @param {Object} params
 * @param {string} params.projectTitle - Name of the project
 * @param {string} params.projectDescription - Description of the project
 * @param {string} params.problemStatement - Problem statement
 * @param {string} params.projectGoal - Project goal
 * @param {string} [params.projectType] - Project type (default "development")
 * @param {string} [params.productVision] - Product vision from Inception
 * @param {string} params.rawTitle - Raw title of entity
 * @param {string} [params.rawDescription] - Raw description of entity
 * @param {string} [params.model] - Model type (default "linear_svm")
 * @param {string} [params.deviceUuid] - Device UUID header
 * @returns {Promise<{ success: boolean, data?: { entityType: string, classScores: Object, score: number, scoreType: string, title: string, description: string }, message?: string, errorCode?: number }>}
 */
const classifyEntityService = async ({
  projectTitle,
  projectDescription,
  problemStatement,
  projectGoal,
  projectType = "development",
  productVision,
  rawTitle,
  rawDescription,
  model = "linear_svm",
  deviceUuid
}) => {
  try {
    const baseUrl = getAiModelBaseUrl();
    const endpoint = `${baseUrl}/api/v1/classification/classify-entity`;

    const payload = {
      model: model || "linear_svm",
      projectTitle: projectTitle?.trim(),
      projectDescription: projectDescription?.trim(),
      problemStatement: problemStatement?.trim(),
      projectGoal: projectGoal?.trim(),
      projectType: projectType?.trim() || "development",
      rawTitle: rawTitle?.trim()
    };

    if (rawDescription && typeof rawDescription === "string" && rawDescription.trim().length >= 10) {
      payload.rawDescription = rawDescription.trim();
    }

    if (productVision && typeof productVision === "string" && productVision.trim().length >= 20) {
      payload.productVision = productVision.trim();
    }

    const headers = getAiHeaders(deviceUuid);

    logWithTime(`🤖 [classifyEntity] Calling AI classification service at ${endpoint}`);

    const response = await axios.post(endpoint, payload, {
      headers,
      timeout: 30000
    });

    const data = response?.data;

    if (!data || !data.success || !data.data) {
      logWithTime(`❌ [classifyEntity] Unexpected response from AI classification service: ${JSON.stringify(data)}`);
      return {
        success: false,
        message: data?.message || "Failed to classify entity with AI model service",
        errorCode: BAD_REQUEST
      };
    }

    return {
      success: true,
      data: {
        entityType: data.data.entityType,
        classScores: data.data.classScores,
        score: data.data.score,
        scoreType: data.data.scoreType,
        title: data.data.title,
        description: data.data.description
      },
      message: data.message
    };
  } catch (error) {
    logWithTime(`❌ [classifyEntity] Error calling AI classification service: ${error.message}`);
    if (error.response?.data) {
      logWithTime(`❌ [classifyEntity] AI classification error response: ${JSON.stringify(error.response.data)}`);
      return {
        success: false,
        message: error.response.data.message || error.message,
        errorCode: error.response.status === 400 ? BAD_REQUEST : INTERNAL_ERROR
      };
    }
    return {
      success: false,
      message: "AI classification service is currently unavailable.",
      errorCode: INTERNAL_ERROR
    };
  }
};

/**
 * Asynchronously classifies an idea and saves aiPredictedClass and aiPredictionSummary.
 * This runs in background to prevent increasing latency of idea create/update APIs.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.ideaId - Idea ObjectId
 * @param {string|mongoose.Types.ObjectId} params.projectId - Project ObjectId
 * @param {string} params.rawTitle - Raw title of idea
 * @param {string} [params.rawDescription] - Raw description of idea
 * @param {string} [params.deviceUuid] - Device UUID
 */
const classifyIdeaAsync = async ({
  ideaId,
  projectId,
  rawTitle,
  rawDescription,
  deviceUuid
}) => {
  // Never throw unhandled rejections to prevent crashing the main process
  try {
    logWithTime(`🔄 [classifyIdeaAsync] Starting async classification for idea: ${ideaId}`);

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      logWithTime(`⚠️ [classifyIdeaAsync] Project ${projectId} not found for idea ${ideaId}`);
      return;
    }

    const inception = await InceptionModel.findOne({ projectId, isDeleted: false });

    const result = await classifyEntityService({
      projectTitle: project.name,
      projectDescription: project.description,
      problemStatement: project.problemStatement,
      projectGoal: project.goal,
      projectType: project.projectType,
      productVision: inception?.productVision || null,
      rawTitle,
      rawDescription,
      deviceUuid
    });

    if (!result.success || !result.data) {
      logWithTime(`⚠️ [classifyIdeaAsync] Classification failed for idea ${ideaId}: ${result.message}`);
      return;
    }

    const { entityType, classScores } = result.data;

    const updatedIdea = await IdeaModel.findByIdAndUpdate(
      ideaId,
      {
        $set: {
          aiPredictedClass: entityType,
          aiPredictionSummary: classScores
        }
      },
      { new: true }
    );

    if (updatedIdea) {
      logWithTime(`✅ [classifyIdeaAsync] Idea ${ideaId} successfully updated with aiPredictedClass: ${entityType}`);
    } else {
      logWithTime(`⚠️ [classifyIdeaAsync] Idea ${ideaId} not found when saving classification result`);
    }
  } catch (error) {
    logWithTime(`❌ [classifyIdeaAsync] Unexpected background error classifying idea ${ideaId}: ${error.message}`);
  }
};

module.exports = {
  convertContentToEnglishService,
  classifyEntityService,
  classifyIdeaAsync,
  getAiModelBaseUrl
};
