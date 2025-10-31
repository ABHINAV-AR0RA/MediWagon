import { Router } from "express"
import { processVoice } from "../controllers/voiceController.ts"
import { asyncHandler } from "../middleware/asyncHandler.ts"
import requireAuth from "../middleware/auth.ts"

const router = Router()

// Main voice endpoint
router.post("/process", requireAuth, asyncHandler(processVoice))

export default router