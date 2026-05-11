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


const $ = (sel) => document.querySelector(sel);
const messageEl = $("#message");
const generateBtn = $("#generate");
const pauseBtn = $("#pause");
const stepBtn = $("#step");
const speedEl = $("#speed");
const speedValEl = $("#speed-val");
const rollLengthEl = $("#roll-length");
const tempEl = $("#temperature");
const tempValEl = $("#temperature-val");
const stripEl = $("#strip");
const stripMarkerEl = $("#strip-marker");
const entropyTextEl = $("#entropy-text");
const presetsEl = $("#presets");
const chatbotPresetsEl = $("#chatbot-presets");
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
const statusEl = $("#status");
const responseEl = $("#response");
const distEl = $("#dist");
const tokenIdxEl = $("#token-idx");

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
pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  stepBtn.disabled = !paused;
});
stepBtn.addEventListener("click", () => {
  if (paused) stepOnce = true;
});

const setStatus = (msg, isErr = false) => {
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", isErr);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms / speed));

// Pause if requested. While paused, wait until resumed OR a single step is requested.
const waitIfPaused = async () => {
  while (paused) {
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

const computeSeqPerp = (series) => {
  if (series.length === 0) return null;
  const sumNegLog = series.reduce((a, p) => a + Math.log(p.perp), 0);
  return Math.exp(sumNegLog / series.length);
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

  const W = perplexityPlotEl.clientWidth || 800;
  const H = 200;
  const M = { top: 12, right: 16, bottom: 28, left: 44 };
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;

  const root = svg("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" });

  // Y range — log scale clipped to [1, max(20, dataMax)].
  let dataMax = 1;
  for (const r of visibleRuns) for (const p of r.series) if (p.perp > dataMax) dataMax = p.perp;
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

  // For a single run, draw the filled area underneath; for multiple runs
  // overlapping fills look muddy, so we only show lines + dots.
  const fillArea = visibleRuns.length === 1;

  for (const run of visibleRuns) {
    if (run.series.length === 0) continue;

    const pts = run.series.map((p, i) => `${xScale(i)},${yScale(p.perp)}`);

    if (fillArea && pts.length >= 2) {
      const areaD =
        `M${xScale(0)},${M.top + innerH} ` +
        `L${pts.join(" L")} ` +
        `L${xScale(run.series.length - 1)},${M.top + innerH} Z`;
      const area = svg("path", { class: "area", d: areaD });
      // Inline style overrides the CSS class default — needed so per-run
      // colors actually win over the .area rule.
      area.style.fill = run.color;
      area.style.fillOpacity = "0.12";
      root.appendChild(area);
    }

    if (pts.length >= 2) {
      const line = svg("polyline", { class: "line", points: pts.join(" ") });
      line.style.stroke = run.color;
      root.appendChild(line);
    }

    run.series.forEach((p, i) => {
      const isLast = run.active && i === run.series.length - 1;
      const dot = svg("circle", {
        class: "dot" + (isLast ? " last" : ""),
        cx: xScale(i),
        cy: yScale(p.perp),
        r: isLast ? 5 : 3,
      });
      dot.style.fill = isLast ? "var(--accent-2)" : run.color;
      const tt = svg("title");
      tt.textContent = `Run ${run.id} (${run.model}) · token ${i + 1}: ${JSON.stringify(p.token)} — perplexity ${p.perp.toFixed(2)}`;
      dot.appendChild(tt);
      root.appendChild(dot);
    });
  }

  perplexityPlotEl.appendChild(root);
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
    drawPerplexityPlot();
    drawRunsLegend();
  });
  const hideAll = document.createElement("button");
  hideAll.type = "button";
  hideAll.className = "bulk-btn";
  hideAll.textContent = "Hide all";
  hideAll.addEventListener("click", () => {
    for (const r of runs) r.visible = false;
    drawPerplexityPlot();
    drawRunsLegend();
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

    const seqPerp = computeSeqPerp(run.series);
    const perp = document.createElement("span");
    perp.className = "run-perp";
    perp.textContent =
      seqPerp == null
        ? `${run.series.length} tokens`
        : `seq.perp = ${seqPerp.toFixed(2)} · ${run.series.length} tokens`;
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
  drawPerplexityPlot();
  drawRunsLegend();
};

const recordTokenForPerplexity = (tokenData) => {
  if (!currentRun) return;
  const perp = 1 / Math.max(tokenData.prob, 1e-12);
  currentRun.series.push({
    idx: currentRun.series.length,
    perp,
    token: tokenData.token,
  });
  drawPerplexityPlot();
  drawRunsLegend();
};

const finishCurrentRun = () => {
  if (currentRun) currentRun.active = false;
  currentRun = null;
  drawPerplexityPlot();
  drawRunsLegend();
};

const clearAllRuns = () => {
  if (runs.length > 0 && !confirm(`Discard all ${runs.length} stored run(s)?`)) return;
  runs.length = 0;
  currentRun = null;
  nextRunId = 1;
  drawPerplexityPlot();
  drawRunsLegend();
};

const deleteRun = (run) => {
  const idx = runs.indexOf(run);
  if (idx < 0) return;
  runs.splice(idx, 1);
  if (currentRun === run) currentRun = null;
  drawPerplexityPlot();
  drawRunsLegend();
};

const setRunVisibility = (run, visible) => {
  run.visible = visible;
  drawPerplexityPlot();
  drawRunsLegend();
};

clearRunsBtn.addEventListener("click", clearAllRuns);

window.addEventListener("resize", () => drawPerplexityPlot());

const animateToken = async (tokenData, idx, total) => {
  tokenIdxEl.textContent = `token ${idx + 1} / ${total}`;
  await waitIfPaused();

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
  drawPerplexityPlot();
  drawRunsLegend();
};

const renderPresetChips = () => {
  for (const preset of PRESETS) {
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
    presetsEl.appendChild(btn);
  }
};
renderPresetChips();

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

const renderChatbotChips = () => {
  for (const sc of CHATBOT_SCENARIOS) {
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

    btn.addEventListener("click", () => setActiveScenario(sc));
    scenarioChipEls.set(sc.id, btn);
    chatbotPresetsEl.appendChild(btn);
  }
};
renderChatbotChips();

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
  if (!busy) {
    paused = false;
    pauseBtn.textContent = "Pause";
  }
};

const generate = async () => {
  const message = messageEl.value.trim();
  if (!message) return;
  reset();
  setBusy(true);
  setStatus("Calling model…");

  const model = modelEl.value;
  const scenario = activeScenario;
  startRun(model, message, scenario ? scenario.label : null);

  try {
    const maxTokens = Math.max(1, parseInt(maxTokensEl.value, 10) || 1000);
    const requestBody = { message, maxTokens, model };
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

reset();
