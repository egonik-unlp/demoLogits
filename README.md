# LLM Sampling Visualizer

A small demo that makes LLM token sampling tangible:

- You type a prompt.
- The Worker asks OpenAI for a completion **with `top_logprobs: 10`** per token.
- The UI animates each token as a *slot-machine roll* over the 10 candidates, landing on the token the model actually sampled.

Hosted on **Cloudflare Workers**. Each visitor brings their own OpenAI API key — there is no server-side key.

## Run locally

```sh
npm install
npx wrangler dev
```

Open <http://localhost:8787>, paste an OpenAI key (`sk-…`) into the **API key** field, and click Generate. The key is stored only in your browser (`localStorage`) and is forwarded by the Worker to OpenAI without being persisted.

## Deploy

```sh
npx wrangler deploy
```

The Worker entry is `src/index.ts`; static assets in `public/` are served by Workers Assets via the binding in `wrangler.toml`.

## Controls

- **Generate** — calls the model and starts the animation.
- **Speed** — slows down or speeds up the per-token animation (the underlying API call doesn't change).
- **Pause / Step** — pause the animation and advance one token at a time.
- **API key** — your OpenAI key. Stored in `localStorage` only.

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
