/**
 * Authored generative backdrops.
 *
 * These exist because the hero media slots have no licensed footage yet, and stock "cyber security"
 * video reads as fake on a security vendor's site. Everything drawn here is original work, so there
 * is no licence to register and nothing to clear — and it costs a few kilobytes instead of the 4MB
 * an MP4 would. `VideoHero` still prefers a real file the moment one lands in assets/media.
 *
 * Six variants, one per hero slot, sharing an engine. All of them are dark, low-contrast and
 * low-motion by design: white display type has to sit on top of them and stay legible.
 */

export type BackdropVariant = 'network' | 'lattice' | 'circuit' | 'cipher' | 'signal' | 'architecture';

type Rgb = readonly [number, number, number];

export interface BackdropPalette {
  readonly accent: Rgb;
  readonly ink: Rgb;
}

export interface Backdrop {
  resize(width: number, height: number): void;
  /** @param dt seconds since the previous frame, already clamped by the caller. */
  step(dt: number): void;
  draw(): void;
}

/** Deterministic PRNG, so the composition is identical on every load and in every screenshot. */
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const rgba = ([r, g, b]: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const VARIANT_SEED: Record<BackdropVariant, number> = {
  network: 0x5ec,
  lattice: 0xa11,
  circuit: 0xc17,
  cipher: 0xc1f,
  signal: 0x519,
  architecture: 0xa2c,
};

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Phase offset so nodes do not pulse in lockstep. */
  phase: number;
}

interface Pulse {
  from: number;
  to: number;
  t: number;
  speed: number;
}

export interface BackdropOptions {
  /**
   * Whether to paint the radial wash. Off when the canvas is layered over a still plate that
   * already carries one — otherwise the two stack and the hero reads a stop brighter than designed.
   */
  readonly wash?: boolean;
}

export function createBackdrop(
  ctx: CanvasRenderingContext2D,
  variant: BackdropVariant,
  palette: BackdropPalette,
  options: BackdropOptions = {},
): Backdrop {
  const { wash: paintWash = true } = options;
  const random = mulberry32(VARIANT_SEED[variant]);

  let width = 0;
  let height = 0;
  let elapsed = 0;

  let nodes: Node[] = [];
  let pulses: Pulse[] = [];
  let traces: Array<Array<{ x: number; y: number }>> = [];
  let columns: Array<{ x: number; offset: number; speed: number; glyphs: string[] }> = [];

  const GLYPHS = '01<>{}[]/\\|=+*#$%&@ABCDEF'.split('');

  const nodeCount = () => {
    const area = width * height;
    const base = Math.round(area / 24000);
    const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 8) : 8;
    const ceiling = cores <= 4 ? 44 : 90;
    return Math.max(18, Math.min(ceiling, base));
  };

  const linkDistance = () => Math.min(220, Math.max(120, Math.hypot(width, height) * 0.12));

  const seedNetwork = () => {
    const count = nodeCount();
    nodes = Array.from({ length: count }, () => ({
      x: random() * width,
      y: random() * height,
      vx: (random() - 0.5) * 12,
      vy: (random() - 0.5) * 12,
      phase: random() * Math.PI * 2,
    }));

    pulses = Array.from({ length: Math.max(3, Math.round(count / 10)) }, () => ({
      from: Math.floor(random() * count),
      to: Math.floor(random() * count),
      t: random(),
      speed: 0.12 + random() * 0.22,
    }));
  };

  const seedLattice = () => {
    const step = Math.max(64, Math.min(120, width / 14));
    const cols = Math.ceil(width / step) + 1;
    const rows = Math.ceil(height / step) + 1;
    nodes = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        nodes.push({
          x: col * step + (random() - 0.5) * step * 0.28,
          y: row * step + (random() - 0.5) * step * 0.28,
          vx: 0,
          vy: 0,
          phase: random() * Math.PI * 2,
        });
      }
    }
  };

  const seedCircuit = () => {
    const count = Math.max(8, Math.round(width / 150));
    traces = Array.from({ length: count }, () => {
      const points = [{ x: random() * width, y: random() * height }];
      const segments = 3 + Math.floor(random() * 4);
      for (let i = 0; i < segments; i += 1) {
        const previous = points[points.length - 1];
        const horizontal = i % 2 === 0;
        const travel = (random() * 0.22 + 0.08) * (random() > 0.5 ? 1 : -1);
        points.push({
          x: horizontal ? previous.x + travel * width : previous.x,
          y: horizontal ? previous.y : previous.y + travel * height,
        });
      }
      return points;
    });

    pulses = traces.map((_, index) => ({
      from: index,
      to: index,
      t: random(),
      speed: 0.06 + random() * 0.12,
    }));
  };

  const seedCipher = () => {
    const step = Math.max(26, Math.min(44, width / 40));
    const count = Math.ceil(width / step);
    columns = Array.from({ length: count }, (_, index) => ({
      x: index * step + step / 2,
      offset: random() * height,
      speed: 8 + random() * 26,
      glyphs: Array.from({ length: Math.ceil(height / 22) + 2 }, () => GLYPHS[Math.floor(random() * GLYPHS.length)]),
    }));
  };

  const seed = () => {
    elapsed = 0;
    if (variant === 'network' || variant === 'signal') seedNetwork();
    else if (variant === 'lattice') seedLattice();
    else if (variant === 'circuit' || variant === 'architecture') seedCircuit();
    else if (variant === 'cipher') seedCipher();
  };

  const clear = () => {
    ctx.clearRect(0, 0, width, height);
    if (!paintWash) return;

    // A cool wash from the top-left keeps the composition from reading as a flat black rectangle.
    const wash = ctx.createRadialGradient(
      width * 0.22,
      height * 0.12,
      0,
      width * 0.22,
      height * 0.12,
      Math.hypot(width, height) * 0.9,
    );
    wash.addColorStop(0, rgba(palette.accent, 0.13));
    wash.addColorStop(0.45, rgba(palette.accent, 0.04));
    wash.addColorStop(1, rgba(palette.accent, 0));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
  };

  const drawNetwork = () => {
    const max = linkDistance();

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance > max) continue;
        const strength = 1 - distance / max;
        ctx.strokeStyle = rgba(palette.accent, strength * 0.2);
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    for (const node of nodes) {
      const twinkle = 0.45 + Math.sin(elapsed * 0.8 + node.phase) * 0.3;
      ctx.fillStyle = rgba(palette.ink, twinkle * 0.5);
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const pulse of pulses) {
      const from = nodes[pulse.from];
      const to = nodes[pulse.to];
      if (!from || !to) continue;
      const x = from.x + (to.x - from.x) * pulse.t;
      const y = from.y + (to.y - from.y) * pulse.t;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 16);
      glow.addColorStop(0, rgba(palette.accent, 0.85));
      glow.addColorStop(1, rgba(palette.accent, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawLattice = () => {
    const scan = ((elapsed * 0.09) % 1.4) - 0.2;
    const scanY = scan * height;

    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.accent, 0.1);
    ctx.beginPath();
    for (const node of nodes) {
      ctx.moveTo(node.x - 6, node.y);
      ctx.lineTo(node.x + 6, node.y);
      ctx.moveTo(node.x, node.y - 6);
      ctx.lineTo(node.x, node.y + 6);
    }
    ctx.stroke();

    for (const node of nodes) {
      const proximity = Math.max(0, 1 - Math.abs(node.y - scanY) / 140);
      if (proximity <= 0.02) continue;
      const lift = Math.sin(elapsed * 0.6 + node.phase) * 0.3 + 0.7;
      ctx.fillStyle = rgba(palette.accent, proximity * lift * 0.75);
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.8 + proximity * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const band = ctx.createLinearGradient(0, scanY - 120, 0, scanY + 120);
    band.addColorStop(0, rgba(palette.accent, 0));
    band.addColorStop(0.5, rgba(palette.accent, 0.08));
    band.addColorStop(1, rgba(palette.accent, 0));
    ctx.fillStyle = band;
    ctx.fillRect(0, scanY - 120, width, 240);
  };

  const pointOnTrace = (points: Array<{ x: number; y: number }>, t: number) => {
    const total = points.length - 1;
    const scaled = Math.min(total - 0.0001, Math.max(0, t * total));
    const index = Math.floor(scaled);
    const local = scaled - index;
    const a = points[index];
    const b = points[index + 1] ?? a;
    return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
  };

  const drawCircuit = () => {
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const points of traces) {
      ctx.strokeStyle = rgba(palette.accent, 0.14);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
      ctx.stroke();

      for (const point of points) {
        ctx.fillStyle = rgba(palette.ink, 0.22);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const pulse of pulses) {
      const points = traces[pulse.from];
      if (!points) continue;
      const head = pointOnTrace(points, pulse.t);
      const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 22);
      glow.addColorStop(0, rgba(palette.accent, 0.8));
      glow.addColorStop(1, rgba(palette.accent, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 22, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCipher = () => {
    ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';

    for (const column of columns) {
      ctx.strokeStyle = rgba(palette.accent, 0.05);
      ctx.beginPath();
      ctx.moveTo(column.x, 0);
      ctx.lineTo(column.x, height);
      ctx.stroke();

      for (let row = 0; row < column.glyphs.length; row += 1) {
        const y = ((row * 22 + column.offset) % (height + 44)) - 22;
        const head = 1 - Math.min(1, Math.abs(y - height * 0.45) / (height * 0.5));
        ctx.fillStyle = rgba(row % 7 === 0 ? palette.accent : palette.ink, 0.06 + head * 0.16);
        ctx.fillText(column.glyphs[row], column.x, y);
      }
    }
  };

  const drawSignal = () => {
    const midline = height * 0.52;
    const amplitude = Math.min(120, height * 0.16);

    ctx.lineWidth = 1.4;
    ctx.strokeStyle = rgba(palette.accent, 0.5);
    ctx.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const phase = x * 0.008 + elapsed * 0.9;
      const y =
        midline +
        Math.sin(phase) * amplitude * 0.5 +
        Math.sin(phase * 2.3 + 1.1) * amplitude * 0.28 +
        Math.sin(phase * 0.5 + 2.2) * amplitude * 0.22;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // The inspection window: what AINerve is for, drawn rather than described.
    const windowWidth = Math.min(280, width * 0.22);
    const travel = (elapsed * 0.07) % 1.3;
    const windowX = travel * (width + windowWidth) - windowWidth;

    ctx.fillStyle = rgba(palette.accent, 0.07);
    ctx.fillRect(windowX, midline - amplitude - 30, windowWidth, amplitude * 2 + 60);
    ctx.strokeStyle = rgba(palette.accent, 0.45);
    ctx.lineWidth = 1;
    ctx.strokeRect(windowX, midline - amplitude - 30, windowWidth, amplitude * 2 + 60);

    for (const node of nodes) {
      const inWindow = node.x > windowX && node.x < windowX + windowWidth;
      ctx.fillStyle = rgba(inWindow ? palette.accent : palette.ink, inWindow ? 0.7 : 0.16);
      ctx.beginPath();
      ctx.arc(node.x, node.y, inWindow ? 2.4 : 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawArchitecture = () => {
    const horizon = height * 0.42;
    const vanishX = width * 0.5;
    const drift = (elapsed * 0.05) % 1;

    ctx.lineWidth = 1;

    for (let i = -14; i <= 14; i += 1) {
      const spread = i / 14;
      ctx.strokeStyle = rgba(palette.accent, 0.12 - Math.abs(spread) * 0.07);
      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(vanishX + spread * width * 2.2, height);
      ctx.stroke();
    }

    for (let row = 0; row < 16; row += 1) {
      const t = (row + drift) / 16;
      const y = horizon + Math.pow(t, 2.4) * (height - horizon);
      if (y > height) continue;
      ctx.strokeStyle = rgba(palette.accent, 0.05 + t * 0.12);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const glowHeight = height * 0.3;
    const glow = ctx.createLinearGradient(0, horizon - glowHeight, 0, horizon + 24);
    glow.addColorStop(0, rgba(palette.accent, 0));
    glow.addColorStop(1, rgba(palette.accent, 0.18));
    ctx.fillStyle = glow;
    ctx.fillRect(0, horizon - glowHeight, width, glowHeight + 24);
  };

  const DRAW: Record<BackdropVariant, () => void> = {
    network: drawNetwork,
    lattice: drawLattice,
    circuit: drawCircuit,
    cipher: drawCipher,
    signal: drawSignal,
    architecture: drawArchitecture,
  };

  return {
    resize(nextWidth, nextHeight) {
      width = nextWidth;
      height = nextHeight;
      seed();
    },

    step(dt) {
      elapsed += dt;

      if (variant === 'network') {
        for (const node of nodes) {
          node.x += node.vx * dt;
          node.y += node.vy * dt;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
          node.x = Math.max(0, Math.min(width, node.x));
          node.y = Math.max(0, Math.min(height, node.y));
        }
        for (const pulse of pulses) {
          pulse.t += pulse.speed * dt;
          if (pulse.t >= 1) {
            pulse.t = 0;
            pulse.from = pulse.to;
            pulse.to = Math.floor(random() * nodes.length);
          }
        }
      }

      if (variant === 'circuit' || variant === 'architecture') {
        for (const pulse of pulses) {
          pulse.t += pulse.speed * dt;
          if (pulse.t >= 1) pulse.t = 0;
        }
      }

      if (variant === 'cipher') {
        for (const column of columns) {
          column.offset = (column.offset + column.speed * dt) % (height + 44);
        }
      }
    },

    draw() {
      if (width === 0 || height === 0) return;
      clear();
      DRAW[variant]();
    },
  };
}
