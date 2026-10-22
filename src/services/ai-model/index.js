// services/ai-model/index.js

const {
  convertContentToEnglishService,
  classifyEntityService,
  classifyIdeaAsync,
  getAiModelBaseUrl
} = require("./ai-model.service");

module.exports = {
  aiModelServices: {
    convertContentToEnglishService,
    classifyEntityService,
    classifyIdeaAsync,
    getAiModelBaseUrl
  }
};
