// Shaders for Rock Cycle Explorer (the pictures on the ground, the rock faces, the sea and the river).
import { VX, VZ, CR, ZF, COAST0, SEA, MTN, CHM, PLU, DYKE, SED_BOT, GN_BOT, LAV0, LAVL } from './geo.js';

const f = n => (Number.isInteger(n) ? n.toFixed(1) : String(n));

export const COMMON = `
float sst(float t){ t = clamp(t, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
vec3 lin(vec3 c){ return c * c; }
vec3 outc(vec3 c){ return sqrt(max(c, 0.0)); }
`;

// ---------------------------------------------------------------- ground
export const TERRAIN_V = `
attribute float aSun; attribute float aAO;
varying vec3 vP; varying vec3 vN; varying float vSun; varying float vAO;
void main(){ vP = position; vN = normal; vSun = aSun; vAO = aAO;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const TERRAIN_F = COMMON + `
uniform sampler2D tGrass, tSlope, tRock, tSnow, tSand, tVolc, tRockN, tGrassN;
uniform vec3 uSun; uniform float uT, uLava, uFront, uGlow;
uniform vec2 uMouth;
varying vec3 vP; varying vec3 vN; varying float vSun; varying float vAO;
vec3 tx(sampler2D t, vec2 uv){ vec3 a = texture2D(t, uv).rgb, b = texture2D(t, uv * 0.37 + vec2(0.31, 0.17)).rgb; return lin(mix(a, b, 0.38)); }
void main(){
  vec2 uv = vP.xz * 0.5; vec3 n = normalize(vN); float slope = 1.0 - n.y, y = vP.y;
  float nz = fbm(vP.xz * 2.3);
  vec3 grass = tx(tGrass, uv * 1.25) * vec3(0.96, 1.02, 0.88);
  vec3 sl = tx(tSlope, uv * 0.95);
  vec3 rock = tx(tRock, uv * 0.75);
  vec3 snow = tx(tSnow, uv * 0.8) * 1.12;
  vec3 sand = tx(tSand, uv * 1.7) * vec3(1.08, 1.0, 0.86);
  vec3 volc = tx(tVolc, uv * 1.3) * 0.55;
  float wSlope = clamp(sst((slope - 0.06) / 0.2) + sst((y - 0.42 + 0.15 * nz) / 0.35), 0.0, 1.0);
  float wRock = clamp(sst((slope - 0.24) / 0.3) + sst((y - 0.95 + 0.2 * nz) / 0.25), 0.0, 1.0);
  vec3 c = mix(grass, sl, wSlope); c = mix(c, rock, wRock);
  float wSnow = sst((y - 1.16 + 0.22 * (nz - 0.5)) / 0.16) * (1.0 - sst((slope - 0.5) / 0.3));
  c = mix(c, snow, wSnow);
  // beach, delta and sea floor
  float beach = sst((vP.x - ${f(COAST0 - 0.3)}) / 0.3) * (1.0 - sst((y - 0.12) / 0.05));
  float dm = distance(vP.xz, uMouth + vec2(0.2, 0.0));
  float delta = (1.0 - sst((dm - 0.2) / 0.4)) * (1.0 - sst((y - 0.1) / 0.06));
  c = mix(c, sand, clamp(max(beach, delta), 0.0, 1.0));
  float under = sst((${f(SEA)} - y) / 0.25);
  c = mix(c, sand * vec3(0.72, 0.74, 0.7), under);
  // volcano
  float r = distance(vP.xz, vec2(${f(VX)}, ${f(VZ)}));
  float wV = 1.0 - sst((r - ${f(CR - 0.25)}) / 0.3);
  c = mix(c, volc, wV);
  // lava flow: old flows are dark rock; after an eruption the new flow glows and then cools
  float s = vP.x - ${f(LAV0)};
  float zc = ${f(ZF)} - 0.24 - 0.025 * s + 0.02 * sin(s * 9.0);
  float w = (0.075 + 0.06 * s) * (1.0 + 0.25 * sin(s * 23.0 + vP.z * 40.0)) * (1.0 - 0.6 * sst((s - ${f(LAVL - 0.35)}) / 0.35));
  float inFlow = (1.0 - sst((abs(vP.z - zc) - w * 0.7) / (w * 0.3))) * step(0.0, s) * (1.0 - sst((s - ${f(LAVL - 0.08)}) / 0.08));
  float age = uLava - s / uFront; float hot = age >= 0.0 ? exp(-age / 2.8) : 0.0;
  vec3 crust = volc * 0.5 + vec3(0.01);
  c = mix(c, crust, inFlow * 0.9);
  // bumps from the photo's normal map (rocky places)
  vec3 nm = texture2D(tRockN, uv * 0.75).xyz * 2.0 - 1.0;
  vec3 ng = texture2D(tGrassN, uv * 1.25).xyz * 2.0 - 1.0;
  vec3 dn = mix(ng, nm, clamp(wRock + wV, 0.0, 1.0));
  vec3 T = normalize(vec3(1.0, 0.0, 0.0) - n * n.x), B = normalize(cross(n, T));
  vec3 nn = normalize(n * 1.0 + (T * dn.x - B * dn.y) * 0.55);
  float sun = max(dot(nn, uSun), 0.0) * vSun;
  vec3 sky = vec3(0.50, 0.60, 0.78), gnd = vec3(0.34, 0.30, 0.25);
  vec3 amb = mix(gnd, sky, nn.y * 0.5 + 0.5) * vAO;
  vec3 col = c * (vec3(1.0, 0.95, 0.86) * sun * 1.35 + amb * 0.62);
  col += vec3(1.0, 0.95, 0.9) * pow(max(dot(reflect(-uSun, nn), vec3(0.0, 1.0, 0.0)), 0.0), 20.0) * wSnow * 0.08;
  // glow: hot lava and the crater
  vec3 lava = mix(vec3(0.9, 0.12, 0.0), vec3(1.0, 0.75, 0.25), hot);
  col = mix(col, lava * (1.6 + 0.4 * sin(uT * 3.0 + s * 12.0)), clamp(inFlow * hot * 1.3, 0.0, 1.0));
  float crater = (1.0 - sst((r - 0.06) / 0.14)) * step(0.55, y);
  col += vec3(1.0, 0.38, 0.05) * crater * (0.5 + 0.25 * sin(uT * 3.0) + uGlow);
  col += vec3(1.0, 0.35, 0.05) * exp(-r * r / 0.08) * 0.12 * (0.6 + uGlow);
  // a little haze, like air between you and the land
  col = mix(col, vec3(0.62, 0.72, 0.84), 0.06);
  gl_FragColor = vec4(outc(col), 1.0);
}`;

// ---------------------------------------------------------------- rock faces (cut sides of the block)
export const FACE_V = `
attribute float aTop;
varying vec3 vP; varying vec3 vN; varying float vTop;
void main(){ vP = position; vN = normal; vTop = aTop;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const FACE_F = COMMON + `
uniform sampler2D tSed, tGneiss, tGranite, tBasalt, tCrust, tSand;
uniform vec3 uSun; uniform float uT, uErupt, uHeat;
varying vec3 vP; varying vec3 vN; varying float vTop;
float fold(float x){ float d = x - ${f(MTN)}; return 0.85 * exp(-d * d / 2.6); }
float baseH(float x){ return x < ${f(COAST0)} ? 0.15 : 0.15 - 0.72 * sst((x - ${f(COAST0)}) / 1.5); }
float chamber(vec3 p){ vec3 d = (p - vec3(${f(CHM.x)}, ${f(CHM.y)}, ${f(ZF)})) / vec3(${f(CHM.rx)}, ${f(CHM.ry)}, ${f(CHM.rz)}); return dot(d, d); }
float pluton(vec3 p){ vec3 d = (p - vec3(${f(PLU.x)}, ${f(PLU.y)}, ${f(ZF)})) / vec3(${f(PLU.rx)}, ${f(PLU.ry)}, ${f(PLU.rz)}); return dot(d, d); }
float dyke(vec3 p){ vec2 a = vec2(${f(DYKE[0][0])}, ${f(DYKE[0][1])}), b = vec2(${f(DYKE[1][0])}, ${f(DYKE[1][1])}), v = b - a;
  float t = clamp(dot(p.xy - a, v) / dot(v, v), 0.0, 1.0); return length(p.xy - a - t * v) + max(0.0, abs(p.z - ${f(ZF)}) - 0.4); }
bool conduit(vec3 p, float top){ return length(vec2(p.x - ${f(VX)} - 0.04 * sin(p.y * 3.0), p.z - ${f(ZF)})) < 0.058 && p.y > ${f(CHM.y + 0.3)} && p.y < top + 0.01; }
// which rock is here? 1 magma, 2 conduit, 3 lava layers, 4 baked rock, 5 granite, 6 new sea-floor sediment,
// 7 sedimentary layers, 8 metamorphic (gneiss), 9 deep crust, 10 dyke
float unitAt(vec3 p, float top){
  float me = chamber(p); if (me < 1.0) return 1.0;
  if (conduit(p, top)) return 2.0;
  float r = length(vec2(p.x - ${f(VX)}, p.z - ${f(VZ)}));
  float lensBot = 0.15 - 0.22 * max(0.0, 1.0 - r / ${f(CR * 1.15)});
  if (r < ${f(CR * 1.15)} && p.y > lensBot && p.y <= top + 0.01) return 3.0;
  float pe = pluton(p); if (pe < 1.0) return 5.0;
  if (dyke(p) < 0.04) return 10.0;
  if (me < 1.55 || pe < 1.32) return 4.0;
  if (p.x > ${f(COAST0)} && p.y > baseH(p.x) - 0.09) return 6.0;
  float u = p.y - fold(p.x);
  if (u > ${f(SED_BOT)}) return 7.0;
  if (u > ${f(GN_BOT)}) return 8.0;
  return 9.0;
}
vec3 bedTint(float i){
  i = mod(i, 7.0);
  if (i < 1.0) return vec3(1.08, 0.92, 0.66);   // sandstone
  if (i < 2.0) return vec3(0.70, 0.70, 0.70);   // gray shale
  if (i < 3.0) return vec3(1.12, 1.08, 0.95);   // limestone
  if (i < 4.0) return vec3(1.00, 0.72, 0.52);   // red sandstone
  if (i < 5.0) return vec3(0.60, 0.58, 0.56);   // dark shale
  if (i < 6.0) return vec3(1.12, 0.98, 0.74);   // buff sandstone
  return vec3(0.86, 0.80, 0.64);                // siltstone
}
vec3 face(vec3 p, float id, float top, vec2 fuv){
  float u = p.y - fold(p.x);
  if (id == 3.0){ float b = floor((top - p.y) * 13.0); vec3 t = lin(texture2D(tBasalt, fuv * 1.4).rgb) * 1.25;
    return t * (mod(b, 3.0) == 2.0 ? vec3(1.25, 0.92, 0.82) : vec3(0.95)); }
  if (id == 5.0 || id == 10.0){ vec3 g = lin(texture2D(tGranite, fuv * 1.6).rgb); return g * vec3(3.6, 2.85, 2.75) * (id == 10.0 ? 1.15 : 1.0); }
  if (id == 6.0) return lin(texture2D(tSand, fuv * 1.4).rgb) * vec3(1.05, 0.98, 0.82);
  if (id == 7.0){
    vec2 suv = vec2(fuv.x * 0.45, u * 0.75);
    vec3 t = lin(texture2D(tSed, suv).rgb) * 1.35;
    float L = (u - ${f(SED_BOT)}) * 7.5; float fr = fract(L);
    vec3 col = t * bedTint(floor(L));
    col *= 0.82 + 0.18 * sst(fr / 0.08) * sst((1.0 - fr) / 0.05);
    return col;
  }
  if (id == 8.0){
    float v = u + 0.08 * sin(9.0 * p.x + 2.0 * p.z) + 0.12 * sin(3.1 * p.x);
    float band = sin(v * 30.0 + 2.2 * sin(p.x * 4.0 + v * 6.0)) + 0.35 * sin(v * 71.0 + p.x * 3.0);
    vec3 t = lin(texture2D(tGneiss, fuv * 0.9).rgb);
    vec3 dark = vec3(0.50, 0.46, 0.56), light = vec3(1.15, 1.10, 1.14);
    return t * mix(dark, light, sst(band * 0.9 + 0.55));
  }
  if (id == 4.0){ vec3 t = lin(texture2D(tCrust, fuv * 1.1).rgb); return t * vec3(0.85, 0.66, 0.6); }
  vec3 t = lin(texture2D(tCrust, fuv * 0.8).rgb); return t * vec3(1.05, 0.82, 0.72);
}
void main(){
  vec3 p = vP; float top = vTop;
  bool side = abs(vN.x) > 0.5;
  vec2 fuv = side ? vec2(p.z, p.y) : vec2(p.x, p.y);
  float id = unitAt(p, top);
  vec3 col;
  if (id == 1.0){
    // magma: slowly churning, brightest in the middle
    float me = chamber(p), k = 1.0 - sqrt(me);
    float n = fbm(vec2(p.x * 3.2 + uT * 0.12, p.y * 4.5 - uT * 0.09)) + 0.5 * fbm(vec2(p.x * 7.0 - uT * 0.2, p.y * 8.0 + uT * 0.15));
    vec3 hotc = mix(vec3(0.75, 0.08, 0.01), vec3(1.0, 0.55, 0.08), sst(k * 1.6 + n * 0.5 - 0.3));
    hotc = mix(hotc, vec3(1.0, 0.92, 0.55), sst(k * 2.2 + n * 0.8 - 1.4));
    col = hotc * (1.25 + 0.15 * sin(uT * 1.7) + 0.3 * uHeat);
    float crustLine = 1.0 - sst((1.0 - me) / 0.06);
    col = mix(col, vec3(0.18, 0.04, 0.02), crustLine * 0.7);
  } else if (id == 2.0){
    float fl = 0.5 + 0.5 * sin(p.y * 22.0 - uT * (4.0 + 6.0 * uErupt)) * sin(p.y * 7.0 - uT * 2.0);
    col = mix(vec3(0.95, 0.30, 0.02), vec3(1.0, 0.8, 0.3), fl * 0.6 + 0.3 * uErupt) * (1.25 + 0.6 * uErupt);
  } else {
    col = face(p, id, top, fuv);
    // contact lines between rock units, about 1 pixel wide at any zoom
    vec3 T = side ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
    float px = max(fwidth(fuv.x), fwidth(fuv.y)) * 1.3;
    float ia = unitAt(p + T * px, top), ib = unitAt(p + vec3(0.0, px, 0.0), top);
    if ((ia != id && ia > 2.0) || (ib != id && ib > 2.0)) col *= 0.35;
    // soil just under the grass
    float soil = 1.0 - sst((top - p.y) / 0.035);
    if (id != 3.0 && id != 6.0 && top > 0.05) col = mix(col, lin(vec3(0.33, 0.25, 0.18)), soil * 0.85);
    float lit = 0.62 + 0.55 * max(dot(normalize(vN), uSun), 0.0);
    col *= lit;
    // warm glow on rock next to hot magma
    float me = chamber(p), pe = pluton(p);
    col += vec3(1.0, 0.32, 0.05) * exp(-max(me - 1.0, 0.0) * 3.5) * (0.22 + 0.08 * sin(uT * 1.7) + 0.2 * uHeat) * step(1.0, me);
    if (id == 3.0) col += vec3(1.0, 0.35, 0.05) * exp(-pow(abs(p.x - ${f(VX)}) / 0.12, 2.0)) * 0.25 * (0.5 + uErupt);
  }
  // a little depth shading toward the bottom
  col *= 0.8 + 0.2 * sst((p.y + 3.0) / 1.5);
  gl_FragColor = vec4(outc(col), 1.0);
}`;

// ---------------------------------------------------------------- sea
export const SEA_V = COMMON + `
attribute float aDepth; uniform float uT;
varying float vD; varying vec3 vP;
void main(){ vD = aDepth; vec3 p = position;
  p.y += 0.004 * sin(p.x * 17.0 - uT * 1.8) * sst(aDepth / 0.06);
  vP = p; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
export const SEA_F = COMMON + `
uniform float uT; uniform vec2 uMouth; uniform vec3 uSun, uCam;
varying float vD; varying vec3 vP;
void main(){
  if (vD < -0.003) discard;
  float w1 = sin(vP.x * 24.0 - uT * 2.0 + sin(vP.z * 7.0) * 1.6), w2 = sin(vP.z * 19.0 + uT * 1.3 + vP.x * 3.0);
  vec3 n = normalize(vec3(0.05 * w1 + 0.03 * fbm(vP.xz * 6.0 + uT * 0.2) - 0.015, 1.0, 0.04 * w2));
  vec3 shallow = vec3(0.16, 0.56, 0.62), deep = vec3(0.03, 0.20, 0.40);
  vec3 c = mix(shallow, deep, sst(vD / 0.38));
  float dm = distance(vP.xz, uMouth);
  c = mix(c, vec3(0.46, 0.40, 0.26), 0.55 * (1.0 - sst((dm - 0.08) / 0.7)) * (0.8 + 0.2 * w1));
  vec3 v = normalize(uCam - vP);
  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  c = mix(c, vec3(0.65, 0.78, 0.92), fr * 0.55);
  c += vec3(1.0, 0.95, 0.85) * pow(max(dot(reflect(-uSun, n), v), 0.0), 60.0) * 0.8;
  float foam = (1.0 - sst(vD / 0.022)) * (0.55 + 0.45 * sin(uT * 2.0 + vP.z * 30.0 + vP.x * 9.0));
  c = mix(c, vec3(0.95), clamp(foam, 0.0, 1.0));
  gl_FragColor = vec4(c, mix(0.78, 0.95, clamp(foam + fr * 0.5, 0.0, 1.0)));
}`;

// water seen through the sides of the block
export const WATERSIDE_V = `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
export const WATERSIDE_F = COMMON + `
varying vec3 vP;
void main(){ float d = ${f(SEA)} - vP.y;
  vec3 c = mix(vec3(0.20, 0.58, 0.75), vec3(0.04, 0.22, 0.45), sst(d / 0.5));
  c = mix(c, vec3(0.9, 0.97, 1.0), 1.0 - sst(d / 0.012));
  gl_FragColor = vec4(c, 0.62 + 0.25 * sst(d / 0.5)); }`;

// ---------------------------------------------------------------- river
export const RIVER_V = `varying vec2 vUv; varying vec3 vP; void main(){ vUv = uv; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
export const RIVER_F = COMMON + `
uniform float uT; uniform vec3 uSun, uCam;
varying vec2 vUv; varying vec3 vP;
void main(){
  float a = vUv.x * 170.0 - uT * 3.2;
  float rip = 0.5 + 0.5 * sin(a + sin(vUv.y * 9.0 + vUv.x * 40.0) * 1.3);
  float n2 = fbm(vec2(vUv.x * 60.0 - uT * 1.5, vUv.y * 4.0));
  vec3 c = mix(vec3(0.16, 0.45, 0.66), vec3(0.42, 0.42, 0.30), sst((vUv.x - 0.3) / 0.7) * 0.65);
  c += 0.10 * rip + 0.08 * (n2 - 0.5);
  vec3 v = normalize(uCam - vP), n = normalize(vec3(0.06 * (rip - 0.5), 1.0, 0.04 * (n2 - 0.5)));
  c += vec3(1.0, 0.95, 0.85) * pow(max(dot(reflect(-uSun, n), v), 0.0), 40.0) * 0.5;
  float edge = sst(vUv.y / 0.2) * sst((1.0 - vUv.y) / 0.2);
  gl_FragColor = vec4(c, 0.55 + 0.42 * edge);
}`;
