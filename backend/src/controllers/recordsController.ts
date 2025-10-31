import type { Request, Response } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"

// Use the main package import for Node.js
import * as pdfjsLib from "pdfjs-dist"

import Record from "../models/Records.ts"
import User from "../models/Users.ts"
import { anonymizeData } from "../services/anonymizationService.ts"
import { summarizeReportWithAI } from "../services/reportSummarizerService.ts"

const UPLOAD_DIR = path.resolve("./uploads/reports")
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) =>
    {
        const ts = Date.now()
        const safe = file.originalname.replace(/\s+/g, "_")
        cb(null, `${ts}__${safe}`)
    }
})
export const upload = multer({ storage })

// --- UPLOAD CONTROLLER ---
export const uploadAndAnalyzeReport = [
    upload.single("file"),
    async (req: Request, res: Response) =>
    {
        try
        {
            const file = req.file
            if (!file)
            {
                return res.status(400).json({
                    success: false,
                    message: "PDF file is required (field name: file)"
                })
            }

			const tokenUserId = req.user?.userId
			if (!tokenUserId) {
				if (req.file?.path) { try { fs.unlinkSync(req.file.path) } catch { /* ignore */ } }
				return res.status(401).json({ success: false, message: "Unauthorized" })
			}
			const user = await User.findById(tokenUserId)

            if (!user)
            {
                fs.unlinkSync(file.path)
				return res.status(404).json({
                    success: false,
					message: "User not found."
                })
            }

            const fileBuffer = fs.readFileSync(file.path)
            let rawText = ""
            
            const uint8Array = new Uint8Array(fileBuffer)
            const loadingTask = pdfjsLib.getDocument(uint8Array)
            const pdfDoc = await loadingTask.promise

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i)
                const textContent = await page.getTextContent()
                rawText += textContent.items.map((item: any) => item.str).join(" ") + "\n"
                page.cleanup()
            }
            
            if (!rawText.trim())
            {
                rawText = "Unable to extract readable text — file may be blank or image-based."
            }

            const anonymizedText = anonymizeData(rawText)

            const record = new Record({
                userId: user._id,
                originalFilename: file.originalname,
                filePath: file.path,
                anonymizedText: anonymizedText,
                uploadedAt: new Date()
            })
            await record.save()

            const aiSummary = await summarizeReportWithAI(anonymizedText)
            record.aiSummary = aiSummary
            await record.save()

            return res.status(201).json({
                success: true,
                message: "Report uploaded, text extracted, and analyzed successfully",
                data: {
                    recordId: record._id,
                    aiSummary,
                    originalFilename: record.originalFilename
                }
            })
        }
        catch (err)
        {
            console.error("Error in uploadAndAnalyzeReport:", err)
            if (req.file?.path) {
                try { fs.unlinkSync(req.file.path) } catch (e) { /* ignore */ }
            }
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: (err as Error).message
            })
        }
    }
]

// --- GET ONE RECORD SUMMARY (by Record ID) ---
export const getRecordSummary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Get the record ID from the URL

        const record = await Record.findById(id).populate("userId", "name");

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Record summary fetched successfully",
            data: {
                recordId: record._id,
                aiSummary: record.aiSummary,
                originalFilename: record.originalFilename,
                uploadedAt: record.uploadedAt,
                user: record.userId 
            }
        });

    } catch (err) {
        console.error("Error in getRecordSummary:", err);
        if ((err as Error).name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid record ID format",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: (err as Error).message
        });
    }
};


//
// ✅ NEW: GET ALL RECORD SUMMARIES (by User ID)
//
export const getAllUserRecords = async (req: Request, res: Response) => {
    try {
        const tokenUserId = req.user?.userId;
        if (!tokenUserId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await User.findById(tokenUserId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Find all records for that user
        // We select only the summary fields and sort by most recent
        const records = await Record.find({ userId: user._id })
            .select("_id originalFilename aiSummary uploadedAt")
            .sort({ uploadedAt: -1 }); // Sort by newest first

        return res.status(200).json({
            success: true,
            message: `Found ${records.length} records for user ${user.name}`,
            data: {
                user: {
                    _id: user._id,
                    name: user.name
                },
                records: records // This will be an array
            }
        });

    } catch (err) {
        console.error("Error in getAllUserRecords:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: (err as Error).message
        });
    }
};