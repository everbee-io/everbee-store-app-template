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

// Get customer
router.get('/:id', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const customer = await client.getCustomer(req.params.id)
  res.json(customer)
}))

// Create customer
router.post('/', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const customer = await client.createCustomer(req.body.customer)
  res.json(customer)
}))

// Update customer
router.put('/:id', asyncHandler(async (req, res) => {
  const client = await getClient(req.user!.userId)
  const customer = await client.updateCustomer(req.params.id, req.body.customer)
  res.json(customer)
}))

export default router
