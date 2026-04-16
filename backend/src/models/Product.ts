import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProduct extends Document {
  everbeeId: string
  storeId: Types.ObjectId
  name: string
  description?: string
  price: number
  status: string
  imageUrl?: string
  variantsCount: number
  lastSyncedAt: Date
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    everbeeId: { type: String, required: true, unique: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    status: { type: String, required: true },
    imageUrl: { type: String },
    variantsCount: { type: Number, default: 0 },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Product = mongoose.model<IProduct>('Product', productSchema)
