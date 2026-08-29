/* =====================================================================
   make-icons.js — Génère les icônes PNG de l'application sans dépendance.
   Usage :  node tools/make-icons.js
   ===================================================================== */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ---------- encodeur PNG minimal (RGBA 8 bits) ---------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filtre « none »
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // profondeur
  ihdr[9] = 6;  // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------- dessin de l'icône ---------- */

const TOP = [0x23, 0x40, 0x5c];    // #23405c
const BOTTOM = [0x3a, 0x5f, 0x80]; // #3a5f80
const MARK = [0xee, 0xf0, 0xf3];   // #eef0f3

const lerp = (a, b, t) => a + (b - a) * t;

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const s = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  const t = (cx - bx) * (py - by) - (cy - by) * (px - bx);
  const u = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
  return (s >= 0 && t >= 0 && u >= 0) || (s <= 0 && t <= 0 && u <= 0);
}

/**
 * @param {number} size    côté en pixels
 * @param {boolean} maskable  true = pleine surface + marque réduite (zone sûre)
 */
function drawIcon(size, maskable) {
  const SS = 3;                    // suréchantillonnage
  const S = size * SS;
  const radius = maskable ? 0 : S * 0.22;
  const markScale = maskable ? 0.72 : 1;

  const cx = S / 2;
  const cy = S * (maskable ? 0.435 : 0.40);
  const r = S * 0.17 * markScale;
  const tipY = cy + r * 3.1;
  const holeR = r * 0.40;

  const acc = new Float32Array(size * size * 4);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let R = 0, G = 0, B = 0, A = 0;

      // fond : coins arrondis
      const inX = Math.min(x, S - 1 - x);
      const inY = Math.min(y, S - 1 - y);
      let inside = true;
      if (radius > 0 && inX < radius && inY < radius) {
        const dx = radius - inX, dy = radius - inY;
        inside = dx * dx + dy * dy <= radius * radius;
      }

      if (inside) {
        const t = y / (S - 1);
        R = lerp(TOP[0], BOTTOM[0], t);
        G = lerp(TOP[1], BOTTOM[1], t);
        B = lerp(TOP[2], BOTTOM[2], t);
        A = 255;

        // marque : goutte (cercle + triangle) évidée
        const px = x + 0.5, py = y + 0.5;
        const body =
          inCircle(px, py, cx, cy, r) ||
          inTriangle(px, py,
            cx - r * 0.87, cy + r * 0.50,
            cx + r * 0.87, cy + r * 0.50,
            cx, tipY);

        if (body && !inCircle(px, py, cx, cy, holeR)) {
          R = MARK[0]; G = MARK[1]; B = MARK[2];
        }
      }

      const oi = (Math.floor(y / SS) * size + Math.floor(x / SS)) * 4;
      acc[oi] += R; acc[oi + 1] += G; acc[oi + 2] += B; acc[oi + 3] += A;
    }
  }

  const n = SS * SS;
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < acc.length; i++) out[i] = Math.round(acc[i] / n);
  return encodePng(size, size, out);
}

/* ---------- écriture ---------- */

const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });

const targets = [
  ['icon-180.png', 180, false],
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-512-maskable.png', 512, true]
];

for (const [name, size, maskable] of targets) {
  const png = drawIcon(size, maskable);
  fs.writeFileSync(path.join(dir, name), png);
  console.log(`${name.padEnd(24)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} Ko`);
}
