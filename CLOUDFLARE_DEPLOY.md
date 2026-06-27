# Cloudflare Pages + GitHub Deploy

Use Cloudflare Pages. The frontend is static, and `/api/*` runs through Pages Functions.

## Setup

1. Run the Supabase SQL in `supabase-schema.sql`.
2. Push this project to GitHub.
3. In Cloudflare, create a Pages project from the GitHub repo.
4. Use these build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Functions directory: `functions`
5. Add these environment variables in Cloudflare Pages:
   - `OPENAI_API_KEY` as a secret
   - `OPENAI_MODEL`
   - `OPENAI_REASONING_EFFORT`
   - `OPENAI_ANALYZE_MAX_OUTPUT_TOKENS`
   - `OPENAI_CHAT_MAX_OUTPUT_TOKENS`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`

Use the same values as `.env`, but do not paste secrets into the repo.

## Local Development

Keep using:

```sh
npm start
```

Local development still uses `server.js`. Cloudflare production uses `functions/api/[[path]].js`.
