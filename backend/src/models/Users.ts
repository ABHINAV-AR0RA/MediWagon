import { Schema, model } from "mongoose"

const userSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true, index: true },
	password: { type: String, required: true },
	age: { type: Number },
	gender: { type: String },
	address: { type: String },
	phone: { type: String },
}, { timestamps: true, versionKey: false, toJSON: { transform(_doc, ret) { delete ret.password; return ret; } } })

export default model("User", userSchema)
