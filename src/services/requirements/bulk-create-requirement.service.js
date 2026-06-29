
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const { createRequirementService } = require("./create-requirement.service");
const { createBulkImportService } = require("@services/bulk-import/create-bulk-import.service");
const { logWithTime } = require("@utils/time-stamps.util");
const {
  RequirementTypes,
  RequirementSources,
  BulkImportCategories,
  Phases,
  PriorityLevels,
  ImportColumns
} = require("@configs/enums.config");
const { INTERNAL_ERROR, CONFLICT } = require("@configs/http-status.config");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");

// ── FieldDefinitions: single source of truth for CREATE_REQUIREMENT ───────────
const { FieldDefinitions } = require("@configs/field-definitions.config");
const { getValidationSet } = require("@utils/field-definition.util");
const { validateLength, isValidRegex } = require("@utils/validators-factory.util");
const { requiredFields } = require("@configs/required-fields.config");

// Pre-built validation map: { fieldName → validationRule } for CREATE_REQUIREMENT
// Same object that drives the JSON-body middleware — reused here for row validation.
const CREATE_REQUIREMENT_VALIDATIONS = getValidationSet(FieldDefinitions.CREATE_REQUIREMENT);

// Ordered list of field definitions so we can iterate with required/optional awareness
const CREATE_REQUIREMENT_FIELDS = Object.values(FieldDefinitions.CREATE_REQUIREMENT);

// Required field names array: ["title", ...] — same source as the JSON-body middleware
const REQUIRED_FIELD_NAMES = requiredFields.createRequirementField;

// ── Field-name constants derived from FieldDefinitions (zero hardcoding) ─────
//    If a field is renamed in field-definitions.config.js it propagates here.
const F = {
  TITLE:              FieldDefinitions.CREATE_REQUIREMENT.TITLE.field,
  DESCRIPTION:        FieldDefinitions.CREATE_REQUIREMENT.DESCRIPTION.field,
  PRIORITY:           FieldDefinitions.CREATE_REQUIREMENT.PRIORITY.field,
  TYPE:               FieldDefinitions.CREATE_REQUIREMENT.TYPE.field,
  PROPOSED_DATE:      FieldDefinitions.CREATE_REQUIREMENT.PROPOSED_DATE.field,
  PARENT_HLF_ID:      FieldDefinitions.CREATE_REQUIREMENT.PARENT_HLF_ID.field,
  RELATION_TYPE:      FieldDefinitions.CREATE_REQUIREMENT.RELATION_TYPE.field,
  RELATION_NOTES:     FieldDefinitions.CREATE_REQUIREMENT.RELATION_DESCRIPTION.field,
  PHASE:              FieldDefinitions.CREATE_REQUIREMENT.PHASE.field,
};

// Fields that have no corresponding spreadsheet column and must be skipped
const SPREADSHEET_ONLY_SKIP = new Set([
  F.PHASE,
  F.PARENT_HLF_ID,
  F.RELATION_TYPE,
  F.RELATION_NOTES,
]);

// ─────────────────────────────────────────────────────────────────────────────
// Processed-file column names
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COL  = ImportColumns.STATUS;
const ERROR_COL   = ImportColumns.ERROR;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: normalise a column key for header-to-field matching
// ─────────────────────────────────────────────────────────────────────────────

const normalizeKey = (str) =>
  String(str || "").trim().toLowerCase().replace(/\s+/g, "");

/**
 * Read a cell value from a parsed row by matching the field name against
 * column headers case-insensitively and without spaces.
 * (Trimming of the value itself is done by the spreadsheet parser already.)
 */
const readCell = (row, fieldName) => {
  for (const key of Object.keys(row)) {
    if (normalizeKey(key) === normalizeKey(fieldName)) {
      return row[key];
    }
  }
  return undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: validate a single data row against FieldDefinitions.CREATE_REQUIREMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates one spreadsheet row using the same FieldDefinitions.CREATE_REQUIREMENT
 * rules that power the JSON-body middleware — keeping a single source of truth.
 *
 * Special handling:
 *  - "title" blank → SKIPPED (the row is intentionally empty)
 *  - "proposedDate" → validated as an ISO-parseable date (isoDate regex in the
 *    definition covers the format; here we also attempt Date construction so we
 *    can normalise it to a proper ISO string for the service call).
 *  - Intra-file duplicate title → caught here before hitting the DB.
 */
const validateRow = (row, rowNumber, seenTitles) => {
  const errors     = [];
  const normalized = {};

  // ── Gate 1: Skip check — blank title means the row is empty ─────────────
  const rawTitle = String(readCell(row, F.TITLE) ?? "");

  if (!rawTitle) {
    return { isSkipped: true, isValid: false, errors: [], normalized: null };
  }

  // ── Gate 2: Required-field presence — using requiredFields.createRequirementField
  //    This is the same array the JSON-body middleware uses, so the source of
  //    truth for which fields are mandatory never diverges.
  const missingRequired = REQUIRED_FIELD_NAMES.filter(
    (fieldName) => !String(readCell(row, fieldName) ?? "")
  );

  if (missingRequired.length > 0) {
    missingRequired.forEach((fieldName) =>
      errors.push(`Row ${rowNumber}: Required field "${fieldName}" is missing.`)
    );
    return { isSkipped: false, isValid: false, errors, normalized: null };
  }

  // ── Gate 3: Per-field validation against FieldDefinitions rules ──────────
  for (const fieldDef of CREATE_REQUIREMENT_FIELDS) {
    const { field, validation } = fieldDef;

    // proposedDate needs special date-parsing treatment — handled separately below.
    if (field === F.PROPOSED_DATE) continue;

    // Fields with no spreadsheet column — skip silently.
    if (SPREADSHEET_ONLY_SKIP.has(field)) continue;

    const rawValue = String(readCell(row, field) ?? "");

    // Skip optional fields that are simply not provided
    if (!rawValue) continue;

    // ── Apply the validation rule from FieldDefinitions ──────────────────────
    if (validation) {
      // ── Length check ─────────────────────────────────────────────────────
      if (validation.length) {
        const { min, max } = validation.length;
        if (!validateLength(rawValue, min, max)) {
          errors.push(
            `Row ${rowNumber}: "${field}" must be between ${min} and ${max} characters (got ${rawValue.length}).`
          );
          continue;
        }
      }

      // ── Enum check ───────────────────────────────────────────────────────
      if (validation.enum) {
        const helper = validation.enum;
        if (!helper.validate(rawValue)) {
          errors.push(
            `Row ${rowNumber}: "${field}" has invalid value "${rawValue}". Allowed: ${helper.getValidValues().join(", ")}.`
          );
          continue;
        }
      }

      // ── Regex check ──────────────────────────────────────────────────────
      if (validation.regex) {
        if (!isValidRegex(rawValue, validation.regex)) {
          errors.push(
            `Row ${rowNumber}: "${field}" has invalid format: "${rawValue}".`
          );
          continue;
        }
      }
    }

    normalized[field] = rawValue;
  }

  // ── Intra-file duplicate title check ─────────────────────────────────────
  if (rawTitle && seenTitles.has(rawTitle.toLowerCase())) {
    errors.push(`Row ${rowNumber}: Duplicate title within this file: "${rawTitle}".`);
  }

  // ── proposedDate: validate + normalise to ISO string ─────────────────────
  const rawDate = readCell(row, F.PROPOSED_DATE);
  let parsedDate = null;

  if (rawDate) {
    const isoRule = CREATE_REQUIREMENT_VALIDATIONS[F.PROPOSED_DATE];

    if (isoRule?.regex && !isValidRegex(String(rawDate), isoRule.regex)) {
      errors.push(`Row ${rowNumber}: "${F.PROPOSED_DATE}" has invalid format: "${rawDate}".`);
    } else {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) {
        errors.push(`Row ${rowNumber}: "${F.PROPOSED_DATE}" could not be parsed: "${rawDate}".`);
      } else {
        parsedDate = d.toISOString();
      }
    }
  }

  return {
    isSkipped: false,
    isValid:   errors.length === 0,
    errors,
    normalized: errors.length === 0
      ? {
          title:        normalized[F.TITLE]       || rawTitle,
          description:  normalized[F.DESCRIPTION] || null,
          priority:     normalized[F.PRIORITY]    || PriorityLevels.MEDIUM,
          type:         normalized[F.TYPE]        || RequirementTypes.FUNCTIONAL,
          proposedDate: parsedDate,
        }
      : null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: map service error code → readable error label
// ─────────────────────────────────────────────────────────────────────────────

const mapErrorCode = (result) => {
  if (result.errorCode === CONFLICT) {
    return "DUPLICATE_REQUIREMENT";
  }
  if (result.errorCode === INTERNAL_ERROR) {
    return "INTERNAL_ERROR";
  }
  return "UNKNOWN_ERROR";
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: write the processed report to a temp file
// ─────────────────────────────────────────────────────────────────────────────

const writeProcessedFile = (headers, rows, rowResults, originalFilePath) => {
  const reportHeaders = [...headers, STATUS_COL, ERROR_COL];

  const data = rows.map((row, idx) => {
    const result = rowResults[idx];
    const rowArr = headers.map((h) => row[h] ?? "");
    rowArr.push(result.status);
    rowArr.push(result.error ?? null);
    return rowArr;
  });

  const ws = XLSX.utils.aoa_to_sheet([reportHeaders, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import Report");

  // Derive temp path from original file path
  const ext  = path.extname(originalFilePath);
  const base = path.basename(originalFilePath, ext);
  const dir  = path.dirname(originalFilePath);

  const processedFilePath = path.join(dir, `${base}-processed.xlsx`);
  XLSX.writeFile(wb, processedFilePath);

  return processedFilePath;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * bulkCreateRequirementService
 *
 * @param {object}    opts
 * @param {object}    opts.project        - Mongoose project document (set by middleware)
 * @param {object}    opts.elicitation    - Mongoose elicitation document (set by middleware)
 * @param {Array<{
 *   importData: { headers: string[], rows: object[], sheetName: string },
 *   filePath:   string,       - original temp file path (from req.files[i].path)
 *   originalname: string      - original filename (from req.files[i].originalname)
 * }>}               opts.files          - Uploaded files merged with their parsed data
 * @param {string}    opts.createdBy      - User / admin ID
 * @param {boolean|null} opts.preserveSourceFile    - true/false/null (null = use env default)
 * @param {boolean|null} opts.preserveProcessedFile - true/false/null (null = use env default)
 * @param {object}    opts.auditContext   - { user, device, requestId }
 *
 * @returns {Promise<{...}>}
 */
const bulkCreateRequirementService = async ({
  project,
  elicitation,
  files,
  createdBy,
  preserveSourceFile    = null,
  preserveProcessedFile = null,
  auditContext,
}) => {
  const fileReports    = [];
  const bulkImportIds  = [];  // collected per file, returned in final summary

  // ── Overall counters ──────────────────────────────────────────────────────
  let grandTotalRows      = 0;
  let grandSuccessfulRows = 0;
  let grandFailedRows     = 0;
  let grandSkippedRows    = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Process each file independently
  // ─────────────────────────────────────────────────────────────────────────

  for (const file of files) {
    const { importData, filePath, originalname } = file;
    const { headers, rows } = importData;

    logWithTime(
      `📂 [bulkCreateRequirementService] Processing file: ${originalname} (${rows.length} data rows)`
    );

    const rowResults       = [];
    const createdIds       = [];
    const seenTitles       = new Set();

    let fileSuccessful     = 0;
    let fileFailed         = 0;
    let fileSkipped        = 0;

    // ── Row-by-row processing ───────────────────────────────────────────────

    for (let i = 0; i < rows.length; i++) {
      const row       = rows[i];
      const rowNumber = i + 1;

      const validation = validateRow(row, rowNumber, seenTitles);

      // ── SKIPPED ─────────────────────────────────────────────────────────
      if (validation.isSkipped) {
        rowResults.push({
          rowNumber,
          status: "SKIPPED",
          error:  null,
        });
        fileSkipped++;
        continue;
      }

      // ── VALIDATION FAILURE ───────────────────────────────────────────────
      if (!validation.isValid) {
        rowResults.push({
          rowNumber,
          status: "FAILURE",
          error:  `VALIDATION_ERROR: ${validation.errors.join(" | ")}`,
        });
        fileFailed++;
        continue;
      }

      // Track this title for intra-file duplicate detection
      seenTitles.add(validation.normalized.title.toLowerCase());

      // ── Call createRequirementService ────────────────────────────────────
      const createResult = await createRequirementService({
        project,
        elicitation,
        elaboration: null,
        phase: Phases.ELICITATION,
        title:             validation.normalized.title,
        description:       validation.normalized.description,
        priority:          validation.normalized.priority,
        type:              validation.normalized.type,
        proposedDate:      validation.normalized.proposedDate,
        source:            RequirementSources.BULK_IMPORT,
        createdBy,
        parentHlfId:       null,
        relationType:      null,
        relationshipNotes: null,
        usedInBulkImport:  true,
        auditContext,
      });

      // ── SUCCESS ──────────────────────────────────────────────────────────
      if (createResult.success) {
        rowResults.push({
          rowNumber,
          status: "SUCCESS",
          error:  null,
        });
        createdIds.push(createResult.requirement._id.toString());
        fileSuccessful++;
      } else {
        // ── FAILURE (service-level) ────────────────────────────────────────
        const errorLabel = mapErrorCode(createResult);
        const errorMsg   = createResult.error || createResult.message || "Unknown error";

        rowResults.push({
          rowNumber,
          status: "FAILURE",
          error:  `${errorLabel}: ${errorMsg}`,
        });
        fileFailed++;
      }
    }

    // ── Write processed.xlsx ─────────────────────────────────────────────────
    let processedFilePath = null;

    try {
      processedFilePath = writeProcessedFile(headers, rows, rowResults, filePath);
      logWithTime(
        `📝 [bulkCreateRequirementService] Processed report written: ${processedFilePath}`
      );
    } catch (writeErr) {
      logWithTime(
        `⚠️ [bulkCreateRequirementService] Failed to write processed report for ${originalname}: ${writeErr.message}`
      );
    }

    // ── createBulkImportService: saves doc + uploads files + fires audit ─────
    const importResult = await createBulkImportService({
      project,
      createdBy,
      preserveSourceFile,
      preserveProcessedFile,
      failedRows:      fileFailed,
      totalRows:       rows.length - fileSkipped,
      successfulRows:  fileSuccessful,
      category:        BulkImportCategories.REQUIREMENTS,
      createdIds,
      originalFilePath:  filePath,   // decision delegated to createBulkImportService
      processedFilePath,
      auditContext,
    });

    const bulkImportId = importResult?.bulkImport?._id?.toString() ?? null;

    if (bulkImportId) bulkImportIds.push(bulkImportId);

    fileReports.push({
      filename:     originalname,
      bulkImportId,
      stats: {
        totalRows:      rows.length,
        successfulRows: fileSuccessful,
        failedRows:     fileFailed,
        skippedRows:    fileSkipped,
      },
      rowResults,
    });

    // ── Accumulate grand totals ───────────────────────────────────────────────
    grandTotalRows      += rows.length;
    grandSuccessfulRows += fileSuccessful;
    grandFailedRows     += fileFailed;
    grandSkippedRows    += fileSkipped;

    logWithTime(
      `✅ [bulkCreateRequirementService] File "${originalname}" done. ` +
      `Success: ${fileSuccessful}, Failed: ${fileFailed}, Skipped: ${fileSkipped}`
    );
  }

  // ── Final summary ──────────────────────────────────────────────────────────

  logWithTime(
    `🏁 [bulkCreateRequirementService] All files processed. ` +
    `Total: ${grandTotalRows}, Success: ${grandSuccessfulRows}, ` +
    `Failed: ${grandFailedRows}, Skipped: ${grandSkippedRows}`
  );

  // ── Fire activity tracker (fire-and-forget) ──────────────────────────────
  const { user, device, requestId } = auditContext || {};

  logActivityTrackerEvent(
    user,
    device,
    requestId,
    ACTIVITY_TRACKER_EVENTS.REQUIREMENTS_IMPORTED_IN_BULK,
    `${grandSuccessfulRows} requirement(s) imported in bulk across ${files.length} file(s).`,
    {
      oldData: null,
      newData: {
        bulkImportIds,
        summary: {
          totalFiles:     files.length,
          totalRows:      grandTotalRows,
          successfulRows: grandSuccessfulRows,
          failedRows:     grandFailedRows,
          skippedRows:    grandSkippedRows,
        },
      }
    }
  );

  return {
    success: true,
    bulkImportIds,
    summary: {
      totalFiles:     files.length,
      totalRows:      grandTotalRows,
      successfulRows: grandSuccessfulRows,
      failedRows:     grandFailedRows,
      skippedRows:    grandSkippedRows,
    },
    files: fileReports,
  };
};

module.exports = { bulkCreateRequirementService };
