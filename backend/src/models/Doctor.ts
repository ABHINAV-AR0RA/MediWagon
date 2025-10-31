import { Schema, model } from "mongoose"

const doctorSchema = new Schema({
	name: { type: String, required: true },
	specialization: { type: String, required: true },
	rating: { type: Number, default: 0 },
	experience: { type: Number, default: 0 },
	available: { type: Boolean, default: true },

	availability: {
		// Specific availability by date
		specificDates: [
			{
				date: { type: Date, required: true },
				timeSlots: [
					{
						start: { type: String, required: true }, // e.g. "10:00 AM"
						end: { type: String, required: true }    // e.g. "12:00 PM"
					}
				]
			}
		],

		// Recurring weekly availability (e.g., every Monday)
		recurring: [
			{
				dayOfWeek: {
					type: String,
					enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
					required: true
				},
				timeSlots: [
					{
						start: { type: String, required: true },
						end: { type: String, required: true }
					}
				]
			}
		]
	}
})

export default model("Doctor", doctorSchema)
