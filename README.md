# 3D Model Store

A complete MVP e-commerce website for selling **physical 3D-printed products**
— figurines, home decor, prototypes, jewellery and accessories. Products are
printed to order, shipped across India, and paid for online (Razorpay) or by
Cash on Delivery.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**,
**Supabase** (Postgres + Auth) and **Razorpay**, with a live 3D product
preview powered by Google's `<model-viewer>`.

> Demo mode: the site works fully without any credentials — with no Supabase
> keys it shows 10 sample products and stores orders in the browser; with no
> Razorpay keys the prepaid option is disabled and COD keeps working. A green
> "Demo mode" banner is shown at the top until Supabase is connected.

## Features

- **Storefront** — home page with hero, categories and featured products;
  shop page with search, category and price filters; product pages with
  image gallery, a live rotatable 3D preview, material, weight, dimensions,
  fulfilment type ("Made to order — dispatches in 2–3 days" or "In stock"),
  sale pricing and a pincode delivery check.
- **Cart & checkout** — cart in React context + localStorage; checkout with
  delivery address form (Indian pincode/phone validation); flat ₹79 shipping,
  free above ₹999; Pay now via Razorpay Checkout.js or Cash on Delivery.
- **Orders** — order success page; My Orders page with a status timeline,
  tracking link and 7-day return requests.
- **Auth** — Supabase Auth email/password + Google sign-in; login, signup,
  forgot/reset password; a `profiles` table with `customer` / `admin` roles.
- **Admin panel** (`/admin`, admin role only) — dashboard (revenue, orders,
  top products, pending returns); full products CRUD; orders list with status
  updates (confirmed → printing → packed → shipped → delivered) plus courier
  name and tracking number/URL fields; return requests (approve / reject).
- **Legal & info** — About, Contact, Privacy Policy, Terms, Refund Policy,
  Licence terms, FAQ.
- **API routes** — `POST /api/checkout/create-order` (server-side price
  calculation from the catalogue, so clients can never tamper with prices;
  creates Razorpay orders for prepaid payments),
  `POST /api/webhooks/razorpay` (verifies the webhook signature with HMAC
  SHA-256 and only then marks an order paid),
  `GET /api/config` (which services are configured — no secrets).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. No env vars are needed for demo mode.

To run with your own backend:

```bash
cp .env.example .env.local
# fill in the values (see below), then
npm run dev
```

## Supabase setup

1. Create a free project at https://supabase.com/dashboard.
2. In the dashboard, open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql` and click **Run**. This creates all tables
   (`profiles`, `categories`, `products`, `orders`, `order_items`,
   `addresses`, `shipments`, `return_requests`, `reviews`, `coupons`), enables
   Row Level Security with sensible policies, adds an auto-create-profile
   trigger, and seeds the 5 categories + 10 sample products.
3. Go to **Project Settings → API** and copy the Project URL, the `anon`
   public key and the `service_role` key into `.env.local` as
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY`.
4. (Optional) In **Authentication → Providers**, enable **Google** sign-in
   and add your OAuth credentials.
5. Make your account an admin — in the SQL Editor run:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

## Razorpay setup (test mode)

1. Create an account at https://dashboard.razorpay.com and stay in
   **Test Mode** while developing.
2. Copy the **Key ID** and **Key Secret** from **Settings → API Keys** into
   `.env.local` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Set up the webhook: **Settings → Webhooks → Add New Webhook**, URL
   `https://your-domain.com/api/webhooks/razorpay`, subscribe to the
   `payment.captured` event, and copy the webhook secret into
   `RAZORPAY_WEBHOOK_SECRET`. (Locally, use the Razorpay CLI or ngrok to
   forward webhooks to `http://localhost:3000/api/webhooks/razorpay`.)
4. Test with Razorpay's test cards / UPI — no real money moves in test mode.
   Switch to live keys only at launch.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In https://vercel.com, click **Add New → Project** and import the repo.
3. Add the same environment variables from `.env.local` in the Vercel
   project settings (all of them, including `NEXT_PUBLIC_SITE_URL` set to
   your Vercel domain).
4. Deploy. After the first deploy, point the Razorpay webhook at
   `https://your-domain.vercel.app/api/webhooks/razorpay`.

## Project structure

```
app/                  Next.js App Router pages
  page.tsx            Home page
  shop/               Shop (search + filters)
  product/[slug]/     Product detail + 3D preview
  cart/ checkout/     Cart + checkout
  order-success/      Order confirmation
  orders/             My Orders (status timeline, returns)
  auth/               Login, signup, forgot/reset password, OAuth callback
  admin/              Admin dashboard, products, orders, returns
  api/                create-order, Razorpay webhook, config
components/           Header, Footer, ProductCard, ModelViewer, BuyBox, …
lib/                  Supabase clients, cart context, auth context,
                      demo data, products/shipping/format helpers
supabase/schema.sql   Full database schema + RLS + seed data
```

## Shipping & fulfilment (current model)

- Flat ₹79 shipping, free above ₹999 (see `lib/shipping.ts`).
- Orders flow: confirmed → printing → packed → shipped → delivered.
- Shipments are booked **manually in Shiprocket** at launch; the admin pastes
  the courier name and tracking details into the order in the admin panel, and
  the customer sees the tracking link on their My Orders page.

## Notes / known limitations

- Product images and GLB previews are placeholders: demo products use Unsplash
  photos and the model-viewer sample Astronaut GLB. Replace them with real
  photos and model files before launch.
- The contact form shows a confirmation but does not send email yet — connect
  an email service (e.g. Resend) in a later phase.
- Reviews and coupons tables exist in the schema; the UI for them is Phase 2.
- No real secrets are in this repo. `.env.local` is gitignored — never commit it.
