import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IOrder extends Document {
  everbeeId: string
  storeId: Types.ObjectId
  orderNumber: string
  status: string
  totalPrice: number
  customerEmail?: string
  customerName?: string
  itemsCount: number
  orderDate: Date
  lastSyncedAt: Date
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<IOrder>(
  {
    everbeeId: { type: String, required: true, unique: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    orderNumber: { type: String, required: true },
    status: { type: String, required: true, index: true },
    totalPrice: { type: Number, required: true },
    customerEmail: { type: String },
    customerName: { type: String },
    itemsCount: { type: Number, default: 0 },
    orderDate: { type: Date, required: true },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Order = mongoose.model<IOrder>('Order', orderSchema)
