// src/models/Records.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRecord extends Document {
  userId: mongoose.Types.ObjectId;
  originalFilename: string;
  filePath: string;
  uploadedAt: Date;
  anonymizedText?: string;
  aiSummary?: string;
  meta?: Record<string, any>;
}

const RecordSchema = new Schema<IRecord>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  originalFilename: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: () => new Date() },
  anonymizedText: { type: String },
  aiSummary: { type: String },
  meta: { type: Schema.Types.Mixed }
});

export default mongoose.models.Record || mongoose.model<IRecord>("Record", RecordSchema);
