import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAppSettings extends Document {
  storeId: Types.ObjectId
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const appSettingsSchema = new Schema<IAppSettings>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, unique: true },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export const AppSettings = mongoose.model<IAppSettings>('AppSettings', appSettingsSchema)
