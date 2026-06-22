# EverBee App Store — registration & submission (reusable runbook)

The EverBee Developer portal (**dev.everbee.io**) asks for the **same things every
time**. This is the canonical checklist + exact values so any new app gets
registered + submitted in minutes, not an afternoon.

> Generate every URL below for your app in one shot:
> ```bash
> ./scripts/registration-values.sh https://<api-domain> https://<web-domain>
> ```
> (No args → prints the localhost dev values.)

---

## 0. Before you open the portal — make the app "submission-ready"

The template ships these so the portal never blocks you:
- ✅ **OAuth callback** — `GET /api/auth/callback`
- ✅ **Install** — `GET /api/auth/install`
- ✅ **Uninstall** — `GET|POST /api/auth/uninstall` (the portal *requires* a valid
  uninstall URL — it errors if blank; the template ships a real one that returns 200)
- ✅ **Storefront snippet** — `GET /track.js` (only if your app touches the buyer
  storefront; the template ships a no-op stub you customize)
- ✅ **Square PNG logo** — `frontend/public/logo-512.png`

If you skip the template, you MUST hand-build the uninstall endpoint or the portal
won't let you save Technical Details.

---

## 1. The portal flow (left nav, in order)

### App Details
Name, category, tagline. (Name = the store-facing app name.)

### Technical Details
| Field | Value | Notes |
|---|---|---|
| **Website URL** | `<web>` (app frontend root) | NOT the callback — this is the app's home |
| **Redirection URLs** | `<api>/api/auth/callback` | the OAuth redirect; add one |
| **App Uninstallation URL** | `<api>/api/auth/uninstall` | **required** — must return 200 |
| **Does your app interact with the buyer storefront?** | Yes / No | Yes if you set cookies, apply discounts, or run JS on the storefront |
| → **JavaScript URL** (if Yes) | `<api>/track.js` | **EverBee auto-injects this into installed storefronts** — no theme editing, no core team |
| → **CSS URL** (if Yes) | *blank* unless you need storefront CSS | optional |
| → **Page** (if Yes) | **All pages** | needs to fire on landing (set ref cookie) AND checkout (apply code) |

### Scope Access (Read / Write per scope)
Check **only what the app calls** (least privilege → smoother review). Common scopes:
`collections, products, orders, customers, discounts, shipping, webhooks, users,
attachments, store, notifications`.

Typical affiliate/marketing app:
- **products** R · **orders** R · **discounts** R+W · **webhooks** R+W
- optional: **customers** R · **store** R
- The two writes that matter: **discounts (mint codes)** + **webhooks (self-subscribe)**.

### Advanced Configurations
"Order Management APIs / Enable Order APIs" — **Skip** unless EverBee must call you
to *gate* order actions (fulfillment-type apps). Most apps: leave OFF.

### App Credentials  ← grab these
Copy **Client ID** + **Client Secret**. Store in Keychain (never on disk):
```bash
security add-generic-password -U -s "cody-os/<app>-client-id"     -a "$USER@cody-os" -w "$(pbpaste)"   # after copying Client ID
security add-generic-password -U -s "cody-os/<app>-client-secret" -a "$USER@cody-os" -w "$(pbpaste)"   # after copying Secret
```
`scripts/dev.sh` injects them as `EVERBEE_CLIENT_ID` / `EVERBEE_CLIENT_SECRET` at launch.
The `app_id` is in the portal URL (`.../edit-app/<app_id>`).

### App Demo
For the reviewer. Production URL = deployed app; Demo Video optional; Username/Password
**blank if the app auto-logs-in a demo** (most do).

### Listing Details
| Field | Value |
|---|---|
| Developer Name | `EverBee` |
| Summary | 10–130 chars |
| Description | 50–5000 chars |
| Logo | square PNG (`frontend/public/logo-512.png`) |
| Support Email | `dev@everbee.io` |
| Privacy Policy URL | `https://www.everbee.io/privacy-policy` (EverBee's corporate policy) |

### Review & Submit
Submit for review (Pawan/Priyam approve). For internal dogfooding you can **"Test
Your App"** without submitting.

---

## 2. localhost vs deployed

- **localhost values work for YOUR OWN testing** (you're on the machine the
  redirects hit). Good enough to register + install on your own store + dogfood.
- **Real buyers + store review need public `https://`** — the storefront
  `track.js` especially (buyers' browsers can't reach localhost). Deploy first
  (`./scripts/deploy-fly.sh`), then re-paste the public URLs.

---

## 3. After install — what's self-serve (NO core team)

The EverBee **Store API** lets the app wire its own integration:
- **Webhooks** — `POST /webhook_subscriptions { topic, url }` → the app subscribes
  `order.created` / `order.refunded` itself on install.
- **Discount codes** — `POST /discounts` → mint real store codes (e.g. affiliate
  coupons) that ride on the order.
- **Orders/products** — `GET /orders`, `GET /products` for data.

You do **not** need the core team to fire webhooks or inject the storefront script
(the portal's JavaScript URL field auto-injects it). The only platform-side asks
are genuinely-core extension points most apps don't need.

---

## 4. The gotchas that cost time (don't repeat)

1. **Uninstall URL is required** and must return 200 — build it before you start.
2. **Website URL ≠ callback URL** — easy to paste the callback by mistake.
3. **Storefront "JavaScript URL" auto-injects** — you don't paste script tags into
   themes; EverBee does it. (Set storefront = Yes to reveal the field.)
4. **Page = All pages** for tracking (landing + checkout).
5. **Least-privilege scopes** review faster.
6. **localhost is fine to register/test**, public HTTPS required before real buyers.
7. Store creds in **Keychain `cody-os/<app>-*`**, inject via `dev.sh` — never commit.
8. Privacy Policy → reuse `https://www.everbee.io/privacy-policy`. Support → `dev@everbee.io`.

---

## Contacts
Priyam + Pawan — Store API / app registration / approvals.
