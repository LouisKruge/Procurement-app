# Procure · Operations Hub

A unified procurement workspace — parts ordering, supplier quotes, approvals, and
delivery tracking in one app. Three switchable design themes. Wired to a live
n8n + Airtable backend, with a local fallback so it works even if the backend is down.

## What's already live (no setup needed)
- **Backend / API:** n8n Cloud workflows (catalog, orders, intake, decision, auth)
- **Database:** Airtable ("Procurement System" base)
- The app talks to these over HTTPS. They run independently of where this front end is hosted.

## Run locally
```bash
npm install
npm run dev
```
Open the URL it prints (usually http://localhost:5173).

## Deploy to a live URL (Vercel)
1. Push this folder to a GitHub repository.
2. Go to vercel.com → "Add New… → Project" → import that repo.
3. Vercel auto-detects Vite. Leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. In ~1 minute you get a live URL like `https://procure-ops-hub.vercel.app`.
5. (Optional) Add a custom domain under the project's Domains tab.

That's it — the app is live, talking to your existing n8n + Airtable backend.

## Demo logins
- admin@demo.com / admin
- gm@demo.com / gm
- requester@demo.com / req
- finance@demo.com / fin

(These work via the built-in local user store. For real shared accounts, create a
**Users** table in Airtable and the Auth Service workflow handles login server-side.)

## Configuration
The backend base URL lives at the top of `src/App.jsx`:
```js
const N8N = "https://stefan90.app.n8n.cloud/webhook";
```
Change it there if your n8n instance moves.

## Notes
- Catalogue (49 suppliers, 798 products) is embedded as a fallback and loads instantly;
  the live n8n Catalog Feed overrides it when reachable.
- Passwords (demo + Airtable Users) are plain text — fine for a pilot, not for
  production. For real use, move auth to Auth0 / Azure AD.
