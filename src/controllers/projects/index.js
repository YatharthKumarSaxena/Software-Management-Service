const { completeProjectController } = require("./complete-project.controller");
const { createProjectController } = require("./create-project.controller");
const { deleteProjectController } = require("./delete-project.controller");
const { getProjectController } = require("./get-project.controller");
const { listProjectsController } = require("./list-projects.controller");
const { resumeProjectController } = require("./resume-project.controller");
const { abortProjectController } = require("./abort-project.controller");
const { updateProjectController } = require("./update-project.controller");
const { archiveProjectController } = require("./archive-project.controller");
const { onHoldProjectController } = require("./on-hold-project.controller");

const projectControllers = {
    createProjectController,
    abortProjectController,
    completeProjectController,
    deleteProjectController,
    getProjectController,
    listProjectsController,
    resumeProjectController,
    updateProjectController,
    archiveProjectController,
    onHoldProjectController
}

module.exports = {
    projectControllers
}