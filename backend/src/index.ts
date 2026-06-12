import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { existsSync } from 'fs'
import { join } from 'path'

dotenv.config()

import { connectDB } from './lib/mongoose'

import authRoutes from './routes/auth'
import productsRoutes from './routes/products'
import ordersRoutes from './routes/orders'
import collectionsRoutes from './routes/collections'
import customersRoutes from './routes/customers'
import analyticsRoutes from './routes/analytics'
import releaseNotesRoutes from './routes/release-notes'
import metaRoutes from './routes/meta'
import mcpRoutes from './routes/mcp'

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

// Machine-legible surface (OpenAPI, docs, llms.txt, robots.txt, sitemap) at root.
app.use('/', metaRoutes)

// Headless head: hosted HTTP MCP at /mcp (public + discoverable by default,
// per-caller bearer auth). Mounted before the SPA catch-all so it wins.
app.use('/mcp', mcpRoutes)

app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/release-notes', releaseNotesRoutes)

// Single-origin production serving: when the built frontend is bundled in
// (Fly deploy), serve it from the same origin so the API, OpenAPI spec, MCP
// surface, and UI all share one domain. Vercel/Railway split deploys skip this.
const FRONTEND_DIST = join(__dirname, '../../frontend/dist')
if (existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST))
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(join(FRONTEND_DIST, 'index.html'))
  })
}

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
