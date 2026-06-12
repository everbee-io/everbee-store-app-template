/**
 * OpenAPI 3.1 specification for THIS app's HTTP API.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  STANDING BUILD RULE — this file is the API contract, not documentation.  │
 * │                                                                           │
 * │  Every EverBee app ships THREE layers that move together:                 │
 * │    1. the product (the routes in src/routes/*)                            │
 * │    2. THIS OpenAPI spec  ← the machine-readable contract                  │
 * │    3. the MCP server (../mcp) ← the natural-language head on top          │
 * │                                                                           │
 * │  When you add / change / remove an endpoint in src/routes/*, you MUST     │
 * │  update this spec AND ../mcp in the SAME change. Product → API → MCP,     │
 * │  every time. Treat it like a test: the PR is not done until all three     │
 * │  agree. The MCP reads this spec at build time, so drift here silently     │
 * │  lies to every LLM that drives the app.                                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Served publicly at  GET /openapi.json   (human docs at GET /docs).
 * Keep operationId stable — the MCP derives tool names from it.
 */

const APP_NAME = process.env.APP_NAME || 'EverBee Store App'
const APP_DESCRIPTION =
  process.env.APP_DESCRIPTION || 'An app built on the EverBee Store platform.'
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001'

const bearerAuth = [{ bearerAuth: [] as string[] }]

const Paginated = (itemsRef: string) => ({
  type: 'object',
  properties: {
    data: { type: 'array', items: { $ref: itemsRef } },
    page: { type: 'integer', example: 1 },
    per_page: { type: 'integer', example: 20 },
    total: { type: 'integer', example: 0 },
  },
})

const pageParams = [
  {
    name: 'page',
    in: 'query',
    schema: { type: 'integer', default: 1 },
    description: 'Page number (1-indexed).',
  },
  {
    name: 'per_page',
    in: 'query',
    schema: { type: 'integer', default: 20 },
    description: 'Items per page.',
  },
]

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    version: process.env.APP_VERSION || '1.0.0',
    contact: { name: 'EverBee', url: 'https://everbee.io' },
  },
  servers: [{ url: PUBLIC_URL, description: 'Primary' }],
  tags: [
    { name: 'auth', description: 'Authentication & session' },
    { name: 'products', description: 'Storefront products' },
    { name: 'orders', description: 'Customer orders & fulfillment' },
    { name: 'collections', description: 'Product collections' },
    { name: 'customers', description: 'Store customers' },
    { name: 'analytics', description: 'Dashboard metrics' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'App access token from /api/auth/login or the OAuth callback.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          status: { type: 'string', enum: ['active', 'draft', 'archived'] },
          price: { type: 'number' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          totalPrice: { type: 'number' },
          orderDate: { type: 'string', format: 'date-time' },
        },
      },
      Collection: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
        },
      },
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          stats: {
            type: 'object',
            properties: {
              productsCount: { type: 'integer' },
              ordersCount: { type: 'integer' },
              totalRevenue: { type: 'number' },
            },
          },
          recentOrders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
          salesByDay: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['analytics'],
        operationId: 'healthCheck',
        summary: 'Liveness probe',
        security: [],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['auth'],
        operationId: 'login',
        summary: 'Email/password login, returns access + refresh tokens',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Tokens + user' },
          '401': {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['auth'],
        operationId: 'getCurrentUser',
        summary: 'Current authenticated user + store',
        security: bearerAuth,
        responses: { '200': { description: 'User' }, '401': { description: 'Unauthorized' } },
      },
    },
    '/api/products': {
      get: {
        tags: ['products'],
        operationId: 'listProducts',
        summary: 'List products',
        security: bearerAuth,
        parameters: pageParams,
        responses: {
          '200': {
            description: 'Products',
            content: {
              'application/json': { schema: Paginated('#/components/schemas/Product') },
            },
          },
        },
      },
      post: {
        tags: ['products'],
        operationId: 'createProduct',
        summary: 'Create a product',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { product: { $ref: '#/components/schemas/Product' } },
              },
            },
          },
        },
        responses: { '200': { description: 'Created product' } },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['products'],
        operationId: 'getProduct',
        summary: 'Get a single product',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product' }, '404': { description: 'Not found' } },
      },
      patch: {
        tags: ['products'],
        operationId: 'updateProduct',
        summary: 'Update a product',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated product' } },
      },
    },
    '/api/products/bulk/status': {
      patch: {
        tags: ['products'],
        operationId: 'bulkUpdateProductStatus',
        summary: 'Bulk update product status',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ids', 'status'],
                properties: {
                  ids: { type: 'array', items: { type: 'string' } },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Result' }, '400': { description: 'Bad request' } },
      },
    },
    '/api/orders': {
      get: {
        tags: ['orders'],
        operationId: 'listOrders',
        summary: 'List orders',
        security: bearerAuth,
        parameters: pageParams,
        responses: {
          '200': {
            description: 'Orders',
            content: { 'application/json': { schema: Paginated('#/components/schemas/Order') } },
          },
        },
      },
    },
    '/api/orders/{id}/tracking': {
      post: {
        tags: ['orders'],
        operationId: 'updateOrderTracking',
        summary: 'Attach tracking info to an order',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Result' } },
      },
    },
    '/api/orders/bulk/status': {
      patch: {
        tags: ['orders'],
        operationId: 'bulkUpdateOrderStatus',
        summary: 'Bulk update order status',
        security: bearerAuth,
        responses: { '200': { description: 'Result' }, '400': { description: 'Bad request' } },
      },
    },
    '/api/collections': {
      get: {
        tags: ['collections'],
        operationId: 'listCollections',
        summary: 'List collections',
        security: bearerAuth,
        parameters: pageParams,
        responses: { '200': { description: 'Collections' } },
      },
      post: {
        tags: ['collections'],
        operationId: 'createCollection',
        summary: 'Create a collection',
        security: bearerAuth,
        responses: { '200': { description: 'Created collection' } },
      },
    },
    '/api/collections/{id}': {
      get: {
        tags: ['collections'],
        operationId: 'getCollection',
        summary: 'Get a collection',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Collection' } },
      },
      patch: {
        tags: ['collections'],
        operationId: 'updateCollection',
        summary: 'Update a collection',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated collection' } },
      },
    },
    '/api/customers/{id}': {
      get: {
        tags: ['customers'],
        operationId: 'getCustomer',
        summary: 'Get a customer',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Customer' } },
      },
      put: {
        tags: ['customers'],
        operationId: 'updateCustomer',
        summary: 'Update a customer',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated customer' } },
      },
    },
    '/api/customers': {
      post: {
        tags: ['customers'],
        operationId: 'createCustomer',
        summary: 'Create a customer',
        security: bearerAuth,
        responses: { '200': { description: 'Created customer' } },
      },
    },
    '/api/analytics/dashboard': {
      get: {
        tags: ['analytics'],
        operationId: 'getDashboard',
        summary: 'Dashboard stats (counts, revenue, recent orders, sales by day)',
        security: bearerAuth,
        responses: {
          '200': {
            description: 'Dashboard',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/DashboardStats' } },
            },
          },
        },
      },
    },
    '/api/analytics/revenue-by-product': {
      get: {
        tags: ['analytics'],
        operationId: 'getRevenueByProduct',
        summary: 'Revenue grouped by product',
        security: bearerAuth,
        responses: { '200': { description: 'Revenue rows' } },
      },
    },
  },
} as const

export type OpenApiSpec = typeof openApiSpec
