# Quick Install Guide

## Prerequisites

- **Node.js 18+** -- [Download](https://nodejs.org/)
- **Git** -- [Download](https://git-scm.com/)
- **MongoDB Atlas account** -- [Sign up free](https://www.mongodb.com/atlas)
- **EverBee Store account** -- [Developer dashboard](https://store.everbee.io/admin/apps)

## Before You Start

### Create a MongoDB Atlas Cluster (2 minutes)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up (free)
2. Create a free **M0** cluster
3. Create a database user (remember the username and password)
4. Go to **Network Access** and add `0.0.0.0/0` (allow all IPs)
5. Click **Connect** > **Drivers** > copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### Get EverBee Credentials

1. Go to [store.everbee.io/admin/apps](https://store.everbee.io/admin/apps)
2. Create a new app (or use existing credentials)
3. Copy the **Client ID** and **Client Secret**

## Installation (5 minutes)

### 1. Fork and clone

```bash
# Fork the repo on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/store-app-template.git my-everbee-app
cd my-everbee-app
```

### 2. Run setup

```bash
npm run setup
```

The interactive wizard will ask for:
- Your app name
- MongoDB Atlas connection string
- EverBee Client ID and Secret

It then automatically:
- Generates a JWT secret
- Creates all `.env` files
- Installs dependencies
- Seeds the database with demo data

### 3. Start the app

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 4. Login with demo account

```
Email: demo@example.com
Password: password
```

## That's it!

You now have a fully functional EverBee Store app with:
- Complete authentication
- EverBee API integration
- Database with demo data
- Pre-built dashboard

## Next Steps

### Build Features with AI

Open in Cursor and start building:

```
"Add a chart showing sales by product"
"Create a bulk product upload feature"
"Add email notifications for new orders"
```

See [BUILD_WITH_AI.md](./BUILD_WITH_AI.md) for a detailed guide.

### Deploy to Production

```bash
npm run deploy
```

Deploys frontend to Vercel and backend to Railway. The script handles everything including environment variable configuration.

### Submit to EverBee

After deploying, submit your app at https://store.everbee.io/admin/apps with your deployment URLs.

## Common Issues

### Port already in use

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database connection error

- Verify your MongoDB Atlas connection string in `backend/.env`
- Check that your Atlas cluster allows connections from `0.0.0.0/0` (Network Access)
- Make sure the database user password doesn't contain unescaped special characters

```bash
# Re-seed demo data
npm run db:seed
```

### Module not found

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

Start building your EverBee Store app!
