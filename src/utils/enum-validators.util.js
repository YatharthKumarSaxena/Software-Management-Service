// Enum Helpers using Factory Design Pattern
const { isValidEnumValue, getEnumKeyByValue } = require("./validators-factory.util.js");
const { logWithTime } = require("./time-stamps.util");

const {
  UserTypes,
  AuthModes,
  DeviceTypes,
  AuditMode,
  FirstNameFieldSetting,
  ContactModes,
  ProjectCreationReason,
  ProjectUpdationReason
} = require("@configs/enums.config");

/**
 * Factory to create enum helper with boolean returns
 * Returns true/false only - caller decides response handling
 * This allows collecting multiple validation errors
 * 
 * @param {Object} enumObj - The frozen enum object
 * @param {String} name - Enum name for logging context
 */

const createEnumHelper = (enumObj, name) => ({
  validate: (value) => {
    const result = isValidEnumValue(enumObj, value);
    logWithTime(`[${name}] validate("${value}") →`, result);
    return result;
  },
  reverseLookup: (value) => {
    const result = getEnumKeyByValue(enumObj, value);
    logWithTime(`[${name}] reverseLookup("${value}") →`, result);
    return result;
  },
  getValidValues: () => {
    return Object.values(enumObj);
  },
  getName: () => name
});

// Enum-specific helpers
const DeviceTypeHelper = createEnumHelper(DeviceTypes, "DeviceType");
const UserTypeHelper = createEnumHelper(UserTypes, "UserType");
const AuthModesHelper = createEnumHelper(AuthModes, "AuthModes");
const AuditModeHelper = createEnumHelper(AuditMode, "AuditMode");
const FirstNameFieldSettingHelper = createEnumHelper(FirstNameFieldSetting, "FirstNameFieldSetting");
const ContactModesHelper = createEnumHelper(ContactModes, "ContactModes");
const ProjectCreationReasonHelper = createEnumHelper(ProjectCreationReason, "ProjectCreationReason");
const ProjectUpdationReasonHelper = createEnumHelper(ProjectUpdationReason, "ProjectUpdationReason");

module.exports = {
    DeviceTypeHelper,
    UserTypeHelper,
    AuthModesHelper,
    AuditModeHelper,
    FirstNameFieldSettingHelper,
    ContactModesHelper,
    ProjectCreationReasonHelper,
    ProjectUpdationReasonHelper
};