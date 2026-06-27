# Cloudflare Workers + GitHub Deploy

Use the Cloudflare Workers GitHub deploy flow. The frontend builds into `dist`, and the Worker routes `/api/*` to the backend while serving static assets for the website.

## Setup

1. Run the Supabase SQL in `supabase-schema.sql`.
2. Push this project to GitHub.
3. In Cloudflare, choose **Workers & Pages**.
4. Choose **Create application**.
5. Choose **Continue with GitHub**.
6. Select `kiranmusu14/m2m`.
7. Use these settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
8. Add these variables in Cloudflare:
   - `GROQ_API_KEY` as a secret
   - `GROQ_MODEL` = `llama-3.1-8b-instant`
   - `GROQ_ANALYZE_MAX_COMPLETION_TOKENS`
   - `GROQ_CHAT_MAX_COMPLETION_TOKENS`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`

Use the same values as `.env`, but do not paste secrets into the repo.

## Local Development

Keep using:

```sh
npm start
```

Local development still uses `server.js`. Cloudflare production uses `worker.js`, `wrangler.toml`, and `functions/api/[[path]].js`.
