# Admin Dashboard (Netlify CMS / Decap CMS)

This repository is configured with a visual admin panel at `/admin`.

## Hosting (Netlify recommended)
1. Create a free Netlify account → "Add new site" → "Import from Git" → choose this GitHub repo.
2. Build command: *(empty)*, Publish directory: `.` (root).
3. After deploy, enable **Identity** (Site Settings → Identity → Enable).
4. Enable **Git Gateway** (Identity → Services → Enable Git Gateway).
5. (Optional) Identity → External Providers → enable **GitHub** so users can "Log in with GitHub".
6. Visit `https://<your-netlify-site>.netlify.app/admin` and log in.

## Editing Products
- Go to **/admin** → **Products**
- Click **New** (or edit an existing item)
- Fill in Name, Price, Category, Image, Description, Featured
- Click **Save** (and **Publish** if editorial workflow is enabled)

The product list is stored in `data/products.json` under the key `products`.
