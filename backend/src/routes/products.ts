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

// List products
router.get('/', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)

  const products = await client.getProducts({
    page: Number(req.query.page) || 1,
    per_page: Number(req.query.per_page) || 20,
    filter_params: req.query.filter_params,
  })

  res.json(products)
}))

// Get single product
router.get('/:id', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const product = await client.getProduct(req.params.id)
  res.json(product)
}))

// Create product
router.post('/', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const product = await client.createProduct(req.body.product)
  res.json(product)
}))

// Update product
router.patch('/:id', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const product = await client.updateProduct(req.params.id, req.body.product)
  res.json(product)
}))

// Bulk update products
router.patch('/bulk/status', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const { ids, status } = req.body

  if (!ids || !Array.isArray(ids) || !status) {
    return res.status(400).json({ error: 'ids and status are required' })
  }

  const result = await client.bulkUpdateProducts(ids, status)
  res.json(result)
}))

export default router
