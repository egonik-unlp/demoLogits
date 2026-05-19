const DEFAULT_MODEL = "gpt-4.1-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const isGen5Model = (model: string) => model.startsWith("gpt-5");

type TopToken = { token: string; prob: number };
type TokenWithLogits = { token: string; prob: number; top: TopToken[] };

type ChatRole = "system" | "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

type LogprobEntry = {
  token: string;
  logprob: number;
  top_logprobs: { token: string; logprob: number }[];
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: { content?: string };
    logprobs?: { content?: LogprobEntry[] };
  }>;
};

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });

const getLogprobs = (resp: OpenAIChatResponse): TokenWithLogits[] => {
  const content = resp.choices?.[0]?.logprobs?.content;
  if (!content) return [];
  return content.map((t) => ({
    token: t.token,
    prob: Math.exp(t.logprob),
    top: t.top_logprobs.map((c) => ({
      token: c.token,
      prob: Math.exp(c.logprob),
    })),
  }));
};

type HistoryTurn = { role: "user" | "assistant"; content: string };
type GenerateBody = {
  message?: string;
  model?: string;
  maxTokens?: number;
  system?: string;
  history?: HistoryTurn[];
  apiKey?: string;
};

type Env = {
  OPENAI_API_KEY?: string;
};

const isValidHistory = (h: unknown): h is HistoryTurn[] =>
  Array.isArray(h) &&
  h.every(
    (t) =>
      t &&
      typeof t === "object" &&
      (t as HistoryTurn).role !== undefined &&
      ((t as HistoryTurn).role === "user" || (t as HistoryTurn).role === "assistant") &&
      typeof (t as HistoryTurn).content === "string",
  );

const handleGenerate = async (req: Request, env: Env): Promise<Response> => {
  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Server-configured key wins. Browser-supplied key is the fallback so
  // hosted demos can offer "bring your own key" without a redeploy.
  const serverKey = typeof env.OPENAI_API_KEY === "string" ? env.OPENAI_API_KEY.trim() : "";
  const clientKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const apiKey = serverKey || clientKey;
  if (!apiKey) {
    return json(
      { error: "OpenAI API key is required", needsClientKey: true },
      { status: 400 },
    );
  }
  if (!apiKey.startsWith("sk-")) {
    return json({ error: "OpenAI API key must start with 'sk-'" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) return json({ error: "message is required" }, { status: 400 });

  const model = body.model ?? DEFAULT_MODEL;
  const maxTokens = body.maxTokens ?? 1000;

  const system = typeof body.system === "string" ? body.system : undefined;
  if (body.history !== undefined && !isValidHistory(body.history)) {
    return json(
      { error: "history must be an array of { role: 'user'|'assistant', content: string }" },
      { status: 400 },
    );
  }
  const history = body.history ?? [];

  const messages: ChatMessage[] = [
    ...(system ? [{ role: "system" as const, content: system }] : []),
    ...history.map((t) => ({ role: t.role, content: t.content })),
    { role: "user" as const, content: message },
  ];

  let upstream: Response;
  try {
    upstream = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        logprobs: true,
        top_logprobs: 10,
        max_tokens: maxTokens,
        // Gen 5 models reason by default; reasoning suppresses logprobs. Disable it.
        ...(isGen5Model(model) ? { reasoning: "none" } : {}),
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: `Upstream fetch failed: ${msg}` }, { status: 502 });
  }

  if (!upstream.ok) {
    let upstreamMsg = `OpenAI error ${upstream.status}`;
    try {
      const errBody = (await upstream.json()) as { error?: { message?: string } };
      if (errBody?.error?.message) upstreamMsg = errBody.error.message;
    } catch {}
    if (upstream.status === 401) {
      return json({ error: "Invalid OpenAI API key" }, { status: 401 });
    }
    return json({ error: upstreamMsg }, { status: upstream.status });
  }

  const resp = (await upstream.json()) as OpenAIChatResponse;
  const tokens = getLogprobs(resp);
  const text = resp.choices?.[0]?.message?.content ?? "";
  return json({ text, tokens, model });
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === "/generate") {
      return handleGenerate(req, env);
    }
    if (req.method === "GET" && url.pathname === "/config") {
      const hasServerKey = typeof env.OPENAI_API_KEY === "string" && env.OPENAI_API_KEY.trim().length > 0;
      return json({ hasServerKey });
    }
    return new Response("Not found", { status: 404 });
  },
};
