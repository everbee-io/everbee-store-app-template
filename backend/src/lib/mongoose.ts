import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/everbee_store_app'

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err)
  })

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected')
  })
}

export async function disconnectDB() {
  await mongoose.disconnect()
}
