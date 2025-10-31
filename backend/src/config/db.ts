import mongoose from "mongoose"
import { config } from "./env.ts"
import postgres from "postgres"

// --- PostgreSQL Connection ---
const sql = postgres(process.env.DATABASE_URL)

// --- MongoDB Connection ---
async function connectMongo()
{
	try
	{
		await mongoose.connect(config.mongoUri)
		const conn = mongoose.connection
		conn.on("error", () => console.error("❌ MongoDB connection error"))
		conn.once("open", () => console.log("✅ MongoDB connected"))
	}
	catch (err)
	{
		console.error("❌ MongoDB connection failed:", err)
		process.exit(1)
	}
}

// --- Exports ---
export { sql, connectMongo }
