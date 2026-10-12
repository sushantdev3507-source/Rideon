# RideOn: deploy everything on Vercel

Website (index.html, style.css, script.js) + backend (`api/` folder, Vercel
serverless functions) + online PostgreSQL database (Neon, free).

## Steps
1. Upload ALL files and folders in this zip to your GitHub repo
   (index.html, style.css, script.js, package.json, database.sql, api/, lib/).
   Keep the folder structure exactly the same.
2. In Vercel, import the repo. Framework Preset: **Other**. Leave build settings empty. Deploy.
3. Add the database: Vercel project → **Storage** tab → **Create Database** → **Neon (Postgres)**
   → Free plan → Create → **Connect** it to your project.
   (This automatically adds the `DATABASE_URL` setting.)
4. Go to **Deployments** → on the latest one click **⋯ → Redeploy**.
5. Open your site and sign up. The tables are created automatically on first use.

## Show the data to your professor
Vercel → Storage → your database → **Open in Neon** → **SQL Editor**, then run:
```sql
SELECT * FROM users;
SELECT * FROM wallets;
SELECT * FROM rides;
SELECT * FROM wallet_transactions;
```

## API endpoints (all POST, JSON)
| Endpoint | Input | What it does |
|---|---|---|
| /api/signup | name, email, password | Creates account + wallet with ₹500 bonus |
| /api/login | email, password | Logs in |
| /api/wallet | userId | Returns wallet balance |
| /api/wallet/add | userId, amount | Adds money |
| /api/rides | userId | Lists rides |
| /api/rides/book | userId, title, detail, fare | Books ride, pays from wallet |
| /api/rides/cancel | userId, rideId | Cancels ride, refunds wallet |

## If something fails
- "Database not connected": step 3 or 4 was skipped.
- Styles missing / 404: files are not in the repo root, or names changed.
