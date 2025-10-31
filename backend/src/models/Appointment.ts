import { Schema, model, Types } from "mongoose"

const appointmentSchema = new Schema({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    reason: { type: String },
    status: { 
        type: String, 
        enum: ["scheduled", "completed", "cancelled"], 
        default: "scheduled" 
    }
})

export default model("Appointment", appointmentSchema)
