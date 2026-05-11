import OpenAI from "openai";
import { file } from "bun";
import path from "node:path";

const PORT = Number(process.env.PORT ?? 3000);
const PUBLIC_DIR = path.join(import.meta.dir, "public");
const DEFAULT_MODEL = "gpt-4.1-mini";

const client = new OpenAI();

type TopToken = { token: string; prob: number };
type TokenWithLogits = { token: string; prob: number; top: TopToken[] };

const getLogprobs = (
  resp: OpenAI.Chat.Completions.ChatCompletion,
): TokenWithLogits[] => {
  const content = resp.choices[0]?.logprobs?.content;
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

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });

const serveStatic = async (relPath: string): Promise<Response> => {
  const safeRel = relPath.replace(/^\/+/, "") || "index.html";
  const full = path.join(PUBLIC_DIR, safeRel);
  if (!full.startsWith(PUBLIC_DIR)) return new Response("Forbidden", { status: 403 });
  const f = file(full);
  if (!(await f.exists())) return new Response("Not found", { status: 404 });
  return new Response(f);
};

type HistoryTurn = { role: "user" | "assistant"; content: string };
type GenerateBody = {
  message?: string;
  model?: string;
  maxTokens?: number;
  system?: string;
  history?: HistoryTurn[];
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

const handleGenerate = async (req: Request): Promise<Response> => {
  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
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

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    ...(system ? [{ role: "system" as const, content: system }] : []),
    ...history.map((t) => ({ role: t.role, content: t.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const resp = await client.chat.completions.create({
      model,
      messages,
      logprobs: true,
      top_logprobs: 10,
      max_tokens: maxTokens,
    });
    const tokens = getLogprobs(resp);
    const text = resp.choices[0]?.message?.content ?? "";
    return json({ text, tokens, model });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("OpenAI error:", msg);
    return json({ error: msg }, { status: 500 });
  }
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === "/generate") {
      return handleGenerate(req);
    }
    if (req.method === "GET") {
      const p = url.pathname === "/" ? "/index.html" : url.pathname;
      return serveStatic(p);
    }
    return new Response("Method not allowed", { status: 405 });
  },
});

console.log(`demoLogits running on http://localhost:${PORT}`);
