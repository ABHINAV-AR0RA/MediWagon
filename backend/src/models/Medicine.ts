import { Schema, model } from "mongoose"

const medicineSchema = new Schema({
    name: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    sideEffects: [String],
    prescribedBy: { type: String } // doctor’s name
})

export default model("Medicine", medicineSchema)
