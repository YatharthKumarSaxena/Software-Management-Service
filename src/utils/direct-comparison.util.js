const isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);

const normalizeValue = (value) => {
  if (typeof value === "string") {
    // Trim whitespace and normalize newlines
    return value.trim().replace(/\r\n/g, "\n");
  }
  // Convert objects like ObjectId to string if they are not plain objects
  if (value && typeof value.toString === 'function' && !isObject(value)) {
    return value.toString();
  }
  return value;
};

/**
 * Compares two objects (oldData from Delete, newData from Create)
 * to verify if a DIRECT conversion is valid.
 * A DIRECT conversion means common fields were not modified meaningfully.
 */
const compareDirectConversion = (oldData, newData) => {
  if (!oldData || !newData) return { valid: true }; // Nothing to compare

  const commonKeys = Object.keys(oldData).filter(key => Object.prototype.hasOwnProperty.call(newData, key));

  for (const key of commonKeys) {
    // Ignore internal or automatically generated fields that naturally change
    const ignoredKeys = ["_id", "id", "createdAt", "updatedAt", "status", "version", "linkedHlfId"];
    if (ignoredKeys.includes(key)) {
      continue;
    }

    const oldVal = oldData[key];
    const newVal = newData[key];

    // Handle deep comparison for objects / arrays
    if (isObject(oldVal) && isObject(newVal)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        return { valid: false, field: key, reason: "Objects differ" };
      }
    } else if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
         return { valid: false, field: key, reason: "Arrays differ" };
      }
    } else {
      if (normalizeValue(oldVal) !== normalizeValue(newVal)) {
        return { valid: false, field: key, reason: "Values differ", oldVal, newVal };
      }
    }
  }

  return { valid: true };
};

module.exports = { compareDirectConversion };
