# LLM Sampling Visualizer

A small demo that makes LLM token sampling tangible:

- You type a prompt.
- The backend asks OpenAI for a completion **with `top_logprobs: 10`** per token.
- The UI animates each token as a *slot-machine roll* over the 10 candidates, landing on the token the model actually sampled.

## Run

```sh
bun install
export OPENAI_API_KEY=sk-...
bun run start
```

Open <http://localhost:3000>.

## Controls

- **Generate** — calls the model and starts the animation.
- **Speed** — slows down or speeds up the per-token animation (the underlying API call doesn't change).
- **Pause / Step** — pause the animation and advance one token at a time.

## Configuration

Environment variables:

- `OPENAI_API_KEY` (required)
- `PORT` (default `3000`)

To change the model, edit `DEFAULT_MODEL` in `server.ts` (default `gpt-4.1-mini`).

## How it works

1. `POST /generate` is a single non-streaming chat completion with `logprobs: true, top_logprobs: 10`.
2. The server converts each token's logprobs to probabilities (`Math.exp(logprob)`) and returns:
   ```json
   {
     "text": "…",
     "tokens": [
       { "token": "the", "prob": 0.62, "top": [{ "token": "the", "prob": 0.62 }, …] }
     ]
   }
   ```
3. The frontend animates one token at a time: bars grow → the highlight rolls over the 10 candidates and decelerates → it lands on the actually-sampled token (★) → the token is appended to the response area.
