const { isDeepStrictEqual } = require("node:util");

const IGNORED_KEYS = new Set([
  "_id",
  "id",
  "sequence",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "version",
  "isDeleted",
  "__v",
  "createdBy",
  "updatedBy",
  "deletedBy"
]);

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizeValue = (value) => {
  if (typeof value === "string") {
    return value.trim().replace(/\r\n/g, "\n");
  }

  if (value && typeof value.toString === "function" && !isObject(value)) {
    return value.toString();
  }

  return value;
};

const compareDirectConversion = (oldData, newData) => {
  if (!oldData || !newData) {
    return { valid: true };
  }

  const commonKeys = Object.keys(oldData).filter(
    (key) =>
      Object.prototype.hasOwnProperty.call(newData, key) &&
      !IGNORED_KEYS.has(key)
  );

  for (const key of commonKeys) {
    const oldValue = normalizeValue(oldData[key]);
    const newValue = normalizeValue(newData[key]);

    // Deep compare for objects & arrays
    if (
      (isObject(oldValue) || Array.isArray(oldValue)) &&
      (isObject(newValue) || Array.isArray(newValue))
    ) {
      if (!isDeepStrictEqual(oldValue, newValue)) {
        return {
          valid: false,
          field: key,
          reason: Array.isArray(oldValue)
            ? "Arrays differ"
            : "Objects differ"
        };
      }

      continue;
    }

    if (oldValue !== newValue) {
      return {
        valid: false,
        field: key,
        reason: "Values differ",
        oldVal: oldValue,
        newVal: newValue
      };
    }
  }

  return { valid: true };
};

module.exports = { compareDirectConversion };