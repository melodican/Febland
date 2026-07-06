# Channel feed credentials — how to get each one

What each channel connector needs, and exactly where to click. Paste the values back and they go
into the git-ignored `engine/.env`. Order shown = easiest first.

---

## 1 · WooCommerce (trade) — ✅ done
- WooCommerce → **Settings → Advanced → REST API → Add key**
- Permissions: **Read**. Copy the **Consumer key** (`ck_…`) and **Consumer secret** (`cs_…`).
- `.env`: `WOO_SITE`, `WOO_KEY`, `WOO_SECRET`

## 2 · Shopify (retail) — ✅ done
- Settings → Apps and sales channels → **Develop apps** → create app → scope **`read_orders`** →
  **Install app** → **API credentials** → reveal the **Admin API access token** (`shpat_…`).
- `.env`: `SHOPIFY_SHOP` (the `…myshopify.com` domain), `SHOPIFY_TOKEN`

## 3 · Faire (wholesale)
Febland sells on Faire as a **brand**, so you need a **brand API access token**.
1. Log into your Faire **brand** account.
2. Go to **Settings** (or the brand portal) → look for **Faire API / Integrations / Developer**.
3. Generate an **access token** (the API uses the header `X-FAIRE-ACCESS-TOKEN`).
4. If you don't see an API/token option, Faire gates API access per account — **message Faire brand
   support** and ask them to enable API access for your account, then generate the token.
- Send me: the access token.  → `.env`: `FAIRE_ACCESS_TOKEN`

## 4 · eBay
eBay's Sell API needs an **OAuth user token** for your selling account.
1. Create/sign in at **developer.ebay.com** → **My Account → Application keys** → get your
   **Production** keyset (App ID / Cert ID).
2. Use eBay's **user token tool**: developer.ebay.com → **User Tokens** (or "Get a User Token"),
   sign in with the eBay account that sells, consent, and it returns a **user access token**.
3. That token is what we use (`Authorization: Bearer …`). Note: user tokens expire in ~2 hours; for
   always-on we'll wire the refresh token later — a fresh token is fine to test with.
- Send me: the user access token.  → `.env`: `EBAY_OAUTH_TOKEN`

## 5 · Amazon (the involved one — do last)
Amazon SP-API needs LWA (Login with Amazon) app credentials + a refresh token.
1. **Seller Central** (Professional account) → **Apps & Services → Develop Apps**. If prompted,
   register as a developer (this can take a short while to approve).
2. **Add new app client** → gives you an **LWA client ID** (`amzn1.application-oa2-client…`) and
   **client secret**. Request the **Orders** role (read-only order data).
3. **Authorize it for your own account** ("self-authorization" / "Authorize" on your app) → this
   returns a **refresh token** (`Atzr|…`).
4. Marketplace ID for the UK is **`A1F83G8C2ARO7P`** (already the default).
- Send me: client ID, client secret, refresh token.
  → `.env`: `AMAZON_CLIENT_ID`, `AMAZON_CLIENT_SECRET`, `AMAZON_REFRESH_TOKEN`

---

### How to send
Paste the values in chat like the others; I drop them into `engine/.env` (git-ignored, never
committed) and the channel goes live. Each connector is independent — a channel starts working the
moment its credentials exist, and is skipped until then.

### Security
Anything shared in chat can be rotated afterwards for peace of mind — none of it is committed, and
the connectors are read-only, so a token can only *read* orders, never change anything.
