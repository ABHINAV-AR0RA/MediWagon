import { Router } from "express";
// ✅ Import the new controller functions
import { 
    uploadAndAnalyzeReport, 
    getRecordSummary, 
    getAllUserRecords 
} from "../controllers/recordsController.ts";
import requireAuth from "../middleware/auth.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

// --- POST /api/records/upload ---
// Uploads and analyzes a new report
router.post("/upload", requireAuth, ...uploadAndAnalyzeReport);

// --- GET /api/records/:id ---
// Gets a single summary by its specific Record ID
router.get("/:id", requireAuth, asyncHandler(getRecordSummary));

// --- POST /api/records/by-user ---
// Gets all record summaries for a specific user
router.post("/by-user", requireAuth, asyncHandler(getAllUserRecords));

export default router;