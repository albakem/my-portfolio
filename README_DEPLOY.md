Vercel deployment & secure serverless setup

Steps to deploy to Vercel (recommended):

1. Install Vercel CLI (optional, for local dev):

```bash
npm i -g vercel
```

2. Sign in and link the project:

```bash
vercel login
vercel link
```

3. Set environment variables in Vercel dashboard (Project → Settings → Environment Variables):
- `OPENAI_API_KEY` — your OpenAI API key (required)
- `FUNCTION_TOKEN` — a random secret token (recommended) that the client must send via `x-function-token` header
- `ALLOWED_ORIGIN` — your site origin (e.g., `https://albakem.github.io`) or `*` during testing

4. Deploy:

```bash
vercel --prod
```

Local testing with Vercel CLI (serves functions at `/api/ask`):

```bash
vercel dev
```

Client note: `index.html` will call `/api/ask`. If you set `FUNCTION_TOKEN`, configure the client to send the header `x-function-token: <token>` (see below). If you don't want to expose a token, leave `FUNCTION_TOKEN` empty — but this increases risk of abuse.

Security recommendations:
- Never commit `OPENAI_API_KEY` or tokens to the repo.
- Use a restrictive `ALLOWED_ORIGIN` for production.
- Consider adding rate-limiting or a small CAPTCHA if public.

GitHub Actions automatic deploy (optional)

1. Add these repository secrets in GitHub (Settings → Secrets → Actions):
	- `VERCEL_TOKEN` — your Vercel personal token
	- `VERCEL_ORG_ID` — your Vercel organization ID
	- `VERCEL_PROJECT_ID` — your Vercel project ID

2. The repository contains a workflow `.github/workflows/deploy-vercel.yml` that will automatically deploy the `main` branch to Vercel when pushed.

Notes: you can still use Vercel's built-in GitHub integration instead of this Action; both will deploy on push.
