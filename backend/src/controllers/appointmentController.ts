import type { Request, Response } from "express"
import { anonymizeData } from "../services/anonymizationService.ts"
import { analyzeSymptomsWithAI } from "../services/symptomAnalysisService.ts"
import { getDoctorRecommendations } from "../services/doctorRecommendationService.ts"
import { textToSpeech } from "../services/voiceAssistantService.ts"
import Appointment from "../models/Appointment.ts"
import Doctor from "../models/Doctor.ts"

/* -------------------- ANALYZE SYMPTOMS -------------------- */
export async function analyzeSymptoms(req: Request, res: Response)
{
	try
	{
		const { symptoms } = req.body

		if (!symptoms || typeof symptoms !== "string")
		{
			return res.status(400).json({
				success: false,
				message: "Invalid or missing symptoms input"
			})
		}

		const anonymizedData = anonymizeData(symptoms)
		const aiResponse = await analyzeSymptomsWithAI(anonymizedData)

		if (!aiResponse)
		{
			return res.status(500).json({
				success: false,
				message: "AI analysis failed"
			})
		}

		// Extract doctor type from AI response
		const doctorMatch = aiResponse.match(/Doctor:\s*([A-Za-z\s]+)/i)
		const doctorType = doctorMatch?.[1]?.trim() || "General Physician"

		return res.status(200).json({
			success: true,
			message: "Symptoms analyzed successfully",
			data: {
				summary: aiResponse,
				doctorType
			}
		})
	}
	catch (err)
	{
		console.error("Error analyzing symptoms:", err)
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: (err as Error).message
		})
	}
}

export async function analyzeSymptomsVoice(req: Request, res: Response)
{
	try
	{
		const { symptoms } = req.body

		if (!symptoms || typeof symptoms !== "string")
		{
			return res.status(400).json({
				success: false,
				message: "Invalid or missing symptoms input"
			})
		}

		// Step 1: anonymize data
		const anonymizedData = anonymizeData(symptoms)

		// Step 2: analyze with AI
		const aiResponse = await analyzeSymptomsWithAI(anonymizedData)

		if (!aiResponse)
		{
			return res.status(500).json({
				success: false,
				message: "AI analysis failed"
			})
		}

		// Step 3: Extract doctor type from AI response
		const doctorMatch = aiResponse.match(/Doctor:\s*([A-Za-z\s]+)/i)
		const doctorType = doctorMatch?.[1]?.trim() || "General Physician"

		// Step 4: Convert AI reply → speech 🎙️
		const audioPath = await textToSpeech(aiResponse)

		// Step 5: Respond with both text and audio
		return res.status(200).json({
			success: true,
			message: "Symptoms analyzed successfully",
			data: {
				summary: aiResponse,
				doctorType,
				audioFile: audioPath   // 👈 path to generated mp3
			}
		})
	}
	catch (err)
	{
		console.error("Error analyzing symptoms:", err)
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: (err as Error).message
		})
	}
}

/* -------------------- FIND AVAILABLE DOCTORS -------------------- */
export async function getAvailableDoctors(req: Request, res: Response)
{
	try
	{
		const { specialization, date, time } = req.body

		if (!specialization || !date || !time)
		{
			return res.status(400).json({
				success: false,
				message: "Missing required fields (specialization, date, time)"
			})
		}

		const selectedDate = new Date(date)

		// 1️⃣ Find all doctors for the specialization who are marked as available
		const doctors = await Doctor.find({ specialization, available: true })

		if (!doctors.length)
		{
			return res.status(404).json({
				success: false,
				message: "No doctors found for this specialization"
			})
		}

		// 2️⃣ Find which doctors are already booked at that time
		const bookedAppointments = await Appointment.find({
			date: selectedDate,
			time: time
		}).select("doctorId")

		const bookedDoctorIds = bookedAppointments.map(a => a.doctorId.toString())

		// 3️⃣ Filter out booked doctors
		const availableDoctors = doctors.filter(doc => !bookedDoctorIds.includes(doc._id.toString()))

		return res.status(200).json({
			success: true,
			message: "Available doctors fetched successfully",
			data: availableDoctors
		})
	}
	catch (err)
	{
		console.error("Error fetching available doctors:", err)
		return res.status(500).json({
			success: false,
			message: "Error fetching available doctors",
			error: (err as Error).message
		})
	}
}

/* -------------------- BOOK APPOINTMENT -------------------- */
export async function bookAppointment(req: Request, res: Response)
{
	try
	{
		const { doctorId, date, time, reason } = req.body
		const userId = req.user?.userId || req.body.userId

		if (!userId || !doctorId || !date || !time)
		{
			return res.status(400).json({
				success: false,
				message: "Missing required fields (userId, doctorId, date, time)"
			})
		}

		// Ensure doctor is available at that time
		const existing = await Appointment.findOne({ doctorId, date: new Date(date), time })
		if (existing)
		{
			return res.status(400).json({
				success: false,
				message: "Doctor is already booked at this time"
			})
		}

		const appointment = new Appointment({
			userId,
			doctorId,
			date: new Date(date),
			time,
			reason
		})

		await appointment.save()

		return res.status(201).json({
			success: true,
			message: "Appointment booked successfully",
			data: appointment
		})
	}
	catch (err)
	{
		console.error("Error booking appointment:", err)
		return res.status(500).json({
			success: false,
			message: "Error booking appointment",
			error: (err as Error).message
		})
	}
}

/* -------------------- USER APPOINTMENTS -------------------- */
export async function getUserAppointments(req: Request, res: Response)
{
	try
	{
		const tokenUserId = req.user?.userId
		if (!tokenUserId)
		{
			return res.status(401).json({ success: false, message: "Unauthorized" })
		}

		const appointments = await Appointment.find({ userId: tokenUserId }).sort({ date: 1 })

		return res.status(200).json({
			success: true,
			message: "Appointments retrieved successfully",
			data: appointments
		})
	}
	catch (err)
	{
		console.error("Error fetching appointments:", err)
		return res.status(500).json({
			success: false,
			message: "Error fetching appointments",
			error: (err as Error).message
		})
	}
}

/* -------------------- CANCEL APPOINTMENT -------------------- */
export async function cancelAppointment(req: Request, res: Response)
{
	try
	{
		const { appointmentId } = req.params

		if (!appointmentId)
		{
			return res.status(400).json({
				success: false,
				message: "Appointment ID is required"
			})
		}

		const appointment = await Appointment.findById(appointmentId)
		if (!appointment)
		{
			return res.status(404).json({
				success: false,
				message: "Appointment not found"
			})
		}

		appointment.status = "cancelled"
		await appointment.save()

		return res.status(200).json({
			success: true,
			message: "Appointment cancelled successfully",
			data: appointment
		})
	}
	catch (err)
	{
		console.error("Error cancelling appointment:", err)
		return res.status(500).json({
			success: false,
			message: "Error cancelling appointment",
			error: (err as Error).message
		})
	}
}
