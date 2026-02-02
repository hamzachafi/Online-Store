# Hamza Chafi — Online Store (Static)

A lightweight, mobile‑first e‑commerce starter you can deploy on GitHub Pages, Netlify, or Vercel.

## ✨ Features
- Product grid with search, category filter, and sorting
- Cart drawer with quantity controls (localStorage)
- Currency formatting (default: MAD) with configurable tax & shipping
- Checkout via email (default), or plug a Stripe Payment Link / PayPal URL
- SEO tags, favicon, Open Graph image, Terms & Privacy pages

## 🚀 Quick start
1. Upload this folder to a static host (GitHub Pages, Netlify, Vercel)
2. Edit `assets/js/config.js`:
   - `CONTACT_EMAIL` → your orders inbox
   - `CURRENCY`, `CURRENCY_SYMBOL` (e.g., MAD / د.م)
   - `TAX_RATE`, `SHIPPING_FLAT`
   - Optional: set `PAYMENT.MODE` to `stripe_link` or `paypal` and paste your link
3. Edit `data/products.json` to add your products (image path, name, price, category)
4. Replace images in `assets/img/` with your own product photos

## 🧾 Products format
`data/products.json`
```json
[
  {"id":"sku-101","name":"Item","category":"tools","price":349.9,"image":"/assets/img/product-1.png","description":"…","featured":1}
]
```

## 🧮 Notes on payments
- **Email checkout (default):** Opens the user's email with an itemized order; you then confirm and collect payment offline.
- **Stripe Payment Link:** Create a single payment link in Stripe Dashboard and paste it in `config.js`. This is *not* a cart-aware checkout, but it's the fastest to accept card payments.
- **PayPal URL:** Similarly, you can paste a PayPal checkout link.
- For a real cart checkout with card processing, connect a backend or Stripe Checkout Session (serverless function).

## 📦 Deployment
- **GitHub Pages:** push to `main`, enable Pages → `main` / root.
- **Netlify:** drag‑and‑drop the folder to the Netlify dashboard.
- **Vercel:** import the repo → framework: `Other` → output: root.

## 🧰 Development
No build step required. Pure HTML/CSS/JS.

## 📜 License
You can use and modify this template freely.
