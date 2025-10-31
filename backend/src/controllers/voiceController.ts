import type { Request, Response } from "express"
import { detectIntent } from "../services/intentService.ts"
import { analyzeSymptomsWithAI } from "../services/symptomAnalysisService.ts"
import { getAvailableDoctors } from "./appointmentController.ts"
import { textToSpeech } from "../services/voiceAssistantService.ts"
import Appointment from "../models/Appointment.ts"
import Doctor from "../models/Doctor.ts"
import Record from "../models/Records.ts"
import User from "../models/Users.ts"

export async function processVoice(req: Request, res: Response)
{
	try
	{
		const { text } = req.body
		if (!req.user) {
			return res.status(401).json({ success: false, message: "Unauthorized" })
		}
		const username = req.user.username

		if (!text)
		{
			return res.status(400).json({
				success: false,
				message: "Missing text input"
			})
		}

		// 🧩 Detect user intent and extract details
		const { intent: intentName, details } = await detectIntent(text)
		let responseText = ""
		let responseData = null

		switch (intentName)
		{
			// 🩺 AI symptom analysis
			case "symptomAnalysis":
				responseText = await analyzeSymptomsWithAI(text)
				break

			// 👨‍⚕️ Check available doctors
			case "getAvailableDoctors":
			{
				const specializationMatch =
					details?.specialization ||
					text.match(/(cardiologist|dermatologist|neurologist|pediatrician|dentist|orthopedic|gynecologist|general physician)/i)?.[1]
				const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/)
				const timeMatch = text.match(/\b(\d{1,2}(:\d{2})?\s*(am|pm)?)\b/i)

				const specialization = specializationMatch?.trim()
				const date = dateMatch?.[1]
				const time = timeMatch?.[1]

				if (!specialization || !date || !time)
				{
					responseText = "I need specialization, date, and time to find available doctors. Please provide them."
					break
				}

				// Compute available doctors directly (controller version expects req/res)
				const selectedDate = new Date(date)
				const doctors = await Doctor.find({ specialization, available: true })
				const bookedAppointments = await Appointment.find({ date: selectedDate, time }).select("doctorId")
				const bookedDoctorIds = bookedAppointments.map(a => a.doctorId.toString())
				responseData = doctors.filter(doc => !bookedDoctorIds.includes(doc._id.toString()))

				if (!responseData || responseData.length === 0)
				{
					responseText = `No available ${specialization}s found for ${date} at ${time}.`
				}
				else
				{
					responseText = `Here are the available ${specialization}s for ${date} at ${time}.`
				}
				break
			}

			// 📅 Book appointment by doctor name
			case "bookAppointment":
			{
				const doctorNameMatch = text.match(/dr\.?\s*([a-z\s]+)/i)
				const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/)
				const timeMatch = text.match(/\b(\d{1,2}(:\d{2})?\s*(am|pm)?)\b/i)

				if (!doctorNameMatch || !dateMatch || !timeMatch)
				{
					responseText = "I couldn’t find the doctor name, date, or time in your request."
					break
				}

				const doctorName = doctorNameMatch[1].trim()
				const date = dateMatch[1]
				const time = timeMatch[1]

				// 🧍‍♂️ Get user and doctor by name
				const doctor = await Doctor.findOne({ name: new RegExp(doctorName, "i") })
				const user = await User.findOne({ name: new RegExp(username, "i") })

				if (!doctor || !user)
				{
					responseText = "Doctor or user not found."
					break
				}

				const appointment = await Appointment.create({
					userId: user._id,
					doctorId: doctor._id,
					date,
					time
				})

				responseText = `Appointment booked successfully with Dr. ${doctor.name} on ${date} at ${time}.`
				responseData = appointment
				break
			}

			// ❌ Cancel appointment
			case "cancelAppointment":
			{
				const appointmentId = details?.appointmentId || text.match(/([a-f0-9]{24})/)?.[1]
				if (!appointmentId) {
					responseText = "Please provide the appointment ID to cancel."
					break
				}
				const appt = await Appointment.findById(appointmentId)
				if (!appt) {
					responseText = "I couldn't find that appointment."
					break
				}
				// Ensure the appointment belongs to the requesting user
				if (String(appt.userId) !== String(req.user!.userId)) {
					responseText = "You can only cancel your own appointments."
					break
				}
				appt.status = "cancelled"
				await appt.save()
				responseText = "Your appointment has been cancelled."
				responseData = { appointmentId }
				break
			}

			// 🗂️ Get all user records
			case "getAllUserRecords":
			{
				const records = await Record.find({ userId: req.user!.userId })
					.select("_id originalFilename aiSummary uploadedAt")
					.sort({ uploadedAt: -1 })
				responseData = records
				responseText = records.length ? `Found ${records.length} records.` : "You don't have any records."
				break
			}

			// 📄 Get one record summary by ID
			case "getRecordSummary":
			{
				const recordId = details?.recordId || text.match(/([a-f0-9]{24})/)?.[1]
				if (!recordId) {
					responseText = "Please provide the record ID."
					break
				}
				const record = await Record.findOne({ _id: recordId, userId: req.user!.userId })
					.select("_id originalFilename aiSummary uploadedAt")
				if (!record) {
					responseText = "I couldn't find that record for your account."
					break
				}
				responseData = record
				responseText = `Here is the summary for ${record.originalFilename}.`
				break
			}

			// 📋 Get user's upcoming appointments
			case "getUserAppointments":
			{
				const user = await User.findOne({ name: new RegExp(username, "i") })
				if (!user)
				{
					responseText = "User not found."
					break
				}

				const appointments = await Appointment.find({ userId: user._id })
				responseData = appointments
				responseText = appointments.length
					? "Here are your upcoming appointments."
					: "You have no appointments."
				break
			}

			// 🤷‍♂️ Unknown intent
			default:
				responseText = "Sorry, I didn't understand your request."
		}

		// 🎙️ Convert AI/system reply to speech
		const audioPath = await textToSpeech(responseText)

		return res.status(200).json({
			success: true,
			intent: intentName,
			message: responseText,
			data: responseData,
			audioFile: audioPath
		})
	}
	catch (err)
	{
		console.error("Error in processVoice:", err)
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: (err as Error).message
		})
	}
}
