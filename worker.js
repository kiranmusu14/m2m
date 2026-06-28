import { onRequest as handleApiRequest } from "./functions/api/[[path]].js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest({ request, env, ctx });
    }

    if (env.ASSETS?.fetch) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      "Static asset binding is missing. In Cloudflare, deploy this Worker from GitHub with build command `npm run build` and deploy command `npx wrangler deploy`, so wrangler.toml uploads ./dist as the ASSETS binding.",
      {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  },
};
