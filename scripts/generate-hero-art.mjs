#!/usr/bin/env node
/**
 * Renders the six hero plates as original SVG artwork into /assets/media.
 *
 * Why this exists: the hero slots needed licensed footage, and the free stock libraries reachable
 * from here carry nothing that fits the brief — their free tiers are lifestyle footage full of
 * recognisable faces and third-party product UI, both of which docs/design-reference.md bars. Rather
 * than ship a security vendor's site on stock "cyber" clips, every plate below is drawn from
 * scratch. Original work: nothing to licence, nothing to clear, and a few kB instead of 4MB.
 *
 * Each plate shares its visual vocabulary with the matching canvas variant in
 * apps/web/src/lib/backdrop.ts, so the still and the motion layer read as one image: the SVG paints
 * immediately as the LCP element, then the canvas animates the same composition on top.
 *
 * Deterministic — the same seed always produces the same plate, so re-running never churns the diff.
 * Run with `npm run art:generate`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets', 'media');

const WIDTH = 1920;
const HEIGHT = 1080;

/**
 * Brand tokens, mirrored from apps/web/src/styles/tokens.css.
 *
 * BASE is the navy the hero band runs on, not the page background — the page itself is the warm
 * off-white and only the hero and footer are dark. The plates therefore have to sit on navy and
 * carry white display type, which is why the wash is stronger here than it looks in isolation.
 */
const BASE = '#041E42';
const ACCENT = '#0E70F7';
const INK = '#FFFFFF';

/** Same generator as lib/backdrop.ts, so a plate and its canvas variant agree. */
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const n = (value) => Number(value.toFixed(1));

/**
 * Shared ground: a cool wash from the upper left, a floor glow, and a vignette. Every plate sits on
 * this so the six read as one family, and so white display type keeps its contrast in the lower
 * left where the headline lands.
 */
const defs = (extra = '') => `
  <defs>
    <radialGradient id="wash" cx="22%" cy="12%" r="95%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="${ACCENT}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="45%" r="78%">
      <stop offset="55%" stop-color="${BASE}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${BASE}" stop-opacity="0.8"/>
    </radialGradient>
    <linearGradient id="legibility" x1="0" y1="1" x2="0.55" y2="0">
      <stop offset="0%" stop-color="${BASE}" stop-opacity="0.82"/>
      <stop offset="60%" stop-color="${BASE}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${BASE}" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
${extra}
  </defs>`;

/** Wraps a plate's own geometry in the shared ground and the legibility scrim. */
const plate = (body, extraDefs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="presentation">
${defs(extraDefs)}
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BASE}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash)"/>
${body}
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#legibility)"/>
</svg>
`;

/* ---------------------------------------------------------------- network */
/** Home. Nodes linked by proximity, with a few charged pulses travelling between them. */
const network = () => {
  const random = mulberry32(0x5ec);
  const nodes = Array.from({ length: 78 }, () => ({
    x: random() * WIDTH,
    y: random() * HEIGHT,
    r: 1.6 + random() * 2.2,
  }));

  const max = 250;
  const links = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (distance > max) continue;
      const strength = (1 - distance / max) * 0.28;
      links.push(
        `<line x1="${n(nodes[i].x)}" y1="${n(nodes[i].y)}" x2="${n(nodes[j].x)}" y2="${n(
          nodes[j].y,
        )}" stroke="${ACCENT}" stroke-opacity="${strength.toFixed(3)}" stroke-width="1"/>`,
      );
    }
  }

  const dots = nodes.map(
    (node) =>
      `<circle cx="${n(node.x)}" cy="${n(node.y)}" r="${n(node.r)}" fill="${INK}" fill-opacity="${(
        0.25 +
        random() * 0.35
      ).toFixed(3)}"/>`,
  );

  // A handful of nodes are lit, standing in for the pulses the canvas layer animates.
  const charged = Array.from({ length: 7 }, () => {
    const node = nodes[Math.floor(random() * nodes.length)];
    return `<circle cx="${n(node.x)}" cy="${n(node.y)}" r="26" fill="${ACCENT}" fill-opacity="0.5" filter="url(#soft)"/>
    <circle cx="${n(node.x)}" cy="${n(node.y)}" r="3.4" fill="${ACCENT}"/>`;
  });

  return plate(
    `  <g>${links.join('')}</g>
  <g>${dots.join('')}</g>
  <g>${charged.join('')}</g>`,
  );
};

/* ---------------------------------------------------------------- lattice */
/** About. A measured grid under a scanning band — the platform auditing its own estate. */
const lattice = () => {
  const random = mulberry32(0xa11);
  const step = 86;
  const marks = [];
  const lit = [];
  const scanY = HEIGHT * 0.46;

  for (let y = 0; y <= HEIGHT + step; y += step) {
    for (let x = 0; x <= WIDTH + step; x += step) {
      const px = x + (random() - 0.5) * step * 0.26;
      const py = y + (random() - 0.5) * step * 0.26;
      marks.push(
        `<path d="M${n(px - 7)} ${n(py)}H${n(px + 7)}M${n(px)} ${n(py - 7)}V${n(py + 7)}"/>`,
      );

      const proximity = Math.max(0, 1 - Math.abs(py - scanY) / 260);
      if (proximity > 0.05) {
        lit.push(
          `<circle cx="${n(px)}" cy="${n(py)}" r="${n(2 + proximity * 3.4)}" fill="${ACCENT}" fill-opacity="${(
            proximity * 0.8
          ).toFixed(3)}"/>`,
        );
      }
    }
  }

  return plate(
    `  <g stroke="${ACCENT}" stroke-opacity="0.22" stroke-width="1.2">${marks.join('')}</g>
  <rect x="0" y="${n(scanY - 150)}" width="${WIDTH}" height="300" fill="url(#band)"/>
  <g>${lit.join('')}</g>`,
    `    <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${ACCENT}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </linearGradient>`,
  );
};

/* ---------------------------------------------------------------- circuit */
/** Platform. Orthogonal traces with lit heads — data taking routed paths across the estate. */
const circuit = () => {
  const random = mulberry32(0xc17);
  const traces = [];
  const heads = [];
  const joints = [];

  for (let t = 0; t < 16; t += 1) {
    let x = random() * WIDTH;
    let y = random() * HEIGHT;
    const points = [{ x, y }];
    const segments = 4 + Math.floor(random() * 4);

    for (let i = 0; i < segments; i += 1) {
      const horizontal = i % 2 === 0;
      const travel = (random() * 0.2 + 0.07) * (random() > 0.5 ? 1 : -1);
      x = horizontal ? x + travel * WIDTH : x;
      y = horizontal ? y : y + travel * HEIGHT;
      points.push({ x, y });
    }

    traces.push(
      `<path d="M${points.map((p) => `${n(p.x)} ${n(p.y)}`).join('L')}" fill="none" stroke="${ACCENT}" stroke-opacity="0.2" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`,
    );
    for (const point of points) {
      joints.push(
        `<circle cx="${n(point.x)}" cy="${n(point.y)}" r="2.6" fill="${INK}" fill-opacity="0.26"/>`,
      );
    }

    const head = points[Math.floor(random() * points.length)];
    heads.push(
      `<circle cx="${n(head.x)}" cy="${n(head.y)}" r="30" fill="${ACCENT}" fill-opacity="0.45" filter="url(#soft)"/>
    <circle cx="${n(head.x)}" cy="${n(head.y)}" r="3.6" fill="${ACCENT}"/>`,
    );
  }

  return plate(`  <g>${traces.join('')}</g>
  <g>${joints.join('')}</g>
  <g>${heads.join('')}</g>`);
};

/* ----------------------------------------------------------------- cipher */
/** DataNerve. Falling glyph columns — data rendered unreadable to anything without the key. */
const cipher = () => {
  const random = mulberry32(0xc1f);
  // `<`, `>` and `&` are illegal as raw XML text content and silently break the whole plate,
  // so the set is stored pre-escaped rather than escaped at the point of use.
  const GLYPHS = [
    '0', '1', '&lt;', '&gt;', '{', '}', '[', ']', '/', '\\', '|', '=', '+',
    '*', '#', '$', '%', '&amp;', '@', 'A', 'B', 'C', 'D', 'E', 'F',
  ];
  const step = 52;
  const rowStep = 34;
  const rules = [];
  const glyphs = [];

  for (let x = step / 2; x < WIDTH; x += step) {
    rules.push(
      `<line x1="${n(x)}" y1="0" x2="${n(x)}" y2="${HEIGHT}" stroke="${ACCENT}" stroke-opacity="0.06" stroke-width="1"/>`,
    );

    const offset = random() * HEIGHT;
    for (let row = 0; row * rowStep < HEIGHT + rowStep; row += 1) {
      const y = (row * rowStep + offset) % (HEIGHT + rowStep);
      // Brightest through the middle band, so the columns read as falling rather than as a wall.
      const head = 1 - Math.min(1, Math.abs(y - HEIGHT * 0.45) / (HEIGHT * 0.55));
      const opacity = 0.07 + head * 0.22;
      // Anything fainter than this is invisible against the base but still costs bytes.
      if (opacity < 0.12) continue;
      const isKey = row % 7 === 0;
      glyphs.push(
        `<text x="${n(x)}" y="${n(y)}" fill="${isKey ? ACCENT : INK}" fill-opacity="${opacity.toFixed(
          3,
        )}">${GLYPHS[Math.floor(random() * GLYPHS.length)]}</text>`,
      );
    }
  }

  return plate(
    `  <g>${rules.join('')}</g>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="15" text-anchor="middle">${glyphs.join(
    '',
  )}</g>`,
  );
};

/* ----------------------------------------------------------------- signal */
/** AINerve. A prompt stream crossing an inspection window — traffic caught mid-flight. */
const signal = () => {
  const random = mulberry32(0x519);
  const midline = HEIGHT * 0.5;
  const amplitude = 168;

  const wave = (phaseShift, opacity, strokeWidth) => {
    const points = [];
    for (let x = 0; x <= WIDTH; x += 6) {
      const phase = x * 0.0062 + phaseShift;
      const y =
        midline +
        Math.sin(phase) * amplitude * 0.5 +
        Math.sin(phase * 2.3 + 1.1) * amplitude * 0.28 +
        Math.sin(phase * 0.5 + 2.2) * amplitude * 0.22;
      points.push(`${n(x)} ${n(y)}`);
    }
    return `<path d="M${points.join('L')}" fill="none" stroke="${ACCENT}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
  };

  const windowX = WIDTH * 0.52;
  const windowWidth = 420;

  const particles = Array.from({ length: 150 }, () => {
    const x = random() * WIDTH;
    const y = random() * HEIGHT;
    const inside = x > windowX && x < windowX + windowWidth;
    return `<circle cx="${n(x)}" cy="${n(y)}" r="${inside ? 2.8 : 1.6}" fill="${
      inside ? ACCENT : INK
    }" fill-opacity="${inside ? 0.75 : 0.16}"/>`;
  });

  return plate(
    `  <g>${wave(0.6, '0.16', 1)}${wave(0.2, '0.28', 1.2)}${wave(0, '0.6', 1.8)}</g>
  <rect x="${n(windowX)}" y="${n(midline - amplitude - 60)}" width="${windowWidth}" height="${n(
    amplitude * 2 + 120,
  )}" fill="${ACCENT}" fill-opacity="0.08" stroke="${ACCENT}" stroke-opacity="0.55" stroke-width="1.5"/>
  <g>${particles.join('')}</g>`,
  );
};

/* ----------------------------------------------------------- architecture */
/** Contact. A receding floor toward a lit horizon — somewhere to walk into. */
const architecture = () => {
  const horizon = HEIGHT * 0.44;
  const vanishX = WIDTH * 0.5;
  const rays = [];
  const rungs = [];

  for (let i = -16; i <= 16; i += 1) {
    const spread = i / 16;
    rays.push(
      `<line x1="${vanishX}" y1="${n(horizon)}" x2="${n(
        vanishX + spread * WIDTH * 2.2,
      )}" y2="${HEIGHT}" stroke="${ACCENT}" stroke-opacity="${(0.3 - Math.abs(spread) * 0.19).toFixed(
        3,
      )}" stroke-width="1.2"/>`,
    );
  }

  // Eased spacing so the rungs bunch toward the horizon and read as perspective.
  for (let row = 0; row < 18; row += 1) {
    const t = row / 18;
    const y = horizon + Math.pow(t, 2.4) * (HEIGHT - horizon);
    rungs.push(
      `<line x1="0" y1="${n(y)}" x2="${WIDTH}" y2="${n(y)}" stroke="${ACCENT}" stroke-opacity="${(
        0.07 +
        t * 0.2
      ).toFixed(3)}" stroke-width="1.2"/>`,
    );
  }

  return plate(
    `  <rect x="0" y="${n(horizon - HEIGHT * 0.32)}" width="${WIDTH}" height="${n(
      HEIGHT * 0.32 + 28,
    )}" fill="url(#horizonGlow)"/>
  <g>${rays.join('')}</g>
  <g>${rungs.join('')}</g>
  <line x1="0" y1="${n(horizon)}" x2="${WIDTH}" y2="${n(
    horizon,
  )}" stroke="${ACCENT}" stroke-opacity="0.5" stroke-width="1.5" filter="url(#glow)"/>`,
    `    <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0.32"/>
    </linearGradient>`,
  );
};

const PLATES = {
  'hero-home.svg': network,
  'hero-about.svg': lattice,
  'hero-platform.svg': circuit,
  'hero-datanerve.svg': cipher,
  'hero-ainerve.svg': signal,
  'hero-contact.svg': architecture,
};

/**
 * A raw `&`, `<` or `>` in text content is illegal XML, and a browser drops the whole plate on the
 * floor when it hits one — silently, with no console error. That cost one debugging round already,
 * so nothing is written until it parses.
 */
const ENTITY = /&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g;

const assertWellFormed = (name, svg) => {
  const problems = [];

  for (const [, text] of svg.matchAll(/>([^<]*)</g)) {
    const stripped = text.replace(ENTITY, '');
    for (const char of ['&', '<', '>']) {
      if (stripped.includes(char)) problems.push(`raw "${char}" in text content: ${text.trim().slice(0, 40)}`);
    }
  }

  const opens = (svg.match(/</g) ?? []).length;
  const closes = (svg.match(/>/g) ?? []).length;
  if (opens !== closes) problems.push(`unbalanced angle brackets: ${opens} "<" vs ${closes} ">"`);

  if (problems.length > 0) {
    throw new Error(`${name} is not well-formed XML:\n  - ${problems.join('\n  - ')}`);
  }
};

await mkdir(outDir, { recursive: true });

for (const [name, render] of Object.entries(PLATES)) {
  const svg = render();
  assertWellFormed(name, svg);
  await writeFile(join(outDir, name), svg, 'utf8');
  console.log(`art: ${name} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} kB)`);
}

console.log(`art: ${Object.keys(PLATES).length} plates written to assets/media`);
