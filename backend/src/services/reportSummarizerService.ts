import OpenAI from "openai"
import dotenv from "dotenv"

dotenv.config()

// ✅ Use explicit baseURL — ensure it's correct for your Futurix API
const openai = new OpenAI({
	apiKey: process.env.SHIVAAY_API_KEY,
	baseURL: "https://api.futurixai.com/api/shivaay/v1"
})

export async function summarizeReportWithAI(anonymizedText: string): Promise<string>
{
	if (!anonymizedText)
		return ""

	const prompt = `
You are a medical-report summarizer that turns clinical reports into a user-friendly, comprehensive summary.

Input (anonymized clinical text):
"""${anonymizedText}"""

Produce:
1) A short plain-language summary (25-50 sentences) for the patient.
2) Important findings (as bullet points).
3) Suggested next steps (as bullet points).
4) If a specialist is indicated, clearly state: "Doctor: [specialization]".

Return only the text, well-formatted and readable.
	`

	try
	{
		const completion = await openai.chat.completions.create({
			model: "shivaay",
			messages: [
				{ role: "system", content: "You are a medical assistant AI for healthcare analysis." },
				{ role: "user", content: prompt }
			]
		})

		return completion.choices?.[0]?.message?.content?.trim() ?? ""
	}
	catch (error: any)
	{
		console.error("Error in summarizeReportWithAI:", error)
		throw new Error(error?.message || "Failed to summarize report with AI")
	}
}
