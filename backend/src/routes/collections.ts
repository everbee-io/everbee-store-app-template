import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'
import { createEverBeeClient } from '../lib/everbee-client'
import { User } from '../models'

const router = Router()

router.use(authenticate)

async function getClient(userId: string) {
  const user = await User.findById(userId).populate('storeId')

  if (!user || !user.storeId) {
    throw new Error('Store not found')
  }

  const store = user.storeId as any
  return createEverBeeClient(store.accessToken, store.storeId)
}

// List collections
router.get('/', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)

  const collections = await client.getCollections({
    page: Number(req.query.page) || 1,
    per_page: Number(req.query.per_page) || 20,
  })

  res.json(collections)
}))

// Get single collection
router.get('/:id', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const collection = await client.getCollection(req.params.id)
  res.json(collection)
}))

// Create collection
router.post('/', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const collection = await client.createCollection(req.body.collection)
  res.json(collection)
}))

// Update collection
router.patch('/:id', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const collection = await client.updateCollection(req.params.id, req.body.collection)
  res.json(collection)
}))

export default router
