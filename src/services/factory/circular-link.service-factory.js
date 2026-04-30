// factory/circular-link.service-factory.js

/**
 * For Multiple References (Array of IDs or Array of Objects)
 */
const createDetectCircularLink = ({ model, linkField, idPath = null }) => {
  return async ({ sourceId, targetIds }) => {
    // Input targets se IDs extract karo (Safe for Strings or Objects)
    const initialTargets = Array.isArray(targetIds)
      ? targetIds.map(t => (idPath && typeof t === 'object' ? String(t[idPath]) : String(t)))
      : [];

    const stack = [...initialTargets];
    const visited = new Set();

    while (stack.length) {
      const currentId = stack.pop();

      if (currentId === String(sourceId)) return true; // Cycle Found!

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const entity = await model.findById(currentId, { [linkField]: 1 }).lean();
      const rawLinks = entity?.[linkField] || [];

      if (Array.isArray(rawLinks) && rawLinks.length) {
        const extractedLinks = rawLinks.map(link => 
          (idPath && typeof link === 'object') ? String(link[idPath]) : String(link)
        );
        stack.push(...extractedLinks);
      }
    }
    return false;
  };
};

/**
 * For Single Reference (Single ID or Single Object)
 */
const createDetectCircularLinkForSingleRef = ({ model, linkField, idPath = null }) => {
  return async ({ sourceId, targetId }) => {
    if (!targetId) return false;

    // Target extraction
    let currentId = (idPath && typeof targetId === 'object') 
                    ? String(targetId[idPath]) 
                    : String(targetId);
                    
    const source = String(sourceId);
    const visited = new Set();

    while (currentId) {
      if (currentId === source) return true; // Cycle Found!

      if (visited.has(currentId)) break;
      visited.add(currentId);

      const entity = await model.findById(currentId, { [linkField]: 1 }).lean();
      if (!entity || !entity[linkField]) break;

      const nextVal = entity[linkField];
      // Next link extraction
      currentId = (idPath && typeof nextVal === 'object') 
                  ? String(nextVal[idPath]) 
                  : String(nextVal);
    }
    return false;
  };
};

module.exports = {
  createDetectCircularLink,
  createDetectCircularLinkForSingleRef
};