import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

import { Store, User, Product, Order, AppSettings } from '../src/models'

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/everbee_store_app'
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  // Create demo store
  const store = await Store.findOneAndUpdate(
    { storeId: 'demo-store-123' },
    {
      storeId: 'demo-store-123',
      subdomain: 'demo-store',
      storeName: 'Demo Store',
      ownerEmail: 'demo@example.com',
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      tokenExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true }
  )

  console.log('Created demo store:', store.subdomain)

  // Create demo user
  const hashedPassword = await bcrypt.hash('password', 10)

  const user = await User.findOneAndUpdate(
    { email: 'demo@example.com' },
    {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
      storeId: store._id,
      role: 'admin',
      everbeeUserId: 'demo-user-123',
    },
    { upsert: true, new: true }
  )

  console.log('Created demo user:', user.email)

  // Create demo products
  const products = [
    {
      everbeeId: 'prod-001',
      name: 'Classic T-Shirt',
      description: 'Comfortable cotton t-shirt',
      price: 29.99,
      status: 'published',
      imageUrl: 'https://via.placeholder.com/300x300?text=T-Shirt',
      variantsCount: 3,
      storeId: store._id,
    },
    {
      everbeeId: 'prod-002',
      name: 'Coffee Mug',
      description: 'Ceramic coffee mug with custom design',
      price: 14.99,
      status: 'published',
      imageUrl: 'https://via.placeholder.com/300x300?text=Mug',
      variantsCount: 2,
      storeId: store._id,
    },
    {
      everbeeId: 'prod-003',
      name: 'Tote Bag',
      description: 'Eco-friendly tote bag',
      price: 19.99,
      status: 'published',
      imageUrl: 'https://via.placeholder.com/300x300?text=Tote',
      variantsCount: 1,
      storeId: store._id,
    },
    {
      everbeeId: 'prod-004',
      name: 'Phone Case',
      description: 'Protective phone case',
      price: 24.99,
      status: 'draft',
      imageUrl: 'https://via.placeholder.com/300x300?text=Phone+Case',
      variantsCount: 5,
      storeId: store._id,
    },
  ]

  for (const product of products) {
    await Product.findOneAndUpdate(
      { everbeeId: product.everbeeId },
      product,
      { upsert: true, new: true }
    )
  }

  console.log(`Created ${products.length} demo products`)

  // Create demo orders
  const orders = [
    {
      everbeeId: 'order-001',
      orderNumber: 'ORD-001',
      status: 'placed',
      totalPrice: 59.98,
      customerEmail: 'customer1@example.com',
      customerName: 'John Doe',
      itemsCount: 2,
      orderDate: new Date('2024-01-15'),
      storeId: store._id,
    },
    {
      everbeeId: 'order-002',
      orderNumber: 'ORD-002',
      status: 'shipped',
      totalPrice: 29.99,
      customerEmail: 'customer2@example.com',
      customerName: 'Jane Smith',
      itemsCount: 1,
      orderDate: new Date('2024-01-14'),
      storeId: store._id,
    },
    {
      everbeeId: 'order-003',
      orderNumber: 'ORD-003',
      status: 'delivered',
      totalPrice: 44.98,
      customerEmail: 'customer3@example.com',
      customerName: 'Bob Johnson',
      itemsCount: 3,
      orderDate: new Date('2024-01-10'),
      storeId: store._id,
    },
  ]

  for (const order of orders) {
    await Order.findOneAndUpdate(
      { everbeeId: order.everbeeId },
      order,
      { upsert: true, new: true }
    )
  }

  console.log(`Created ${orders.length} demo orders`)

  // Create app settings
  await AppSettings.findOneAndUpdate(
    { storeId: store._id },
    {
      storeId: store._id,
      settings: {
        theme: 'light',
        notifications: true,
        autoSync: true,
      },
    },
    { upsert: true, new: true }
  )

  console.log('Created app settings')

  console.log('')
  console.log('Database seeded successfully!')
  console.log('')
  console.log('Demo credentials:')
  console.log('  Email: demo@example.com')
  console.log('  Password: password')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
