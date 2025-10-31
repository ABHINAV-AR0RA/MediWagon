import express from "express"
import {
	analyzeSymptoms,
	bookAppointment,
	getUserAppointments,
	cancelAppointment,
    getAvailableDoctors,
    analyzeSymptomsVoice
} from "../controllers/appointmentController.ts"
import { asyncHandler } from "../middleware/asyncHandler.ts"
import requireAuth from "../middleware/auth.ts"

const router = express.Router()

router.post("/analyze", asyncHandler(analyzeSymptoms))
router.post("/book", requireAuth, asyncHandler(bookAppointment))
router.post("/available", asyncHandler(getAvailableDoctors))
router.post("/analyzeVoice", asyncHandler(analyzeSymptomsVoice))
router.get("/user", requireAuth, asyncHandler(getUserAppointments))
router.put("/cancel/:appointmentId", requireAuth, asyncHandler(cancelAppointment))

export default router
