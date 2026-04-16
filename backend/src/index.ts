import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

dotenv.config()

import { connectDB } from './lib/mongoose'

import authRoutes from './routes/auth'
import productsRoutes from './routes/products'
import ordersRoutes from './routes/orders'
import collectionsRoutes from './routes/collections'
import customersRoutes from './routes/customers'
import analyticsRoutes from './routes/analytics'

import { errorHandler } from './middleware/error-handler'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/analytics', analyticsRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use(errorHandler)

async function start() {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`)
  })
}

start()

export default app
