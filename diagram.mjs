// Draw a student's OWN system as an Excalidraw board.
// Given their chain (source → trigger → steps → action), this emits an .excalidraw
// file they can open on excalidraw.com or the VS Code Excalidraw extension.
//
// Claude Code calls this during the DESIGN step so the student sees a diagram of the
// exact system they're building — not a generic teaching board.
//
//   import { systemBoard } from "./diagram.mjs";
//   systemBoard({ name, triggerType, source, steps, action, verify }, "diagrams/my-system.excalidraw");
//
// Or run it directly to generate the example: `node diagram.mjs`

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const INK = "#1f2430", MUTED = "#6b7280", LINE = "#e6e8eb";
const BLUE = "#2f6fed", BLUE_INK = "#1e4fb0", BLUE_BG = "#eef4fe", BLUE_BORDER = "#cfe0fb";
const GREY_BG = "#f4f6f9", TERRA_INK = "#a8482e", ARROW = "#b7bec9";
const SANS = 2, MONO = 3;

let _id = 0;
const nid = (t) => `${t}-${++_id}`;
const seed = () => Math.floor(Math.random() * 2 ** 31);
const base = (x) => ({
  id: nid(x.type || "el"), x: 0, y: 0, width: 100, height: 50, angle: 0,
  strokeColor: INK, backgroundColor: "transparent", fillStyle: "solid", strokeWidth: 1,
  strokeStyle: "solid", roughness: 0, opacity: 100, groupIds: [], frameId: null, roundness: null,
  seed: seed(), versionNonce: seed(), isDeleted: false, boundElements: [], updated: Date.now(),
  link: null, locked: false, ...x,
});
const rect = (x, y, w, h, o = {}) => base({ type: "rectangle", x, y, width: w, height: h, roundness: { type: 3 }, ...o });
const arrow = (x, y, pts, o = {}) => base({
  type: "arrow", x, y,
  width: Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0])), height: 0,
  points: pts, lastCommittedPoint: null, startBinding: null, endBinding: null,
  startArrowhead: null, endArrowhead: "arrow", ...o,
});
const text = (x, y, t, o = {}) => {
  const fs = o.fontSize || 16;
  const lines = String(t).split("\n");
  return base({
    type: "text", x, y, width: o.width || Math.max(...lines.map((l) => l.length)) * fs * 0.55,
    height: lines.length * fs * 1.25, text: String(t), fontSize: fs, fontFamily: o.fontFamily || SANS,
    textAlign: o.textAlign || "left", verticalAlign: "top", baseline: Math.floor(fs * 0.85),
    containerId: null, originalText: String(t), lineHeight: 1.25, strokeColor: o.strokeColor || INK, ...o,
  });
};

function writeBoard(outPath, elements) {
  writeFileSync(outPath, JSON.stringify({
    type: "excalidraw", version: 2, source: "https://excalidraw.com",
    elements, appState: { gridSize: null, viewBackgroundColor: "#ffffff" }, files: {},
  }, null, 2));
  console.log(`OK ${outPath} (${elements.length} elements)`);
}

/**
 * Draw one system's chain.
 * @param {{name:string, triggerType:"scheduled"|"event", source:string, steps:string[], action:string, verify?:string}} system
 * @param {string} outPath  e.g. "diagrams/my-system.excalidraw"
 */
export function systemBoard(system, outPath) {
  const el = [];
  const X0 = 120, Y = 220, nodeW = 220, nodeH = 100, gap = 74;

  el.push(text(X0, 96, system.name || "System", { fontSize: 28, strokeColor: INK }));
  el.push(text(X0, 138, `${(system.triggerType || "event").toUpperCase()} · FIXED SYSTEM`, { fontSize: 13, fontFamily: MONO, strokeColor: MUTED }));

  const nodes = [
    { label: "SOURCE", val: system.source || "source", kind: "io" },
    { label: "TRIGGER", val: system.triggerType === "scheduled" ? "on a schedule" : "webhook → receiver", kind: "trigger" },
    ...(system.steps || []).map((s, i) => ({ label: `STEP ${i + 1}`, val: s, kind: "step" })),
    { label: "ACTION", val: system.action || "action", kind: "io" },
  ];

  let x = X0;
  nodes.forEach((n, i) => {
    const bg = n.kind === "io" ? GREY_BG : n.kind === "trigger" ? BLUE_BG : "#ffffff";
    const bd = n.kind === "trigger" ? BLUE_BORDER : LINE;
    el.push(rect(x, Y, nodeW, nodeH, { backgroundColor: bg, strokeColor: bd, strokeWidth: 1 }));
    el.push(text(x + 16, Y + 14, n.label, { fontSize: 10, fontFamily: MONO, strokeColor: n.kind === "trigger" ? BLUE_INK : MUTED, width: nodeW - 32 }));
    el.push(text(x + 16, Y + 38, n.val, { fontSize: 13, strokeColor: INK, width: nodeW - 32 }));
    if (i < nodes.length - 1) el.push(arrow(x + nodeW + 12, Y + nodeH / 2, [[0, 0], [gap - 24, 0]], { strokeColor: ARROW, strokeWidth: 1.5, endArrowhead: "arrow" }));
    x += nodeW + gap;
  });

  if (system.triggerType !== "scheduled" && system.verify) {
    el.push(text(X0 + nodeW + gap, Y + nodeH + 18, `↑ receiver verifies: ${system.verify}  ·  then triggers the task`, { fontSize: 12, strokeColor: TERRA_INK, width: 520 }));
  }
  el.push(text(X0, Y + nodeH + 70, "Fixed system: you designed the steps; the system runs them.", { fontSize: 13, strokeColor: MUTED }));

  writeBoard(outPath, el);
}

// Run directly → generate the reference example.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const HERE = dirname(fileURLToPath(import.meta.url));
  systemBoard(
    {
      name: "Pre-call research",
      triggerType: "event",
      source: "Cal.com booking",
      steps: ["wait until 1h before call", "research the company", "write the brief"],
      action: "email the rep",
      verify: "Cal.com signature",
    },
    join(HERE, "diagrams", "example-system.excalidraw"),
  );
}
