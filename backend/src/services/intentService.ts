interface IntentResult {
	intent: string
	confidence: number
	details?: Record<string, string>
}

export async function detectIntent(userText: string): Promise<IntentResult>
{
	const text = userText.toLowerCase().trim()

	// Utility for quick pattern check
	const match = (patterns: string[]) => patterns.some(p => text.includes(p))

	// =============================
	// 1️⃣ SYMPTOM ANALYSIS
	// =============================
	if (
		match(["i have", "feeling", "suffering", "pain", "cough", "fever", "ache", "symptom", "vomit", "tired", "dizzy", "sick"]) ||
		/feeling (unwell|weak|ill|bad|dizzy|sick)/i.test(text)
	)
	{
		return { intent: "symptomAnalysis", confidence: 0.95 }
	}

	// =============================
	// 2️⃣ GET AVAILABLE DOCTORS
	// =============================
	if (
		match([
			"available doctors", "find doctor", "show doctors", "any doctor", "need a doctor",
			"doctor for", "which doctor", "specialist", "cardiologist", "dermatologist", "orthopedic"
		])
	)
	{
		const specialtyMatch = text.match(/(cardiologist|dermatologist|orthopedic|neurologist|psychiatrist|dentist|physician)/i)
		const specialization = specialtyMatch ? specialtyMatch[1] : "General Physician"

		return {
			intent: "getAvailableDoctors",
			confidence: 0.9,
			details: { specialization }
		}
	}

	// =============================
	// 3️⃣ BOOK APPOINTMENT
	// =============================
	if (
		match(["book", "schedule", "make appointment", "set appointment", "reserve appointment"]) ||
		/book.*doctor|appointment.*doctor/i.test(text)
	)
	{
		const doctorMatch = text.match(/dr\.?\s*([a-z\s]+)/i)
		const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/) ||
			text.match(/\b(?:on )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)\b/i)
		const timeMatch = text.match(/\b(\d{1,2}(:\d{2})?\s*(am|pm)?)\b/i)

		return {
			intent: "bookAppointment",
			confidence: 0.9,
			details: {
				doctorName: doctorMatch?.[1]?.trim() || "",
				date: dateMatch?.[1] || "",
				time: timeMatch?.[1] || ""
			}
		}
	}

	// =============================
	// 4️⃣ GET USER APPOINTMENTS
	// =============================
	if (
		match(["my appointments", "show appointments", "check appointments", "list appointments", "view my schedule"]) ||
		/(upcoming|next) appointment/i.test(text)
	)
	{
		return { intent: "getUserAppointments", confidence: 0.9 }
	}

	// =============================
	// 5️⃣ CANCEL APPOINTMENT
	// =============================
	if (match(["cancel appointment", "delete appointment", "remove appointment"])) {
		const idMatch = text.match(/([a-f0-9]{24})/)
		return { intent: "cancelAppointment", confidence: 0.9, details: { appointmentId: idMatch?.[1] || "" } }
	}

	// =============================
	// 6️⃣ GET ALL USER RECORDS
	// =============================
	if (match(["my records", "show records", "show reports", "list reports", "medical records"])) {
		return { intent: "getAllUserRecords", confidence: 0.9 }
	}

	// =============================
	// 7️⃣ GET RECORD SUMMARY BY ID
	// =============================
	if (match(["record", "report"]) && /summary|details|show|open|read/.test(text)) {
		const idMatch = text.match(/([a-f0-9]{24})/)
		return { intent: "getRecordSummary", confidence: 0.85, details: { recordId: idMatch?.[1] || "" } }
	}

	// =============================
	// 8️⃣ UNKNOWN INTENT
	// =============================
	return { intent: "unknown", confidence: 0.3 }
}
