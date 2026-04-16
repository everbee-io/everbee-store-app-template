import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User, Store } from '../models'
import { generateAccessToken, generateRefreshToken } from '../lib/jwt'
import { exchangeCodeForToken, buildAuthorizationUrl } from '../lib/everbee-auth'
import { asyncHandler } from '../middleware/error-handler'
import { authenticate } from '../middleware/auth'

const router = Router()

// Local signup
router.post('/signup', asyncHandler(async (req, res) => {
  const { email, password, name, storeId } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(400).json({ error: 'User already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Find the store to link the user to
  const store = await Store.findOne({ storeId: storeId || 'demo-store-123' })
  if (!store) {
    return res.status(400).json({ error: 'Store not found' })
  }

  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    storeId: store._id,
  })

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
    storeId: user.storeId.toString(),
  })

  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
    storeId: user.storeId.toString(),
  })

  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      storeId: user.storeId,
    },
    accessToken,
    refreshToken,
  })
}))

// Local login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await User.findOne({ email }).populate('storeId')

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const store = user.storeId as any

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
    storeId: user.storeId.toString(),
  })

  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
    storeId: user.storeId.toString(),
  })

  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      storeId: store._id,
      store: {
        id: store._id,
        storeId: store.storeId,
        subdomain: store.subdomain,
        storeName: store.storeName,
      },
    },
    accessToken,
    refreshToken,
  })
}))

// EverBee OAuth - Install flow
router.get('/install', asyncHandler(async (req, res) => {
  const { app_id, store_id, subdomain, token, user_id } = req.query

  if (!token || !store_id || !subdomain) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const state = `${store_id}_${subdomain}_${user_id}`
  const authUrl = buildAuthorizationUrl(state, token as string)

  res.redirect(authUrl)
}))

// EverBee OAuth - Callback
router.get('/callback', asyncHandler(async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=${error}`)
  }

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=missing_code`)
  }

  const [storeIdParam, subdomain, userId] = (state as string).split('_')

  const tokens = await exchangeCodeForToken(code as string)
  const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000)

  const store = await Store.findOneAndUpdate(
    { storeId: storeIdParam },
    {
      storeId: storeIdParam,
      subdomain,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry,
    },
    { upsert: true, new: true }
  )

  let user = await User.findOne({ everbeeUserId: userId })

  if (!user) {
    user = await User.create({
      email: `user-${userId}@everbee.store`,
      password: await bcrypt.hash(Math.random().toString(36), 10),
      everbeeUserId: userId,
      storeId: store._id,
    })
  }

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
    storeId: user.storeId.toString(),
  })

  res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${accessToken}`)
}))

// Get current user
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.userId)
    .populate('storeId', 'storeId subdomain storeName')

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const store = user.storeId as any

  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      store: {
        id: store._id,
        storeId: store.storeId,
        subdomain: store.subdomain,
        storeName: store.storeName,
      },
    },
  })
}))

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' })
  }

  const payload = require('../lib/jwt').verifyToken(refreshToken)

  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    storeId: payload.storeId,
  })

  res.json({ accessToken })
}))

export default router
