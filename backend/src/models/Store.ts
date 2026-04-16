import mongoose, { Schema, Document } from 'mongoose'

export interface IStore extends Document {
  storeId: string
  subdomain: string
  accessToken: string
  refreshToken?: string
  tokenExpiry?: Date
  storeName?: string
  ownerEmail?: string
  createdAt: Date
  updatedAt: Date
}

const storeSchema = new Schema<IStore>(
  {
    storeId: { type: String, required: true, unique: true, index: true },
    subdomain: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    tokenExpiry: { type: Date },
    storeName: { type: String },
    ownerEmail: { type: String },
  },
  { timestamps: true }
)

export const Store = mongoose.model<IStore>('Store', storeSchema)
