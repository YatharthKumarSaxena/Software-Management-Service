// services/bulk-import/bulk-import.service.js
//
// Processes one chunk of an Excel/CSV import for the Elicitation phase.
//
// Responsibilities:
//  - Row-level validation (required fields, enum values, date, duplicates)
//  - Immediate creation of valid Requirements via createRequirementService
//  - Statistics tracking
//  - Processed-report generation / update  (processed.xlsx)
//  - BulkImport document update

const XLSX = require("xlsx");
const fs = require("fs");
const mongoose = require("mongoose");
const { BulkImportModel } = require("@models/bulk-import.model");
const { createRequirementService } = require("@services/requirements/create-requirement.service");
const {
  ensureBulkImportDir,
  getProcessedFilePath,
  getOriginalFilePath,
  deleteChunkFile
} = require("@utils/bulk-import-temp.util");
const { logWithTime } = require("@utils/time-stamps.util");
const {
  RequirementTypes,
  RequirementSources,
  PriorityLevels,
  BulkImportStatuses,
  Phases
} = require("@configs/enums.config");
const { INTERNAL_ERROR, BAD_REQUEST } = require("@configs/http-status.config");

// ── Column key normalisation ───────────────────────────────────────────────
const normalizeKey = (str) =>
  String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

const findHeader = (row, candidates) => {
  for (const key of candidates) {
    for (const rowKey of Object.keys(row)) {
      if (normalizeKey(rowKey) === normalizeKey(key)) {
        return row[rowKey];
      }
    }
  }
  return undefined;
};

// ── Enum maps for row validation ──────────────────────────────────────────
const VALID_PRIORITIES = new Set(Object.values(PriorityLevels));
const VALID_TYPES = new Set(Object.values(RequirementTypes));

// ── Row validator ─────────────────────────────────────────────────────────
const validateRow = (row, rowNumber, existingTitlesInBatch) => {
  const errors = [];

  const title = String(findHeader(row, ["Title", "title", "TITLE"]) || "").trim();
  const description = String(
    findHeader(row, ["Description", "description", "DESCRIPTION"]) || ""
  ).trim() || null;
  const priority = String(
    findHeader(row, ["Priority", "priority", "PRIORITY"]) || ""
  )
    .trim()
    .toUpperCase();
  const type = String(
    findHeader(row, ["Type", "type", "TYPE"]) || ""
  )
    .trim()
    .toUpperCase();
  const proposedDate = findHeader(row, ["ProposedDate", "proposeddate", "Proposed Date", "proposed_date"]);

  // Required: Title
  if (!title || title.length < 10) {
    errors.push(`Row ${rowNumber}: Title is required and must be at least 10 characters.`);
  } else if (title.length > 500) {
    errors.push(`Row ${rowNumber}: Title must not exceed 500 characters.`);
  }

  // Duplicate within the batch
  if (title && existingTitlesInBatch.has(title.toLowerCase())) {
    errors.push(`Row ${rowNumber}: Duplicate title within this chunk: "${title}".`);
  }

  // Enum: Priority (optional)
  if (priority && !VALID_PRIORITIES.has(priority)) {
    errors.push(
      `Row ${rowNumber}: Invalid priority '${priority}'. Allowed: ${[...VALID_PRIORITIES].join(", ")}`
    );
  }

  // Enum: Type (optional)
  if (type && !VALID_TYPES.has(type)) {
    errors.push(
      `Row ${rowNumber}: Invalid type '${type}'. Allowed: ${[...VALID_TYPES].join(", ")}`
    );
  }

  // Date validation (optional)
  let parsedDate = null;
  if (proposedDate) {
    const d = new Date(proposedDate);
    if (isNaN(d.getTime())) {
      errors.push(`Row ${rowNumber}: Invalid ProposedDate '${proposedDate}'.`);
    } else {
      parsedDate = d.toISOString();
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalized: errors.length === 0
      ? {
          title,
          description: description || null,
          priority: priority || PriorityLevels.MEDIUM,
          type: type || RequirementTypes.FUNCTIONAL,
          proposedDate: parsedDate
        }
      : null
  };
};

// ── Processed report helpers ───────────────────────────────────────────────
const STATUS_COL = "Import Status";
const ERRORS_COL = "Validation Errors";

const buildProcessedWorkbook = (rows, headers, results) => {
  const reportHeaders = [...headers, STATUS_COL, ERRORS_COL];

  const data = rows.map((row, idx) => {
    const result = results[idx];
    const rowArr = headers.map((h) => row[h] ?? "");
    rowArr.push(result.status);
    rowArr.push(result.errors || "");
    return rowArr;
  });

  const ws = XLSX.utils.aoa_to_sheet([reportHeaders, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import Report");
  return wb;
};

const appendToProcessedWorkbook = (existingPath, rows, headers, results) => {
  let wb;
  let existingData = [];
  let reportHeaders;

  if (fs.existsSync(existingPath)) {
    wb = XLSX.readFile(existingPath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    reportHeaders = allRows[0] || [];
    existingData = allRows.slice(1);
  } else {
    reportHeaders = [...headers, STATUS_COL, ERRORS_COL];
    existingData = [];
    wb = XLSX.utils.book_new();
  }

  const newData = rows.map((row, idx) => {
    const result = results[idx];
    const rowArr = reportHeaders
      .filter((h) => h !== STATUS_COL && h !== ERRORS_COL)
      .map((h) => row[h] ?? "");
    rowArr.push(result.status);
    rowArr.push(result.errors || "");
    return rowArr;
  });

  const allData = [reportHeaders, ...existingData, ...newData];
  const ws = XLSX.utils.aoa_to_sheet(allData);

  if (wb.SheetNames.length === 0) {
    XLSX.utils.book_append_sheet(wb, ws, "Import Report");
  } else {
    wb.Sheets[wb.SheetNames[0]] = ws;
  }

  return wb;
};

// ── Calculate final status ─────────────────────────────────────────────────
const calculateStatus = (successfulRows, totalRows) => {
  if (successfulRows === totalRows) return BulkImportStatuses.COMPLETED;
  if (successfulRows > 0) return BulkImportStatuses.PARTIALLY_COMPLETED;
  return BulkImportStatuses.FAILED;
};

// ══════════════════════════════════════════════════════════════════════════
// Main Service
// ══════════════════════════════════════════════════════════════════════════

/**
 * processChunkService
 * ───────────────────
 * Processes a single Excel/CSV chunk.
 *
 * @param {object} opts
 * @param {object}  opts.project        - Mongoose project document
 * @param {object}  opts.elicitation    - Mongoose elicitation document
 * @param {object[]} opts.rows          - Parsed data rows from parse-import-file middleware
 * @param {string[]} opts.headers       - Column headers
 * @param {string}  opts.bulkImportId  - ID of the BulkImport document (null for chunk 1)
 * @param {number}  opts.chunkNumber   - 1-based chunk number
 * @param {number}  opts.totalChunks   - Total number of chunks declared by frontend
 * @param {boolean} opts.preserveSourceFile - Whether to keep the original file
 * @param {string}  opts.chunkFilePath  - Path to the raw chunk file on disk
 * @param {string}  opts.originalFilePath - Path to the original file (for first chunk only)
 * @param {string}  opts.createdBy      - Custom user ID of the uploader
 * @param {object}  opts.auditContext   - { user, device, requestId }
 */
const processChunkService = async ({
  project,
  elicitation,
  rows,
  headers,
  bulkImportId,
  chunkNumber,
  totalChunks,
  preserveSourceFile,
  chunkFilePath,
  originalChunkFilePath,
  createdBy,
  auditContext
}) => {
  let bulkImport = null;

  try {
    const projectId = project._id.toString();
    const elicitationId = elicitation._id.toString();

    // ── Step 1: Resolve or create BulkImport document ─────────────────────
    if (chunkNumber === 1) {
      // First chunk — create a new BulkImport record
      bulkImport = new BulkImportModel({
        projectId: new mongoose.Types.ObjectId(projectId),
        elicitationId: new mongoose.Types.ObjectId(elicitationId),
        createdBy,
        status: BulkImportStatuses.FAILED, // Will be recalculated
        totalChunks,
        processedChunks: 0,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        preserveSourceFile: preserveSourceFile === true || preserveSourceFile === "true"
      });
      await bulkImport.save();
    } else {
      // Subsequent chunk — load existing BulkImport
      bulkImport = await BulkImportModel.findById(bulkImportId);
      if (!bulkImport) {
        return {
          success: false,
          errorCode: BAD_REQUEST,
          message: `BulkImport session not found: ${bulkImportId}`
        };
      }

      // Validate it belongs to this project
      if (bulkImport.projectId.toString() !== projectId) {
        return {
          success: false,
          errorCode: BAD_REQUEST,
          message: "BulkImport session does not belong to this project."
        };
      }
    }

    ensureBulkImportDir(bulkImport._id.toString());

    // ── Step 2: Save the original chunk file as original.xlsx (chunk 1 only) ─
    if (chunkNumber === 1 && preserveSourceFile && originalChunkFilePath) {
      const origPath = getOriginalFilePath(bulkImport._id.toString());
      if (!fs.existsSync(origPath)) {
        fs.copyFileSync(originalChunkFilePath, origPath);
      }
    }

    // ── Step 3: Row validation & requirement creation ──────────────────────
    const rowResults = [];
    const existingTitlesInBatch = new Set();
    let chunkSuccessful = 0;
    let chunkFailed = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      const validation = validateRow(row, rowNumber, existingTitlesInBatch);

      if (!validation.isValid) {
        rowResults.push({
          rowNumber,
          status: "FAILED",
          errors: validation.errors.join(" | ")
        });
        chunkFailed++;
        continue;
      }

      const { title, description, priority, type, proposedDate } =
        validation.normalized;

      // Track to catch intra-chunk duplicates
      existingTitlesInBatch.add(title.toLowerCase());

      // Create requirement immediately
      const createResult = await createRequirementService({
        project,
        elicitation,
        elaboration: null,
        phase: Phases.ELICITATION,
        title,
        description,
        priority,
        type,
        proposedDate,
        source: RequirementSources.BULK_IMPORT,
        createdBy,
        parentHlfId: null,
        relationType: null,
        relationshipNotes: null,
        auditContext
      });

      if (createResult.success) {
        rowResults.push({
          rowNumber,
          status: "SUCCESS",
          errors: ""
        });
        chunkSuccessful++;
      } else {
        rowResults.push({
          rowNumber,
          status: "FAILED",
          errors: createResult.message || "Requirement creation failed"
        });
        chunkFailed++;
      }
    }

    // ── Step 4: Update processed.xlsx ─────────────────────────────────────
    const processedPath = getProcessedFilePath(bulkImport._id.toString());
    const storeReport =
      process.env.STORE_PROCESSED_IMPORT_REPORT !== "false"; // default true

    if (storeReport) {
      const wb = appendToProcessedWorkbook(processedPath, rows, headers, rowResults);
      XLSX.writeFile(wb, processedPath);
    }

    // ── Step 5: Update BulkImport document ────────────────────────────────
    bulkImport.totalRows += rows.length;
    bulkImport.successfulRows += chunkSuccessful;
    bulkImport.failedRows += chunkFailed;
    bulkImport.processedChunks += 1;
    await bulkImport.save();

    // ── Step 6: Delete the transient chunk file ────────────────────────────
    if (chunkFilePath) {
      deleteChunkFile(chunkFilePath);
    }

    logWithTime(
      `✅ [processChunkService] Chunk ${chunkNumber}/${totalChunks} done. ` +
        `Success: ${chunkSuccessful}, Failed: ${chunkFailed}`
    );

    return {
      success: true,
      bulkImportId: bulkImport._id.toString(),
      chunkNumber,
      totalChunks,
      chunkStats: {
        totalRows: rows.length,
        successfulRows: chunkSuccessful,
        failedRows: chunkFailed
      },
      runningStats: {
        totalRows: bulkImport.totalRows,
        successfulRows: bulkImport.successfulRows,
        failedRows: bulkImport.failedRows,
        processedChunks: bulkImport.processedChunks
      },
      rowResults
    };
  } catch (error) {
    logWithTime(`❌ [processChunkService] Error: ${error.message}`);
    // Cleanup chunk file on unexpected error
    if (chunkFilePath) {
      deleteChunkFile(chunkFilePath);
    }
    return {
      success: false,
      errorCode: INTERNAL_ERROR,
      message: "Internal error while processing bulk import chunk.",
      error: error.message
    };
  }
};

module.exports = { processChunkService };
