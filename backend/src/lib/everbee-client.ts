import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const EVERBEE_API_BASE_URL = 'https://store-open-api.everbee.com/open_api/v1'

export class EverBeeClient {
  private client: AxiosInstance
  private accessToken: string
  private storeId: string

  constructor(accessToken: string, storeId: string) {
    this.accessToken = accessToken
    this.storeId = storeId

    this.client = axios.create({
      baseURL: EVERBEE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': this.accessToken,
        'Store-Id': this.storeId,
      },
    })
  }

  // Products
  async getProducts(params?: { page?: number; per_page?: number; filter_params?: any }) {
    const response = await this.client.get('/products', { params })
    return response.data
  }

  async getProduct(id: string) {
    const response = await this.client.get(`/products/${id}`)
    return response.data
  }

  async createProduct(product: any) {
    const response = await this.client.post('/products', { product })
    return response.data
  }

  async updateProduct(id: string, product: any) {
    const response = await this.client.patch(`/products/${id}`, { product })
    return response.data
  }

  async bulkUpdateProducts(ids: string[], status: string) {
    const response = await this.client.patch('/products/bulk_operation', {
      product: { ids, status },
    })
    return response.data
  }

  // Orders
  async getOrders(params?: { page?: number; per_page?: number; filter_params?: any }) {
    const response = await this.client.get('/orders', { params })
    return response.data
  }

  async updateOrderTracking(orderId: string, tracking: any) {
    const response = await this.client.post(`/orders/${orderId}/trackings`, { tracking })
    return response.data
  }

  async bulkUpdateOrders(ids: string[], status: string) {
    const response = await this.client.patch('/orders/bulk_operation', {
      order: { ids, status },
    })
    return response.data
  }

  // Collections
  async getCollections(params?: { page?: number; per_page?: number; filter_params?: any }) {
    const response = await this.client.get('/collections', { params })
    return response.data
  }

  async getCollection(id: string) {
    const response = await this.client.get(`/collections/${id}`)
    return response.data
  }

  async createCollection(collection: any) {
    const response = await this.client.post('/collections', { collection })
    return response.data
  }

  async updateCollection(id: string, collection: any) {
    const response = await this.client.patch(`/collections/${id}`, { collection })
    return response.data
  }

  // Categories
  async getCategories() {
    const response = await this.client.get('/categories')
    return response.data
  }

  async getCategory(id: string) {
    const response = await this.client.get(`/categories/${id}`)
    return response.data
  }

  // Customers
  async getCustomer(id: string) {
    const response = await this.client.get(`/customers/${id}`)
    return response.data
  }

  async createCustomer(customer: any) {
    const response = await this.client.post('/customers', { customer })
    return response.data
  }

  async updateCustomer(id: string, customer: any) {
    const response = await this.client.put(`/customers/${id}`, { customer })
    return response.data
  }

  // Attachments (Images)
  async createAttachment(blob: any) {
    const response = await this.client.post('/attachments', { blob })
    return response.data
  }

  async createAttachmentFromUrl(mediaUrl: string) {
    const response = await this.client.post('/attachments', { media_url: mediaUrl })
    return response.data
  }

  // Shipping Profiles
  async getShippingProfiles() {
    const response = await this.client.get('/shipping_profiles')
    return response.data
  }

  async createShippingProfile(shippingProfile: any) {
    const response = await this.client.post('/shipping_profiles', { shipping_profile: shippingProfile })
    return response.data
  }

  async updateShippingProfile(id: string, shippingProfile: any) {
    const response = await this.client.patch(`/shipping_profiles/${id}`, { shipping_profile: shippingProfile })
    return response.data
  }

  // Discounts
  async getDiscounts(params?: { page?: number; per_page?: number; search_term?: string }) {
    const response = await this.client.get('/discounts', { params })
    return response.data
  }

  async getDiscount(id: string) {
    const response = await this.client.get(`/discounts/${id}`)
    return response.data
  }

  async createDiscount(discount: any) {
    const response = await this.client.post('/discounts', { discount })
    return response.data
  }

  async updateDiscount(id: string, discount: any) {
    const response = await this.client.put(`/discounts/${id}`, { discount })
    return response.data
  }

  // Themes
  async getThemeSettings() {
    const response = await this.client.get('/themes')
    return response.data
  }

  // Webhook Subscriptions
  async getWebhookSubscriptions() {
    const response = await this.client.get('/webhook_subscriptions')
    return response.data
  }

  async createWebhookSubscription(topic: string, url: string) {
    const response = await this.client.post('/webhook_subscriptions', {
      webhook_subscription: { topic, url },
    })
    return response.data
  }

  async updateWebhookSubscription(id: string, topic: string, url: string) {
    const response = await this.client.patch(`/webhook_subscriptions/${id}`, {
      webhook_subscription: { topic, url },
    })
    return response.data
  }

  async deleteWebhookSubscription(id: string) {
    const response = await this.client.delete(`/webhook_subscriptions/${id}`)
    return response.data
  }
}

export function createEverBeeClient(accessToken: string, storeId: string) {
  return new EverBeeClient(accessToken, storeId)
}
