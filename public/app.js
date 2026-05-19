// LLM Sampling Visualizer — frontend

// Prompts curated to produce contrasting entropy profiles.
// "high" = the model is genuinely unsure → top-10 spreads → flat distribution
//          and high per-token perplexity. "low" = near-deterministic.
const PRESETS = [
  {
    tag: "low",
    label: "Capital",
    prompt:
      "What is the capital of France? Reply with two short sentences explaining it.",
  },
  {
    tag: "high",
    label: "Random numbers",
    prompt:
      "Pick eight random integers between 1 and 100. Reply with only the comma-separated numbers, nothing else.",
  },
  {
    tag: "high",
    label: "Coin flips",
    prompt:
      "Flip a coin twelve times. Reply with only the comma-separated results, each either 'heads' or 'tails'.",
  },
  {
    tag: "high",
    label: "Pick colors",
    prompt:
      "Pick six colors at random from this list, with repeats allowed: red, blue, green, yellow, purple, orange, pink, black. Reply with only the comma-separated words.",
  },
  {
    tag: "high",
    label: "Continue story",
    prompt:
      "Continue this story in three to four sentences: She opened the door and saw",
  },
  {
    tag: "high",
    label: "Random nouns",
    prompt:
      "Generate eight unrelated random English nouns. Reply with only the comma-separated words.",
  },
];

// ────────── Chatbot scenarios ──────────
// Four 2×2 variants showing how (a) system-prompt compactness and (b)
// conversation length shape the model's reply to the SAME final user
// message. Domain: customer support for an online clothing store.

const CHATBOT_SYSTEM_COMPACT =
  "You are Sam, a customer support agent for Snappler Outlet, an online " +
  "clothing store. Be friendly, accurate, and concise. If you do not have " +
  "enough information to answer, ask one clarifying question. Never invent " +
  "order details or discount codes.";

const CHATBOT_SYSTEM_BLOATED = `# Identity
You are Sam, a senior customer support agent at Snappler Outlet ("Snappler"), an online retailer of premium casual clothing for adults aged 18-65, headquartered in Buenos Aires, founded in 2018, with a customer service team operating 24/7 across English, Spanish, and Portuguese. You report into the Customer Experience team and your KPIs include first-response time, customer satisfaction (CSAT), and resolution rate.

# Tone
Be warm, professional, empathetic, and proactive. Mirror the customer's level of formality. Never use slang. Always sign off with "Warm regards, Sam at Snappler Outlet" if the customer thanks you. Use exclamation points sparingly and only when a customer expresses positive emotion. Never use emoji unless the customer uses one first. Avoid contractions in formal contexts (e.g. "do not" not "don't"). Match the customer's language but default to English.

# Policies
- Returns: accepted within 30 days of delivery for full refund, 60 days for store credit. Items must be unworn with original tags.
- Exchanges: free first exchange per order; $4.99 shipping for subsequent exchanges.
- Sizing: refer to size chart at /sizing if asked. Cloudwool products run small in the shoulders; T-shirts are true-to-size.
- Refunds: process within 5-7 business days to original payment method.
- Defective items: replace at no charge with a prepaid return label.
- Discount codes: only one promotional code per order, cannot be combined with sale-priced items, cannot be combined with each other. Welcome codes are for first-time orders only.

# Workflow
1. Greet the customer.
2. Ask for their order number if not yet provided.
3. Confirm the issue clearly.
4. Provide a solution within policy or escalate to a human if outside policy.
5. Confirm resolution with the customer.
6. Offer additional help and close.

# Constraints
- Never confirm specific product availability without checking inventory.
- Never quote shipping speeds without confirming destination zip code.
- Never promise discount codes you have not been given.
- Never disclose other customers' information.
- If the customer is angry, acknowledge their feelings before resolving the issue.
- If the request is unusual, flag for human review.
- If the customer asks about competitors, do not comment.

# Output format
- Keep replies under four sentences when possible.
- Use bullet lists for multi-step instructions.
- End with a question or call to action.

You must follow these instructions exactly.`;

const CHATBOT_HISTORY_SHORT = [
  { role: "user", content: "hi I bought a hoodie last week and it's a little tight" },
  {
    role: "assistant",
    content:
      "Sorry to hear that! Could you share your order number and I'll look into options for you?",
  },
  { role: "user", content: "order is SNAP-44219" },
];

const CHATBOT_HISTORY_LONG = [
  { role: "user", content: "hi I bought a hoodie last week" },
  { role: "assistant", content: "Welcome! How can I help you with that?" },
  { role: "user", content: "it doesn't fit me right" },
  {
    role: "assistant",
    content: "Sorry to hear that! Is it too small, too big, or just an unusual fit?",
  },
  { role: "user", content: "a bit tight in the shoulders" },
  {
    role: "assistant",
    content: "Got it. Could you share the order number and the size you ordered?",
  },
  { role: "user", content: "SNAP-44219, size M" },
  {
    role: "assistant",
    content:
      "Thanks. I'm pulling that up — this is the Cloudwool Pullover Hoodie in Charcoal, size M, correct?",
  },
  { role: "user", content: "yes that's the one" },
  {
    role: "assistant",
    content:
      "Perfect. Our Cloudwool runs slightly slim through the shoulders — many customers size up. Would you like an exchange to size L?",
  },
  {
    role: "user",
    content:
      "I'd actually want to keep this one for now in case I lose weight, but maybe also order a Large separately",
  },
  {
    role: "assistant",
    content:
      "Understood. I can place a new order for the Cloudwool in Charcoal, size L. Want me to use the same shipping address as the original order?",
  },
  { role: "user", content: "yes same address please" },
];

const CHATBOT_FINAL_MESSAGE =
  "Hmm hold on — could you walk me through every option I have here? I want " +
  "to understand the trade-offs between exchanging vs. returning vs. ordering " +
  "a new one, whether welcome10 or any other discount applies, expected " +
  "shipping timelines, and what happens if the new size also doesn't fit. " +
  "I'd like to think this through carefully before deciding.";

const CHATBOT_SCENARIOS = [
  {
    id: "compact-short",
    label: "compact + short hist",
    sysVariant: "compact",
    histVariant: "short",
    system: CHATBOT_SYSTEM_COMPACT,
    history: CHATBOT_HISTORY_SHORT,
    message: CHATBOT_FINAL_MESSAGE,
  },
  {
    id: "compact-long",
    label: "compact + long hist",
    sysVariant: "compact",
    histVariant: "long",
    system: CHATBOT_SYSTEM_COMPACT,
    history: CHATBOT_HISTORY_LONG,
    message: CHATBOT_FINAL_MESSAGE,
  },
  {
    id: "bloated-short",
    label: "bloated + short hist",
    sysVariant: "bloated",
    histVariant: "short",
    system: CHATBOT_SYSTEM_BLOATED,
    history: CHATBOT_HISTORY_SHORT,
    message: CHATBOT_FINAL_MESSAGE,
  },
  {
    id: "bloated-long",
    label: "bloated + long hist",
    sysVariant: "bloated",
    histVariant: "long",
    system: CHATBOT_SYSTEM_BLOATED,
    history: CHATBOT_HISTORY_LONG,
    message: CHATBOT_FINAL_MESSAGE,
  },
];

// ────────── Logic puzzles ──────────
// Hard constraint-satisfaction prompts. The model can't brute-force these
// during token-by-token sampling, so perplexity tends to spike sharply on the
// "decision" tokens — which makes them a good showcase for the metrics view.

const PUZZLE_EN = `Six people — Ava, Ben, Cara, Dylan, Emma, and Felix — each brought exactly one item to a community event: a book, a lantern, a camera, a puzzle, a blanket, or a guitar.

Each person arrived from exactly one neighborhood: Northside, Riverside, Old Town, Hillcrest, Lakeside, or Market Square.

They arrived one at a time, in positions 1 through 6.

Facts:

1. The person with the lantern arrived immediately before the person from Riverside.
2. Ava did not arrive first or last.
3. The person from Hillcrest arrived sometime after Cara.
4. Ben did not bring the camera and is not from Lakeside.
5. The person with the puzzle arrived third.
6. Dylan arrived immediately after the person from Old Town.
7. Emma is either the person with the blanket or the person from Northside, but not both.
8. The person with the guitar arrived before the person from Lakeside.
9. Cara is not from Riverside, and she did not arrive immediately before Emma.
10. The person from Northside arrived two positions before the person with the camera.
11. Ava arrived sometime after the person with the blanket.
12. The person from Lakeside did not bring the puzzle.
13. Dylan is not from Hillcrest.
14. The person with the camera arrived after Ben but before Emma.
15. The person from Old Town did not bring the blanket.
16. Felix arrived earlier than the person with the book, but later than the person from Market Square.

Question:

Determine each person's item, neighborhood, and arrival order.

Important: Do not guess. Solve the puzzle step by step. If the facts are inconsistent, identify the contradiction. If multiple solutions exist, list all possible solutions.`;

const PUZZLE_ES = `Seis personas — Ava, Ben, Cara, Dylan, Emma y Felix — llevaron exactamente un objeto cada una a un evento comunitario: un libro, una linterna, una cámara, un rompecabezas, una manta o una guitarra.

Cada persona llegó desde exactamente un barrio: Northside, Riverside, Old Town, Hillcrest, Lakeside o Market Square.

Llegaron una a la vez, en las posiciones 1 a 6.

Pistas:

1. La persona con la linterna llegó inmediatamente antes que la persona de Riverside.
2. Ava no llegó ni primero ni último.
3. La persona de Hillcrest llegó en algún momento después de Cara.
4. Ben no llevó la cámara y no es de Lakeside.
5. La persona con el rompecabezas llegó en tercer lugar.
6. Dylan llegó inmediatamente después de la persona de Old Town.
7. Emma es o bien la persona con la manta o bien la persona de Northside, pero no ambas.
8. La persona con la guitarra llegó antes que la persona de Lakeside.
9. Cara no es de Riverside, y no llegó inmediatamente antes que Emma.
10. La persona de Northside llegó dos posiciones antes que la persona con la cámara.
11. Ava llegó en algún momento después de la persona con la manta.
12. La persona de Lakeside no llevó el rompecabezas.
13. Dylan no es de Hillcrest.
14. La persona con la cámara llegó después que Ben pero antes que Emma.
15. La persona de Old Town no llevó la manta.
16. Felix llegó antes que la persona con el libro, pero después que la persona de Market Square.

Pregunta:

Determina el objeto, el barrio y el orden de llegada de cada persona.

Importante: No adivines. Resuelve el rompecabezas paso a paso. Si los datos son inconsistentes, identifica la contradicción. Si existen múltiples soluciones, enuméralas todas.`;

const PUZZLES = [
  { id: "six-people-en", lang: "EN", label: "Six-person event (EN)", prompt: PUZZLE_EN },
  { id: "six-people-es", lang: "ES", label: "Six-person event (ES)", prompt: PUZZLE_ES },
];


const $ = (sel) => document.querySelector(sel);
const messageEl = $("#message");
const generateBtn = $("#generate");
const pauseBtn = $("#pause");
const stepBtn = $("#step");
const fastForwardBtn = $("#fast-forward");
const speedEl = $("#speed");
const speedValEl = $("#speed-val");
const rollLengthEl = $("#roll-length");
const tempEl = $("#temperature");
const tempValEl = $("#temperature-val");
const stripEl = $("#strip");
const stripMarkerEl = $("#strip-marker");
const entropyTextEl = $("#entropy-text");
const examplesChipsEl = $("#examples-chips");
const examplesTabsEl = document.querySelector(".examples-tabs");
const scenarioContextEl = $("#scenario-context");
const ctxSummaryMetaEl = $("#ctx-summary-meta");
const ctxSystemEl = $("#ctx-system");
const ctxHistoryEl = $("#ctx-history");
const ctxMessageEl = $("#ctx-message");
const perplexityPlotEl = $("#perplexity-plot");
const maxTokensEl = $("#max-tokens");
const modelEl = $("#model");
const compareModeEl = $("#compare-mode");
const clearRunsBtn = $("#clear-runs");
const runsLegendEl = $("#runs-legend");
const metricsTableEl = $("#metrics-table");
const plotMetricEl = $("#plot-metric");
const statusEl = $("#status");
const responseEl = $("#response");
const distEl = $("#dist");
const tokenIdxEl = $("#token-idx");
const apiKeyEl = $("#api-key");
const apiKeyStatusEl = $("#api-key-status");

const API_KEY_STORAGE = "demoLogits.openaiKey";
const loadApiKey = () => {
  try { return localStorage.getItem(API_KEY_STORAGE) ?? ""; } catch { return ""; }
};
const saveApiKey = (v) => {
  try {
    if (v) localStorage.setItem(API_KEY_STORAGE, v);
    else localStorage.removeItem(API_KEY_STORAGE);
  } catch {}
};
const updateApiKeyStatus = () => {
  if (serverHasKey) {
    apiKeyStatusEl.textContent = "Server-provided";
    apiKeyStatusEl.classList.add("ok");
    return;
  }
  const v = apiKeyEl.value.trim();
  apiKeyStatusEl.textContent = v ? "Saved" : "Not set";
  apiKeyStatusEl.classList.toggle("ok", !!v);
};

// Set true once /config confirms the Worker has OPENAI_API_KEY bound.
// When true, the input is hidden and we don't send `apiKey` in /generate.
let serverHasKey = false;
const apiKeyField = apiKeyEl.closest("label") ?? apiKeyEl;
const setServerHasKey = (v) => {
  serverHasKey = !!v;
  apiKeyField.style.display = serverHasKey ? "none" : "";
  updateApiKeyStatus();
};

apiKeyEl.value = loadApiKey();
updateApiKeyStatus();
apiKeyEl.addEventListener("blur", () => {
  saveApiKey(apiKeyEl.value.trim());
  updateApiKeyStatus();
});
apiKeyEl.addEventListener("input", updateApiKeyStatus);

// Probe the Worker for a server-side key. If present, hide the input.
fetch("/config")
  .then((r) => (r.ok ? r.json() : null))
  .then((cfg) => setServerHasKey(cfg && cfg.hasServerKey))
  .catch(() => {});

let speed = 1.0;
speedEl.addEventListener("input", () => {
  speed = parseFloat(speedEl.value);
  speedValEl.textContent = speed.toFixed(1) + "x";
});

// Simulated softmax temperature applied to the returned top-10 probs.
// p_i' = p_i^(1/T) / Σ p_j^(1/T), then rescaled back to the original
// top-10 mass so bars don't suddenly inflate when T ≠ 1.
//
// Slider is 0..100 mapped log-scale to T ∈ [exp(-3), exp(3)] ≈ [0.05, 20],
// with T=1 at slider=50. Log scale gives symmetric, fine-grained control
// around T=1 plus enough headroom at the high end to flatten the
// distribution to near-uniform ("full degeneration").
const tempFromSlider = (v) => Math.exp(6 * (v / 100 - 0.5));
const getTemperature = () => tempFromSlider(parseFloat(tempEl.value));
const applyTemperature = (top, T) => {
  if (Math.abs(T - 1) < 1e-3) return top.map((c) => ({ ...c }));
  const invT = 1 / T;
  const logs = top.map((c) => invT * Math.log(Math.max(c.prob, 1e-300)));
  const maxLog = Math.max(...logs);
  const exps = logs.map((l) => Math.exp(l - maxLog));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
  const origMass = top.reduce((a, c) => a + c.prob, 0);
  return top.map((c, i) => ({
    token: c.token,
    prob: (exps[i] / sumExp) * origMass,
  }));
};

// Track the last rendered token so the temperature slider can live-update.
let lastRenderedTop = null;
let lastSampledToken = null;

const updateTempLabel = () => {
  tempValEl.textContent = getTemperature().toFixed(2);
};
updateTempLabel();
tempEl.addEventListener("input", () => {
  updateTempLabel();
  if (lastRenderedTop) {
    renderDistribution(lastRenderedTop, lastSampledToken);
  }
});

let paused = false;
let stepOnce = false;
let fastForward = false;
pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  stepBtn.disabled = !paused;
});
stepBtn.addEventListener("click", () => {
  if (paused) stepOnce = true;
});
fastForwardBtn.addEventListener("click", () => {
  // One-way switch for the current run. Auto-unpause so the loop progresses.
  fastForward = true;
  paused = false;
  pauseBtn.textContent = "Pause";
  pauseBtn.disabled = true;
  stepBtn.disabled = true;
  fastForwardBtn.disabled = true;
  fastForwardBtn.textContent = "⏭ Skipping…";
});

const setStatus = (msg, isErr = false) => {
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", isErr);
};

const sleep = (ms) => {
  // In fast-forward we still yield to the browser so the response text and
  // plot can paint; just don't actually wait.
  if (fastForward) return new Promise((r) => setTimeout(r, 0));
  return new Promise((r) => setTimeout(r, ms / speed));
};

// Pause if requested. While paused, wait until resumed OR a single step is requested.
const waitIfPaused = async () => {
  while (paused && !fastForward) {
    if (stepOnce) {
      stepOnce = false;
      return;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
};

const renderTokenLabel = (tok) => {
  // Make whitespace visible.
  const span = document.createElement("span");
  if (tok === " ") {
    span.innerHTML = `<span class="ws">·</span>`;
  } else if (tok === "\n") {
    span.innerHTML = `<span class="ws">↵</span>`;
  } else if (tok === "\t") {
    span.innerHTML = `<span class="ws">⇥</span>`;
  } else if (/^\s+$/.test(tok)) {
    span.innerHTML = `<span class="ws">${tok.replace(/ /g, "·").replace(/\n/g, "↵")}</span>`;
  } else {
    // Escape text content
    span.textContent = tok;
  }
  return span;
};

// Render the stacked probability strip + entropy meter.
// `sortedAdjusted` is the candidates already sorted desc by adjusted prob.
const renderStrip = (sortedAdjusted, sampledToken) => {
  stripEl.innerHTML = "";
  stripMarkerEl.innerHTML = "";

  const sumMass = sortedAdjusted.reduce((a, c) => a + c.prob, 0) || 1;

  // Cumulative offset so we can place the ▼ marker over the chosen segment.
  let cumulative = 0;
  let chosenCenter = null;

  sortedAdjusted.forEach((cand, i) => {
    const sharePct = (cand.prob / sumMass) * 100;

    const seg = document.createElement("div");
    seg.className = "seg";
    seg.style.flexBasis = sharePct + "%";
    // Distinct hue per rank — visually reinforces "10 separate candidates".
    const hue = (i * 36) % 360;
    seg.style.background = `hsl(${hue}, 45%, ${i === 0 ? 50 : 38}%)`;

    // Show token text only if segment is wide enough.
    if (sharePct > 7) {
      const labelText = cand.token === " " ? "·"
        : cand.token === "\n" ? "↵"
        : cand.token === "\t" ? "⇥"
        : cand.token;
      seg.textContent = labelText;
    }
    seg.title = `${JSON.stringify(cand.token)} — ${(cand.prob * 100).toFixed(2)}%`;

    if (cand.token === sampledToken && chosenCenter == null) {
      seg.classList.add("chosen");
      chosenCenter = cumulative + sharePct / 2;
    }

    cumulative += sharePct;
    stripEl.appendChild(seg);
  });

  // ▼ marker positioned over the sampled segment.
  if (chosenCenter != null) {
    const m = document.createElement("div");
    m.className = "marker";
    m.textContent = "▼";
    m.style.left = chosenCenter + "%";
    stripMarkerEl.appendChild(m);
  }

  // Entropy of the (renormalized) top-10 distribution, in bits.
  // H_max = log2(10) ≈ 3.322. Useful pedagogically: T low → H low; T high → H high.
  let H = 0;
  for (const c of sortedAdjusted) {
    const p = c.prob / sumMass;
    if (p > 0) H -= p * Math.log2(p);
  }
  const Hmax = Math.log2(sortedAdjusted.length || 1);
  entropyTextEl.textContent =
    `H = ${H.toFixed(2)} / ${Hmax.toFixed(2)} bits   (${((H / (Hmax || 1)) * 100).toFixed(0)}% of max)`;
};

// Render the 10 candidate rows for a token. Returns array of row elements
// in the order they were rendered (sorted by prob desc), and an index map
// from the candidate token string to its row index.
const renderDistribution = (top, sampledToken) => {
  // Cache so the temperature slider can re-render the same token live.
  lastRenderedTop = top;
  lastSampledToken = sampledToken;

  distEl.innerHTML = "";
  const T = getTemperature();
  const adjusted = applyTemperature(top, T);
  const sorted = [...adjusted].sort((a, b) => b.prob - a.prob);
  const maxProb = sorted[0]?.prob ?? 1;

  renderStrip(sorted, sampledToken);

  const rows = [];
  let chosenIdx = -1;
  sorted.forEach((cand, i) => {
    if (cand.token === sampledToken && chosenIdx === -1) chosenIdx = i;

    const row = document.createElement("div");
    row.className = "row";

    const label = document.createElement("div");
    label.className = "tok-label";
    label.appendChild(renderTokenLabel(cand.token));
    row.appendChild(label);

    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    // Width relative to max so the largest bar fills the track.
    const widthPct = (cand.prob / maxProb) * 100;
    // Animate from 0 to widthPct.
    fill.style.width = "0%";
    requestAnimationFrame(() => {
      fill.style.width = widthPct.toFixed(2) + "%";
    });
    track.appendChild(fill);
    row.appendChild(track);

    const pct = document.createElement("div");
    pct.className = "pct";
    pct.textContent = (cand.prob * 100).toFixed(1) + "%";
    row.appendChild(pct);

    distEl.appendChild(row);
    rows.push(row);
  });

  // If the sampled token isn't in top-10 (rare), append a synthetic row.
  if (chosenIdx === -1 && sampledToken != null) {
    const row = document.createElement("div");
    row.className = "row";
    const label = document.createElement("div");
    label.className = "tok-label";
    label.appendChild(renderTokenLabel(sampledToken));
    row.appendChild(label);
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = "2%";
    track.appendChild(fill);
    row.appendChild(track);
    const pct = document.createElement("div");
    pct.className = "pct";
    pct.textContent = "<top10";
    row.appendChild(pct);
    distEl.appendChild(row);
    rows.push(row);
    chosenIdx = rows.length - 1;
  }

  return { rows, chosenIdx };
};

const clearSpin = (rows) => {
  for (const r of rows) r.classList.remove("spin");
};

// Roll length presets — total ticks before landing on the chosen row.
// "off" skips the spin entirely.
const ROLL_PRESETS = {
  off:    { steps: 0,  fastMs: 0,  slowMs: 0   },
  short:  { steps: 8,  fastMs: 45, slowMs: 160 },
  medium: { steps: 14, fastMs: 50, slowMs: 200 },
  long:   { steps: 22, fastMs: 55, slowMs: 220 },
};

// The slot-machine roll: highlight rolls top → bottom, accelerating into
// a smooth fast cycle then decelerating until it lands on chosenIdx.
const rollAnimation = async (rows, chosenIdx) => {
  if (rows.length === 0) return;

  const preset = ROLL_PRESETS[rollLengthEl.value] ?? ROLL_PRESETS.short;

  if (preset.steps === 0) {
    // No spin — just land directly.
    rows[chosenIdx]?.classList.add("chosen");
    return;
  }

  const totalSteps = preset.steps + (chosenIdx % rows.length);
  const sequence = [];
  for (let i = 0; i < totalSteps; i++) {
    const t = totalSteps === 1 ? 1 : i / (totalSteps - 1);
    const eased = t * t * (3 - 2 * t); // ease-in-out
    const ms = preset.fastMs + (preset.slowMs - preset.fastMs) * eased;
    sequence.push({ idx: i % rows.length, ms });
  }
  sequence.push({ idx: chosenIdx, ms: 220 });

  let prev = -1;
  for (const step of sequence) {
    if (prev >= 0) rows[prev]?.classList.remove("spin");
    rows[step.idx]?.classList.add("spin");
    prev = step.idx;
    await sleep(step.ms);
  }
  clearSpin(rows);
  rows[chosenIdx]?.classList.add("chosen");
};

const appendTokenToResponse = (tok) => {
  // Remove caret, append token, re-append caret.
  const caret = responseEl.querySelector(".caret");
  if (caret) caret.remove();

  const span = document.createElement("span");
  span.className = "tok just-added";
  // Preserve whitespace correctly — set textContent which keeps spaces/newlines.
  span.textContent = tok;
  responseEl.appendChild(span);
  // Re-append caret
  const newCaret = document.createElement("span");
  newCaret.className = "caret";
  newCaret.textContent = "▌";
  responseEl.appendChild(newCaret);

  // Drop the highlight after a moment.
  setTimeout(() => span.classList.remove("just-added"), 700);

  // Auto-scroll if needed.
  responseEl.scrollTop = responseEl.scrollHeight;

  // Let the GIF recorder snapshot a frame after each token.
  document.dispatchEvent(new CustomEvent("response-token-appended", { detail: { token: tok } }));
};

// Explicit end-of-sequence marker. Drops the blinking caret (generation is
// over) and appends a styled <|endoftext|> token so the animation has a
// visible terminator — useful both on screen and for the saved recording.
const END_OF_TEXT = "<|endoftext|>";
const appendEndToken = () => {
  if (responseEl.querySelector(".tok.end-token")) return;
  const caret = responseEl.querySelector(".caret");
  if (caret) caret.remove();
  const span = document.createElement("span");
  span.className = "tok end-token just-added";
  span.textContent = END_OF_TEXT;
  responseEl.appendChild(span);
  setTimeout(() => span.classList.remove("just-added"), 700);
  responseEl.scrollTop = responseEl.scrollHeight;
  // Notify the recorder so it can stop after one more frame.
  document.dispatchEvent(new CustomEvent("response-end-token"));
};

// ────────── Per-token perplexity plot ──────────
// Per-token perplexity = 1 / prob(actually-sampled token). Confident token
// → ≈1, uncertain → can spike to 10s or 100s. We plot on a log Y axis so
// both regimes are readable on the same chart.
//
// All runs are kept in history. Each run has a `visible` flag controlling
// whether it shows up on the plot — toggleable from the legend. Compare
// mode just decides whether a fresh Generate keeps previous selections
// visible or hides them.
//
// Colors are derived deterministically from the run id using the golden
// angle (~137.5°) so any two consecutive runs are maximally separated on
// the hue wheel; this scales to arbitrarily many runs without repeating.
const colorForRunId = (id) => {
  const hue = ((id - 1) * 137.508) % 360;
  return `hsl(${hue.toFixed(1)}, 65%, 60%)`;
};
/** @type {Array<{id:number, model:string, prompt:string, color:string, series:Array<{idx:number,perp:number,token:string}>, active:boolean, visible:boolean}>} */
const runs = [];
let currentRun = null;
let nextRunId = 1;

const xmlns = "http://www.w3.org/2000/svg";
const svg = (tag, attrs = {}) => {
  const el = document.createElementNS(xmlns, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

// Threshold for "spike" tokens: perp > 10 ≡ the model gave its own pick <10% prob.
const SPIKE_THRESHOLD = 10;

// Linear-interpolated percentile on a pre-sorted ascending array.
const percentile = (sorted, q) => {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

const computeRunMetrics = (series) => {
  if (series.length === 0) {
    return {
      count: 0,
      geoMean: null, arithMean: null, max: null,
      p95: null, p99: null,
      spikeCount: 0, spikeDensity: 0,
    };
  }
  const perps = series.map((p) => p.perp);
  const sorted = [...perps].sort((a, b) => a - b);
  const sumNegLog = perps.reduce((a, v) => a + Math.log(v), 0);
  const sum = perps.reduce((a, v) => a + v, 0);
  let spikeCount = 0;
  for (const v of perps) if (v > SPIKE_THRESHOLD) spikeCount++;
  return {
    count: series.length,
    geoMean: Math.exp(sumNegLog / series.length),
    arithMean: sum / series.length,
    max: sorted[sorted.length - 1],
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
    spikeCount,
    spikeDensity: (spikeCount / series.length) * 100,
  };
};

// Trailing-window max over a numeric array. Window of N at index i covers
// indices [max(0, i-N+1), i]. Surfaces the local worst case so a single spike
// inside a long, mostly-calm sequence stays visible.
const rollingMax = (values, window) => {
  const out = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    let m = values[start];
    for (let j = start + 1; j <= i; j++) if (values[j] > m) m = values[j];
    out[i] = m;
  }
  return out;
};

const drawPerplexityPlot = () => {
  perplexityPlotEl.innerHTML = "";
  const visibleRuns = runs.filter((r) => r.visible);
  const totalPoints = visibleRuns.reduce((a, r) => a + r.series.length, 0);
  if (totalPoints === 0) {
    const ph = document.createElement("div");
    ph.className = "placeholder";
    ph.textContent = runs.length === 0
      ? "Per-token perplexity will appear here as the model generates."
      : "All runs are hidden — toggle a checkbox below to show one.";
    perplexityPlotEl.appendChild(ph);
    return;
  }

  const mode = (plotMetricEl && plotMetricEl.value) || "raw";

  // Per-run plotted values. The token + raw perp are kept around for tooltips
  // even when the line is drawn from a derived series (e.g. rolling-max).
  const plotted = visibleRuns.map((r) => {
    const rawPerps = r.series.map((p) => p.perp);
    const yPerps = mode === "rolling-max" ? rollingMax(rawPerps, 10) : rawPerps;
    return {
      run: r,
      points: r.series.map((p, i) => ({
        idx: i,
        token: p.token,
        rawPerp: p.perp,
        yPerp: yPerps[i],
        isSpike: p.perp > SPIKE_THRESHOLD,
      })),
    };
  });

  const W = perplexityPlotEl.clientWidth || 800;
  const H = 200;
  const M = { top: 12, right: 16, bottom: 28, left: 44 };
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;

  const root = svg("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" });

  // Y range — log scale clipped to [1, max(20, dataMax)].
  let dataMax = 1;
  for (const pl of plotted) for (const p of pl.points) if (p.yPerp > dataMax) dataMax = p.yPerp;
  const yMax = Math.max(20, Math.pow(10, Math.ceil(Math.log10(dataMax))));
  const yMin = 1;

  // X range — max series length across visible runs (aligns by token index).
  const maxLen = visibleRuns.reduce((a, r) => Math.max(a, r.series.length), 1);

  const xScale = (i) => {
    if (maxLen <= 1) return M.left + innerW / 2;
    return M.left + (i / (maxLen - 1)) * innerW;
  };
  const yScale = (v) => {
    const lv = Math.log10(Math.max(v, yMin));
    const lmax = Math.log10(yMax);
    return M.top + innerH - (lv / lmax) * innerH;
  };

  // Gridlines + Y axis labels at log-spaced ticks.
  const grid = svg("g", { class: "grid" });
  const axis = svg("g", { class: "axis" });
  const yTicks = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 5000, 100000].filter((t) => t <= yMax);
  for (const t of yTicks) {
    const y = yScale(t);
    grid.appendChild(svg("line", { x1: M.left, x2: M.left + innerW, y1: y, y2: y }));
    const lbl = svg("text", { x: M.left - 6, y: y + 3, "text-anchor": "end" });
    lbl.textContent = t >= 1000 ? t.toExponential(0).replace("+", "") : String(t);
    axis.appendChild(lbl);
  }
  // X axis baseline + label
  axis.appendChild(svg("line", {
    x1: M.left, x2: M.left + innerW, y1: M.top + innerH, y2: M.top + innerH,
  }));
  const xlbl = svg("text", {
    x: M.left + innerW / 2, y: H - 8, "text-anchor": "middle",
  });
  xlbl.textContent = "token index";
  axis.appendChild(xlbl);
  const ylbl = svg("text", {
    x: 12, y: M.top + innerH / 2,
    "text-anchor": "middle",
    transform: `rotate(-90 12 ${M.top + innerH / 2})`,
  });
  ylbl.textContent = "perplexity (log)";
  axis.appendChild(ylbl);

  root.appendChild(grid);
  root.appendChild(axis);

  // In threshold mode, draw a dashed reference line at the spike cutoff so the
  // viewer can see which dots cross it at a glance.
  if (mode === "threshold" && SPIKE_THRESHOLD <= yMax) {
    const yT = yScale(SPIKE_THRESHOLD);
    const thr = svg("line", {
      class: "threshold",
      x1: M.left, x2: M.left + innerW, y1: yT, y2: yT,
    });
    root.appendChild(thr);
    const thrLbl = svg("text", {
      class: "threshold-label",
      x: M.left + innerW - 4, y: yT - 4, "text-anchor": "end",
    });
    thrLbl.textContent = `spike > ${SPIKE_THRESHOLD}`;
    root.appendChild(thrLbl);
  }

  // For a single run, draw the filled area underneath; for multiple runs
  // overlapping fills look muddy, so we only show lines + dots.
  const fillArea = plotted.length === 1;

  for (const { run, points } of plotted) {
    if (points.length === 0) continue;

    const pts = points.map((p) => `${xScale(p.idx)},${yScale(p.yPerp)}`);

    if (fillArea && pts.length >= 2) {
      const areaD =
        `M${xScale(0)},${M.top + innerH} ` +
        `L${pts.join(" L")} ` +
        `L${xScale(points.length - 1)},${M.top + innerH} Z`;
      const area = svg("path", { class: "area", d: areaD });
      area.style.fill = run.color;
      area.style.fillOpacity = "0.12";
      root.appendChild(area);
    }

    if (pts.length >= 2) {
      const line = svg("polyline", { class: "line", points: pts.join(" ") });
      line.style.stroke = run.color;
      root.appendChild(line);
    }

    points.forEach((p) => {
      const isLast = run.active && p.idx === points.length - 1;
      const highlightSpike = mode === "threshold" && p.isSpike;
      const r = isLast ? 5 : highlightSpike ? 4.5 : 3;
      const dot = svg("circle", {
        class: "dot" + (isLast ? " last" : "") + (highlightSpike ? " spike" : ""),
        cx: xScale(p.idx),
        cy: yScale(p.yPerp),
        r,
      });
      dot.style.fill = isLast ? "var(--accent-2)" : run.color;
      if (highlightSpike) {
        dot.style.stroke = "#ff5b5b";
        dot.style.strokeWidth = "2";
      }
      const tt = svg("title");
      const modeNote =
        mode === "rolling-max"
          ? ` (rolling max=${p.yPerp.toFixed(2)})`
          : "";
      tt.textContent =
        `Run ${run.id} (${run.model}) · token ${p.idx + 1}: ` +
        `${JSON.stringify(p.token)} — perplexity ${p.rawPerp.toFixed(2)}${modeNote}`;
      dot.appendChild(tt);
      root.appendChild(dot);
    });
  }

  perplexityPlotEl.appendChild(root);
};

// Side-by-side comparison of every aggregate the per-token series can carry.
// Highlights the best (lowest) and worst (highest) value per column so the
// reader can spot which run wins on which metric — useful when geo.mean lies
// to you about a localized spike in a long sequence.
const METRIC_COLS = [
  { key: "geoMean",      label: "geo.mean", fmt: (v) => v.toFixed(2) },
  { key: "arithMean",    label: "mean",     fmt: (v) => v.toFixed(2) },
  { key: "max",          label: "max",      fmt: (v) => v.toFixed(2) },
  { key: "p95",          label: "p95",      fmt: (v) => v.toFixed(2) },
  { key: "p99",          label: "p99",      fmt: (v) => v.toFixed(2) },
  { key: "spikeCount",   label: `spikes (>${SPIKE_THRESHOLD})`, fmt: (v) => String(v) },
  { key: "spikeDensity", label: "/100 tok", fmt: (v) => v.toFixed(1) },
];

const drawMetricsTable = () => {
  metricsTableEl.innerHTML = "";
  const visibleRuns = runs.filter((r) => r.visible && r.series.length > 0);
  if (visibleRuns.length === 0) {
    const empty = document.createElement("div");
    empty.className = "metrics-table-empty";
    empty.textContent = runs.length === 0
      ? "Metrics will appear here once a run produces tokens."
      : "No visible runs with tokens — toggle one on below.";
    metricsTableEl.appendChild(empty);
    return;
  }

  const rows = visibleRuns.map((r) => ({ run: r, m: computeRunMetrics(r.series) }));

  // Per-column min/max for best/worst highlighting. Only meaningful with ≥2 runs.
  const extremes = {};
  if (rows.length >= 2) {
    for (const col of METRIC_COLS) {
      let lo = Infinity, hi = -Infinity;
      for (const { m } of rows) {
        const v = m[col.key];
        if (v == null) continue;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      if (lo !== hi) extremes[col.key] = { lo, hi };
    }
  }

  const table = document.createElement("table");
  table.className = "metrics-table-grid";

  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  for (const h of ["Run", "Model", "tokens", ...METRIC_COLS.map((c) => c.label)]) {
    const th = document.createElement("th");
    th.textContent = h;
    hr.appendChild(th);
  }
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const { run, m } of rows) {
    const tr = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.className = "mt-run";
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = run.color;
    idCell.appendChild(sw);
    idCell.appendChild(document.createTextNode(`#${run.id}`));
    tr.appendChild(idCell);

    const modelCell = document.createElement("td");
    modelCell.className = "mt-model";
    modelCell.textContent = run.model;
    tr.appendChild(modelCell);

    const tokCell = document.createElement("td");
    tokCell.className = "mt-num";
    tokCell.textContent = String(m.count);
    tr.appendChild(tokCell);

    for (const col of METRIC_COLS) {
      const td = document.createElement("td");
      td.className = "mt-num";
      const v = m[col.key];
      if (v == null) {
        td.textContent = "—";
      } else {
        td.textContent = col.fmt(v);
        const ex = extremes[col.key];
        if (ex) {
          if (v === ex.lo) td.classList.add("best");
          else if (v === ex.hi) td.classList.add("worst");
        }
      }
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  metricsTableEl.appendChild(table);
};

const redrawMetrics = () => {
  drawPerplexityPlot();
  drawMetricsTable();
  drawRunsLegend();
};

const drawRunsLegend = () => {
  runsLegendEl.innerHTML = "";
  if (runs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "legend-empty";
    empty.textContent = "No runs yet. Click Generate to start collecting runs.";
    runsLegendEl.appendChild(empty);
    return;
  }

  // Header summarizing visible/hidden + bulk toggles.
  const visibleCount = runs.filter((r) => r.visible).length;
  const header = document.createElement("div");
  header.className = "legend-header";
  const summary = document.createElement("span");
  summary.textContent = `${visibleCount}/${runs.length} run${runs.length === 1 ? "" : "s"} visible`;
  header.appendChild(summary);
  const showAll = document.createElement("button");
  showAll.type = "button";
  showAll.className = "bulk-btn";
  showAll.textContent = "Show all";
  showAll.addEventListener("click", () => {
    for (const r of runs) r.visible = true;
    redrawMetrics();
  });
  const hideAll = document.createElement("button");
  hideAll.type = "button";
  hideAll.className = "bulk-btn";
  hideAll.textContent = "Hide all";
  hideAll.addEventListener("click", () => {
    for (const r of runs) r.visible = false;
    redrawMetrics();
  });
  header.appendChild(showAll);
  header.appendChild(hideAll);
  runsLegendEl.appendChild(header);

  for (const run of runs) {
    const item = document.createElement("div");
    item.className =
      "legend-item" +
      (run.active ? " active" : "") +
      (run.visible ? "" : " hidden");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "vis-toggle";
    cb.checked = run.visible;
    cb.title = run.visible ? "Hide on plot" : "Show on plot";
    cb.addEventListener("change", () => setRunVisibility(run, cb.checked));
    item.appendChild(cb);

    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = run.color;
    item.appendChild(sw);

    const label = document.createElement("span");
    label.className = "run-label";
    label.textContent = `Run ${run.id}`;
    item.appendChild(label);

    const model = document.createElement("span");
    model.className = "run-model";
    model.textContent = run.model;
    item.appendChild(model);

    const prompt = document.createElement("span");
    prompt.className = "run-prompt";
    prompt.title = run.prompt;
    if (run.scenarioLabel) {
      const tag = document.createElement("span");
      tag.className = "scenario-tag";
      tag.textContent = run.scenarioLabel;
      prompt.appendChild(tag);
      prompt.appendChild(document.createTextNode(`“${run.prompt}”`));
    } else {
      prompt.textContent = `“${run.prompt}”`;
    }
    item.appendChild(prompt);

    const m = computeRunMetrics(run.series);
    const perp = document.createElement("span");
    perp.className = "run-perp";
    perp.textContent =
      m.geoMean == null
        ? `${m.count} tokens`
        : `seq.perp = ${m.geoMean.toFixed(2)} · ${m.count} tokens`;
    item.appendChild(perp);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "run-delete";
    del.textContent = "×";
    del.title = "Delete this run";
    del.addEventListener("click", () => deleteRun(run));
    item.appendChild(del);

    runsLegendEl.appendChild(item);
  }
};

const startRun = (model, prompt, scenarioLabel = null) => {
  // Keep history; just toggle visibility per compare mode.
  for (const r of runs) {
    r.active = false;
    if (!compareModeEl.checked) r.visible = false;
  }
  const id = nextRunId++;
  currentRun = {
    id,
    model,
    prompt,
    scenarioLabel,
    color: colorForRunId(id),
    series: [],
    active: true,
    visible: true,
  };
  runs.push(currentRun);
  redrawMetrics();
};

const recordTokenForPerplexity = (tokenData) => {
  if (!currentRun) return;
  const perp = 1 / Math.max(tokenData.prob, 1e-12);
  currentRun.series.push({
    idx: currentRun.series.length,
    perp,
    token: tokenData.token,
  });
  // While fast-forwarding, skip the per-token plot rebuild — finishCurrentRun
  // calls redrawMetrics() once when the loop ends, which is enough.
  if (!fastForward) redrawMetrics();
};

const finishCurrentRun = () => {
  if (currentRun) currentRun.active = false;
  currentRun = null;
  redrawMetrics();
};

const clearAllRuns = () => {
  if (runs.length > 0 && !confirm(`Discard all ${runs.length} stored run(s)?`)) return;
  runs.length = 0;
  currentRun = null;
  nextRunId = 1;
  redrawMetrics();
};

const deleteRun = (run) => {
  const idx = runs.indexOf(run);
  if (idx < 0) return;
  runs.splice(idx, 1);
  if (currentRun === run) currentRun = null;
  redrawMetrics();
};

const setRunVisibility = (run, visible) => {
  run.visible = visible;
  redrawMetrics();
};

clearRunsBtn.addEventListener("click", clearAllRuns);
plotMetricEl.addEventListener("change", drawPerplexityPlot);

window.addEventListener("resize", () => drawPerplexityPlot());

const animateToken = async (tokenData, idx, total) => {
  tokenIdxEl.textContent = `token ${idx + 1} / ${total}`;
  await waitIfPaused();

  if (fastForward) {
    // Skip the slot-machine roll and the bar-growing animation entirely; just
    // record the result and yield so the response text can paint.
    appendTokenToResponse(tokenData.token);
    recordTokenForPerplexity(tokenData);
    await sleep(0);
    return;
  }

  const { rows, chosenIdx } = renderDistribution(tokenData.top, tokenData.token);

  // Brief pause so bars finish growing before the roll starts.
  await sleep(180);
  await waitIfPaused();

  await rollAnimation(rows, chosenIdx);

  // Append the actually-sampled token to the response and update the plot.
  appendTokenToResponse(tokenData.token);
  recordTokenForPerplexity(tokenData);

  // Hold a beat before the next token.
  await sleep(420);
};

const reset = () => {
  responseEl.innerHTML = '<span class="caret">▌</span>';
  distEl.innerHTML = '<div class="placeholder">Click Generate to start.</div>';
  stripEl.innerHTML = "";
  stripMarkerEl.innerHTML = "";
  entropyTextEl.textContent = "H = — bits";
  tokenIdxEl.textContent = "";
  lastRenderedTop = null;
  lastSampledToken = null;
  // Note: perplexity runs are NOT cleared here. They're managed by
  // startRun (which obeys compare-mode) and the explicit Clear runs button.
  redrawMetrics();
};

// Chip factories per category. Each returns a freshly-built <button> for one
// example; the unified renderer below decides when (which tab is active).

const renderPromptChip = (preset) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `preset-chip ${preset.tag}`;
  const tag = document.createElement("span");
  tag.className = "chip-tag";
  tag.textContent = preset.tag === "high" ? "high-H" : "low-H";
  btn.appendChild(tag);
  btn.appendChild(document.createTextNode(preset.label));
  btn.title = preset.prompt;
  btn.addEventListener("click", () => {
    clearActiveScenario();
    messageEl.value = preset.prompt;
    messageEl.focus();
  });
  return btn;
};

const renderPuzzleChip = (pz) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "preset-chip puzzle";
  const tag = document.createElement("span");
  tag.className = "chip-tag";
  tag.textContent = pz.lang;
  btn.appendChild(tag);
  btn.appendChild(document.createTextNode(pz.label));
  btn.title = pz.prompt.slice(0, 140) + "…";
  btn.addEventListener("click", () => {
    clearActiveScenario();
    messageEl.value = pz.prompt;
    messageEl.focus();
  });
  return btn;
};

// ────────── Chatbot scenario state + UI ──────────
let activeScenario = null;
const scenarioChipEls = new Map(); // id → button

const renderScenarioContext = (scenario) => {
  if (!scenario) {
    scenarioContextEl.hidden = true;
    return;
  }
  scenarioContextEl.hidden = false;
  ctxSummaryMetaEl.textContent =
    ` · ${scenario.sysVariant} system · ${scenario.history.length} prior turns`;

  ctxSystemEl.innerHTML = "";
  const sysRole = document.createElement("span");
  sysRole.className = "ctx-role";
  sysRole.textContent = "system";
  const sysBody = document.createElement("span");
  sysBody.className = "ctx-content";
  sysBody.textContent = scenario.system;
  ctxSystemEl.appendChild(sysRole);
  ctxSystemEl.appendChild(sysBody);

  ctxHistoryEl.innerHTML = "";
  for (const turn of scenario.history) {
    const t = document.createElement("div");
    t.className = "ctx-turn " + turn.role;
    const role = document.createElement("span");
    role.className = "ctx-role";
    role.textContent = turn.role;
    const body = document.createElement("span");
    body.className = "ctx-content";
    body.textContent = turn.content;
    t.appendChild(role);
    t.appendChild(body);
    ctxHistoryEl.appendChild(t);
  }

  ctxMessageEl.innerHTML = "";
  const qRole = document.createElement("span");
  qRole.className = "ctx-role";
  qRole.textContent = "queued user →";
  const qBody = document.createElement("span");
  qBody.className = "ctx-content";
  qBody.textContent = scenario.message;
  ctxMessageEl.appendChild(qRole);
  ctxMessageEl.appendChild(qBody);
};

const setActiveScenario = (scenario) => {
  activeScenario = scenario;
  for (const [id, el] of scenarioChipEls) {
    el.classList.toggle("active", id === scenario.id);
  }
  messageEl.value = scenario.message;
  renderScenarioContext(scenario);
  scenarioContextEl.open = true;
};

const clearActiveScenario = () => {
  if (!activeScenario) return;
  activeScenario = null;
  for (const el of scenarioChipEls.values()) el.classList.remove("active");
  renderScenarioContext(null);
};

const renderChatbotChip = (sc) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `preset-chip chatbot ${sc.sysVariant}`;
  btn.title = `${sc.sysVariant} system prompt · ${sc.history.length} turns of history`;

  const axes = document.createElement("span");
  axes.className = "chip-axes";
  const axSys = document.createElement("span");
  axSys.className = `ax-sys ${sc.sysVariant}`;
  axSys.textContent = sc.sysVariant === "compact" ? "S" : "S+";
  const axHist = document.createElement("span");
  axHist.className = "ax-hist";
  axHist.textContent = sc.histVariant === "short" ? "▪" : "▪▪▪";
  axes.appendChild(axSys);
  axes.appendChild(axHist);
  btn.appendChild(axes);
  btn.appendChild(document.createTextNode(sc.label));

  if (activeScenario && activeScenario.id === sc.id) btn.classList.add("active");
  btn.addEventListener("click", () => setActiveScenario(sc));
  scenarioChipEls.set(sc.id, btn);
  return btn;
};

// Single registry + tab switcher. Re-rendering chips on every tab change is
// cheap and keeps the "which chatbot chip is active" outline correct without
// special-case bookkeeping.
const CATEGORIES = [
  { id: "prompts", items: PRESETS,           render: renderPromptChip  },
  { id: "chatbot", items: CHATBOT_SCENARIOS, render: renderChatbotChip },
  { id: "puzzles", items: PUZZLES,           render: renderPuzzleChip  },
];

const showCategory = (catId) => {
  for (const t of examplesTabsEl.querySelectorAll(".ex-tab")) {
    t.classList.toggle("active", t.dataset.cat === catId);
  }
  examplesChipsEl.innerHTML = "";
  // Chatbot chip nodes are tracked by id for the "active" outline. Old nodes
  // become detached on tab switch — drop the map so we never style stale ones.
  scenarioChipEls.clear();
  const cat = CATEGORIES.find((c) => c.id === catId);
  if (!cat) return;
  for (const item of cat.items) examplesChipsEl.appendChild(cat.render(item));
};

examplesTabsEl.addEventListener("click", (e) => {
  const t = e.target.closest(".ex-tab");
  if (t && t.dataset.cat) showCategory(t.dataset.cat);
});
showCategory("prompts");

// Manual edits to the textarea drop the active scenario so we don't ship
// a bloated context with a freely-typed message.
messageEl.addEventListener("input", () => {
  if (activeScenario && messageEl.value !== activeScenario.message) {
    clearActiveScenario();
  }
});

const setBusy = (busy) => {
  generateBtn.disabled = busy;
  messageEl.disabled = busy;
  pauseBtn.disabled = !busy;
  stepBtn.disabled = true; // only enabled while paused
  fastForwardBtn.disabled = !busy;
  fastForwardBtn.textContent = "⏭ Skip anim";
  if (busy) {
    // Reset fast-forward at the start of each run; it's a one-shot flag.
    fastForward = false;
  } else {
    paused = false;
    pauseBtn.textContent = "Pause";
    fastForward = false;
  }
};

const generate = async () => {
  const message = messageEl.value.trim();
  if (!message) return;

  const apiKey = apiKeyEl.value.trim();
  if (!serverHasKey) {
    if (!apiKey) {
      setStatus("Paste an OpenAI API key to generate.", true);
      apiKeyEl.focus();
      return;
    }
    saveApiKey(apiKey);
    updateApiKeyStatus();
  }

  reset();
  setBusy(true);
  setStatus("Calling model…");

  const model = modelEl.value;
  const scenario = activeScenario;
  startRun(model, message, scenario ? scenario.label : null);

  try {
    const maxTokens = Math.max(1, parseInt(maxTokensEl.value, 10) || 1000);
    const requestBody = { message, maxTokens, model };
    if (!serverHasKey) requestBody.apiKey = apiKey;
    if (scenario) {
      requestBody.system = scenario.system;
      requestBody.history = scenario.history;
    }
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data && data.needsClientKey) setServerHasKey(false);
      setStatus(data.error ?? `HTTP ${res.status}`, true);
      // Drop the empty run so the legend isn't littered with failed attempts.
      const idx = runs.indexOf(currentRun);
      if (idx >= 0) runs.splice(idx, 1);
      finishCurrentRun();
      setBusy(false);
      return;
    }
    const tokens = data.tokens ?? [];
    if (tokens.length === 0) {
      setStatus("Model returned no tokens.", true);
      finishCurrentRun();
      setBusy(false);
      return;
    }
    // Server may pick a different model than requested; reflect what we got.
    if (currentRun && data.model) currentRun.model = data.model;
    setStatus(`Animating ${tokens.length} tokens…`);
    distEl.innerHTML = "";
    for (let i = 0; i < tokens.length; i++) {
      await animateToken(tokens[i], i, tokens.length);
    }
    appendEndToken();
    setStatus(`Done. Sampled ${tokens.length} tokens with model ${data.model}.`);
    finishCurrentRun();
  } catch (err) {
    setStatus(err?.message ?? String(err), true);
    finishCurrentRun();
  } finally {
    setBusy(false);
  }
};

generateBtn.addEventListener("click", generate);
messageEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
});

// ────────── Screen recording (one panel at a time) ──────────
// Browsers don't expose a "capture this DOM element" stream for arbitrary
// elements (only <canvas> and <video>), so we use getDisplayMedia. The user
// picks what to share (tab/window/screen) and we save the result as .webm.
// Each Record button passes a filename prefix so the saved file is
// self-describing.
const recordButtons = {
  perp: $("#record-perp"),
  dist: $("#record-dist"),
};
let activeRecording = null; // { recorder, stream, chunks, button, originalLabel, otherButton }

const stopRecording = () => {
  if (!activeRecording) return;
  const r = activeRecording;
  if (r.recorder.state !== "inactive") r.recorder.stop();
  for (const t of r.stream.getTracks()) t.stop();
};

const startRecording = async (button, otherButton, filenamePrefix) => {
  if (activeRecording) {
    stopRecording();
    return;
  }
  if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === "undefined") {
    setStatus("Screen recording is not supported in this browser.", true);
    return;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: false,
    });
  } catch {
    // User cancelled the picker — silently bail.
    return;
  }

  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const mime = candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
  const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks = [];
  recorder.addEventListener("dataavailable", (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });
  recorder.addEventListener("stop", () => {
    const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.href = url;
    a.download = `${filenamePrefix}-${ts}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);

    button.textContent = activeRecording.originalLabel;
    button.classList.remove("recording");
    if (activeRecording.otherButton) activeRecording.otherButton.disabled = false;
    setStatus(`Saved ${a.download} (${(blob.size / 1024 / 1024).toFixed(1)} MB).`);
    activeRecording = null;
  });

  // If the user clicks "Stop sharing" in the browser bar, end gracefully.
  for (const t of stream.getTracks()) {
    t.addEventListener("ended", () => {
      if (recorder.state !== "inactive") recorder.stop();
    });
  }

  activeRecording = {
    recorder,
    stream,
    chunks,
    button,
    originalLabel: button.textContent,
    otherButton,
  };
  recorder.start(250); // collect chunks every 250ms
  button.textContent = "■ Stop & save";
  button.classList.add("recording");
  if (otherButton) otherButton.disabled = true;
  setStatus("Recording… click again to stop and save.");
};

recordButtons.perp.addEventListener("click", () =>
  startRecording(recordButtons.perp, recordButtons.dist, "perplexity"),
);
recordButtons.dist.addEventListener("click", () =>
  startRecording(recordButtons.dist, recordButtons.perp, "token-distribution"),
);

// ────────── GIF recorder (prompt + response continuation) ──────────
// Renders the prompt and the response onto a 2D canvas with our own text
// layout (no DOM rasterization — that gave blurry, unstyled output) and
// encodes a real .gif via the vendored `gifenc` library. One frame per
// appended token + a held end frame after <|endoftext|>.
//
// Toggling "Include prompt" off skips the prompt zone — useful when you
// only want the response itself in the GIF.
const recordResponseBtn = $("#record-response");
const includePromptEl = $("#include-prompt");

const INCLUDE_PROMPT_STORAGE = "demoLogits.includePrompt";
try {
  const saved = localStorage.getItem(INCLUDE_PROMPT_STORAGE);
  if (saved !== null) includePromptEl.checked = saved === "1";
} catch {}
includePromptEl.addEventListener("change", () => {
  try {
    localStorage.setItem(INCLUDE_PROMPT_STORAGE, includePromptEl.checked ? "1" : "0");
  } catch {}
});

// Canvas geometry — fixed width, height grows in line increments.
const GIF_WIDTH = 720;
const GIF_PADDING = 24;
const GIF_LINE_HEIGHT = 28; // 16px font * 1.7-ish
const GIF_FONT = '16px ui-monospace, Menlo, Consolas, "Liberation Mono", monospace';
const GIF_SMALL_FONT = '12px ui-monospace, Menlo, Consolas, "Liberation Mono", monospace';
const GIF_FRAME_DELAY_MS = 140;
const GIF_END_HOLD_MS = 1000;

const readCssVar = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

// Resolve a CSS variable to a concrete CSS color string the canvas accepts.
// rgba() with CSS-variable values doesn't render on canvas, so we fall back
// to hardcoded ones that match the dark theme.
const gifColors = () => ({
  bg: readCssVar("--bg", "#0f1115"),
  panel: readCssVar("--panel", "#181b22"),
  border: readCssVar("--border", "#262a33"),
  text: readCssVar("--text", "#e6e8ee"),
  muted: readCssVar("--muted", "#8a93a6"),
  accent: readCssVar("--accent", "#ffd166"),
  highlight: "rgba(255, 209, 102, 0.22)",
});

// Word-wrap helper: returns an array of lines for the given text, breaking
// only at whitespace where possible but force-breaking very long words.
const wrapText = (ctx, text, maxWidth) => {
  const out = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph.length === 0) { out.push(""); continue; }
    let line = "";
    const words = paragraph.split(/(\s+)/); // keep separators
    for (const w of words) {
      const candidate = line + w;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else if (line.length > 0) {
        out.push(line.replace(/\s+$/, ""));
        line = w.replace(/^\s+/, "");
      } else {
        // Single token wider than the line — hard-break character-by-character.
        let buf = "";
        for (const ch of w) {
          if (ctx.measureText(buf + ch).width > maxWidth && buf.length > 0) {
            out.push(buf);
            buf = ch;
          } else {
            buf += ch;
          }
        }
        line = buf;
      }
    }
    out.push(line);
  }
  return out;
};

// Lays out prompt + response into lines, given current state.
const layoutGifFrame = (ctx, state) => {
  const { promptText, responseTokens, includePrompt, endTokenShown } = state;
  const innerW = GIF_WIDTH - GIF_PADDING * 2;
  const blocks = [];

  if (includePrompt && promptText) {
    ctx.font = GIF_SMALL_FONT;
    blocks.push({ kind: "label", text: "Prompt" });
    ctx.font = GIF_FONT;
    for (const line of wrapText(ctx, promptText, innerW)) {
      blocks.push({ kind: "prompt", text: line });
    }
    blocks.push({ kind: "divider" });
    blocks.push({ kind: "label", text: "Response" });
  }

  // Response: concatenate all tokens (preserving whitespace), wrap to width.
  // We want to keep track of which line/range contains the *last* token so
  // we can highlight it. Build the full text first, remember the offset of
  // each token, then map offsets to wrapped (line, x-range).
  const fullText = responseTokens.join("");
  ctx.font = GIF_FONT;
  const lines = wrapText(ctx, fullText || " ", innerW);
  for (const line of lines) {
    blocks.push({ kind: "response", text: line });
  }
  if (endTokenShown) {
    blocks.push({ kind: "end-token", text: "<|endoftext|>" });
  }
  return blocks;
};

const measureCanvasHeight = (blocks) => {
  let h = GIF_PADDING;
  for (const b of blocks) {
    if (b.kind === "label") h += 18;
    else if (b.kind === "divider") h += 16;
    else h += GIF_LINE_HEIGHT;
  }
  h += GIF_PADDING;
  return Math.max(120, h);
};

const drawGifFrame = (canvas, ctx, state, forcedHeight) => {
  const colors = gifColors();
  const blocks = layoutGifFrame(ctx, state);
  const newHeight = forcedHeight ?? measureCanvasHeight(blocks);
  if (canvas.height !== newHeight) canvas.height = newHeight;
  // Background.
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Panel.
  ctx.fillStyle = colors.panel;
  const r = 12;
  const px = GIF_PADDING / 2;
  const py = GIF_PADDING / 2;
  const pw = canvas.width - GIF_PADDING;
  const ph = canvas.height - GIF_PADDING;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath(); ctx.roundRect(px, py, pw, ph, r); ctx.fill();
  } else {
    ctx.fillRect(px, py, pw, ph);
  }
  // Border.
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath(); ctx.roundRect(px + 0.5, py + 0.5, pw - 1, ph - 1, r); ctx.stroke();
  } else {
    ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  }

  let y = GIF_PADDING;
  ctx.textBaseline = "top";
  for (const b of blocks) {
    if (b.kind === "label") {
      ctx.font = GIF_SMALL_FONT;
      ctx.fillStyle = colors.muted;
      ctx.fillText(b.text.toUpperCase(), GIF_PADDING, y);
      y += 18;
    } else if (b.kind === "divider") {
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(GIF_PADDING, y + 6);
      ctx.lineTo(canvas.width - GIF_PADDING, y + 6);
      ctx.stroke();
      y += 16;
    } else if (b.kind === "prompt") {
      ctx.font = GIF_FONT;
      ctx.fillStyle = colors.text;
      ctx.fillText(b.text, GIF_PADDING, y);
      y += GIF_LINE_HEIGHT;
    } else if (b.kind === "response") {
      ctx.font = GIF_FONT;
      ctx.fillStyle = colors.text;
      ctx.fillText(b.text, GIF_PADDING, y);
      y += GIF_LINE_HEIGHT;
    } else if (b.kind === "end-token") {
      ctx.font = GIF_FONT;
      const tw = ctx.measureText(b.text).width;
      const bx = GIF_PADDING;
      const by = y + 2;
      const bw = tw + 12;
      const bh = GIF_LINE_HEIGHT - 4;
      // Dashed border.
      ctx.save();
      ctx.strokeStyle = colors.muted;
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.restore();
      ctx.fillStyle = colors.muted;
      ctx.fillText(b.text, bx + 6, y + 4);
      y += GIF_LINE_HEIGHT;
    }
  }

  // Blinking caret if generation isn't finished.
  if (!state.endTokenShown && state.responseTokens.length > 0) {
    ctx.font = GIF_FONT;
    const lastLine = blocks.filter((b) => b.kind === "response").slice(-1)[0];
    if (lastLine) {
      const lineY = y - GIF_LINE_HEIGHT;
      const lineWidth = ctx.measureText(lastLine.text).width;
      ctx.fillStyle = colors.accent;
      ctx.fillText("▌", GIF_PADDING + lineWidth, lineY);
    }
  }
};

// `gifenc` writes the logical-screen size from the first frame and clips
// every subsequent frame to it. So we can't stream tokens directly — we
// buffer per-token snapshots (just counts + flags, not pixels) and do the
// actual encoding in one pass on finalize, at the *final* max canvas
// height. That way every frame fits the last frame's layout.
let gifRecording = null;

const stopGifRecording = (canceled = false) => {
  if (!gifRecording) return;
  if (canceled) {
    recordResponseBtn.textContent = gifRecording.originalLabel;
    recordResponseBtn.classList.remove("recording");
    setStatus("GIF recording canceled.");
    gifRecording = null;
    return;
  }
  gifRecording.finalize();
};

const startGifRecording = async () => {
  if (gifRecording) {
    stopGifRecording(true);
    return;
  }
  const gifenc = window.__gifenc;
  if (!gifenc || !gifenc.GIFEncoder) {
    setStatus("GIF encoder not loaded yet — try again in a moment.", true);
    return;
  }

  const state = {
    promptText: messageEl.value.trim(),
    responseTokens: [],
    includePrompt: includePromptEl.checked,
    endTokenShown: false,
  };
  // Each entry is `{ count, endTokenShown, delay }` — a cheap snapshot of
  // the response state at the moment the event fired.
  const snapshots = [];

  const pushSnapshot = (delayMs) => {
    snapshots.push({
      count: state.responseTokens.length,
      endTokenShown: state.endTokenShown,
      delay: delayMs,
    });
  };

  // Initial frame so the GIF starts with the prompt visible.
  pushSnapshot(GIF_FRAME_DELAY_MS);

  const finalize = async () => {
    if (!gifRecording) return;
    setStatus("Encoding GIF…");
    // Yield once so the status update paints before the heavy work.
    await new Promise((r) => requestAnimationFrame(() => r()));

    // Pre-size the canvas to the final layout's height so every frame
    // shares the same logical-screen size.
    const canvas = document.createElement("canvas");
    canvas.width = GIF_WIDTH;
    const tmpCtx = canvas.getContext("2d");
    drawGifFrame(canvas, tmpCtx, state); // sets canvas.height to final height
    const finalHeight = canvas.height;

    const encoder = gifenc.GIFEncoder();
    const renderState = {
      promptText: state.promptText,
      responseTokens: state.responseTokens,
      includePrompt: state.includePrompt,
      endTokenShown: false,
      _visibleCount: 0,
    };

    // Append a 1-second hold of the last frame so the GIF doesn't loop back
    // the instant it lands on <|endoftext|>.
    if (snapshots.length > 0) {
      const last = snapshots[snapshots.length - 1];
      snapshots.push({ count: last.count, endTokenShown: last.endTokenShown, delay: GIF_END_HOLD_MS });
    }

    for (let i = 0; i < snapshots.length; i++) {
      const snap = snapshots[i];
      // Slice the response to only the tokens that had been emitted at
      // this snapshot — same final height applies to every frame.
      renderState.responseTokens = state.responseTokens.slice(0, snap.count);
      renderState.endTokenShown = snap.endTokenShown;
      drawGifFrame(canvas, tmpCtx, renderState, finalHeight);
      const { data, width, height } = tmpCtx.getImageData(0, 0, canvas.width, canvas.height);
      const palette = gifenc.quantize(data, 64);
      const indexed = gifenc.applyPalette(data, palette);
      encoder.writeFrame(indexed, width, height, { palette, delay: snap.delay });
      // Yield every 10 frames so the UI thread stays responsive on long runs.
      if ((i + 1) % 10 === 0) {
        setStatus(`Encoding GIF… ${i + 1}/${snapshots.length}`);
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    encoder.finish();
    const blob = new Blob([encoder.bytes()], { type: "image/gif" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.href = url;
    a.download = `response-${ts}.gif`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    recordResponseBtn.textContent = gifRecording.originalLabel;
    recordResponseBtn.classList.remove("recording");
    setStatus(`Saved ${a.download} (${(blob.size / 1024).toFixed(0)} KB, ${snapshots.length} frames).`);
    gifRecording = null;
  };

  gifRecording = {
    state,
    snapshots,
    pushSnapshot,
    finalize,
    originalLabel: recordResponseBtn.textContent,
  };
  recordResponseBtn.textContent = "■ Stop";
  recordResponseBtn.classList.add("recording");
  setStatus("Recording GIF… auto-stops after <|endoftext|>.");
};

document.addEventListener("response-token-appended", (e) => {
  if (!gifRecording) return;
  const tok = e.detail && typeof e.detail.token === "string" ? e.detail.token : "";
  gifRecording.state.responseTokens.push(tok);
  gifRecording.pushSnapshot(GIF_FRAME_DELAY_MS);
});

document.addEventListener("response-end-token", () => {
  if (!gifRecording) return;
  gifRecording.state.endTokenShown = true;
  gifRecording.pushSnapshot(GIF_FRAME_DELAY_MS);
  gifRecording.finalize();
});

recordResponseBtn.addEventListener("click", startGifRecording);

reset();
