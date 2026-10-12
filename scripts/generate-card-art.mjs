#!/usr/bin/env node
/**
 * Renders the card and section plates as original SVG artwork into /assets/media.
 *
 * Companion to generate-hero-art.mjs, and it exists for a narrower reason. The launch cards and
 * the image-led bands were carrying stock photographs of server racks — three of them shot against
 * plain white walls, and one of a monitor in an empty room. On a page arguing that this vendor
 * knows where your data is, a photograph of somebody else's data centre says nothing, and the
 * white backgrounds cut a hole in a page composed of dark bands.
 *
 * The first pass replaced them with abstract fields — dots, arcs, streams. On brand, and still
 * saying nothing: a field of dots is decoration wherever you put it. These are diagrams instead.
 * Each one draws the objects its section is actually about — databases, clouds, endpoints,
 * documents, the boundary data crosses — so somebody who reads nothing but the picture still knows
 * which page they are on.
 *
 * No text. The plates are loaded through `<img>`, which cannot reach the page's self-hosted fonts,
 * so any label would render in whatever the system supplies and break the type system on a page
 * where nothing else does. Recognisable geometry carries the meaning instead.
 *
 * Authored 4:3. `MediaSplit` frames at exactly 4:3 and `ArticleCard` at 16:9, so every composition
 * stays inside a centred safe band — SAFE_TOP to SAFE_BOTTOM — that survives the 16:9 crop.
 *
 * Deterministic: the same seed always produces the same plate, so re-running never churns the diff.
 * Run with `npm run art:cards`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets', 'media');

const W = 1600;
const H = 1200;
/** The 16:9 crop keeps the middle 900px. Nothing that carries meaning goes outside it. */
const SAFE_TOP = 150;
const SAFE_BOTTOM = 1050;
const MID = H / 2;

/** Brand tokens, mirrored from apps/web/src/styles/tokens.css. */
const NAVY = '#041E42';
const DEEP = '#020E20';
const ACCENT = '#0E70F7';
const TEAL = '#3DDBC8';
const AMBER = '#FFA033';
const INK = '#FFFFFF';

/** Same generator as lib/backdrop.ts and the hero plates, so the whole family agrees. */
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const n = (v) => Number(v.toFixed(1));

/* ------------------------------------------------------------------------ Ground */

const ground = (id) => `
  <defs>
    <linearGradient id="field-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="${DEEP}"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="32%" cy="16%" r="86%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="${ACCENT}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig-${id}" cx="50%" cy="50%" r="70%">
      <stop offset="58%" stop-color="${DEEP}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${DEEP}" stop-opacity="0.7"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#field-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#glow-${id})"/>`;

const wrap = (id, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-hidden="true">` +
  `${ground(id)}${body}<rect width="${W}" height="${H}" fill="url(#vig-${id})"/></svg>\n`;

/* -------------------------------------------------------------- Drawing vocabulary
 * Every object is stroked in one weight and filled at low alpha, so twelve plates drawn from the
 * same kit read as one set however they are combined.
 */

const SW = 3.5;
const stroke = (c = ACCENT, o = 0.75, w = SW) =>
  `fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const solid = (c = ACCENT, o = 0.14) => `fill="${c}" fill-opacity="${o}"`;

/** A database: an ellipse cap, a body, and one band across it. */
const cylinder = (x, y, w, h, c = ACCENT, o = 0.75) => {
  const rx = w / 2;
  const ry = w / 5;
  return `
    <path d="M${x - rx} ${y} v${h} a${rx} ${ry} 0 0 0 ${w} 0 v${-h}" ${solid(c, 0.12)}/>
    <path d="M${x - rx} ${y} v${h} a${rx} ${ry} 0 0 0 ${w} 0 v${-h}" ${stroke(c, o)}/>
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${solid(c, 0.2)}/>
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${stroke(c, o)}/>
    <path d="M${x - rx} ${n(y + h * 0.5)} a${rx} ${ry} 0 0 0 ${w} 0" ${stroke(c, o * 0.55)}/>`;
};

/** A cloud, drawn as three overlapping arcs closed along the base. */
const cloud = (x, y, w, c = ACCENT, o = 0.75) => {
  const u = w / 100;
  return `
    <path d="M${n(x - 46 * u)} ${n(y + 14 * u)}
             a${n(20 * u)} ${n(20 * u)} 0 0 1 ${n(14 * u)} ${n(-33 * u)}
             a${n(27 * u)} ${n(27 * u)} 0 0 1 ${n(51 * u)} ${n(-4 * u)}
             a${n(21 * u)} ${n(21 * u)} 0 0 1 ${n(24 * u)} ${n(37 * u)} z"
          ${solid(c, 0.13)}/>
    <path d="M${n(x - 46 * u)} ${n(y + 14 * u)}
             a${n(20 * u)} ${n(20 * u)} 0 0 1 ${n(14 * u)} ${n(-33 * u)}
             a${n(27 * u)} ${n(27 * u)} 0 0 1 ${n(51 * u)} ${n(-4 * u)}
             a${n(21 * u)} ${n(21 * u)} 0 0 1 ${n(24 * u)} ${n(37 * u)} z"
          ${stroke(c, o)}/>`;
};

/** A folder with its raised tab. */
const folder = (x, y, w, c = ACCENT, o = 0.75) => {
  const h = w * 0.72;
  return `
    <path d="M${x} ${n(y + h)} v${n(-h)} h${n(w * 0.38)} l${n(w * 0.1)} ${n(h * 0.16)} h${n(w * 0.52)} v${n(h - h * 0.16)} z"
          ${solid(c, 0.12)}/>
    <path d="M${x} ${n(y + h)} v${n(-h)} h${n(w * 0.38)} l${n(w * 0.1)} ${n(h * 0.16)} h${n(w * 0.52)} v${n(h - h * 0.16)} z"
          ${stroke(c, o)}/>`;
};

/** An endpoint: screen, neck, base. */
const endpoint = (x, y, w, c = ACCENT, o = 0.75) => {
  const h = w * 0.66;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${n(w * 0.05)}" ${solid(c, 0.12)}/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${n(w * 0.05)}" ${stroke(c, o)}/>
    <path d="M${n(x + w * 0.5)} ${n(y + h)} v${n(h * 0.18)}" ${stroke(c, o)}/>
    <path d="M${n(x + w * 0.24)} ${n(y + h * 1.18)} h${n(w * 0.52)}" ${stroke(c, o)}/>`;
};

/** A document with ruled lines and a folded corner. */
const doc = (x, y, w, lines = 4, c = ACCENT, o = 0.75) => {
  const h = w * 1.3;
  const fold = w * 0.26;
  let rules = '';
  for (let i = 0; i < lines; i += 1) {
    const ly = n(y + h * 0.42 + i * (h * 0.13));
    const lw = i === lines - 1 ? w * 0.42 : w * 0.64;
    rules += `<path d="M${n(x + w * 0.18)} ${ly} h${n(lw)}" ${stroke(c, o * 0.5, SW * 0.8)}/>`;
  }
  return `
    <path d="M${x} ${y} h${n(w - fold)} l${n(fold)} ${n(fold)} v${n(h - fold)} h${-w} z" ${solid(c, 0.12)}/>
    <path d="M${x} ${y} h${n(w - fold)} l${n(fold)} ${n(fold)} v${n(h - fold)} h${-w} z" ${stroke(c, o)}/>
    <path d="M${n(x + w - fold)} ${y} v${n(fold)} h${n(fold)}" ${stroke(c, o)}/>
    ${rules}`;
};

/** A shield. Used for a protected boundary, never as decoration. */
const shield = (x, y, w, c = ACCENT, o = 0.8) => {
  const h = w * 1.2;
  return `
    <path d="M${x} ${n(y + h * 0.2)} L${n(x + w / 2)} ${y} L${n(x + w)} ${n(y + h * 0.2)}
             v${n(h * 0.38)} q0 ${n(h * 0.34)} ${n(-w / 2)} ${n(h * 0.42)}
             q${n(-w / 2)} ${n(-h * 0.08)} ${n(-w / 2)} ${n(-h * 0.42)} z"
          ${solid(c, 0.15)}/>
    <path d="M${x} ${n(y + h * 0.2)} L${n(x + w / 2)} ${y} L${n(x + w)} ${n(y + h * 0.2)}
             v${n(h * 0.38)} q0 ${n(h * 0.34)} ${n(-w / 2)} ${n(h * 0.42)}
             q${n(-w / 2)} ${n(-h * 0.08)} ${n(-w / 2)} ${n(-h * 0.42)} z"
          ${stroke(c, o)}/>`;
};

/** A tick inside the shield, or on its own as a confirmed state. */
const tick = (x, y, s, c = TEAL, o = 0.95) =>
  `<path d="M${n(x - s)} ${y} l${n(s * 0.75)} ${n(s * 0.8)} L${n(x + s)} ${n(y - s * 0.75)}" ${stroke(c, o, SW * 1.2)}/>`;

/** A cross, for a blocked path. */
const cross = (x, y, s, c = AMBER, o = 0.95) =>
  `<path d="M${n(x - s)} ${n(y - s)} l${n(s * 2)} ${n(s * 2)} M${n(x + s)} ${n(y - s)} l${n(-s * 2)} ${n(s * 2)}" ${stroke(c, o, SW * 1.2)}/>`;

/** A magnifier, angled down-right. */
const magnifier = (x, y, r, c = TEAL, o = 0.9) => `
  <circle cx="${x}" cy="${y}" r="${r}" ${solid(c, 0.1)}/>
  <circle cx="${x}" cy="${y}" r="${r}" ${stroke(c, o, SW * 1.3)}/>
  <path d="M${n(x + r * 0.72)} ${n(y + r * 0.72)} l${n(r * 0.66)} ${n(r * 0.66)}" ${stroke(c, o, SW * 1.8)}/>`;

/** A person: head and shoulders. An owner, a steward, a subject. */
const person = (x, y, r, c = ACCENT, o = 0.75) => `
  <circle cx="${x}" cy="${y}" r="${r}" ${solid(c, 0.16)}/>
  <circle cx="${x}" cy="${y}" r="${r}" ${stroke(c, o)}/>
  <path d="M${n(x - r * 1.5)} ${n(y + r * 2.5)} a${n(r * 1.5)} ${n(r * 1.6)} 0 0 1 ${n(r * 3)} 0" ${stroke(c, o)}/>`;

/** A premises: a block with a roofline and windows. On-premises deployment. */
const building = (x, y, w, c = ACCENT, o = 0.75) => {
  const h = w * 0.85;
  let win = '';
  for (let r = 0; r < 3; r += 1) {
    for (let cIdx = 0; cIdx < 3; cIdx += 1) {
      win += `<rect x="${n(x + w * (0.18 + cIdx * 0.25))}" y="${n(y + h * (0.3 + r * 0.22))}" width="${n(w * 0.13)}" height="${n(h * 0.13)}" ${solid(c, 0.4)}/>`;
    }
  }
  return `
    <path d="M${x} ${n(y + h)} v${n(-h * 0.8)} l${n(w / 2)} ${n(-h * 0.2)} l${n(w / 2)} ${n(h * 0.2)} v${n(h * 0.8)} z" ${solid(c, 0.12)}/>
    <path d="M${x} ${n(y + h)} v${n(-h * 0.8)} l${n(w / 2)} ${n(-h * 0.2)} l${n(w / 2)} ${n(h * 0.2)} v${n(h * 0.8)} z" ${stroke(c, o)}/>
    ${win}`;
};

/** An envelope. An egress channel. */
const envelope = (x, y, w, c = ACCENT, o = 0.75) => {
  const h = w * 0.66;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${n(w * 0.05)}" ${solid(c, 0.12)}/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${n(w * 0.05)}" ${stroke(c, o)}/>
    <path d="M${x} ${n(y + h * 0.12)} L${n(x + w / 2)} ${n(y + h * 0.6)} L${n(x + w)} ${n(y + h * 0.12)}" ${stroke(c, o)}/>`;
};

/** Removable media. The other egress channel everyone forgets. */
const drive = (x, y, w, c = ACCENT, o = 0.75) => {
  const h = w * 1.5;
  return `
    <rect x="${x}" y="${n(y + h * 0.22)}" width="${w}" height="${n(h * 0.78)}" rx="${n(w * 0.12)}" ${solid(c, 0.12)}/>
    <rect x="${x}" y="${n(y + h * 0.22)}" width="${w}" height="${n(h * 0.78)}" rx="${n(w * 0.12)}" ${stroke(c, o)}/>
    <rect x="${n(x + w * 0.3)}" y="${y}" width="${n(w * 0.4)}" height="${n(h * 0.24)}" ${solid(c, 0.3)}/>
    <rect x="${n(x + w * 0.3)}" y="${y}" width="${n(w * 0.4)}" height="${n(h * 0.24)}" ${stroke(c, o)}/>`;
};

/** A social platform tile: a rounded square with a glyph-sized mark inside. */
const tile = (x, y, s, c = ACCENT, o = 0.7, filled = false) => `
  <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${n(s * 0.26)}" ${solid(c, filled ? 0.3 : 0.1)}/>
  <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${n(s * 0.26)}" ${stroke(c, o)}/>
  <circle cx="${n(x + s * 0.5)}" cy="${n(y + s * 0.5)}" r="${n(s * 0.17)}" ${solid(c, filled ? 0.85 : 0.35)}/>`;

/** A soft connector between two points, bowed toward the horizontal. */
const link = (x1, y1, x2, y2, c = ACCENT, o = 0.32, w = 2.4) => {
  const mx = (x1 + x2) / 2;
  return `<path d="M${n(x1)} ${n(y1)} C ${n(mx)} ${n(y1)}, ${n(mx)} ${n(y2)}, ${n(x2)} ${n(y2)}" ${stroke(c, o, w)}/>`;
};

/** An arrowhead pointing right, for a flow that has a direction. */
const arrow = (x, y, s, c = ACCENT, o = 0.7) =>
  `<path d="M${n(x - s)} ${n(y - s * 0.62)} L${x} ${y} L${n(x - s)} ${n(y + s * 0.62)}" ${stroke(c, o, SW)}/>`;

/** A dotted vertical boundary: the line data has to cross. */
const boundary = (x, top, bottom, c = ACCENT, o = 0.55) => `
  <path d="M${x} ${top} V${bottom}" ${stroke(c, o * 0.5, 10)} stroke-dasharray="2 22"/>
  <path d="M${x} ${top} V${bottom}" ${stroke(c, o, 2.5)}/>`;

/* ---------------------------------------------------------------------- The plates */

/**
 * Governance — a maturity ladder with accountability under it.
 * Five ascending steps from Initial to Optimized, a flag on the top step, and the owner, steward
 * and custodian chain feeding the whole thing from below.
 */
const governance = () => {
  const parts = [];
  const baseY = 830;
  const stepW = 210;
  const rise = 108;
  const x0 = 260;

  for (let i = 0; i < 5; i += 1) {
    const h = 96 + i * rise;
    const x = x0 + i * stepW;
    const y = baseY - h;
    parts.push(
      `<rect x="${x}" y="${y}" width="${stepW - 16}" height="${h}" rx="4" ${solid(ACCENT, 0.09 + i * 0.045)}/>`,
      `<rect x="${x}" y="${y}" width="${stepW - 16}" height="${h}" rx="4" ${stroke(ACCENT, 0.4 + i * 0.1)}/>`,
      // The level marker along the top edge of each step.
      `<path d="M${n(x + 22)} ${n(y + 22)} h${n(stepW - 60)}" ${stroke(i === 4 ? TEAL : ACCENT, 0.5 + i * 0.1, SW * 1.1)}/>`,
    );
  }

  // The flag on the optimized step.
  const flagX = x0 + 4 * stepW + (stepW - 16) / 2;
  const flagTop = baseY - (96 + 4 * rise);
  parts.push(
    `<path d="M${flagX} ${n(flagTop - 20)} v${-128}" ${stroke(TEAL, 0.9, SW)}`.concat('/>'),
    `<path d="M${flagX} ${n(flagTop - 148)} l104 34 -104 34 z" ${solid(TEAL, 0.35)}/>`,
    `<path d="M${flagX} ${n(flagTop - 148)} l104 34 -104 34 z" ${stroke(TEAL, 0.9)}/>`,
  );

  // The accountability chain running beneath: three roles, linked.
  const roleY = 985;
  const roleXs = [430, 800, 1170];
  for (let i = 0; i < roleXs.length; i += 1) {
    parts.push(person(roleXs[i], roleY, 32, ACCENT, 0.7));
    if (i > 0) {
      parts.push(
        `<path d="M${n(roleXs[i - 1] + 62)} ${n(roleY + 18)} H${n(roleXs[i] - 62)}" ${stroke(ACCENT, 0.5, 2.8)}/>`,
      );
    }
    parts.push(
      `<path d="M${roleXs[i]} ${n(roleY - 54)} V${n(baseY + 34)}" ${stroke(ACCENT, 0.45, 2.8)} stroke-dasharray="8 10"/>`,
    );
  }
  parts.push(`<path d="M${x0} ${n(baseY + 2)} H${n(x0 + 5 * stepW - 16)}" ${stroke(ACCENT, 0.45, SW)}/>`);

  return wrap('gov', parts.join(''));
};

/**
 * Discovery — a magnifier passing over the estate.
 * A grid of sources; the ones inside the lens have been found and classified, the rest have not
 * been reached yet.
 */
const discovery = () => {
  const parts = [];
  const lensX = 1000;
  const lensY = 520;
  const lensR = 250;

  const items = [];
  const cols = 6;
  const rows = 4;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = 250 + c * 220;
      const y = 300 + r * 180;
      const inside = Math.hypot(x + 40 - lensX, y + 30 - lensY) < lensR - 30;
      items.push({ x, y, inside, kind: (r * cols + c) % 3 });
    }
  }

  for (const it of items) {
    const o = it.inside ? 0.85 : 0.26;
    const col = it.inside ? TEAL : ACCENT;
    if (it.kind === 0) parts.push(folder(it.x, it.y, 92, col, o));
    else if (it.kind === 1) parts.push(cylinder(n(it.x + 46), n(it.y + 14), 88, 54, col, o));
    else parts.push(doc(it.x, it.y, 66, 3, col, o));
  }

  parts.push(magnifier(lensX, lensY, lensR, TEAL, 0.85));

  return wrap('disc', parts.join(''));
};

/**
 * Classification — items sorted into the five-level taxonomy.
 * Unsorted objects on the left funnel into five ranked bands, brightening toward the most
 * restricted.
 */
const classification = () => {
  const random = mulberry32(0xc1a5);
  const parts = [];
  const bandX = 820;
  const bandW = 560;

  for (let i = 0; i < 5; i += 1) {
    const y = 250 + i * 145;
    parts.push(
      `<rect x="${bandX}" y="${y}" width="${bandW}" height="104" rx="4" ${solid(ACCENT, 0.08 + i * 0.05)}/>`,
      `<rect x="${bandX}" y="${y}" width="${bandW}" height="104" rx="4" ${stroke(ACCENT, 0.35 + i * 0.11)}/>`,
      `<rect x="${bandX}" y="${y}" width="14" height="104" ${solid(i === 4 ? TEAL : ACCENT, 0.55 + i * 0.1)}/>`,
    );
    // The items already filed at this level.
    for (let j = 0; j < 3 + i; j += 1) {
      parts.push(
        `<rect x="${n(bandX + 58 + j * 56)}" y="${n(y + 34)}" width="36" height="36" rx="3" ${solid(i === 4 ? TEAL : ACCENT, 0.3 + i * 0.09)}/>`,
      );
    }
  }

  // The unsorted pile, and the lines routing each item to a level.
  for (let i = 0; i < 9; i += 1) {
    const x = 220 + (i % 3) * 120;
    const y = 300 + Math.floor(i / 3) * 190;
    parts.push(
      `<rect x="${x}" y="${y}" width="88" height="88" rx="4" ${solid(INK, 0.1)}/>`,
      `<rect x="${x}" y="${y}" width="88" height="88" rx="4" ${stroke(INK, 0.45)}/>`,
    );
    const level = Math.floor(random() * 5);
    parts.push(link(x + 88, y + 44, bandX - 18, 250 + level * 145 + 52, ACCENT, 0.34, 2.6));
  }
  parts.push(arrow(bandX - 6, MID - 100, 20, ACCENT, 0.5));

  return wrap('class', parts.join(''));
};

/**
 * DSPM — every source family on the left, the posture engine in the middle, findings on the right.
 * Two findings carry an exposure flag; the rest are classified and quiet.
 */
const dspm = () => {
  const parts = [];
  const srcX = 240;
  const engineX = 800;
  const outX = 1240;

  const sources = [
    (y) => folder(srcX, y - 34, 96),
    (y) => cylinder(srcX + 48, y - 28, 92, 58),
    (y) => cloud(srcX + 48, y + 10, 118),
    (y) => endpoint(srcX, y - 32, 100),
  ];
  const srcYs = [300, 500, 700, 890];

  for (let i = 0; i < sources.length; i += 1) {
    parts.push(sources[i](srcYs[i]));
    parts.push(link(srcX + 126, srcYs[i], engineX - 92, MID, ACCENT, 0.3));
  }

  // The engine: a shield with a tick, because posture is discovery plus a judgement.
  parts.push(
    `<circle cx="${engineX}" cy="${MID}" r="150" ${solid(ACCENT, 0.09)}/>`,
    `<circle cx="${engineX}" cy="${MID}" r="150" ${stroke(ACCENT, 0.5)}/>`,
    shield(engineX - 62, MID - 76, 124, TEAL, 0.85),
    tick(engineX, MID + 6, 26, TEAL, 0.95),
  );

  // Findings, ranked. Two are exposed.
  const findY = [330, 470, 610, 750, 890];
  for (let i = 0; i < findY.length; i += 1) {
    const exposed = i === 1 || i === 3;
    const col = exposed ? AMBER : ACCENT;
    parts.push(
      link(engineX + 158, MID, outX - 24, findY[i], col, exposed ? 0.55 : 0.28),
      `<rect x="${outX}" y="${n(findY[i] - 34)}" width="220" height="68" rx="4" ${solid(col, exposed ? 0.18 : 0.09)}/>`,
      `<rect x="${outX}" y="${n(findY[i] - 34)}" width="220" height="68" rx="4" ${stroke(col, exposed ? 0.85 : 0.4)}/>`,
      `<path d="M${outX} ${n(findY[i] - 34)} v68" ${stroke(col, exposed ? 0.95 : 0.5, 7)}/>`,
      exposed
        ? cross(outX + 168, findY[i], 15, AMBER, 0.95)
        : `<circle cx="${outX + 168}" cy="${findY[i]}" r="9" ${solid(ACCENT, 0.5)}/>`,
      `<path d="M${outX + 42} ${n(findY[i] - 10)} h96 M${outX + 42} ${n(findY[i] + 12)} h62" ${stroke(col, 0.35, 2.6)}/>`,
    );
  }

  return wrap('dspm', parts.join(''));
};

/**
 * DLP — the four channels data leaves by, and the boundary that stops two of them.
 */
const dlp = () => {
  const parts = [];
  const lineX = 880;
  const startX = 300;

  const channels = [
    { y: 300, draw: envelope(startX, 268, 120), blocked: false },
    { y: 520, draw: cloud(startX + 60, 530, 130), blocked: true },
    { y: 740, draw: drive(startX + 36, 690, 84), blocked: true },
    { y: 940, draw: endpoint(startX, 905, 116), blocked: false },
  ];

  parts.push(boundary(lineX, SAFE_TOP + 20, SAFE_BOTTOM - 20));

  for (const ch of channels) {
    parts.push(ch.draw);
    const col = ch.blocked ? AMBER : TEAL;
    parts.push(link(startX + 170, ch.y, lineX - 40, ch.y, col, 0.45, 3));

    if (ch.blocked) {
      parts.push(cross(lineX, ch.y, 26, AMBER, 0.95));
    } else {
      parts.push(
        link(lineX + 40, ch.y, 1320, ch.y, col, 0.4, 3),
        arrow(1350, ch.y, 22, TEAL, 0.8),
        tick(lineX, ch.y, 22, TEAL, 0.9),
      );
    }
  }

  // The shield sitting on the boundary, so the line reads as a control rather than a wall.
  parts.push(shield(lineX - 74, MID - 96, 148, ACCENT, 0.85));

  return wrap('dlp', parts.join(''));
};

/**
 * AINerve — prompts, agent calls and tool use arriving at one policy gate, leaving as allow,
 * redact or block.
 */
const ainerve = () => {
  const parts = [];
  const gateX = 800;
  const inX = 250;

  const inputs = [340, 520, 700, 880];
  for (const y of inputs) {
    // A prompt, drawn as a speech block with a tail.
    parts.push(
      `<rect x="${inX}" y="${n(y - 52)}" width="230" height="104" rx="14" ${solid(ACCENT, 0.12)}/>`,
      `<rect x="${inX}" y="${n(y - 52)}" width="230" height="104" rx="14" ${stroke(ACCENT, 0.6)}/>`,
      `<path d="M${inX + 34} ${n(y + 52)} v26 l30 -26 z" ${solid(ACCENT, 0.12)}/>`,
      `<path d="M${inX + 34} ${n(y + 52)} v26 l30 -26 z" ${stroke(ACCENT, 0.6)}/>`,
      `<path d="M${inX + 28} ${n(y - 18)} h150 M${inX + 28} ${n(y + 12)} h104" ${stroke(ACCENT, 0.4, 2.8)}/>`,
      link(inX + 244, y, gateX - 96, MID, ACCENT, 0.3),
    );
  }

  // The gate.
  parts.push(
    `<rect x="${gateX - 90}" y="${SAFE_TOP + 60}" width="180" height="${SAFE_BOTTOM - SAFE_TOP - 120}" rx="14" ${solid(ACCENT, 0.1)}/>`,
    `<rect x="${gateX - 90}" y="${SAFE_TOP + 60}" width="180" height="${SAFE_BOTTOM - SAFE_TOP - 120}" rx="14" ${stroke(ACCENT, 0.6)}/>`,
    shield(gateX - 70, MID - 84, 140, ACCENT, 0.9),
    tick(gateX, MID + 4, 24, TEAL, 0.95),
  );

  // Three outcomes.
  const outs = [
    { y: 340, col: TEAL, mark: 'tick' },
    { y: MID, col: ACCENT, mark: 'redact' },
    { y: 880, col: AMBER, mark: 'cross' },
  ];
  for (const o of outs) {
    parts.push(link(gateX + 96, MID, 1230, o.y, o.col, 0.4, 3));
    parts.push(
      `<rect x="1250" y="${n(o.y - 52)}" width="120" height="104" rx="12" ${solid(o.col, 0.14)}/>`,
      `<rect x="1250" y="${n(o.y - 52)}" width="120" height="104" rx="12" ${stroke(o.col, 0.8)}/>`,
    );
    if (o.mark === 'tick') parts.push(tick(1310, o.y + 6, 24, TEAL, 0.95));
    else if (o.mark === 'cross') parts.push(cross(1310, o.y, 22, AMBER, 0.95));
    else
      parts.push(
        `<path d="M1278 ${n(o.y - 16)} h64 M1278 ${n(o.y + 12)} h34" ${stroke(ACCENT, 0.75, 8)}/>`,
      );
  }

  return wrap('ai', parts.join(''));
};

/**
 * SOCMINT — three identifiers in, a ring of public platforms searched, one correlated subject,
 * and a cited report out.
 */
const socmint = () => {
  const parts = [];
  const cx = 720;
  const cy = MID;

  // The identifiers that start an inquiry.
  const ids = [380, MID, 820];
  for (const y of ids) {
    parts.push(
      `<rect x="150" y="${n(y - 40)}" width="200" height="80" rx="40" ${solid(ACCENT, 0.12)}/>`,
      `<rect x="150" y="${n(y - 40)}" width="200" height="80" rx="40" ${stroke(ACCENT, 0.6)}/>`,
      `<circle cx="196" cy="${y}" r="15" ${solid(ACCENT, 0.55)}/>`,
      `<path d="M228 ${y} h84" ${stroke(ACCENT, 0.4, 3)}/>`,
      link(350, y, cx - 168, cy, ACCENT, 0.3),
    );
  }

  // The platforms searched, on a ring. The filled ones returned a confirmed match.
  const ring = [
    [0, true],
    [40, false],
    [80, true],
    [125, false],
    [180, true],
    [230, false],
    [270, true],
    [320, false],
  ];
  for (const [deg, hit] of ring) {
    const a = (deg * Math.PI) / 180;
    const x = n(cx + Math.cos(a) * 300 - 38);
    const y = n(cy + Math.sin(a) * 250 - 38);
    parts.push(tile(x, y, 76, hit ? TEAL : ACCENT, hit ? 0.85 : 0.4, hit));
    if (hit) parts.push(link(x + 38, y + 38, cx, cy, TEAL, 0.3, 2.4));
  }

  // The subject every confirmed match resolves to.
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="120" ${solid(ACCENT, 0.1)}/>`,
    `<circle cx="${cx}" cy="${cy}" r="120" ${stroke(ACCENT, 0.55)}/>`,
    person(cx, cy - 22, 40, INK, 0.85),
  );

  // The deliverable.
  parts.push(
    doc(1250, cy - 200, 240, 5, TEAL, 0.85),
    link(cx + 310, cy, 1240, cy, TEAL, 0.4, 3),
    arrow(1244, cy, 20, TEAL, 0.75),
  );

  return wrap('soc', parts.join(''));
};

/**
 * Evidence and reporting — one report, every claim traced back to the object that produced it.
 */
const evidence = () => {
  const parts = [];
  const docX = 940;
  const docY = 300;
  const docW = 420;

  // The sources each claim cites.
  const srcY = [300, 470, 640, 810];
  for (let i = 0; i < srcY.length; i += 1) {
    const y = srcY[i];
    parts.push(
      i % 2 === 0 ? cylinder(320, y - 34, 132, 82) : folder(250, y - 48, 140),
      link(400, y + 4, docX - 40, docY + 140 + i * 130, ACCENT, 0.4, 2.8),
    );
  }

  parts.push(doc(docX, docY, docW, 5, ACCENT, 0.8));

  // The seal: evidence is only evidence if somebody signed for it.
  const sealX = docX + docW - 40;
  const sealY = docY + docW * 1.3 - 60;
  parts.push(
    `<circle cx="${sealX}" cy="${sealY}" r="72" ${solid(TEAL, 0.16)}/>`,
    `<circle cx="${sealX}" cy="${sealY}" r="72" ${stroke(TEAL, 0.9, SW * 1.2)}/>`,
    `<circle cx="${sealX}" cy="${sealY}" r="52" ${stroke(TEAL, 0.4)}/>`,
    tick(sealX, sealY + 8, 28, TEAL, 0.95),
  );

  return wrap('evid', parts.join(''));
};

/**
 * Data quality — six dimensions, each a dial at a different level. Completeness through timeliness.
 */
const quality = () => {
  const parts = [];
  const levels = [0.82, 0.64, 0.93, 0.48, 0.75, 0.88];

  for (let i = 0; i < 6; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = 420 + col * 380;
    const cy = 420 + row * 380;
    const r = 118;
    const level = levels[i];
    const sweep = Math.PI * 1.5 * level;
    const start = Math.PI * 0.75;
    const end = start + sweep;
    const big = sweep > Math.PI ? 1 : 0;

    parts.push(
      // The track.
      `<path d="M${n(cx + Math.cos(start) * r)} ${n(cy + Math.sin(start) * r)} A${r} ${r} 0 1 1 ${n(cx + Math.cos(Math.PI * 0.25) * r)} ${n(cy + Math.sin(Math.PI * 0.25) * r)}" ${stroke(INK, 0.12, 16)}/>`,
      // The reading.
      `<path d="M${n(cx + Math.cos(start) * r)} ${n(cy + Math.sin(start) * r)} A${r} ${r} 0 ${big} 1 ${n(cx + Math.cos(end) * r)} ${n(cy + Math.sin(end) * r)}" ${stroke(level > 0.7 ? TEAL : AMBER, 0.85, 16)}/>`,
      `<circle cx="${cx}" cy="${cy}" r="${r - 46}" ${solid(ACCENT, 0.1)}/>`,
      `<circle cx="${cx}" cy="${cy}" r="${r - 46}" ${stroke(ACCENT, 0.35)}/>`,
      `<circle cx="${cx}" cy="${cy}" r="12" ${solid(level > 0.7 ? TEAL : AMBER, 0.8)}/>`,
    );
  }

  return wrap('qual', parts.join(''));
};

/**
 * Deployment — the same platform in three places: your premises, an isolated environment, and
 * cloud. Identical payload under each, because the model changes where it runs and nothing else.
 */
const deployment = () => {
  const parts = [];
  const xs = [330, 800, 1270];
  const topY = 300;

  parts.push(building(xs[0] - 130, topY, 260));

  // Air-gapped: the same premises inside a sealed ring with the link broken.
  parts.push(
    building(xs[1] - 110, topY + 22, 220),
    `<circle cx="${xs[1]}" cy="${topY + 118}" r="188" ${stroke(TEAL, 0.5, SW)} stroke-dasharray="16 16"/>`,
    cross(xs[1] - 188, topY + 118, 22, AMBER, 0.85),
    cross(xs[1] + 188, topY + 118, 22, AMBER, 0.85),
  );

  parts.push(cloud(xs[2], topY + 150, 360));

  // The identical stack under each, so the three read as one platform in three places.
  for (const x of xs) {
    for (let i = 0; i < 3; i += 1) {
      const y = 700 + i * 96;
      parts.push(
        `<rect x="${x - 150}" y="${y}" width="300" height="72" rx="5" ${solid(ACCENT, 0.12)}/>`,
        `<rect x="${x - 150}" y="${y}" width="300" height="72" rx="5" ${stroke(ACCENT, 0.5)}/>`,
        `<circle cx="${x - 112}" cy="${y + 36}" r="12" ${solid(i === 1 ? TEAL : ACCENT, 0.7)}/>`,
        `<path d="M${x - 78} ${y + 28} h150 M${x - 78} ${y + 50} h96" ${stroke(ACCENT, 0.32, 2.6)}/>`,
      );
    }
    parts.push(`<path d="M${x} ${topY + 320} V690" ${stroke(ACCENT, 0.3, 2.6)} stroke-dasharray="8 10"/>`);
  }

  return wrap('dep', parts.join(''));
};

/**
 * Partners — two organisations, each with their own people, joined by one certification.
 */
const partners = () => {
  const parts = [];
  const left = 420;
  const right = 1180;
  const cy = MID;

  for (const [x, col] of [
    [left, ACCENT],
    [right, ACCENT],
  ]) {
    parts.push(
      `<circle cx="${x}" cy="${cy}" r="230" ${solid(col, 0.07)}/>`,
      `<circle cx="${x}" cy="${cy}" r="230" ${stroke(col, 0.35)}/>`,
    );
    const seats = [
      [0, -120],
      [-118, 46],
      [118, 46],
    ];
    for (const [dx, dy] of seats) {
      parts.push(person(x + dx, cy + dy, 40, col, 0.7));
      parts.push(link(x, cy, x + dx, cy + dy + 40, col, 0.2, 2.2));
    }
  }

  // The certification that makes the overlap mean something.
  parts.push(
    `<circle cx="${(left + right) / 2}" cy="${cy}" r="112" ${solid(TEAL, 0.16)}/>`,
    `<circle cx="${(left + right) / 2}" cy="${cy}" r="112" ${stroke(TEAL, 0.9, SW * 1.2)}/>`,
    tick((left + right) / 2, cy + 10, 40, TEAL, 0.95),
    link(left + 232, cy, (left + right) / 2 - 114, cy, TEAL, 0.45, 3),
    link((left + right) / 2 + 114, cy, right - 232, cy, TEAL, 0.45, 3),
  );

  return wrap('part', parts.join(''));
};

/**
 * The portfolio — three products on one control plane, sharing the taxonomy underneath.
 */
const portfolio = () => {
  const parts = [];
  const hubs = [
    { x: 400, y: 400 },
    { x: 1200, y: 400 },
    { x: 800, y: 860 },
  ];

  // The plane they all sit on.
  parts.push(
    `<path d="M800 230 L1490 600 L800 970 L110 600 Z" ${solid(ACCENT, 0.09)}/>`,
    `<path d="M800 230 L1490 600 L800 970 L110 600 Z" ${stroke(ACCENT, 0.45)} stroke-dasharray="14 12"/>`,
  );

  for (let i = 0; i < hubs.length; i += 1) {
    for (let j = i + 1; j < hubs.length; j += 1) {
      parts.push(link(hubs[i].x, hubs[i].y, hubs[j].x, hubs[j].y, ACCENT, 0.45, 3));
    }
  }

  const marks = [
    (h) => shield(h.x - 62, h.y - 74, 124, TEAL, 0.9),
    (h) =>
      `<path d="M${h.x + 16} ${h.y - 74} l-58 88 h46 l-14 76 58 -92 h-46 z" ${solid(TEAL, 0.3)}/>` +
      `<path d="M${h.x + 16} ${h.y - 74} l-58 88 h46 l-14 76 58 -92 h-46 z" ${stroke(TEAL, 0.9)}/>`,
    (h) => magnifier(h.x, h.y - 10, 62, TEAL, 0.9),
  ];

  for (let i = 0; i < hubs.length; i += 1) {
    const h = hubs[i];
    parts.push(
      `<circle cx="${h.x}" cy="${h.y}" r="140" ${solid(ACCENT, 0.18)}/>`,
      `<circle cx="${h.x}" cy="${h.y}" r="140" ${stroke(ACCENT, 0.8)}/>`,
      marks[i](h),
    );
  }

  return wrap('port', parts.join(''));
};

/*
 * About half of these are drawn but not currently placed. That is the point of them working, not a
 * sign that they are not: they were stand-ins, and as the client supplies real photography for a
 * band its plate stands down. The set stays whole -- twelve drawn from one vocabulary -- because
 * the next band that needs one should not have to wait for a plate to be written, and because a
 * half-set stops reading as a family.
 *
 * Run `npm run art:cards` after editing any of them; the whole set regenerates deterministically.
 */
const PLATES = {
  'art-governance.svg': governance,
  'art-discovery.svg': discovery,
  'art-classification.svg': classification,
  'art-dspm.svg': dspm,
  'art-dlp.svg': dlp,
  'art-ainerve.svg': ainerve,
  'art-socmint.svg': socmint,
  'art-evidence.svg': evidence,
  'art-quality.svg': quality,
  'art-deployment.svg': deployment,
  'art-partners.svg': partners,
  'art-portfolio.svg': portfolio,
};

await mkdir(outDir, { recursive: true });

for (const [name, draw] of Object.entries(PLATES)) {
  const svg = draw();
  await writeFile(join(outDir, name), svg, 'utf8');
  console.log(`${name.padEnd(28)} ${(Buffer.byteLength(svg) / 1024).toFixed(1)} kB`);
}

console.log(`\n${Object.keys(PLATES).length} card plates written to assets/media.`);
