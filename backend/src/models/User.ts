import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name?: string
  storeId: Types.ObjectId
  everbeeUserId?: string
  role: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    everbeeUserId: { type: String },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
)

export const User = mongoose.model<IUser>('User', userSchema)
