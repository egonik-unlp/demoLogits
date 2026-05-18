# LLM Sampling Visualizer

A small demo that makes LLM token sampling tangible:

- You type a prompt.
- The Worker asks OpenAI for a completion **with `top_logprobs: 10`** per token.
- The UI animates each token as a *slot-machine roll* over the 10 candidates, landing on the token the model actually sampled.

Hosted on **Cloudflare Workers**. The Worker can either be configured with an `OPENAI_API_KEY` (server-side) or fall back to a key the visitor pastes in the UI.

## Run locally

```sh
npm install
npm run dev
```

`npm run dev` runs `scripts/dev.mjs`, which:

1. Reads `OPENAI_API_KEY` from `.env` (the project root).
2. Writes a temporary `.dev.vars` so Wrangler exposes it as a Worker env binding.
3. Spawns `wrangler dev` and cleans up `.dev.vars` on exit.

Open <http://localhost:8787>. If the Worker has `OPENAI_API_KEY`, the API-key input is hidden and you just click Generate. Otherwise paste an `sk-…` key into the **API key** field — it stays in `localStorage` and is forwarded to OpenAI per request.

## Deploy

```sh
npx wrangler secret put OPENAI_API_KEY   # one-time
npx wrangler deploy
```

In production the same `env.OPENAI_API_KEY` binding is read; if no secret is set, deployed users will see the API-key input.

The Worker entry is `src/index.ts`; static assets in `public/` are served by Workers Assets via the binding in `wrangler.toml`.

## Controls

- **Generate** — calls the model and starts the animation.
- **Speed** — slows down or speeds up the per-token animation (the underlying API call doesn't change).
- **Pause / Step** — pause the animation and advance one token at a time.
- **API key** — your OpenAI key. Stored in `localStorage` only. Hidden when the Worker has its own `OPENAI_API_KEY` configured.
- **Record GIF (response)** — renders the prompt + response onto a hidden canvas (one frame per token) and encodes a real `.gif` via the vendored [`gifenc`](public/vendor/gifenc.esm.js) library. No screen-share, no cursor. Auto-stops once the explicit `<|endoftext|>` marker is rendered. Toggle **Include prompt** to record the response on its own.

## How it works

1. `POST /generate` is a single non-streaming chat completion with `logprobs: true, top_logprobs: 10`.
2. The Worker constructs a per-request OpenAI client using the visitor's pasted key, then converts each token's logprobs to probabilities (`Math.exp(logprob)`) and returns:
   ```json
   {
     "text": "…",
     "tokens": [
       { "token": "the", "prob": 0.62, "top": [{ "token": "the", "prob": 0.62 }, …] }
     ]
   }
   ```
3. The frontend animates one token at a time: bars grow → the highlight rolls over the 10 candidates and decelerates → it lands on the actually-sampled token (★) → the token is appended to the response area.

To change the default model, edit `DEFAULT_MODEL` in `src/index.ts` (default `gpt-4.1-mini`).
