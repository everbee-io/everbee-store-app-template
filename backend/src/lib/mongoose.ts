import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/everbee_store_app'

  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.error(
      'MONGODB_URI is not set. Add your MongoDB Atlas connection string in Railway Variables.'
    )
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    console.error(
      'Check MONGODB_URI in Railway (Atlas cluster, user/password, IP allowlist 0.0.0.0/0).'
    )
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
