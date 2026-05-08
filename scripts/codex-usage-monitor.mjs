import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const sessionsDir = path.join(codexHome, "sessions");
const now = Date.now();
const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".jsonl")) out.push(full);
  }
  return out;
}

function parseJsonLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function newer(a, b) {
  if (!b) return true;
  return Date.parse(a.at ?? 0) > Date.parse(b.at ?? 0);
}

const files = walk(sessionsDir)
  .map((file) => ({ file, stat: fs.statSync(file) }))
  .filter(({ stat }) => stat.mtimeMs >= sevenDaysAgo)
  .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

const modelCounts = new Map();
const tokenTotalsByModel = new Map();
let latestRate = null;
let latestUsage = null;
let sessionCount = 0;

for (const { file } of files) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  let sessionModel = "unknown";
  let lastUsage = null;

  for (const line of lines) {
    const item = parseJsonLine(line);
    if (!item) continue;

    if (item.type === "session_meta") {
      sessionModel = item.payload?.model ?? item.payload?.collaboration_mode?.settings?.model ?? sessionModel;
    }

    if (item.type === "turn_context") {
      sessionModel = item.payload?.model ?? item.payload?.collaboration_mode?.settings?.model ?? sessionModel;
    }

    if (item.type === "event_msg" && item.payload?.type === "token_count") {
      if (item.payload.rate_limits) {
        const candidate = { at: item.timestamp, ...item.payload.rate_limits };
        if (newer(candidate, latestRate)) latestRate = candidate;
      }
      const usage = item.payload.info?.total_token_usage ?? item.payload.info?.last_token_usage;
      if (usage) {
        const candidate = { at: item.timestamp, usage };
        lastUsage = candidate;
        if (newer(candidate, latestUsage)) latestUsage = candidate;
      }
    }
  }

  sessionCount += 1;
  modelCounts.set(sessionModel, (modelCounts.get(sessionModel) ?? 0) + 1);
  if (lastUsage) {
    const usage = lastUsage.usage;
    const prev = tokenTotalsByModel.get(sessionModel) ?? { input: 0, output: 0, reasoning: 0, total: 0 };
    tokenTotalsByModel.set(sessionModel, {
      input: prev.input + (usage.input_tokens ?? 0),
      output: prev.output + (usage.output_tokens ?? 0),
      reasoning: prev.reasoning + (usage.reasoning_output_tokens ?? 0),
      total: prev.total + (usage.total_tokens ?? 0),
    });
  }
}

function pct(value) {
  if (typeof value !== "number") return "unknown";
  return `${value.toFixed(1).replace(/\.0$/, "")}%`;
}

function fmtReset(seconds) {
  if (!seconds) return "unknown";
  const ms = seconds * 1000;
  const date = new Date(ms);
  const hours = Math.max(0, (ms - now) / 3_600_000);
  return `${date.toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })} Brisbane (${hours.toFixed(1)}h)`;
}

const weekly = latestRate?.secondary;
const shortWindow = latestRate?.primary;
const weeklyUsed = weekly?.used_percent;
let recommendation = "No live rate-limit telemetry found. Run a tiny Codex probe, then rerun this monitor.";

if (typeof weeklyUsed === "number") {
  const weeklyResetMs = (weekly.resets_at ?? 0) * 1000;
  const hoursLeft = Math.max(0, (weeklyResetMs - now) / 3_600_000);
  if (weeklyUsed < 35 && hoursLeft > 72) recommendation = "Use heavier build sessions now. Keep gpt-5.5 for owner reasoning; delegate docs/QA/copy to gpt-5.4-mini.";
  else if (weeklyUsed < 80 && hoursLeft <= 24) recommendation = "Allowance is likely underused near reset. Burn down safe backlog: tests, docs, copy polish, QA, issue triage.";
  else if (weeklyUsed > 90) recommendation = "Conserve premium reasoning. Use gpt-5.5 only for production-critical work until reset.";
  else if (weeklyUsed > 75 && hoursLeft > 24) recommendation = "Throttle xhigh exploration. Batch questions and route repetitive work to gpt-5.4-mini.";
  else recommendation = "Balanced mode. Use gpt-5.5 for owner review/hard reasoning, gpt-5.4 for coding, gpt-5.4-mini for repetitive QA/docs.";
}

console.log("Codex Usage Monitor");
console.log("===================");
console.log(`Codex home: ${codexHome}`);
console.log(`Sessions scanned, last 7d: ${sessionCount}`);
console.log("");
console.log("Rate limits");
console.log(`- Latest telemetry: ${latestRate?.at ?? "none"}`);
console.log(`- Short window used: ${pct(shortWindow?.used_percent)} reset: ${fmtReset(shortWindow?.resets_at)}`);
console.log(`- Weekly used: ${pct(weekly?.used_percent)} reset: ${fmtReset(weekly?.resets_at)}`);
console.log(`- Plan: ${latestRate?.plan_type ?? "unknown"}`);
console.log("");
console.log("Model sessions");
for (const [model, count] of [...modelCounts].sort((a, b) => b[1] - a[1])) {
  const tokens = tokenTotalsByModel.get(model);
  const tokenText = tokens ? `, final observed tokens=${tokens.total.toLocaleString()}` : "";
  console.log(`- ${model}: ${count}${tokenText}`);
}
console.log("");
console.log("Recommendation");
console.log(`- ${recommendation}`);
console.log("");
console.log("Known live model routing");
console.log("- hard owner reasoning: gpt-5.5 high/xhigh");
console.log("- normal coding: gpt-5.4 medium/high");
console.log("- repetitive QA/docs/copy: gpt-5.4-mini low/medium");
console.log("- unavailable in latest probe: gpt-5.5-mini, gpt-5.5-pro, gpt-5.4-pro");
