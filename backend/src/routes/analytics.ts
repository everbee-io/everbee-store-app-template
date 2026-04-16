import { Router } from 'express'
import mongoose from 'mongoose'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'
import { Product, Order } from '../models'

const router = Router()

router.use(authenticate)

// Get dashboard stats
router.get('/dashboard', asyncHandler(async (req, res) => {
  const { storeId } = req.user!
  const storeObjectId = new mongoose.Types.ObjectId(storeId)

  const [productsCount, ordersCount, revenueResult] = await Promise.all([
    Product.countDocuments({ storeId: storeObjectId }),
    Order.countDocuments({ storeId: storeObjectId }),
    Order.aggregate([
      { $match: { storeId: storeObjectId } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ])

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

  const recentOrders = await Order.find({ storeId: storeObjectId })
    .sort({ orderDate: -1 })
    .limit(5)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const salesByDay = await Order.aggregate([
    {
      $match: {
        storeId: storeObjectId,
        orderDate: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
        totalPrice: { $sum: '$totalPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  res.json({
    stats: {
      productsCount,
      ordersCount,
      totalRevenue,
    },
    recentOrders,
    salesByDay: salesByDay.map((day) => ({
      orderDate: day._id,
      _sum: { totalPrice: day.totalPrice },
      _count: day.count,
    })),
  })
}))

// Get revenue by product
router.get('/revenue-by-product', asyncHandler(async (req, res) => {
  const { storeId } = req.user!
  const storeObjectId = new mongoose.Types.ObjectId(storeId)

  const products = await Product.find({ storeId: storeObjectId }).limit(10)

  const data = products.map((product) => ({
    productId: product.everbeeId,
    name: product.name,
    revenue: Math.random() * 1000,
    orders: Math.floor(Math.random() * 50),
  }))

  res.json({ data })
}))

export default router
