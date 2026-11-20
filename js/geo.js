// =====================================================================
// Rock Cycle Explorer — the shape of the land and the rock inside it.
// The block of crust runs from x = -4 (mountains, left) to x = 4 (sea, right),
// from z = -1.6 (back) to z = 1.6 (the front cut face), and down to y = -3.
// Everything that draws the block, and every path the grain of rock takes,
// uses these same numbers, so the grain always sits on the ground or rock.
// =====================================================================
export const ZF = 1.6, XL = -4, XR = 4, YB = -3.0, SEA = 0.03;
export const FZ = ZF + 0.035;                 // just in front of the cut face
export const sstep = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- noise (for rocky, natural-looking ground) ----------
function hash(ix, iz) {
  let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z, oct) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }
function ridged(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { const n = 1 - Math.abs(vnoise(x * f, z * f) * 2 - 1); s += a * n * n; f *= 2.1; a *= 0.5; } return s; }

// ---------- plains, beach and sea floor ----------
export const COAST0 = 2.2;                     // the plain starts sloping down to the sea here
export function base(x) { return x < COAST0 ? 0.15 : 0.15 - 0.72 * sstep((x - COAST0) / 1.5); }
export const SHORE = (() => { let x = COAST0; while (base(x) > SEA) x += 0.001; return x; })();

// ---------- mountains ----------
export const MTN = -2.55;
function mountain(x, z) {
  const g = Math.exp(-((x - MTN) ** 2) / 0.85), g2 = Math.exp(-((x + 3.55) ** 2) / 0.22);
  return 1.5 * g * (0.78 + 0.22 * Math.cos(2.0 * z + 0.6)) + 0.42 * g2 * (0.75 + 0.25 * Math.sin(2.6 * z + 1));
}

// ---------- volcano (cut in half by the front face, so you can see inside) ----------
export const VX = 0.75, VZ = ZF, CR = 1.3, CH = 0.95;
function cone(x, z) {
  const r = Math.hypot(x - VX, z - VZ); if (r >= CR) return 0;
  let v = CH * Math.pow(1 - r / CR, 1.25);
  if (r < 0.15) v -= (0.15 - r) * 1.5;           // crater
  return v;
}
// the lava flow: from the crater down the sea-side slope, near the front
export const LAV0 = VX + 0.1, LAVL = 1.45;
export const lavaZ = s => ZF - 0.24 - 0.025 * s;
export const lavaW = s => 0.06 + 0.05 * s;
function lavaMask(x, z) { const s = x - LAV0; if (s < 0 || s > LAVL) return 0; return 1 - sstep((Math.abs(z - lavaZ(s)) - lavaW(s) * 0.6) / (lavaW(s) * 0.6)); }

// ---------- river: from the mountain foot to the sea ----------
export const RIV0 = -1.75;
export function riverZ(x) { return -0.1 - 0.5 * sstep((x - RIV0) / 2.1) + 0.11 * Math.sin(1.55 * x + 0.5); }
export function riverBed(x) {                   // only goes down on its way to the sea
  if (x < SHORE) return 0.012 + 0.09 * clamp((SHORE - x) / (SHORE - RIV0), 0, 1.2);
  return base(x) - 0.03;
}
export const RIVW = 0.028;                       // water depth above the bed
export const riverWide = x => 1 + 0.9 * sstep((x - 1.3) / 1.2);
export const MOUTH = [SHORE, riverZ(SHORE)];

// ---------- the height of the ground ----------
export function H(x, z) {
  let h = base(x);
  const m = mountain(x, z), mm = Math.min(1, m / 0.55);
  const lv = lavaMask(x, z);
  h += m + 0.32 * mm * (ridged(x * 1.7 + 11.3, z * 1.7 + 3.1) - 0.38);
  h += (0.022 * (fbm(x * 3.1 + 5.2, z * 3.1 + 9.4, 3) - 0.5) + 0.012 * (vnoise(x * 11 + 2, z * 11 + 7) - 0.5)) * (1 - lv);
  h += cone(x, z);
  if (x > COAST0 - 0.1) {                        // the delta: a fan of sand at the river mouth
    const dm = Math.hypot((x - MOUTH[0] - 0.25) * 0.9, z - MOUTH[1]);
    h += 0.085 * Math.exp(-dm * dm / 0.16) * sstep((x - COAST0) / 0.35);
  }
  if (x > RIV0 - 0.35 && x < SHORE + 0.5) {      // carve the river valley
    const sl = (riverZ(x + 0.01) - riverZ(x - 0.01)) / 0.02;
    const d = (z - riverZ(x)) / Math.sqrt(1 + sl * sl), w = 0.12 * riverWide(x);
    const fade = Math.min(1, (x - RIV0 + 0.35) / 0.35, (SHORE + 0.5 - x) / 0.5);
    const bed = riverBed(x);
    if (h > bed) h -= (h - bed) * Math.exp(-d * d / (w * w)) * fade;
  }
  return h;
}
export const Hf = x => H(x, ZF - 0.0005);        // the ground line along the front cut face

// ---------- rock units inside the block ----------
export const fold = x => 0.85 * Math.exp(-((x - MTN) ** 2) / 2.6);   // the layers arch up under the mountains
export const CHM = { x: VX, y: -2.05, rx: 1.0, ry: 0.42, rz: 0.75 };   // magma chamber
export const PLU = { x: -2.35, y: -1.45, rx: 0.85, ry: 0.55, rz: 1.0 }; // granite (cooled magma)
export const DYKE = [[-0.15, -2.0], [-1.62, -1.66]];                  // crack that fed the granite
export const SED_BOT = -1.45, GN_BOT = -2.55;                          // bottoms of the layer stacks (below the fold line)
export const gneissY = x => fold(x) - 2.0;                            // middle of the metamorphic band

// ---------- grain paths ----------
export const S = (x, z) => [x, H(x, z) + 0.06, z];                   // on the ground
export const Fp = (x, y) => [x, y, FZ];                              // on the front face
export const onFace = p => Math.abs(p[2] - FZ) < 1e-6;
export function riverPt(x) { return [x, (x < SHORE ? riverBed(x) + RIVW : H(x, riverZ(x))) + 0.02, riverZ(x)]; }
function line(a, b, n) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n; o.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]); } return o; }
const nsteps = (a, b, d = 0.05) => Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / d));
const seg = (a, b) => line(a, b, nsteps(a, b));
function join(...parts) { let o = []; for (const p of parts) o = o.concat(o.length ? p.slice(1) : p); return o; }
function surfLine(a, b) {                           // along the ground from a to b
  const n = nsteps(a, b, 0.04), o = [];
  for (let i = 0; i <= n; i++) { const t = i / n; o.push(S(a[0] + (b[0] - a[0]) * t, a[2] + (b[2] - a[2]) * t)); }
  o[0] = a.slice(); return o;
}

export const SEAX = 2.95, DEPOSIT = Fp(SEAX, Hf(SEAX) - 0.05);
export const LOC = {                              // where each kind of rock waits
  magma: Fp(CHM.x, CHM.y),
  granite: Fp(PLU.x, PLU.y),
  basalt: S(LAV0 + LAVL - 0.08, lavaZ(LAVL - 0.08)),
  sediment: riverPt(-1.4),
  deposit: DEPOSIT,
  sandstone: Fp(2.75, -0.95),
  gneiss: Fp(-1.15, gneissY(-1.15)),
  exposed: S(-2.0, ZF - 0.45)
};

function toFace(p) {                                // from the ground near the front, onto the cut face
  if (onFace(p)) return [p.slice()];
  const e = S(p[0], ZF - 0.03), o = surfLine(p, e);
  o.push(Fp(p[0], Hf(p[0]) - 0.04)); return o;
}
function descend(p) {                               // weathering: pieces roll downhill, then wash into the river
  const o = [p.slice()]; let x = p[0], z = p[2];
  for (let i = 0; i < 300; i++) {
    const hx = (H(x + 0.01, z) - H(x - 0.01, z)) / 0.02, hz = (H(x, z + 0.01) - H(x, z - 0.01)) / 0.02, g = Math.hypot(hx, hz);
    if (g < 0.15 || Math.abs(z - riverZ(x)) < 0.08) break;
    x -= 0.025 * hx / g; z = clamp(z - 0.025 * hz / g, -ZF + 0.12, ZF - 0.1);
    if (i % 2 === 1) o.push(S(x, z));
  }
  const xr = clamp(x + 0.2, RIV0 + 0.15, SHORE - 0.2), q = riverPt(xr);
  const mid = S((x + xr) / 2, (z + riverZ(xr)) / 2);
  const out = join(o, surfLine(o[o.length - 1], mid), surfLine(mid, [q[0], 0, q[2]]));
  out[out.length - 1] = q; return out;
}

// the path for process k, starting exactly where the grain is now
export function makePath(k, pos) {
  const p = pos.slice(), x = p[0];
  switch (k) {
    case 'weather': {
      if (!onFace(p)) return descend(p);
      const g0 = S(x, ZF - 0.04), g1 = S(x, ZF - 0.14);
      return join([p, g0], surfLine(g0, g1), descend(g1));
    }
    case 'transport': {
      const x0 = Math.max(RIV0 + 0.05, x), o = [p.slice()], end = SHORE + 0.1;
      const n = Math.max(4, Math.ceil((end - x0) / 0.04));
      for (let i = 1; i <= n; i++) o.push(riverPt(x0 + (end - x0) * i / n));
      const a = o[o.length - 1], zf = ZF - 0.04;
      for (let i = 1; i <= 16; i++) {               // out past the delta, sinking to the sea floor
        const t = i / 16, xx = a[0] + (SEAX - a[0]) * t, zz = a[2] + (riverZ(SHORE) - a[2]) * t;
        o.push([xx, Math.max(H(xx, zz) + 0.035, a[1] + (H(xx, zz) + 0.035 - a[1]) * sstep(t * 1.4)), zz]);
      }
      const b = o[o.length - 1];
      for (let i = 1; i <= 24; i++) { const zz = b[2] + (zf - b[2]) * i / 24; o.push([SEAX, H(SEAX, zz) + 0.035, zz]); }
      o.push(DEPOSIT.slice());
      return o;
    }
    case 'compact': { const f = toFace(p), e = f[f.length - 1]; return join(f, seg(e, Fp(e[0], -0.95))); }
    case 'heatp': {
      const f = toFace(p), e = f[f.length - 1];
      const pe = ((e[0] - PLU.x) / PLU.rx) ** 2 + ((e[1] - PLU.y) / PLU.ry) ** 2;
      if (pe < 1.2) return join(f, seg(e, Fp(-1.15, gneissY(-1.15))));   // granite is squeezed beside its old body
      return join(f, seg(e, Fp(e[0], gneissY(e[0]))));
    }
    case 'melt': {
      const f = toFace(p), e = f[f.length - 1];
      const deep = Math.min(e[1], gneissY(e[0])), d1 = Fp(e[0], deep - 0.22);
      const tgt = Fp(CHM.x + (e[0] > CHM.x ? 0.5 : -0.5), CHM.y - 0.08);
      const low = Fp((d1[0] + tgt[0]) / 2, Math.min(d1[1], tgt[1]) - 0.12);
      return join(f, seg(e, d1), seg(d1, low), seg(low, tgt));
    }
    case 'intrude': {
      const a = Fp(DYKE[0][0], DYKE[0][1]), b = Fp(DYKE[1][0], DYKE[1][1]);
      return join(seg(p, a), seg(a, b), seg(b, Fp(PLU.x, PLU.y)));
    }
    case 'erupt': {
      const bot = Fp(VX, CHM.y + 0.3), o = seg(p, bot), top = Hf(VX) - 0.04, n = 40;
      for (let j = 1; j <= n; j++) { const yy = bot[1] + (top - bot[1]) * j / n; o.push(Fp(VX + 0.04 * Math.sin(yy * 3), yy)); }
      const vent = [VX, Hf(VX) + 0.08, ZF - 0.05]; o.push(vent);
      const ventI = o.length - 1;
      const out = o.concat(surfLine(vent, S(LAV0 + 0.05, lavaZ(0.05))).slice(1));
      for (let j = 1; j <= 56; j++) { const s = 0.05 + (LAVL - 0.13) * j / 56; out.push(S(LAV0 + s, lavaZ(s))); }
      out.ventI = ventI; return out;
    }
    case 'uplift': {
      const f = toFace(p), e = f[f.length - 1], xu = e[0] > COAST0 - 0.1 ? COAST0 - 0.15 : e[0];
      return join(f, seg(e, Fp(xu, Hf(xu) - 0.03)));
    }
  }
  return [p];
}
