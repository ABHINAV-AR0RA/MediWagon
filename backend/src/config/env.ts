import dotenv from "dotenv";

dotenv.config();

type AppConfig = {
	port: number;
	mongoUri: string;
	jwtSecret: string;
	supabaseUrl: string;
	supabaseServiceKey: string;
	supabaseBucket: string;
};

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const config: AppConfig = {
	port: Number(process.env.PORT || 5000),
	mongoUri: requireEnv("MONGO_URI"),
	jwtSecret: requireEnv("JWT_SECRET"),
	supabaseUrl: requireEnv("SUPABASE_URL"),
	supabaseServiceKey: requireEnv("SUPABASE_SERVICE_KEY"),
	supabaseBucket: process.env.SUPABASE_BUCKET || "voice-audio",
};

export default config;


