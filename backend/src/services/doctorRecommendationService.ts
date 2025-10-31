import Doctor from "../models/Doctor.ts";

export async function getDoctorRecommendations(specialization: string)
{
	try {
		const doctors = await Doctor.find({ specialization })
			.sort({ rating: -1 })
			.limit(3)
			.select("name specialization rating location");

		if (!doctors.length) {
			return [
				{
					name: "No doctors available currently",
					specialization,
					rating: 0,
					location: "N/A"
				}
			];
		}

		return doctors;

	} catch (err) {
		console.error("Error fetching doctor recommendations:", err);
		return [];
	}
}
