import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from "recharts";

/* ============================================================
   ISMMS / ASCEND — Clerkship LCME Monitoring Dashboard
   Source: AY clerkship evaluation dashboards (8 clerkships)
   ============================================================ */

const INK = "#0B1F3A";        // deep navy
const INK_SOFT = "#3B4F6B";
const PAPER = "#F4F6FA";
const CARD = "#FFFFFF";
const LINE = "#E2E7F0";
const MAGENTA = "#C5299B";
const CYAN = "#0E9BB8";

// RAG palette (kept distinct from brand hues)
const GREEN = "#1F9D6B";
const AMBER = "#D9901A";
const RED = "#D1495B";
const GREEN_BG = "#E6F4EE";
const AMBER_BG = "#FBF1DF";
const RED_BG = "#F8E4E7";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ---- LCME element model -------------------------------------------------- */
const ELEMENTS = [
  {
    id: "9.7", code: "9.7", title: "Formative Assessment & Feedback",
    scope: "program",
    blurb: "Mid-clerkship feedback delivered, useful for reflection, and tied to the Clinical Performance Evaluation form.",
    metrics: [
      { key: "fbReceived", label: "Received mid-clerkship feedback" },
      { key: "fbHelpful", label: "Feedback helped reflection" },
      { key: "fbCPE", label: "Feedback tied to CPE form" },
    ],
  },
  {
    id: "9.4", code: "9.4", title: "Direct Observation of Clinical Skills",
    scope: "program",
    blurb: "Students directly observed performing core clinical skills (assessment system requirement).",
    metrics: [
      { key: "obsHx", label: "Observed taking history" },
      { key: "obsExam", label: "Observed physical / mental status exam" },
    ],
  },
  {
    id: "9.3", code: "9.3", title: "Clinical Supervision",
    scope: "site",
    blurb: "Appropriate supervision and supervisor availability, monitored at each clinical site.",
    metrics: [
      { key: "supervision", label: "Appropriate supervision" },
      { key: "availability", label: "Supervisor available when needed" },
    ],
  },
  {
    id: "3.5", code: "3.5", title: "Learning Environment / Professionalism",
    scope: "site",
    blurb: "Residents and attendings modeling professional behavior with patients, monitored at each site.",
    metrics: [
      { key: "listened", label: "Listened / showed interest in patients" },
      { key: "respect", label: "Respected patient dignity & autonomy" },
      { key: "explain", label: "Took time to explain to patients" },
    ],
  },
].sort((a, b) => parseFloat(a.code) - parseFloat(b.code)); // columns ordered by element number

const SITE_KEYS = ["supervision", "availability", "listened", "respect", "explain"];

/* ---- Data (current-year YTD % vs prior-year YTD %) ----------------------- */
// p() program metric: [current, prior].  Sites carry n (current YTD) for weighting.
const DATA = [
  {
    name: "Inpatient Medicine", short: "MED", year: "2025-26", periods: "Rotations 1–2 reported",
    overall: { fbReceived: [97,96], fbHelpful: [98,90], fbCPE: [78,76], obsHx:[100,100], obsExam:[100,100] },
    sites: [
      { name:"Elmhurst", n:29, supervision:[100,93], availability:[100,91], listened:[93,90], respect:[89,88], explain:[89,84] },
      { name:"Mount Sinai", n:73, supervision:[99,100], availability:[99,100], listened:[100,93], respect:[100,95], explain:[100,89] },
      { name:"MS Morningside", n:26, supervision:[100,95], availability:[100,95], listened:[100,73], respect:[100,77], explain:[100,73] },
      { name:"MS West", n:17, supervision:[100,100], availability:[100,100], listened:[100,88], respect:[100,94], explain:[100,88] },
    ],
  },
  {
    name: "Surgery-Anesthesiology", short: "SURG", year: "2025-26", periods: "Rotations 1–2 reported",
    overall: { fbReceived:[78,91], fbHelpful:[74,89], fbCPE:[52,69], obsHx:[94,95], obsExam:[95,96] },
    sites: [
      { name:"Elmhurst", n:17, supervision:[94,91], availability:[82,95], listened:[76,64], respect:[76,64], explain:[65,59] },
      { name:"Mount Sinai", n:19, supervision:[100,98], availability:[100,97], listened:[68,90], respect:[68,65], explain:[68,89] },
      { name:"MS West", n:15, supervision:[93,100], availability:[93,100], listened:[93,81], respect:[100,85], explain:[93,77] },
    ],
  },
  {
    name: "Pediatrics", short: "PEDS", year: "2025-26", periods: "Rotations 1–2 reported",
    overall: { fbReceived:[94,99], fbHelpful:[94,93], fbCPE:[70,80], obsHx:[97,99], obsExam:[95,100] },
    sites: [
      { name:"Elmhurst", n:6, supervision:[67,100], availability:[67,100], listened:[67,71], respect:[67,100], explain:[83,71] },
      { name:"Mount Sinai", n:46, supervision:[93,99], availability:[91,99], listened:[91,89], respect:[89,92], explain:[89,91] },
    ],
  },
  {
    name: "OB/GYN", short: "OBGYN", year: "2025-26", periods: "Rotations 1–2 reported",
    overall: { fbReceived:[99,95], fbHelpful:[92,88], fbCPE:[82,80], obsHx:[99,99], obsExam:[99,99] },
    sites: [
      { name:"Elmhurst", n:11, supervision:[91,83], availability:[91,87], listened:[91,78], respect:[100,74], explain:[91,87] },
      { name:"Mount Sinai", n:37, supervision:[89,84], availability:[86,84], listened:[92,71], respect:[92,68], explain:[81,63] },
      { name:"MS West", n:24, supervision:[96,94], availability:[88,91], listened:[75,84], respect:[75,84], explain:[75,81] },
    ],
  },
  {
    name: "Neurology", short: "NEURO", year: "2025-26", periods: "Rotations 1–2 reported",
    overall: { fbReceived:[97,97], fbHelpful:[96,94], fbCPE:[73,81], obsHx:[100,98], obsExam:[100,98] },
    sites: [
      { name:"Elmhurst", n:7, supervision:[86,100], availability:[86,100], listened:[100,100], respect:[100,100], explain:[100,100] },
      { name:"Mount Sinai", n:18, supervision:[94,100], availability:[94,100], listened:[100,92], respect:[100,88], explain:[100,88] },
      { name:"MS West", n:15, supervision:[100,100], availability:[100,100], listened:[100,100], respect:[100,96], explain:[93,92] },
      { name:"Bronx VA", n:7, supervision:[100,100], availability:[100,100], listened:[71,90], respect:[86,100], explain:[86,90] },
      { name:"MS Morningside", n:16, supervision:[100,81], availability:[100,81], listened:[100,88], respect:[100,94], explain:[100,94] },
      { name:"MSQ/MSH", n:8, supervision:[88,100], availability:[88,100], listened:[88,89], respect:[88,89], explain:[88,89] },
    ],
  },
  {
    name: "Psychiatry", short: "PSYCH", year: "2025-26", periods: "Rotations 1–2 reported",
    overall: { fbReceived:[99,99], fbHelpful:[97,99], fbCPE:[65,67], obsHx:[99,100], obsExam:[100,100] },
    sites: [
      { name:"Mount Sinai", n:28, supervision:[100,97], availability:[100,97], listened:[89,89], respect:[93,89], explain:[82,89] },
      { name:"MS West", n:3, supervision:[100,100], availability:[100,100], listened:[100,100], respect:[100,100], explain:[100,92] },
      { name:"MS Morningside", n:18, supervision:[100,93], availability:[100,100], listened:[83,93], respect:[83,93], explain:[89,93] },
      { name:"Behavioral Health Ctr", n:18, supervision:[89,100], availability:[89,100], listened:[94,100], respect:[89,100], explain:[94,100] },
    ],
  },
  {
    name: "Emergency Medicine", short: "EM", year: "2025-26", periods: "Rotations 1–2 reported",
    overall: { fbReceived:[100,97], fbHelpful:[100,95], fbCPE:[91,85], obsHx:[91,82], obsExam:[91,80] },
    sites: [
      { name:"Elmhurst", n:5, supervision:[100,94], availability:[100,94], listened:[80,78], respect:[80,78], explain:[80,83] },
      { name:"Mount Sinai", n:8, supervision:[75,94], availability:[100,97], listened:[63,79], respect:[63,88], explain:[25,58] },
      { name:"MS Queens", n:7, supervision:[100,100], availability:[100,100], listened:[100,100], respect:[100,100], explain:[100,100] },
      { name:"MSM/MSW", n:28, supervision:[71,93], availability:[86,93], listened:[86,50], respect:[86,71], explain:[71,71] },
    ],
  },
  {
    name: "ACC–Geriatrics", short: "ACC-GERI", year: "2024-25", periods: "Modules 1–4 (complete)",
    overall: { fbReceived:[95,95], fbHelpful:[98,99], fbCPE:[80,86], obsHx:[100,99], obsExam:[100,99] },
    sites: [
      { name:"All Sites Combined", n:168, supervision:[97,98], availability:[95,96], listened:[98,95], respect:[98,96], explain:[96,93] },
    ],
  },
].sort((a, b) => a.name.localeCompare(b.name)); // clerkships listed alphabetically

/* ---- multi-year history (program-level elements, from 9.4 & 9.7 summaries) -
   Source: Element 9.4 / 9.7 summary tables, AY2021-22 → AY2025-26 (YTD Jul 2025–Jan 2026).
   Keyed by clerkship .name; null = not reported that year. EM is not in the summary set. */
const YEARS = ["2021-22", "2022-23", "2023-24", "2024-25", "2025-26"];
const HIST = {
  fbReceived: {
    "ACC–Geriatrics": [90, 96, 95, 100, null],
    "Inpatient Medicine": [98, 97, 94, 96, 97],
    "Neurology": [97, 95, 96, 97, 97],
    "OB/GYN": [96, 100, 97, 95, 99],
    "Pediatrics": [94, 93, 99, 99, 94],
    "Psychiatry": [97, 94, 98, 99, 99],
    "Surgery-Anesthesiology": [98, 92, 92, 91, 79],
  },
  fbHelpful: {
    "ACC–Geriatrics": [90, 99, 99, 98, null],
    "Inpatient Medicine": [91, 100, 94, 90, 98],
    "Neurology": [90, 95, 91, 94, 96],
    "OB/GYN": [83, 91, 85, 88, 92],
    "Pediatrics": [85, 90, 93, 93, 94],
    "Psychiatry": [92, 98, 96, 99, 97],
    "Surgery-Anesthesiology": [89, 96, 99, 89, 74],
  },
  fbCPE: {
    "ACC–Geriatrics": [72, 96, 95, 100, null],
    "Inpatient Medicine": [75, 72, 74, 76, 78],
    "Neurology": [72, 74, 74, 81, 73],
    "OB/GYN": [70, 76, 83, 80, 82],
    "Pediatrics": [69, 79, 80, 65, 67],
    "Psychiatry": [97, 63, 68, 99, 99],
    "Surgery-Anesthesiology": [70, 68, 74, 69, 52],
  },
  obsHx: {
    "ACC–Geriatrics": [96, 96, 99, 100, null],
    "Inpatient Medicine": [97, 99, 95, 100, 100],
    "Neurology": [94, 98, 99, 98, 98],
    "OB/GYN": [98, 96, 99, 99, 99],
    "Pediatrics": [99, 100, 100, 99, 99],
    "Psychiatry": [98, 100, 99, 100, 100],
    "Surgery-Anesthesiology": [95, 97, 99, 95, 95],
  },
  obsExam: {
    "ACC–Geriatrics": [99, 97, 99, 100, null],
    "Inpatient Medicine": [97, 99, 95, 100, 100],
    "Neurology": [99, 98, 100, 98, 98],
    "OB/GYN": [99, 98, 98, 99, 99],
    "Pediatrics": [98, 100, 100, 100, 100],
    "Psychiatry": [98, 100, 100, 100, 100],
    "Surgery-Anesthesiology": [96, 96, 97, 96, 96],
  },
};

const TREND_METRICS = [
  { key: "fbReceived", el: "9.7", label: "Received mid-clerkship feedback" },
  { key: "fbHelpful", el: "9.7", label: "Feedback helped reflection" },
  { key: "fbCPE", el: "9.7", label: "Feedback tied to CPE form" },
  { key: "obsHx", el: "9.4", label: "Observed taking history" },
  { key: "obsExam", el: "9.4", label: "Observed physical / mental status exam" },
];

const LINE_COLORS = [INK, MAGENTA, CYAN, "#E0823C", "#7A4FB5", "#1F9D6B", "#C0344E"];

// AAMC Graduation Questionnaire — "provided with mid-clerkship feedback? %Yes"
// ISMMS graduates by discipline 2021–2025, with national 2025 comparator.
const GQ_YEARS = ["2021", "2022", "2023", "2024", "2025"];
const GQ = [
  { disc: "Family medicine", vals: [96.7, 98.3, 94.7, 98.9, 100], natl: 97.5 },
  { disc: "Internal medicine", vals: [97.5, 100, 95.3, 100, 100], natl: 99.0 },
  { disc: "Neurology", vals: [96.7, 97.6, 99.1, 98.0, 100], natl: 94.3 },
  { disc: "OB/GYN Women's Health", vals: [95.1, 95.2, 94.4, 98.0, 100], natl: 96.4 },
  { disc: "Pediatrics", vals: [95.9, 98.4, 98.1, 99.0, 100], natl: 98.3 },
  { disc: "Psychiatry", vals: [95.1, 96.8, 98.1, 99.0, 98.8], natl: 97.6 },
  { disc: "Surgery", vals: [89.3, 96.0, 96.3, 98.0, 96.5], natl: 95.7 },
];

/* ---- per-rotation NUMERATOR counts + rotation n (from source dashboards) ----
   Program rates: fbReceived/obsHx/obsExam over n; fbHelpful/fbCPE over fbReceived.
   Site rates: over the site's rotation n. null = rotation not reported. */
const ROT = {"Inpatient Medicine": {"labels": ["MOD 1", "MOD 2"], "n": [41, 36], "program": {"fbReceived": [39, 35], "fbHelpful": [38, 35], "fbCPE": [32, 29], "obsHx": [41, 36], "obsExam": [41, 36]}, "sites": {"Elmhurst": {"n": [18, 10], "supervision": [18, 10], "availability": [18, 10], "listened": [16, 10], "respect": [16, 9], "explain": [15, 10]}, "Mount Sinai": {"n": [45, 28], "supervision": [44, 28], "availability": [44, 28], "listened": [42, 25], "respect": [43, 26], "explain": [42, 24]}, "MS Morningside": {"n": [15, 12], "supervision": [14, 11], "availability": [14, 11], "listened": [12, 8], "respect": [11, 8], "explain": [10, 8]}, "MS West": {"n": [12, 7], "supervision": [12, 7], "availability": [12, 7], "listened": [12, 7], "respect": [12, 7], "explain": [12, 7]}}}, "Surgery-Anesthesiology": {"labels": ["MOD 1", "MOD 2"], "n": [39, 24], "program": {"fbReceived": [31, 21], "fbHelpful": [30, 17], "fbCPE": [20, 13], "obsHx": [37, 23], "obsExam": [37, 24]}, "sites": {"Elmhurst": {"n": [10, 4], "supervision": [9, 4], "availability": [8, 3], "listened": [7, 3], "respect": [7, 3], "explain": [5, 3]}, "Mount Sinai": {"n": [33, 9], "supervision": [32, 9], "availability": [32, 9], "listened": [30, 9], "respect": [30, 9], "explain": [30, 9]}, "MS West": {"n": [1, 7], "supervision": [1, 6], "availability": [1, 6], "listened": [1, 6], "respect": [1, 6], "explain": [1, 6]}}}, "Pediatrics": {"labels": ["MOD 1", "MOD 2"], "n": [38, 33], "program": {"fbReceived": [38, 33], "fbHelpful": [35, 30], "fbCPE": [25, 23], "obsHx": [38, 32], "obsExam": [37, 32]}, "sites": {"Elmhurst": {"n": [3, 2], "supervision": [3, 2], "availability": [3, 2], "listened": [3, 2], "respect": [3, 2], "explain": [3, 2]}, "Mount Sinai": {"n": [25, 25], "supervision": [23, 23], "availability": [23, 23], "listened": [23, 23], "respect": [22, 22], "explain": [22, 22]}}}, "OB/GYN": {"labels": ["MOD 1", "MOD 2"], "n": [48, 29], "program": {"fbReceived": [48, 29], "fbHelpful": [45, 26], "fbCPE": [39, 22], "obsHx": [47, 29], "obsExam": [47, 29]}, "sites": {"Elmhurst": {"n": [8, 3], "supervision": [7, 3], "availability": [7, 3], "listened": [7, 2], "respect": [8, 3], "explain": [8, 3]}, "Mount Sinai": {"n": [24, 15], "supervision": [20, 15], "availability": [20, 15], "listened": [21, 15], "respect": [21, 15], "explain": [17, 15]}, "MS West": {"n": [15, 11], "supervision": [15, 11], "availability": [13, 10], "listened": [11, 11], "respect": [11, 9], "explain": [12, 9]}}}, "Neurology": {"labels": ["MOD 1", "MOD 2"], "n": [42, 27], "program": {"fbReceived": [41, 27], "fbHelpful": [39, 27], "fbCPE": [29, 21], "obsHx": [42, 27], "obsExam": [42, 27]}, "sites": {"Elmhurst": {"n": [6, 3], "supervision": [5, 3], "availability": [5, 3], "listened": [3, 3], "respect": [3, 3], "explain": [2, 2]}, "Mount Sinai": {"n": [11, 7], "supervision": [11, 6], "availability": [11, 6], "listened": [11, 7], "respect": [11, 7], "explain": [11, 7]}, "MS West": {"n": [9, 7], "supervision": [9, 7], "availability": [9, 7], "listened": [9, 7], "respect": [9, 7], "explain": [8, 7]}, "Bronx VA": {"n": [4, 3], "supervision": [4, 3], "availability": [4, 3], "listened": [2, 3], "respect": [3, 3], "explain": [3, 3]}, "MS Morningside": {"n": [8, 6], "supervision": [8, 6], "availability": [8, 6], "listened": [8, 6], "respect": [8, 6], "explain": [8, 6]}, "MSQ/MSH": {"n": [5, 3], "supervision": [5, 3], "availability": [5, 3], "listened": [5, 3], "respect": [5, 3], "explain": [5, 3]}}}, "Psychiatry": {"labels": ["MOD 1", "MOD 2"], "n": [44, 31], "program": {"fbReceived": [43, 30], "fbHelpful": [31, 31], "fbCPE": [31, 18], "obsHx": [43, 31], "obsExam": [44, 31]}, "sites": {"Mount Sinai": {"n": [17, 11], "supervision": [17, 11], "availability": [17, 11], "listened": [16, 9], "respect": [17, 10], "explain": [15, 8]}, "MS West": {"n": [2, null], "supervision": [2, null], "availability": [2, null], "listened": [2, null], "respect": [2, null], "explain": [2, null]}, "MS Morningside": {"n": [11, 7], "supervision": [11, 7], "availability": [11, 7], "listened": [9, 6], "respect": [9, 6], "explain": [10, 6]}, "Behavioral Health Ctr": {"n": [10, 9], "supervision": [10, 7], "availability": [10, 7], "listened": [10, 8], "respect": [10, 7], "explain": [10, 8]}}}, "Emergency Medicine": {"labels": ["Jul\u2013Sep", "Oct\u2013Dec"], "n": [13, 20], "program": {"fbReceived": [13, 20], "fbHelpful": [13, 20], "fbCPE": [12, 18], "obsHx": [11, 19], "obsExam": [11, 19]}, "sites": {"Elmhurst": {"n": [1, 4], "supervision": [1, 4], "availability": [1, 4], "listened": [1, 3], "respect": [1, 3], "explain": [1, 3]}, "Mount Sinai": {"n": [4, 4], "supervision": [3, 3], "availability": [4, 4], "listened": [2, 3], "respect": [2, 3], "explain": [1, 1]}, "MS Queens": {"n": [4, 4], "supervision": [4, 4], "availability": [4, 4], "listened": [4, 4], "respect": [4, 4], "explain": [4, 4]}, "MSM/MSW": {"n": [5, 9], "supervision": [3, 7], "availability": [4, 8], "listened": [4, 8], "respect": [4, 8], "explain": [3, 7]}}}, "ACC\u2013Geriatrics": {"labels": ["MOD 1", "MOD 2", "MOD 3", "MOD 4"], "n": [31, 17, 22, 16], "program": {"fbReceived": [30, 16, 21, 15], "fbHelpful": [28, 15, 22, 15], "fbCPE": [26, 11, 18, 11], "obsHx": [31, 17, 22, 16], "obsExam": [31, 17, 22, 16]}, "sites": {"All Sites Combined": {"n": [51, 35, 46, 36], "supervision": [49, 32, 46, 36], "availability": [49, 29, 45, 36], "listened": [51, 35, 45, 34], "respect": [50, 35, 45, 34], "explain": [51, 33, 44, 34]}}}};

/* ---- scoring helpers ----------------------------------------------------- */
// n-weighted mean of a site metric across a clerkship's sites, for year idx (0 cur / 1 prior)
function siteMetricMean(c, key, idx) {
  let num = 0, den = 0;
  c.sites.forEach((s) => {
    if (s[key] && typeof s[key][idx] === "number") { num += s[key][idx] * s.n; den += s.n; }
  });
  return den ? num / den : null;
}

// element score for a clerkship, year idx — mean of its constituent metrics
function elementScore(c, el, idx) {
  const vals = el.metrics.map((m) =>
    el.scope === "program" ? c.overall[m.key]?.[idx] : siteMetricMean(c, m.key, idx)
  ).filter((v) => typeof v === "number");
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function ragOf(v, bench) {
  if (v == null) return "na";
  if (v >= bench) return "green";
  if (v >= bench - 10) return "amber";
  return "red";
}
const RAG_FG = { green: GREEN, amber: AMBER, red: RED, na: "#9AA6B8" };
const RAG_BG = { green: GREEN_BG, amber: AMBER_BG, red: RED_BG, na: "#EEF1F6" };

function Delta({ v }) {
  if (v == null) return <span style={{ color: "#9AA6B8" }}>—</span>;
  const r = Math.round(v);
  if (r === 0) return <span style={{ color: INK_SOFT }}>±0</span>;
  const up = r > 0;
  return (
    <span style={{ color: up ? GREEN : RED, fontWeight: 600 }}>
      {up ? "▲" : "▼"} {Math.abs(r)}
    </span>
  );
}

function Sparkline({ data, bench, w = 92, h = 26 }) {
  const pts = data.map((v, i) => ({ v, i })).filter((p) => typeof p.v === "number");
  if (pts.length < 2) return <span style={{ color: "#9AA6B8", fontSize: 11 }}>—</span>;
  const min = Math.min(80, ...pts.map((p) => p.v)) - 2;
  const max = 100;
  const x = (i) => (i / (data.length - 1)) * (w - 4) + 2;
  const y = (v) => h - 3 - ((v - min) / (max - min)) * (h - 6);
  const path = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const lc = ragOf(last.v, bench);
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <line x1={2} x2={w - 2} y1={y(bench)} y2={y(bench)} stroke={INK} strokeOpacity={0.25} strokeDasharray="2 2" />
      <path d={path} fill="none" stroke={INK_SOFT} strokeWidth={1.6} strokeLinejoin="round" />
      <circle cx={x(last.i)} cy={y(last.v)} r={2.8} fill={RAG_FG[lc]} />
    </svg>
  );
}


/* ========================================================================== */
export default function App() {
  const [bench, setBench] = useState(90);
  const [view, setView] = useState("matrix");
  const [selected, setSelected] = useState(null); // clerkship name
  const [trendKey, setTrendKey] = useState("fbReceived");
  const [history, setHistory] = useState([]); // navigation stack of {view, selected}

  const sel = DATA.find((d) => d.name === selected) || null;

  // navigate forward, recording where we came from
  const go = (nextView, nextSelected = selected) => {
    setHistory((h) => [...h, { view, selected }]);
    setView(nextView);
    setSelected(nextSelected);
  };
  // step back to the previous state (or home to the matrix)
  const back = () => {
    if (history.length) {
      const prev = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setView(prev.view);
      setSelected(prev.selected);
    } else {
      setView("matrix");
      setSelected(null);
    }
  };
  const canBack = history.length > 0 || view !== "matrix" || selected != null;
  // reset to the default landing view
  const home = () => { setHistory([]); setView("matrix"); setSelected(null); };
  const atHome = view === "matrix" && selected == null && history.length === 0;

  // ---- KPI rollups
  const kpis = useMemo(() => {
    let red = 0, amber = 0, cells = 0, declined = 0;
    DATA.forEach((c) => ELEMENTS.forEach((el) => {
      const cur = elementScore(c, el, 0), prior = elementScore(c, el, 1);
      if (cur == null) return;
      cells++;
      const r = ragOf(cur, bench);
      if (r === "red") red++; else if (r === "amber") amber++;
      if (prior != null && cur - prior <= -3) declined++;
    }));
    return { red, amber, cells, declined };
  }, [bench]);

  return (
    <div style={{ background: PAPER, minHeight: "100%", fontFamily: FONT, color: INK, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; max-width: 100%; overflow-x: hidden; }
        .scrollx { overflow-x: auto; max-width: 100%; -webkit-overflow-scrolling: touch; }
        .stick { position: sticky; left: 0; z-index: 1; background: #fff; box-shadow: 1px 0 0 ${LINE}; }
        .stickh { position: sticky; left: 0; z-index: 2; background: #F7F9FD; box-shadow: 1px 0 0 ${LINE}; }
        .row-click:hover .stick { background: #F0F4FB; }
        .tab { cursor:pointer; padding:8px 14px; border-radius:999px; font-size:13px; font-weight:600;
               letter-spacing:.02em; border:1px solid transparent; transition:all .15s; white-space:nowrap;}
        .tab:hover { background:#EDF1F8; }
        .row-click { cursor:pointer; transition:background .12s; }
        .row-click:hover { background:#F0F4FB !important; }
        input[type=range]{ -webkit-appearance:none; height:4px; border-radius:4px;
            background:linear-gradient(90deg, ${CYAN}, ${MAGENTA}); outline:none; }
        input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:18px; height:18px;
            border-radius:50%; background:#fff; border:3px solid ${INK}; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,.2);}
        .pill { font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
        .px { padding-left:28px; padding-right:28px; }
        .backbtn { display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:none;
            background:#13294B; color:#fff; font-weight:600; font-size:13px; font-family:inherit;
            padding:8px 14px; border-radius:999px; transition:background .15s; }
        .backbtn:hover { background:#1d3a64; }
        .backbtn:disabled { opacity:.35; cursor:not-allowed; }
        .h-title { font-size:26px; }
        .banner-name { font-size:27px; }
        @media (max-width:640px) {
          .px { padding-left:14px; padding-right:14px; }
          .h-title { font-size:20px; }
          .banner-name { font-size:21px; }
        }
      `}</style>

      {/* ===== Header ===== */}
      <div className="px" style={{ background: INK, color: "#fff", paddingTop: 22, paddingBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 260px" }}>
            <div className="pill" style={{ color: CYAN, marginBottom: 6 }}>
              ASCEND · Office of Curricular Affairs
            </div>
            <div className="h-title" style={{ fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
              Clerkship LCME Monitoring Dashboard
            </div>
            <div style={{ color: "#A9BAD6", fontSize: 13, marginTop: 6 }}>
              Direct observation, feedback, supervision &amp; learning environment across required clerkships
            </div>
          </div>
          {/* benchmark control */}
          <div style={{ background: "#13294B", borderRadius: 12, padding: "12px 16px", flex: "1 1 240px", maxWidth: 340 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#A9BAD6", marginBottom: 8 }}>
              <span className="pill" style={{ letterSpacing: ".05em" }}>Monitoring benchmark</span>
              <span style={{ color: "#fff", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{bench}%</span>
            </div>
            <input type="range" min={70} max={100} value={bench} style={{ width: "100%" }}
              onChange={(e) => setBench(Number(e.target.value))} />
            <div style={{ display: "flex", gap: 12, marginTop: 9, fontSize: 11, color: "#A9BAD6", flexWrap: "wrap" }}>
              <Legend c={GREEN} t={`Meets (≥${bench})`} />
              <Legend c={AMBER} t={`Watch (${bench - 10}–${bench - 1})`} />
              <Legend c={RED} t={`Flag (<${bench - 10})`} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== KPI strip ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%, 160px),1fr))", gap: 1, background: LINE }}>
        <Kpi label="Clerkships monitored" value={DATA.length} sub="required rotations" />
        <Kpi label="LCME element scores" value={kpis.cells} sub="clerkship × element cells" />
        <Kpi label="Flagged at benchmark" value={kpis.red} sub={`below ${bench - 10}%`} accent={kpis.red ? RED : GREEN} />
        <Kpi label="On watch" value={kpis.amber} sub={`${bench - 10}–${bench - 1}%`} accent={kpis.amber ? AMBER : GREEN} />
        <Kpi label="Declining vs prior yr" value={kpis.declined} sub="≥3 pts lower YoY" accent={kpis.declined ? AMBER : GREEN} />
      </div>

      {/* ===== Nav: home + back + tabs ===== */}
      <div className="px" style={{ display: "flex", gap: 8, paddingTop: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button className="backbtn" onClick={home} disabled={atHome} aria-label="Go to home view"
          style={{ background: atHome ? "#13294B" : INK }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>⌂</span> Home
        </button>
        <button className="backbtn" onClick={back} disabled={!canBack} aria-label="Go back">
          <span style={{ fontSize: 15, lineHeight: 1 }}>‹</span> Back
        </button>
        <div style={{ width: 1, alignSelf: "stretch", background: LINE, margin: "2px 2px" }} />
        {[
          ["matrix", "Monitoring Matrix"],
          ["elements", "LCME Elements"],
          ["sites", "Site Detail"],
          ["rotation", "By Rotation"],
          ["comparability", "Site Comparability"],
          ["trends", "Multi-Year Trends"],
          ["benchmark", "National Benchmark"],
        ].map(([id, lbl]) => (
          <div key={id} className="tab" onClick={() => view !== id && go(id)}
            style={view === id
              ? { background: INK, color: "#fff" }
              : { background: CARD, color: INK_SOFT, border: `1px solid ${LINE}` }}>
            {lbl}
          </div>
        ))}
      </div>

      {/* ===== Now-viewing banner (clerkship-specific views) ===== */}
      {sel && (view === "elements" || view === "sites" || view === "rotation") && (() => {
        const VIEW_LABELS = { elements: "LCME elements", sites: "Site detail", rotation: "By rotation" };
        const others = ["elements", "sites", "rotation"].filter((v) => v !== view);
        return (
        <div className="px" style={{ paddingTop: 14 }}>
          <div style={{
            background: CARD, borderRadius: 12, borderLeft: `6px solid ${MAGENTA}`,
            boxShadow: "0 1px 3px rgba(11,31,58,.08)", padding: "14px 18px",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap",
          }}>
            <div style={{ minWidth: 0 }}>
              <div className="pill" style={{ color: MAGENTA, fontSize: 10.5 }}>Now viewing · {VIEW_LABELS[view]}</div>
              <div className="banner-name" style={{ fontWeight: 800, color: INK, lineHeight: 1.1, marginTop: 3 }}>
                {sel.name} Clerkship
              </div>
              <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 3 }}>
                {sel.year} · {sel.periods} · {sel.sites.length} clinical {sel.sites.length === 1 ? "site" : "sites"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {others.map((v) => (
                <div key={v} className="tab" onClick={() => go(v)} style={{ background: "#F0F4FB", color: INK }}>
                  {VIEW_LABELS[v]} →
                </div>
              ))}
              <div className="tab" onClick={() => go(view, null)} style={{ background: CARD, color: MAGENTA, border: `1px solid ${LINE}` }}>
                Change clerkship
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      <div className="px" style={{ paddingTop: 16, paddingBottom: 36 }}>
        {view === "matrix" && <Matrix bench={bench} onPick={(n) => go("elements", n)} />}
        {view === "elements" && <Elements sel={sel} bench={bench} onPick={(n) => go("elements", n)} />}
        {view === "sites" && <Sites sel={sel} bench={bench} onPick={(n) => go("sites", n)} />}
        {view === "rotation" && <Rotation sel={sel} bench={bench} onPick={(n) => go("rotation", n)} />}
        {view === "comparability" && <Comparability bench={bench} />}
        {view === "trends" && <Trends trendKey={trendKey} setTrendKey={setTrendKey} bench={bench} />}
        {view === "benchmark" && <Benchmark bench={bench} />}
      </div>

      <div className="px" style={{ paddingBottom: 30, color: INK_SOFT, fontSize: 11.5, lineHeight: 1.6 }}>
        <strong>Notes.</strong> Matrix and element cells show current-year YTD performance; deltas compare to prior-year YTD.
        Element scores are the mean of their constituent items; site-level elements (9.3, 3.5) are response-count weighted.
        Multi-year trends (9.4, 9.7) are drawn from the Element 9.4 / 9.7 summaries (AY2021-22 → AY2025-26, current year YTD through Jan 2026);
        the National Benchmark view uses ISMMS AAMC Graduation Questionnaire results against the all-schools 2025 mean.
        Benchmark and watch/flag bands are adjustable and illustrative — confirm element crosswalk and thresholds against the official
        LCME DCI mapping before committee use. ACC–Geriatrics reflects the complete 2024–25 cycle; other clerkships are mid-cycle (2025–26),
        and Emergency Medicine is not included in the multi-year element summaries.
      </div>
    </div>
  );
}

/* ---- small components ---------------------------------------------------- */
function Legend({ c, t }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: 2, background: c, display: "inline-block" }} />{t}
    </span>
  );
}

function Kpi({ label, value, sub, accent = INK }) {
  return (
    <div style={{ background: CARD, padding: "14px 18px" }}>
      <div className="pill" style={{ color: INK_SOFT, fontSize: 10.5 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: accent, lineHeight: 1.1, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 1 }}>{sub}</div>
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, ...style }}>{children}</div>;
}

/* ---- View 1: Monitoring Matrix ------------------------------------------- */
function Matrix({ bench, onPick }) {
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 18px 10px" }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Monitoring matrix</div>
        <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 2 }}>
          Each cell is the clerkship's score on an LCME element; the small figure is the change vs prior year. Click a clerkship to drill in.
        </div>
      </div>
      <div className="scrollx">
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 720 }}>
          <thead>
            <tr style={{ background: "#F7F9FD" }}>
              <th className="stickh" style={thL}>Clerkship</th>
              {ELEMENTS.map((el) => (
                <th key={el.id} style={thC}>
                  <div style={{ fontWeight: 700, color: INK }}>{el.code}</div>
                  <div style={{ fontWeight: 500, color: INK_SOFT, fontSize: 11, maxWidth: 130, margin: "0 auto" }}>{el.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.map((c) => (
              <tr key={c.name} className="row-click" onClick={() => onPick(c.name)} style={{ borderTop: `1px solid ${LINE}` }}>
                <td className="stick" style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: INK_SOFT }}>{c.year} · {c.periods}</div>
                </td>
                {ELEMENTS.map((el) => {
                  const cur = elementScore(c, el, 0), prior = elementScore(c, el, 1);
                  const rag = ragOf(cur, bench);
                  return (
                    <td key={el.id} style={{ padding: 8, textAlign: "center" }}>
                      <div style={{ background: RAG_BG[rag], borderRadius: 10, padding: "8px 4px", minWidth: 76, margin: "0 auto" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: RAG_FG[rag], fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                          {cur == null ? "—" : Math.round(cur) + "%"}
                        </div>
                        <div style={{ fontSize: 11, marginTop: 2 }}>
                          <Delta v={cur != null && prior != null ? cur - prior : null} />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
const thL = { textAlign: "left", padding: "10px 16px", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: INK_SOFT };
const thC = { textAlign: "center", padding: "8px 6px", fontSize: 11 };

/* ---- View 2: LCME Elements (drill-down) ---------------------------------- */
function Elements({ sel, bench, onPick }) {
  if (!sel) return <PickPrompt onPick={onPick} label="Select a clerkship to see its LCME element breakdown" />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%, 290px),1fr))", gap: 16 }}>
      {ELEMENTS.map((el) => {
        const cur = elementScore(sel, el, 0), prior = elementScore(sel, el, 1);
        const rag = ragOf(cur, bench);
        return (
          <Card key={el.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <span className="pill" style={{ color: "#fff", background: INK, padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>
                  Element {el.code}
                </span>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 8 }}>{el.title}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: RAG_FG[rag], lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {cur == null ? "—" : Math.round(cur) + "%"}
                </div>
                <div style={{ fontSize: 12 }}><Delta v={cur != null && prior != null ? cur - prior : null} /> <span style={{ color: INK_SOFT }}>YoY</span></div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: INK_SOFT, margin: "8px 0 14px" }}>{el.blurb}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {el.metrics.map((m) => {
                const v = el.scope === "program" ? sel.overall[m.key]?.[0] : siteMetricMean(sel, m.key, 0);
                const p = el.scope === "program" ? sel.overall[m.key]?.[1] : siteMetricMean(sel, m.key, 1);
                const hist = el.scope === "program" ? HIST[m.key]?.[sel.name] : null;
                return <MetricBar key={m.key} label={m.label} v={v} p={p} bench={bench} hist={hist} />;
              })}
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 12 }}>
              {el.scope === "program" ? "Program-level (all sites)" : "Weighted across clinical sites"}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MetricBar({ label, v, p, bench, hist }) {
  const rag = ragOf(v, bench);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4, gap: 8 }}>
        <span style={{ color: INK }}>{label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums", color: INK_SOFT, whiteSpace: "nowrap" }}>
          <strong style={{ color: RAG_FG[rag] }}>{v == null ? "—" : Math.round(v) + "%"}</strong>
          {p != null && <span style={{ marginLeft: 6 }}><Delta v={v != null ? v - p : null} /></span>}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 8, background: "#EEF1F6", borderRadius: 6, position: "relative", overflow: "hidden" }}>
          <div style={{ width: `${v == null ? 0 : v}%`, height: "100%", background: RAG_FG[rag], borderRadius: 6 }} />
          <div style={{ position: "absolute", left: `${bench}%`, top: -2, bottom: -2, width: 2, background: INK, opacity: 0.55 }} />
        </div>
        {hist && <span title="5-year trend" style={{ flexShrink: 0 }}><Sparkline data={hist} bench={bench} /></span>}
      </div>
    </div>
  );
}

/* ---- View 3: Site detail ------------------------------------------------- */
function Sites({ sel, bench, onPick }) {
  if (!sel) return <PickPrompt onPick={onPick} label="Select a clerkship to compare its clinical sites" />;
  const metricMeta = [
    { key: "supervision", label: "Supervision", el: "9.3",
      q: "I received appropriate/adequate supervision by residents and/or attendings at this site.", resp: "Strongly Agree + Agree" },
    { key: "availability", label: "Availability", el: "9.3",
      q: "A resident or attending was available whenever I needed at this site.", resp: "Strongly Agree + Agree" },
    { key: "listened", label: "Listened", el: "3.5",
      q: "Residents/attendings actively listened and showed interest in patients.", resp: "Very Often / Always" },
    { key: "respect", label: "Respect", el: "3.5",
      q: "Residents/attendings were respectful of patients' dignity and autonomy.", resp: "Very Often / Always" },
    { key: "explain", label: "Explained", el: "3.5",
      q: "Residents/attendings took time and effort to explain information to patients.", resp: "Very Often / Always" },
  ];
  const chartData = sel.sites.map((s) => {
    const o = { site: s.name, n: s.n };
    SITE_KEYS.forEach((k) => (o[k] = s[k]?.[0] ?? null));
    return o;
  });
  const colors = { supervision: INK, availability: CYAN, listened: MAGENTA, respect: "#7A4FB5", explain: "#E0823C" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{sel.name} — clinical sites (9.3 supervision &amp; 3.5 environment)</div>
        <div style={{ fontSize: 12.5, color: INK_SOFT, margin: "2px 0 14px" }}>
          Current-year YTD by site. Vertical line marks the {bench}% benchmark. Hover bars for exact values.
        </div>
        <div style={{ width: "100%", height: 60 + sel.sites.length * 78 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 4, bottom: 4 }} barCategoryGap="22%">
              <CartesianGrid horizontal={false} stroke={LINE} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: INK_SOFT }} tickFormatter={(v) => v + "%"} />
              <YAxis type="category" dataKey="site" width={120} tick={{ fontSize: 12, fill: INK }} />
              <Tooltip formatter={(v, n) => [v == null ? "n/a" : v + "%", metricMeta.find((m) => m.key === n)?.label || n]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${LINE}` }} />
              <ReferenceLine x={bench} stroke={INK} strokeDasharray="3 3" />
              {SITE_KEYS.map((k) => <Bar key={k} dataKey={k} fill={colors[k]} radius={[0, 3, 3, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
          <div className="pill" style={{ color: INK_SOFT, fontSize: 10 }}>Survey items (as asked on the clerkship/site evaluation)</div>
          {metricMeta.map((m) => (
            <div key={m.key} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12, lineHeight: 1.4 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: colors[m.key], flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: INK }}>
                <strong>{m.label}</strong>
                <span style={{ color: INK_SOFT }}> · Element {m.el}</span>
                <span style={{ display: "block", color: INK_SOFT }}>
                  "{m.q}" <span style={{ fontStyle: "italic" }}>(% {m.resp})</span>
                </span>
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="scrollx">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
            <thead>
              <tr style={{ background: "#F7F9FD" }}>
                <th className="stickh" style={thL}>Site</th>
                <th style={{ ...thC, textAlign: "right", paddingRight: 14 }}>n</th>
                {metricMeta.map((m) => <th key={m.key} style={thC}>{m.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {sel.sites.map((s) => (
                <tr key={s.name} style={{ borderTop: `1px solid ${LINE}` }}>
                  <td className="stick" style={{ padding: "9px 16px", fontWeight: 600, fontSize: 13 }}>{s.name}</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", color: INK_SOFT, fontVariantNumeric: "tabular-nums" }}>{s.n}</td>
                  {SITE_KEYS.map((k) => {
                    const v = s[k]?.[0]; const rag = ragOf(v, bench);
                    return (
                      <td key={k} style={{ padding: "7px 6px", textAlign: "center" }}>
                        <span style={{ background: RAG_BG[rag], color: RAG_FG[rag], fontWeight: 700, fontSize: 12.5,
                          padding: "3px 8px", borderRadius: 6, fontVariantNumeric: "tabular-nums", display: "inline-block", minWidth: 40 }}>
                          {v == null ? "—" : v + "%"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---- View 4: Multi-year trends ------------------------------------------ */
function Trends({ trendKey, setTrendKey, bench }) {
  const meta = TREND_METRICS.find((m) => m.key === trendKey);
  // clerkships that have a history series for this metric
  const series = DATA.filter((c) => HIST[trendKey]?.[c.name]).map((c, i) => ({
    name: c.name, short: c.short, color: LINE_COLORS[i % LINE_COLORS.length],
    vals: HIST[trendKey][c.name],
  }));
  const lineData = YEARS.map((y, yi) => {
    const o = { year: y };
    series.forEach((s) => (o[s.name] = s.vals[yi]));
    return o;
  });
  // latest-vs-prior movers
  const movers = series.map((s) => {
    const v = s.vals.filter((x) => typeof x === "number");
    const cur = v[v.length - 1], prior = v[v.length - 2];
    return { name: s.short, full: s.name, cur, prior, delta: cur != null && prior != null ? cur - prior : null };
  }).sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Five-year trend · {meta.label}</div>
            <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 2 }}>
              LCME Element {meta.el}. Each line is one clerkship; the dashed line marks the {bench}% benchmark.
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TREND_METRICS.map((m) => (
              <div key={m.key} className="tab" onClick={() => setTrendKey(m.key)}
                style={trendKey === m.key
                  ? { background: MAGENTA, color: "#fff" }
                  : { background: "#F0F4FB", color: INK_SOFT }}>
                <span style={{ opacity: 0.7, marginRight: 4 }}>{m.el}</span>{m.label.split(" ").slice(0, 2).join(" ")}
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: "100%", height: 340, marginTop: 14 }}>
          <ResponsiveContainer>
            <LineChart data={lineData} margin={{ top: 10, right: 18, left: -8, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke={LINE} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: INK }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: INK_SOFT }} tickFormatter={(v) => v + "%"} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${LINE}` }}
                formatter={(v, n) => [v == null ? "n/a" : v + "%", n]} />
              <ReferenceLine y={bench} stroke={INK} strokeDasharray="4 4" />
              {series.map((s) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color}
                  strokeWidth={2.2} dot={{ r: 2.5 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11.5, color: INK_SOFT }}>
          {series.map((s) => (
            <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 14, height: 3, background: s.color, display: "inline-block", borderRadius: 2 }} />{s.name}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 8 }}>
          Emergency Medicine is reported on a different cycle and is not in the multi-year element summary.
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Most recent year-over-year change</div>
        <div style={{ fontSize: 12.5, color: INK_SOFT, margin: "2px 0 12px" }}>Latest reported year vs the year before, by clerkship.</div>
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={movers} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke={LINE} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: INK }} />
              <YAxis tick={{ fontSize: 11, fill: INK_SOFT }} tickFormatter={(v) => (v > 0 ? "+" : "") + v} />
              <Tooltip formatter={(v) => [(v > 0 ? "+" : "") + Math.round(v) + " pts", "Change"]}
                labelFormatter={(l) => movers.find((r) => r.name === l)?.full}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${LINE}` }} />
              <ReferenceLine y={0} stroke={INK} />
              <Bar dataKey="delta" radius={[3, 3, 0, 0]}>
                {movers.map((r, i) => <Cell key={i} fill={(r.delta ?? 0) >= 0 ? GREEN : RED} />)}
                <LabelList dataKey="delta" position="top" formatter={(v) => v == null ? "" : (v > 0 ? "+" : "") + Math.round(v)}
                  style={{ fontSize: 11, fill: INK_SOFT }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* ---- View 5: National benchmark (AAMC GQ) ------------------------------- */
function Benchmark({ bench }) {
  const [yi, setYi] = useState(GQ_YEARS.length - 1);
  const barData = GQ.map((g) => ({ disc: g.disc, school: g.vals[yi], natl: g.natl }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>AAMC Graduation Questionnaire — mid-clerkship feedback</div>
            <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 2 }}>
              Share of graduates reporting they were provided mid-clerkship feedback (Element 9.7), by discipline.
              Colored bars are ISMMS {GQ_YEARS[yi]}; the gray bar is the all-schools 2025 mean.
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {GQ_YEARS.map((y, i) => (
              <div key={y} className="tab" onClick={() => setYi(i)}
                style={yi === i ? { background: CYAN, color: "#fff" } : { background: "#F0F4FB", color: INK_SOFT }}>{y}</div>
            ))}
          </div>
        </div>
        <div style={{ width: "100%", height: 330, marginTop: 14 }}>
          <ResponsiveContainer>
            <BarChart data={barData} margin={{ top: 8, right: 18, left: 0, bottom: 60 }}>
              <CartesianGrid vertical={false} stroke={LINE} />
              <XAxis dataKey="disc" tick={{ fontSize: 10.5, fill: INK }} interval={0} angle={-22} textAnchor="end" height={70} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: INK_SOFT }} tickFormatter={(v) => v + "%"} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${LINE}` }}
                formatter={(v, n) => [v + "%", n === "school" ? `ISMMS ${GQ_YEARS[yi]}` : "All schools 2025"]} />
              <Bar dataKey="natl" radius={[3, 3, 0, 0]} maxBarSize={46} fill="#C7D2E0">
                <LabelList dataKey="natl" position="top" formatter={(v) => v} style={{ fontSize: 10, fill: "#8A98AD" }} />
              </Bar>
              <Bar dataKey="school" radius={[3, 3, 0, 0]} maxBarSize={46}>
                {barData.map((d, i) => <Cell key={i} fill={d.school >= d.natl ? GREEN : AMBER} />)}
                <LabelList dataKey="school" position="top" formatter={(v) => Math.round(v)} style={{ fontSize: 10.5, fill: INK_SOFT }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 11.5, color: INK_SOFT }}>
          Green = at or above the national mean; amber = below. ISMMS reaches 100% in four disciplines in 2025; Surgery (96.5%)
          and Psychiatry (98.8%) trail their own prior-year highs but remain at or above the national mean.
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="scrollx">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
            <thead>
              <tr style={{ background: "#F7F9FD" }}>
                <th className="stickh" style={thL}>Discipline</th>
                {GQ_YEARS.map((y) => <th key={y} style={thC}>{y}</th>)}
                <th style={thC}>Natl ’25</th>
                <th style={thC}>vs Natl</th>
              </tr>
            </thead>
            <tbody>
              {GQ.map((g) => {
                const latest = g.vals[g.vals.length - 1];
                const diff = latest - g.natl;
                return (
                  <tr key={g.disc} style={{ borderTop: `1px solid ${LINE}` }}>
                    <td className="stick" style={{ padding: "9px 16px", fontWeight: 600, fontSize: 13 }}>{g.disc}</td>
                    {g.vals.map((v, i) => (
                      <td key={i} style={{ ...tdNum, color: i === g.vals.length - 1 ? INK : INK_SOFT, fontWeight: i === g.vals.length - 1 ? 700 : 400 }}>
                        {v}
                      </td>
                    ))}
                    <td style={{ ...tdNum, color: INK_SOFT }}>{g.natl}</td>
                    <td style={tdNum}>
                      <span style={{ color: diff >= 0 ? GREEN : RED, fontWeight: 600 }}>
                        {diff >= 0 ? "+" : ""}{diff.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
/* ---- View 7: Site Comparability (LCME 8.7) ------------------------------- */
const COMBINED_SITES = new Set(["MSQ/MSH", "MSM/MSW"]);
function spreadBand(s) { return s == null ? "na" : s >= 20 ? "red" : s >= 10 ? "amber" : "green"; }
function Comparability({ bench }) {
  const [itemKey, setItemKey] = useState("supervision");
  const item = SITE_ROWS.find((r) => r.key === itemKey);
  // clerkships with discrete sites (exclude ACC, which reports a single combined row)
  const cols = DATA.filter((c) => !(c.sites.length === 1 && c.sites[0].name === "All Sites Combined"));
  const siteNames = [];
  cols.forEach((c) => c.sites.forEach((s) => {
    if (s.name !== "All Sites Combined" && !siteNames.includes(s.name)) siteNames.push(s.name);
  }));
  siteNames.sort();
  const val = (c, sn) => { const s = c.sites.find((x) => x.name === sn); return s ? (s[itemKey]?.[0] ?? null) : null; };
  const spreadOf = (arr) => { const v = arr.filter((x) => x != null); return v.length > 1 ? Math.max(...v) - Math.min(...v) : null; };

  const rowSpread = siteNames.map((sn) => spreadOf(cols.map((c) => val(c, sn))));
  const colSpread = cols.map((c) => spreadOf(siteNames.map((sn) => val(c, sn))));

  // callouts
  let worstSite = { sp: -1 }, worstClerk = { sp: -1 };
  siteNames.forEach((sn, i) => { if ((rowSpread[i] ?? -1) > worstSite.sp) worstSite = { sp: rowSpread[i], name: sn }; });
  cols.forEach((c, j) => { if ((colSpread[j] ?? -1) > worstClerk.sp) worstClerk = { sp: colSpread[j], name: c.name }; });

  const SpreadChip = ({ s }) => {
    const b = spreadBand(s);
    return (
      <span style={{ background: RAG_BG[b], color: RAG_FG[b], fontWeight: 700, fontSize: 11.5,
        padding: "3px 8px", borderRadius: 6, fontVariantNumeric: "tabular-nums" }}>
        {s == null ? "—" : s + " pt"}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Site comparability · Element 8.7</div>
              <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 2, maxWidth: 560 }}>
                Read <strong>down a column</strong> to compare sites within a clerkship; read <strong>across a row</strong> to compare one
                site across clerkships. Wide ranges flag where the experience may not be comparable.
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SITE_ROWS.map((r) => (
                <div key={r.key} className="tab" onClick={() => setItemKey(r.key)}
                  style={itemKey === r.key ? { background: INK, color: "#fff" } : { background: "#F0F4FB", color: INK_SOFT }}>
                  <span style={{ opacity: 0.7, marginRight: 4 }}>{r.el}</span>{r.label.split(" ").slice(0, 2).join(" ")}
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: INK, marginTop: 10, fontStyle: "italic" }}>
            Showing: "{item.label}" (Element {item.el})
          </div>
        </div>
        <div className="scrollx">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#F7F9FD" }}>
                <th style={{ ...thL, position: "sticky", left: 0, background: "#F7F9FD" }}>Site ╲ Clerkship</th>
                {cols.map((c) => <th key={c.name} style={{ ...thC, minWidth: 58 }} title={c.name}>{c.short}</th>)}
                <th style={{ ...thC, background: "#EEF2F8" }}>Site range</th>
              </tr>
            </thead>
            <tbody>
              {siteNames.map((sn, i) => (
                <tr key={sn} style={{ borderTop: `1px solid ${LINE}` }}>
                  <td style={{ padding: "8px 14px", fontWeight: 600, fontSize: 12.5, position: "sticky", left: 0, background: CARD }}>
                    {sn}{COMBINED_SITES.has(sn) && <sup title="Combined-site data — reported merged in the source, not separable" style={{ color: MAGENTA, fontWeight: 700 }}> ‡</sup>}
                  </td>
                  {cols.map((c) => {
                    const v = val(c, sn); const rag = ragOf(v, bench);
                    return (
                      <td key={c.name} style={{ padding: "6px 5px", textAlign: "center" }}>
                        {v == null
                          ? <span style={{ color: "#C7CFDB" }}>·</span>
                          : <span style={{ background: RAG_BG[rag], color: RAG_FG[rag], fontWeight: 700, fontSize: 12,
                              padding: "3px 6px", borderRadius: 5, fontVariantNumeric: "tabular-nums", display: "inline-block", minWidth: 38 }}>{v}%</span>}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "center", padding: "6px 8px", background: "#F7F9FD" }}><SpreadChip s={rowSpread[i]} /></td>
                </tr>
              ))}
              {/* within-clerkship range row */}
              <tr style={{ borderTop: `2px solid ${LINE}`, background: "#F7F9FD" }}>
                <td style={{ padding: "8px 14px", fontWeight: 700, fontSize: 12, position: "sticky", left: 0, background: "#F7F9FD" }}>Within-clerkship range</td>
                {cols.map((c, j) => (
                  <td key={c.name} style={{ textAlign: "center", padding: "6px 5px" }}><SpreadChip s={colSpread[j]} /></td>
                ))}
                <td style={{ background: "#EEF2F8" }} />
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", padding: "10px 18px 16px", fontSize: 11.5, color: INK_SOFT }}>
          <span>Range bands:&nbsp;</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: GREEN }} />&lt;10 pts comparable</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: AMBER }} />10–19 pts watch</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: RED }} />≥20 pts review</span>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%, 260px),1fr))", gap: 16 }}>
        <Card>
          <div className="pill" style={{ color: INK_SOFT }}>Widest spread across clerkships</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{worstSite.name || "—"}</div>
          <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 2 }}>
            varies <strong style={{ color: RAG_FG[spreadBand(worstSite.sp)] }}>{worstSite.sp < 0 ? "—" : worstSite.sp + " points"}</strong> on
            "{item.label}" depending on which clerkship the student rotates through.
          </div>
        </Card>
        <Card>
          <div className="pill" style={{ color: INK_SOFT }}>Widest spread within a clerkship</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{worstClerk.name || "—"}</div>
          <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 2 }}>
            shows a <strong style={{ color: RAG_FG[spreadBand(worstClerk.sp)] }}>{worstClerk.sp < 0 ? "—" : worstClerk.sp + " point"}</strong> gap
            between its best and weakest site on this item.
          </div>
        </Card>
      </div>

      <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.6 }}>
        Cells are current-year YTD, colored against the {bench}% benchmark. Range = highest minus lowest site value (for sites/clerkships with
        ≥2 reporting sites). ACC–Geriatrics is omitted here because it reports a single all-sites-combined figure rather than discrete sites.
        Site labels are shown as each clerkship records them. <strong style={{ color: MAGENTA }}>‡</strong> marks combined-site rows
        (MSQ/MSH = Mount Sinai Queens + Mount Sinai Hospital; MSM/MSW = Mount Sinai Morningside + Mount Sinai West) that the
        source reports merged and cannot be split without the underlying per-hospital data.
      </div>
    </div>
  );
}

const tdNum = { padding: "9px 6px", textAlign: "center", fontVariantNumeric: "tabular-nums", fontSize: 13 };


/* ---- View 6: By Rotation ------------------------------------------------- */
const PROG_ROWS = [
  { key: "fbReceived", el: "9.7", label: "Received mid-clerkship feedback", den: "n" },
  { key: "fbHelpful", el: "9.7", label: "Feedback helped reflection", den: "received" },
  { key: "fbCPE", el: "9.7", label: "Feedback tied to CPE form", den: "received" },
  { key: "obsHx", el: "9.4", label: "Observed taking history", den: "n" },
  { key: "obsExam", el: "9.4", label: "Observed physical / mental status exam", den: "n" },
];
const SITE_ROWS = [
  { key: "supervision", el: "9.3", label: "Appropriate/adequate supervision" },
  { key: "availability", el: "9.3", label: "Supervisor available when needed" },
  { key: "listened", el: "3.5", label: "Listened / showed interest" },
  { key: "respect", el: "3.5", label: "Respected dignity & autonomy" },
  { key: "explain", el: "3.5", label: "Explained to patients" },
];
function rotPct(num, den) {
  if (num == null || den == null || den === 0) return null;
  const r = Math.round((100 * num) / den);
  return r > 100 ? null : r; // guard rare source counts where numerator exceeds denominator
}
function RotCell({ num, den, bench }) {
  if (den == null) return <td style={{ ...tdNum, color: "#9AA6B8" }}>—</td>;
  const pct = rotPct(num, den);
  const rag = ragOf(pct, bench);
  return (
    <td style={{ padding: "6px 6px", textAlign: "center" }}>
      <span style={{ background: RAG_BG[rag], color: RAG_FG[rag], fontWeight: 700, fontSize: 12.5,
        padding: "3px 7px", borderRadius: 6, fontVariantNumeric: "tabular-nums", display: "inline-block", minWidth: 38 }}>
        {pct == null ? "—" : pct + "%"}
      </span>
      <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{num}/{den}</div>
    </td>
  );
}
function ElTag({ code }) {
  return <span style={{ fontSize: 10, color: INK_SOFT, fontWeight: 700 }}> · {code}</span>;
}

function Rotation({ sel, bench, onPick }) {
  if (!sel) return <PickPrompt onPick={onPick} label="Select a clerkship to see results by rotation" />;
  const r = ROT[sel.name];
  if (!r) return <Card style={{ textAlign: "center", color: INK_SOFT }}>Rotation-level data isn't available for this clerkship.</Card>;
  const labels = r.labels;

  const ProgRow = ({ row }) => {
    const ytd = sel.overall[row.key]?.[0];
    const yrag = ragOf(ytd, bench);
    return (
      <tr style={{ borderTop: `1px solid ${LINE}` }}>
        <td className="stick" style={{ padding: "8px 14px", fontSize: 12.5 }}>{row.label}<ElTag code={row.el} /></td>
        {labels.map((_, i) => {
          const num = r.program[row.key][i];
          const den = row.den === "n" ? r.n[i] : r.program.fbReceived[i];
          return <RotCell key={i} num={num} den={den} bench={bench} />;
        })}
        <td style={{ ...tdNum, fontWeight: 700, color: RAG_FG[yrag], background: "#F7F9FD" }}>{ytd == null ? "—" : ytd + "%"}</td>
      </tr>
    );
  };

  const SiteTable = ({ site }) => {
    const sr = r.sites[site.name];
    if (!sr) return null;
    return (
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px 8px", fontWeight: 700, fontSize: 14 }}>{site.name}</div>
        <div className="scrollx">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 460 }}>
            <thead>
              <tr style={{ background: "#F7F9FD" }}>
                <th className="stickh" style={thL}>Site survey item</th>
                {labels.map((l, i) => <th key={i} style={thC}>Rotation {i + 1}<div style={{ fontWeight: 400, color: INK_SOFT, fontSize: 10 }}>{/^MOD/i.test(l) ? "" : l + " · "}n={sr.n[i] == null ? "—" : sr.n[i]}</div></th>)}
                <th style={thC}>YTD</th>
              </tr>
            </thead>
            <tbody>
              {SITE_ROWS.map((row) => {
                const ytd = site[row.key]?.[0];
                const yrag = ragOf(ytd, bench);
                return (
                  <tr key={row.key} style={{ borderTop: `1px solid ${LINE}` }}>
                    <td className="stick" style={{ padding: "8px 14px", fontSize: 12.5 }}>{row.label}<ElTag code={row.el} /></td>
                    {labels.map((_, i) => <RotCell key={i} num={sr[row.key][i]} den={sr.n[i]} bench={bench} />)}
                    <td style={{ ...tdNum, fontWeight: 700, color: RAG_FG[yrag], background: "#F7F9FD" }}>{ytd == null ? "—" : ytd + "%"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px 8px" }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Clerkship evaluation — by rotation</div>
          <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 2 }}>
            Each rotation shows the rate with its raw count beneath; the shaded YTD column is the aggregate as reported.
          </div>
        </div>
        <div className="scrollx">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
            <thead>
              <tr style={{ background: "#F7F9FD" }}>
                <th className="stickh" style={thL}>Program survey item</th>
                {labels.map((l, i) => <th key={i} style={thC}>Rotation {i + 1}<div style={{ fontWeight: 400, color: INK_SOFT, fontSize: 10 }}>{/^MOD/i.test(l) ? "" : l + " · "}n={r.n[i]}</div></th>)}
                <th style={thC}>YTD</th>
              </tr>
            </thead>
            <tbody>{PROG_ROWS.map((row) => <ProgRow key={row.key} row={row} />)}</tbody>
          </table>
        </div>
      </Card>

      <div style={{ fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: ".02em" }}>By clinical site</div>
      {sel.sites.map((s) => <SiteTable key={s.name} site={s} />)}

      <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.6 }}>
        Feedback-helped and CPE-form rates use the per-rotation count of students who received feedback as the denominator (per the
        source footnote); a cell shows "—" where that denominator is unavailable or the reported counts are internally inconsistent.
        The YTD column is reproduced as reported and may rest on a slightly different respondent base than the pooled rotations.
      </div>
    </div>
  );
}

function PickPrompt({ onPick, label }) {
  return (
    <Card style={{ textAlign: "center", padding: "30px 18px" }}>
      <div style={{ fontSize: 14, color: INK_SOFT, marginBottom: 14 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {DATA.map((c) => (
          <div key={c.name} className="tab" onClick={() => onPick(c.name)}
            style={{ background: "#F0F4FB", color: INK, border: `1px solid ${LINE}` }}>
            {c.name}
          </div>
        ))}
      </div>
    </Card>
  );
}
