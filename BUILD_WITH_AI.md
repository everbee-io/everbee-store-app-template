# Building Features with AI

This template is optimized for AI-powered development. Use Cursor, Claude Code, or any AI coding assistant to build features quickly.

## How It Works

The `.cursorrules` file contains comprehensive instructions that tell AI assistants about:
- Your project architecture (React frontend + Node backend)
- EverBee Store API integration patterns
- Code conventions and best practices
- File organization

## Quick Start Examples

### Example 1: Add Product Analytics

**Prompt:**
```
Add a chart showing total revenue by product for the last 30 days
```

**What AI will do:**
1. Create backend route `/api/analytics/revenue-by-product`
2. Fetch orders from EverBee API and aggregate by product
3. Create a `RevenueChart` component using recharts
4. Add it to the analytics page

### Example 2: Bulk Product Upload

**Prompt:**
```
Add a feature to bulk upload products via CSV file
```

**What AI will do:**
1. Add file upload endpoint in backend
2. Create CSV parser service
3. Batch create products via EverBee API
4. Create upload UI with progress indicator
5. Add error handling and validation

### Example 3: Order Notifications

**Prompt:**
```
Send email notifications when orders are placed
```

**What AI will do:**
1. Set up webhook subscription for `order.created`
2. Create email service (using SendGrid/Resend)
3. Add webhook handler endpoint
4. Create email templates
5. Add notification settings page

## Best Practices

### 1. Be Specific About Requirements

❌ Bad: "Add a products page"
✅ Good: "Add a products page with search, filters by status (published/draft), and pagination"

### 2. Reference Existing Patterns

❌ Bad: "Add orders management"
✅ Good: "Add orders management following the same pattern as products - list view, detail view, bulk actions"

### 3. Specify Integration Points

❌ Bad: "Show sales data"
✅ Good: "Fetch orders from EverBee API, calculate total sales by day, and display as a line chart"

### 4. Break Down Complex Features

Instead of:
```
"Build a complete inventory management system"
```

Do:
```
1. "Add a page to view low stock products"
2. "Add ability to bulk update product quantities"
3. "Add email alerts for low stock items"
```

## Common Prompts

### Products

```
- "Add a bulk image uploader for products"
- "Create a product duplication feature"
- "Add a quick edit mode for product prices"
- "Show product performance metrics (views, sales, conversion rate)"
```

### Orders

```
- "Add order search by customer email or order number"
- "Create a refund processing workflow"
- "Add bulk order status updates"
- "Generate packing slips for orders"
```

### Analytics

```
- "Show top selling products this month"
- "Create a customer lifetime value report"
- "Add sales forecast based on historical data"
- "Show conversion funnel from views to purchases"
```

### Automation

```
- "Auto-publish products after quality check"
- "Send abandoned cart emails"
- "Automatically fulfill orders when tracking is added"
- "Sync inventory with EverBee every hour"
```

## Advanced: Multi-Step Features

For complex features, guide AI through steps:

**Building an AI Product Description Generator:**

```
Step 1: "Add a backend endpoint that calls OpenAI API to generate product descriptions"

Step 2: "Create a UI component with a 'Generate Description' button on the product edit page"

Step 3: "Allow users to regenerate or edit the AI-generated description before saving"

Step 4: "Add settings page to customize the AI description style (casual, professional, etc.)"
```

## Debugging with AI

If something breaks, describe the error:

```
"I'm getting a 401 error when fetching products. The error message says 'Invalid authentication token'"
```

AI will:
1. Check token handling in API client
2. Verify headers are set correctly
3. Check token refresh logic
4. Suggest fixes

## Working with EverBee API

AI knows about all EverBee API endpoints. Just describe what you need:

```
"Fetch all collections and show products in each collection"
```

AI will:
1. Use `everbeeClient.getCollections()`
2. For each collection, fetch products
3. Create UI to display collections and products
4. Handle loading and error states

## TypeScript Support

AI will maintain type safety:

```
"Add a Customer type that matches the EverBee customer API response"
```

AI creates:
```typescript
interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  addresses: Address[]
}
```

## Testing

Ask AI to add tests:

```
"Add tests for the product service"
```

AI creates:
```typescript
describe('ProductService', () => {
  it('should fetch products from EverBee API', async () => {
    // Test implementation
  })
})
```

## When You're Done Building

Once your app is ready, deploy and submit it:

### Deploy

```bash
npm run deploy
```

This handles everything:
- Deploys frontend to Vercel
- Deploys backend to Railway
- Configures all environment variables
- Prints your live URLs

### Submit to EverBee

After deploying, the script prints submission instructions. You can also do it manually:

1. Go to https://store.everbee.io/admin/apps
2. Click **Create New App**
3. Enter your Vercel URL (frontend) and Railway URL (backend callback)
4. Submit for review

## Tips for Success

1. **Start Small**: Build one feature at a time
2. **Test Often**: Run `npm run dev` after each change
3. **Review Code**: AI is smart but check the generated code
4. **Iterate**: Refine features based on testing
5. **Ask Questions**: "Why did you use this approach?" helps you learn

## Common Patterns AI Follows

### Adding a New Page

1. Create page component in `frontend/src/pages/`
2. Add route in `App.tsx`
3. Create backend API endpoint if needed
4. Add navigation link in layout

### Integrating EverBee API

1. Add method to `everbee-client.ts`
2. Create service function in backend
3. Add controller and route
4. Update frontend API client
5. Use in React component

### Adding Database Model

1. Create model file in `backend/src/models/`
2. Export from `backend/src/models/index.ts`
3. Update seed data if needed
4. Import and use in backend services

## Getting Help

If AI gets stuck or makes mistakes:

1. **Be more specific**: Add more context to your prompt
2. **Show error messages**: Paste the exact error
3. **Reference docs**: "Following the EverBee API docs for products..."
4. **Start over**: Sometimes a fresh prompt works better

## Resources

- EverBee API Documentation (see PDF)
- Frontend patterns in `frontend/src/`
- Backend patterns in `backend/src/`
- Example code in existing pages/routes

---

**Remember**: AI is your pair programmer. It handles the boilerplate so you can focus on building awesome features! 🚀
