# START HERE — Building Apps for the OpoShop App Store

**Who this is for:** Brandon — and the Claude Code (or Cursor) instance Brandon hands this repo to.

**The goal:** Build apps on top of the EverBee/OpoShop Store platform and publish them to the OpoShop app store, where any OpoShop merchant can install them. This repo is the starter template. Everything you need to go from zero to a live, published app is in here.

If you're an AI agent reading this: read this whole file first, then read `CLAUDE.md`, `STANDARDS.md`, and `.cursorrules` in this repo. Those are your standing rules. This file orients you; those files bind you.

---

## The big picture

You don't write boilerplate. The template already handles the hard parts — EverBee OAuth login, the database, the API layer, the deploy, the app-store registration. Your job is to **describe the app you want, let AI build the feature on top of the template, then deploy and submit it.**

The loop, end to end:

```
1. Clone the template        →  one repo per app
2. Set up accounts + creds   →  MongoDB, EverBee dev portal, Fly.io
3. npm run setup             →  wizard wires your creds, seeds demo data
4. Build with AI             →  describe features, Claude Code writes them on the template
5. Register the app          →  dev.everbee.io (the runbook does this for you)
6. Deploy                    →  one command to Fly.io
7. Submit to the app store   →  paste the generated values, hit submit
```

Each app is its own clone of this template. Don't try to build many apps in one repo.

---

## What you need before you start (one-time setup)

Set these up once. They're free or near-free at this stage.

| # | What | Where | Why |
|---|------|-------|-----|
| 1 | **Node.js 18+** | https://nodejs.org | Runs the app locally |
| 2 | **Git** | https://git-scm.com | Clone the template, push your app |
| 3 | **Claude Code** | `npm install -g @anthropic-ai/claude-code` then run `claude` | This is how you build. AI writes the features. |
| 4 | **GitHub access** | Ask Cody to add you to the `everbee-io` org | The template lives here; you push your apps here |
| 5 | **MongoDB Atlas** | https://www.mongodb.com/atlas (free M0 cluster) | The app's database. Create a DB user + allow network access from anywhere (0.0.0.0/0), grab the `mongodb+srv://...` connection string |
| 6 | **EverBee Developer account** | https://dev.everbee.io | Where you register an app and get its Client ID + Secret (the OAuth keys that let merchants log in) |
| 7 | **Fly.io** | https://fly.io + install `flyctl` (https://fly.io/docs/flyctl/install) | Where the app gets deployed/hosted |
| 8 | **PostHog** *(optional)* | https://posthog.com (free) | Product analytics. Leave blank locally; wire it before you care about usage data |

You'll also want **a real OpoShop store to test against** — ideally one of our own stores — so you can install your app on it and see it work for real before submitting.

---

## Getting the template

```bash
git clone https://github.com/everbee-io/everbee-store-app-template.git my-first-app
cd my-first-app
```

> Rename `my-first-app` to whatever the app is. **One clone = one app.** When you start the next app, clone the template again into a new folder.

Then disconnect it from the template's git history and start fresh for your app:

```bash
rm -rf .git && git init
```

(Later, create a new repo under `everbee-io` and push to it.)

---

## Building an app — the actual workflow

### Step 1 — Run the setup wizard
```bash
npm run setup
```
It asks for your app name, your MongoDB connection string, and your EverBee Client ID + Secret (from dev.everbee.io). It auto-generates the rest, writes your `.env` files, installs everything, and seeds demo data. (See `INSTALL.md` if you want the manual version.)

### Step 2 — Run it locally
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Demo login: `demo@example.com` / `password`

You now have a working store app with login, a dashboard, products, orders, and analytics pages — before you've written a line of code.

### Step 3 — Build features with Claude Code
This is the part you do over and over. Open the repo in Claude Code and describe what you want, in plain English. Examples that work because the template is structured for them:

- "Add a page that shows my best-selling products this month as a bar chart."
- "Build a feature that lets the merchant bulk-edit product prices."
- "Create a discount that automatically mints a code for first-time buyers."

Claude Code reads `.cursorrules` and `CLAUDE.md` automatically and follows the patterns and standards. Read `BUILD_WITH_AI.md` for how to prompt well (be specific, point at existing pages, name the integration points).

### Step 4 — Register the app on the dev portal
The repo has a runbook so this is never a scavenger hunt. First generate every value the portal asks for:
```bash
./scripts/registration-values.sh https://<your-app>.fly.dev https://<your-app>.fly.dev
```
Then follow **`EVERBEE-SUBMISSION.md`** field by field. It tells you exactly what goes in each box (and the easy mistakes to avoid — e.g. the Website URL is *not* the callback URL, and the Uninstall URL is required and must return 200).

### Step 5 — Deploy
```bash
git add -A && git commit -m "first version" && git push   # GitHub first, always
bash scripts/deploy-fly.sh
```
It regenerates the release notes from git, creates the Fly app, prompts you for the secrets (Mongo URI, EverBee Client ID/Secret), deploys, and prints your live URLs.

### Step 6 — Submit to the app store
Back on dev.everbee.io, finish the listing and hit Submit. Once approved, any OpoShop merchant can install it.

### Step 7 — Test it for real
Install your app on a real OpoShop store and click through it as a merchant would before you consider it done. (Cody's rule: dogfood on a real store first.)

---

## The standards — every app must ship these (non-negotiable)

These are the definition of "done," like tests. They're not extra credit — the template gives you all of them for free, and your job is to **keep them in sync as you build.** Full detail in `STANDARDS.md`; the short version:

1. **OpenAPI spec** — every API route is documented in `backend/src/openapi.ts`. The one-line test: *if you added or changed an endpoint and didn't touch `openapi.ts`, you broke the rule.*
2. **MCP layer** — the app exposes itself at `/mcp` so it can be driven by AI in plain English. It auto-generates from the OpenAPI spec, so if you keep the spec current, this stays current for free.
3. **LLM-crawlable by default** — serves `/llms.txt`, an AI-friendly `robots.txt`, and a sitemap so LLMs can discover and use the app. Public is the default; a private/internal app must explicitly opt out (`APP_VISIBILITY=private`).
4. **Autonomous release notes** — generated from git history on every deploy and shown on a "What's New" page. Nobody hand-writes a changelog.
5. **"How It Works" admin page** — a diagram + plain-English explanation of how the app works, kept current. If you change how the app works, update this page in the same change.
6. **Fly-first, GitHub-first deploy** — always commit and push to GitHub *before* deploying. Never `fly deploy` straight from your machine without pushing first.
7. **Product analytics (PostHog)** — every meaningful feature tracks the action that matters.

The reason these are mandatory: every app should be discoverable and drivable by AI out of the box. That's the whole platform thesis. Don't disable them without a reason.

---

## Where everything lives (the repo map)

Read these when you need them. An AI agent should read the first three before building anything.

| File | What it's for |
|------|---------------|
| `CLAUDE.md` | Standing rules for the AI agent. Read first. |
| `STANDARDS.md` | The 7-point definition-of-done, in full. |
| `.cursorrules` | Coding patterns, architecture, conventions the agent follows. |
| `BUILD_WITH_AI.md` | How to prompt the AI to build features well. |
| `EVERBEE-SUBMISSION.md` | Field-by-field app-store registration runbook. |
| `PROJECT_STRUCTURE.md` | Full file tree + what each pre-built page does. |
| `INSTALL.md` | Manual setup, if the wizard isn't enough. |
| `mcp/README.md` | How the MCP layer works and how to connect to it. |

**Stack, for reference:** React + Vite + Tailwind (frontend), Node + Express + MongoDB/Mongoose (backend), TypeScript throughout, MCP server built in, deploys as a single Docker image to Fly.io.

**Handy commands:**
```bash
npm run setup        # one-time wizard
npm run dev          # run frontend + backend locally
npm run db:seed      # re-seed demo data
npm run build        # production build
bash scripts/deploy-fly.sh   # deploy to Fly
./scripts/registration-values.sh <api-url> <web-url>   # values for the dev portal
```

---

## Credentials — keep them safe

- **Never commit secrets.** The real `.env` is gitignored; only `.env.example` (the template, no secrets) is committed.
- Locally, your Client ID/Secret live in your `.env`.
- In production, they go in **Fly secrets** (the deploy script prompts you).
- If you want them out of plain-text `.env` even locally, store them in your OS keychain — that's a preference, not a requirement.

---

## When you get stuck

- **App/feature building:** ask your Claude Code. It has this whole repo as context.
- **EverBee Store API, OAuth, app registration, anything platform-side:** **Priyam** and **Pawan** are the EverBee engineering contacts. They handle Store API access, OAuth/Client ID issues, and app approval. Route platform questions to them (through Cody).
- **What to build / priorities:** Cody.

---

## For the AI agent reading this

You've been handed this repo to help Brandon build and publish apps on the OpoShop store. Operating instructions:

1. Read `CLAUDE.md`, `STANDARDS.md`, and `.cursorrules` now. They override your defaults.
2. The 7 standards above are the definition of done. When you add or change an endpoint, update `backend/src/openapi.ts` in the same change — the MCP layer depends on it. When you change how the app works, update the "How It Works" page.
3. Build features on the existing patterns; don't reinvent the auth, the API client, or the deploy.
4. GitHub push happens before any deploy. Never deploy uncommitted code.
5. Ask the human before anything irreversible or anything that spends money or submits the app for review.
6. The build loop is: feature → run locally → verify → commit/push → deploy → register/submit. Follow it in order.

Start by confirming the prerequisites in the table above are in place, then run `npm run setup`.
