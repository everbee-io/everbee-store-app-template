import axios, { AxiosInstance } from 'axios'

import { getBackendBaseUrl } from './backend-url'

const API_URL = getBackendBaseUrl()

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) throw new Error('No refresh token')

            const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
              refreshToken,
            })

            localStorage.setItem('accessToken', data.accessToken)
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

            return this.client(originalRequest)
          } catch (refreshError) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/auth/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Auth
  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password })
    return data
  }

  async signup(email: string, password: string, name?: string) {
    const { data } = await this.client.post('/auth/signup', { email, password, name })
    return data
  }

  async getCurrentUser() {
    const { data } = await this.client.get('/auth/me')
    return data
  }

  // Products
  async getProducts(params?: { page?: number; per_page?: number; filter_params?: any }) {
    const { data } = await this.client.get('/products', { params })
    return data
  }

  async getProduct(id: string) {
    const { data } = await this.client.get(`/products/${id}`)
    return data
  }

  async createProduct(product: any) {
    const { data } = await this.client.post('/products', { product })
    return data
  }

  async updateProduct(id: string, product: any) {
    const { data } = await this.client.patch(`/products/${id}`, { product })
    return data
  }

  async bulkUpdateProductStatus(ids: string[], status: string) {
    const { data } = await this.client.patch('/products/bulk/status', { ids, status })
    return data
  }

  // Orders
  async getOrders(params?: { page?: number; per_page?: number; filter_params?: any }) {
    const { data } = await this.client.get('/orders', { params })
    return data
  }

  async updateOrderTracking(orderId: string, tracking: any) {
    const { data } = await this.client.post(`/orders/${orderId}/tracking`, { tracking })
    return data
  }

  async bulkUpdateOrderStatus(ids: string[], status: string) {
    const { data } = await this.client.patch('/orders/bulk/status', { ids, status })
    return data
  }

  // Collections
  async getCollections(params?: { page?: number; per_page?: number }) {
    const { data } = await this.client.get('/collections', { params })
    return data
  }

  async getCollection(id: string) {
    const { data } = await this.client.get(`/collections/${id}`)
    return data
  }

  async createCollection(collection: any) {
    const { data } = await this.client.post('/collections', { collection })
    return data
  }

  async updateCollection(id: string, collection: any) {
    const { data } = await this.client.patch(`/collections/${id}`, { collection })
    return data
  }

  // Customers
  async getCustomer(id: string) {
    const { data } = await this.client.get(`/customers/${id}`)
    return data
  }

  async createCustomer(customer: any) {
    const { data } = await this.client.post('/customers', { customer })
    return data
  }

  async updateCustomer(id: string, customer: any) {
    const { data } = await this.client.put(`/customers/${id}`, { customer })
    return data
  }

  // Analytics
  async getDashboardStats() {
    const { data } = await this.client.get('/analytics/dashboard')
    return data
  }

  async getRevenueByProduct() {
    const { data } = await this.client.get('/analytics/revenue-by-product')
    return data
  }
}

export const api = new ApiClient()
