# Complete Project Structure

This document shows the full structure of the EverBee Store App Template after running `npm run setup`.

```
everbee-store-app-template/
├── README.md                   # Main documentation
├── BUILD_WITH_AI.md            # AI development guide
├── .cursorrules                # AI assistant instructions
├── package.json                # Root package (workspaces)
├── scripts/
│   ├── setup.sh                # Interactive setup wizard
│   ├── dev.sh                  # Run both servers
│   └── deploy.sh               # Deploy to Vercel + Railway
│
├── backend/                    # Node.js API
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env                    # Created by setup script
│   │
│   ├── seed/
│   │   └── seed.ts             # Demo data seeder
│   │
│   └── src/
│       ├── index.ts            # Express app entry
│       │
│       ├── models/
│       │   ├── index.ts        # Model exports
│       │   ├── Store.ts        # Store model
│       │   ├── User.ts         # User model
│       │   ├── Product.ts      # Product model
│       │   ├── Order.ts        # Order model
│       │   └── AppSettings.ts  # AppSettings model
│       │
│       ├── lib/
│       │   ├── mongoose.ts     # MongoDB connection
│       │   ├── everbee-client.ts  # EverBee API wrapper
│       │   ├── jwt.ts          # JWT utilities
│       │   └── everbee-auth.ts # OAuth flow handler
│       │
│       ├── middleware/
│       │   ├── auth.ts         # JWT authentication
│       │   ├── error-handler.ts
│       │   └── validation.ts   # Request validation
│       │
│       ├── routes/
│       │   ├── auth.ts         # Auth routes (login, OAuth callback)
│       │   ├── products.ts     # Product routes
│       │   ├── orders.ts       # Order routes
│       │   ├── collections.ts  # Collection routes
│       │   ├── customers.ts    # Customer routes
│       │   └── analytics.ts    # Analytics routes
│       │
│       ├── controllers/
│       │   ├── auth.ts
│       │   ├── products.ts
│       │   ├── orders.ts
│       │   ├── collections.ts
│       │   ├── customers.ts
│       │   └── analytics.ts
│       │
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── products.service.ts
│       │   ├── orders.service.ts
│       │   ├── collections.service.ts
│       │   ├── customers.service.ts
│       │   └── analytics.service.ts
│       │
│       └── types/
│           ├── index.ts
│           ├── everbee.ts      # EverBee API types
│           └── express.d.ts    # Extended Express types
│
└── frontend/                   # React App
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    ├── .env                    # Created by setup script
    ├── index.html
    │
    ├── public/
    │   ├── logo.png
    │   └── favicon.ico
    │
    └── src/
        ├── main.tsx            # App entry point
        ├── App.tsx             # Routes and providers
        │
        ├── config/
        │   └── app.ts          # App configuration (name, theme)
        │
        ├── lib/
        │   ├── api-client.ts   # Backend API client
        │   ├── auth.ts         # Auth utilities
        │   └── utils.ts        # Helper functions
        │
        ├── hooks/
        │   ├── useAuth.ts      # Auth hook
        │   ├── useProducts.ts  # Products data hook
        │   ├── useOrders.ts    # Orders data hook
        │   └── useStore.ts     # Zustand store hook
        │
        ├── store/
        │   ├── index.ts        # Zustand store
        │   ├── auth.slice.ts   # Auth state
        │   └── ui.slice.ts     # UI state (sidebar, modals)
        │
        ├── types/
        │   ├── index.ts
        │   ├── product.ts
        │   ├── order.ts
        │   └── user.ts
        │
        ├── components/
        │   ├── Layout/
        │   │   ├── index.tsx
        │   │   ├── Sidebar.tsx
        │   │   ├── Header.tsx
        │   │   └── Footer.tsx
        │   │
        │   ├── ui/             # Reusable UI components
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Card.tsx
        │   │   ├── Table.tsx
        │   │   ├── Modal.tsx
        │   │   ├── Spinner.tsx
        │   │   └── EmptyState.tsx
        │   │
        │   ├── products/
        │   │   ├── ProductCard.tsx
        │   │   ├── ProductList.tsx
        │   │   ├── ProductForm.tsx
        │   │   └── ProductFilters.tsx
        │   │
        │   ├── orders/
        │   │   ├── OrderCard.tsx
        │   │   ├── OrderList.tsx
        │   │   └── OrderStatusBadge.tsx
        │   │
        │   └── charts/
        │       ├── SalesChart.tsx
        │       ├── RevenueChart.tsx
        │       └── ProductsChart.tsx
        │
        └── pages/
            ├── Welcome/
            │   └── index.tsx   # Landing page
            │
            ├── Auth/
            │   ├── Login.tsx
            │   ├── Signup.tsx
            │   └── Callback.tsx  # OAuth callback
            │
            ├── Dashboard/
            │   └── index.tsx   # Main dashboard
            │
            ├── Products/
            │   ├── index.tsx   # Product list
            │   ├── Detail.tsx  # Product detail
            │   ├── Create.tsx  # Create product
            │   └── Edit.tsx    # Edit product
            │
            ├── Orders/
            │   ├── index.tsx   # Order list
            │   └── Detail.tsx  # Order detail
            │
            ├── Collections/
            │   ├── index.tsx
            │   └── Detail.tsx
            │
            ├── Customers/
            │   ├── index.tsx
            │   └── Detail.tsx
            │
            ├── Analytics/
            │   └── index.tsx   # Analytics dashboard
            │
            └── Settings/
                └── index.tsx   # App settings
```

## Pre-built Pages

All these pages are **included and working** out of the box:

### 1. Welcome Page (`/`)
- Beautiful landing screen
- "Get Started" button → Signup
- Login link
- Status indicators (DB connected, API ready)

### 2. Authentication (`/auth/*`)
- **Login** (`/auth/login`) - Email/password login
- **Signup** (`/auth/signup`) - New user registration
- **OAuth Callback** (`/auth/callback`) - EverBee OAuth flow

### 3. Dashboard (`/dashboard`)
- Overview cards (products count, orders count, revenue)
- Recent orders table
- Sales chart (last 7 days)
- Quick actions

### 4. Products (`/products/*`)
- **List** (`/products`) - All products with search, filters, pagination
- **Create** (`/products/new`) - Add new product
- **Edit** (`/products/:id/edit`) - Edit existing product
- **Detail** (`/products/:id`) - View product details

### 5. Orders (`/orders/*`)
- **List** (`/orders`) - All orders with filters (status, date)
- **Detail** (`/orders/:id`) - View order details, add tracking

### 6. Collections (`/collections/*`)
- **List** (`/collections`) - All collections
- **Detail** (`/collections/:id`) - Collection products

### 7. Customers (`/customers/*`)
- **List** (`/customers`) - All customers
- **Detail** (`/customers/:id`) - Customer details and orders

### 8. Analytics (`/analytics`)
- Revenue over time chart
- Top products by sales
- Order status distribution
- Customer metrics

### 9. Settings (`/settings`)
- App configuration
- EverBee API connection status
- Webhook management
- User preferences

## Features Included

### Authentication ✅
- JWT-based auth
- EverBee OAuth integration
- Token refresh
- Protected routes

### Data Fetching ✅
- React Query for caching
- Auto-retry on failure
- Loading states
- Error handling

### Forms ✅
- React Hook Form
- Zod validation
- Error messages
- Success feedback

### UI Components ✅
- Tailwind CSS styling
- Responsive design
- Loading spinners
- Empty states
- Toast notifications

### API Integration ✅
- Complete EverBee SDK wrapper
- All endpoints implemented
- Type-safe API calls
- Error handling

### Database ✅
- MongoDB with Mongoose
- Seed data
- Type-safe queries via TypeScript interfaces

## Customization

### Change App Name
Edit `frontend/src/config/app.ts`:
```typescript
export const appConfig = {
  name: 'Your App Name',  // 👈 Here
  // ...
}
```

### Change Colors
Edit `frontend/src/config/app.ts`:
```typescript
theme: {
  primary: '#your-color',  // 👈 Here
}
```

Or edit `tailwind.config.js` for full theme control.

### Add Your Logo
Replace `frontend/public/logo.png` with your logo (recommended: 200x200px)

### Add a Database Model
1. Create a new model file in `backend/src/models/`
2. Export it from `backend/src/models/index.ts`
3. Update seed data if needed

## What Happens on `npm run setup`

1. Checks Node.js 18+ is installed
2. Prompts for your app name
3. Walks you through MongoDB Atlas setup and collects the connection string
4. Collects your EverBee Client ID and Secret
5. Auto-generates a JWT secret
6. Creates `backend/.env` and `frontend/.env`
7. Installs all dependencies
8. Seeds the database with demo data
9. Generates app config with your app name

Total time: ~5 minutes (including MongoDB Atlas setup)

## What Happens on `npm run deploy`

1. Checks Vercel and Railway CLIs are installed
2. Builds frontend and backend
3. Deploys backend to Railway with all env vars
4. Deploys frontend to Vercel pointing to Railway backend
5. Prints deployment URLs and EverBee submission instructions
