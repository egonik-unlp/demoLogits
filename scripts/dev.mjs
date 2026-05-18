#!/usr/bin/env node
// Bridges .env → .dev.vars so `wrangler dev` exposes OPENAI_API_KEY
// as a Worker env binding. We only forward the keys the Worker uses,
// not the whole .env (which has unrelated secrets).
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");
const envPath = resolve(repo, ".env");
const devVarsPath = resolve(repo, ".dev.vars");

const FORWARDED = ["OPENAI_API_KEY"];

const parseEnv = (text) => {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
};

let wroteDevVars = false;
if (existsSync(envPath)) {
  const env = parseEnv(readFileSync(envPath, "utf8"));
  const lines = [];
  for (const k of FORWARDED) {
    if (env[k]) lines.push(`${k}=${env[k]}`);
  }
  if (lines.length > 0) {
    writeFileSync(devVarsPath, lines.join("\n") + "\n", { mode: 0o600 });
    wroteDevVars = true;
    console.log(`[dev] wrote .dev.vars with ${lines.length} key(s) from .env`);
  } else {
    console.log("[dev] .env has none of the forwarded keys; skipping .dev.vars");
  }
} else {
  console.log("[dev] no .env file; running wrangler dev as-is");
}

const cleanup = () => {
  if (wroteDevVars && existsSync(devVarsPath)) {
    try { unlinkSync(devVarsPath); } catch {}
  }
};

const child = spawn("wrangler", ["dev", ...process.argv.slice(2)], {
  cwd: repo,
  stdio: "inherit",
  shell: false,
});

const forward = (sig) => () => {
  if (!child.killed) child.kill(sig);
};
process.on("SIGINT", forward("SIGINT"));
process.on("SIGTERM", forward("SIGTERM"));
process.on("exit", cleanup);

child.on("exit", (code, signal) => {
  cleanup();
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
