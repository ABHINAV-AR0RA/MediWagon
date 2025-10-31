import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { Readable } from "stream"
import { createClient } from "@supabase/supabase-js"
import { config } from "../config/env.ts"

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

async function ensureBucket(): Promise<void> {
	try {
		const { data: buckets, error: listErr } = await supabase.storage.listBuckets()
		if (listErr) throw listErr
		const exists = buckets?.some(b => b.name === config.supabaseBucket)
		if (!exists) {
			const { error: createErr } = await supabase.storage.createBucket(config.supabaseBucket, {
				public: true,
				fileSizeLimit: "50MB",
				allowedMimeTypes: ["audio/mpeg", "audio/mp3"],
			})
			if (createErr) throw createErr
		}
	} catch (e) {
		// If bucket APIs are restricted, surface the error to caller
		throw e
	}
}

export async function textToSpeech(text: string)
{
	try
	{
		const voiceId = "MF4J4IDTRo0AxOO4dpFR"

		const audio = await elevenlabs.textToSpeech.convert(voiceId, {
			text,
			modelId: "eleven_multilingual_v2",
			outputFormat: "mp3_44100_128"
		})

		// Convert stream to a single Buffer
		const reader = audio.getReader()
		const chunks: Buffer[] = []
		const stream = new Readable({
			async read()
			{
				const { done, value } = await reader.read()
				if (done) { this.push(null) }
				else { this.push(value) }
			}
		})
		await new Promise<void>((resolve, reject) =>
		{
			stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
			stream.on("end", resolve)
			stream.on("error", reject)
		})
		const buffer = Buffer.concat(chunks)

		// Ensure bucket exists (public) then upload to Supabase Storage
		await ensureBucket()
		const filename = `aasha-${Date.now()}.mp3`
		const pathInBucket = `voice/${filename}`
		const { error: uploadError } = await supabase
			.storage
			.from(config.supabaseBucket)
			.upload(pathInBucket, buffer, { contentType: "audio/mpeg", upsert: true })
		if (uploadError) { throw uploadError }

		const { data: publicUrlData } = supabase
			.storage
			.from(config.supabaseBucket)
			.getPublicUrl(pathInBucket)

		return publicUrlData.publicUrl
	}
	catch (err)
	{
		console.error("Error generating speech:", err)
		throw err
	}
}
