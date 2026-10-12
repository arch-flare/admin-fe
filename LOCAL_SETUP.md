# Running the admin app on your machine

The admin app needs the Laravel API running too. The full guide, covering the API, the admin app and the crawler, is in the API repo:
**[arch-flare/api -> LOCAL_SETUP.md](https://github.com/arch-flare/api/blob/main/LOCAL_SETUP.md)** (on branch `feat/product-crawler` until that PR is merged).

## Quick version (admin app only)

Prerequisite: Node.js 18+ and the API running at http://127.0.0.1:8000 (see the guide above).

```bash
npm install
```

`.env` is committed and points at the **live** API. Don't edit it. Create a git-ignored `.env.local` to override it:

```bash
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000/api/"
NEXT_PUBLIC_STORAGE_URL="http://127.0.0.1:8000/storage/"
```

```bash
npm run dev
```

Open http://localhost:3000/auth/signin and sign in with the seeded admin: `admin@archflaire.test` / `password`.

Restart `npm run dev` after editing `.env.local`.

## Troubleshooting

- **`ChunkLoadError` / "Unhandled Runtime Error"**: stale Next.js cache. Stop the dev server, delete the `.next` folder, start it again, and hard-refresh the browser (Ctrl+Shift+R).
- **Sees live data or can't log in**: `.env.local` is missing, or the dev server wasn't restarted after creating it.
- **Crawler pages show "Failed to load"**: the API is missing the crawler migration or the API PR. Run `php artisan migrate` in the API repo.
