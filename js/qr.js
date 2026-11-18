/* ============================================================
 * QR.js — Pembuat QR Code murni JavaScript (tanpa pustaka luar)
 * Mode byte (UTF-8), koreksi galat M, versi 1–10 otomatis.
 * Dipakai di frontend (SVG) dan backend GAS (tabel HTML untuk PDF).
 * ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---- Aritmetika GF(256) untuk Reed-Solomon ----
  var EXP = new Array(512), LOG = new Array(256);
  (function () {
    var x = 1, i;
    for (i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
    for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  function gfMul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function rsGen(n) {
    var g = [1], i, j;
    for (i = 0; i < n; i++) {
      var ng = new Array(g.length + 1).fill(0);
      for (j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= gfMul(g[j], EXP[i]); }
      g = ng;
    }
    return g;
  }
  function rsEncode(data, n) {
    var g = rsGen(n), res = new Array(n).fill(0), i, j;
    for (i = 0; i < data.length; i++) {
      var f = data[i] ^ res[0];
      res.shift(); res.push(0);
      if (f) for (j = 0; j < n; j++) res[j] ^= gfMul(g[j + 1], f);
    }
    return res;
  }

  // ---- Tabel level M: [kodeKoreksi per blok, [[jumlahBlok, kataDataPerBlok], ...]] ----
  var VER = [null,
    [10, [[1, 16]]], [16, [[1, 28]]], [26, [[1, 44]]], [18, [[2, 32]]], [24, [[2, 43]]],
    [16, [[4, 27]]], [18, [[4, 31]]], [22, [[2, 38], [2, 39]]], [22, [[3, 36], [2, 37]]], [26, [[4, 43], [1, 44]]]
  ];
  var ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

  function dataCapacity(v) { var s = 0; VER[v][1].forEach(function (b) { s += b[0] * b[1]; }); return s; }

  function utf8(str) {
    var out = [], i, c;
    str = unescape(encodeURIComponent(String(str)));
    for (i = 0; i < str.length; i++) { c = str.charCodeAt(i); out.push(c & 255); }
    return out;
  }

  function buildCodewords(bytes, v) {
    var bits = [];
    function push(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    push(4, 4); push(bytes.length, v < 10 ? 8 : 16);
    bytes.forEach(function (b) { push(b, 8); });
    var cap = dataCapacity(v) * 8;
    push(0, Math.min(4, cap - bits.length));
    while (bits.length % 8) bits.push(0);
    var pad = [0xEC, 0x11], k = 0;
    while (bits.length < cap) { push(pad[k++ & 1], 8); }
    var data = [], i;
    for (i = 0; i < bits.length; i += 8) {
      var b = 0; for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b);
    }
    // bagi ke blok + hitung koreksi galat
    var ecLen = VER[v][0], blocks = [], pos = 0;
    VER[v][1].forEach(function (g) {
      for (var n = 0; n < g[0]; n++) { var d = data.slice(pos, pos + g[1]); pos += g[1]; blocks.push({ d: d, e: rsEncode(d, ecLen) }); }
    });
    var out = [], maxD = 0;
    blocks.forEach(function (b) { if (b.d.length > maxD) maxD = b.d.length; });
    for (i = 0; i < maxD; i++) blocks.forEach(function (b) { if (i < b.d.length) out.push(b.d[i]); });
    for (i = 0; i < ecLen; i++) blocks.forEach(function (b) { out.push(b.e[i]); });
    return out;
  }

  function getBit(x, i) { return ((x >>> i) & 1) !== 0; }

  function makeMatrix(v, codewords) {
    var size = 17 + 4 * v, m = [], f = [], y, x, i;
    for (y = 0; y < size; y++) { m.push(new Array(size).fill(false)); f.push(new Array(size).fill(false)); }
    function setF(x, y, dark) { if (x >= 0 && x < size && y >= 0 && y < size) { m[y][x] = dark; f[y][x] = true; } }

    for (i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)); setF(cx + dx, cy + dy, d !== 2 && d !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var ap = ALIGN[v], n = ap.length, a, b;
    for (a = 0; a < n; a++) for (b = 0; b < n; b++) {
      if ((a === 0 && b === 0) || (a === 0 && b === n - 1) || (a === n - 1 && b === 0)) continue;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setF(ap[a] + dx, ap[b] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    // area format (dicadangkan, diisi nanti)
    drawFormat(0, true);
    if (v >= 7) {
      var rem = v;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vbits = (v << 12) | rem;
      for (i = 0; i < 18; i++) { var c = getBit(vbits, i), aa = size - 11 + (i % 3), bb = Math.floor(i / 3); setF(aa, bb, c); setF(bb, aa, c); }
    }

    function drawFormat(mask, reserveOnly) {
      var d = (0 << 3) | mask, r = d; // level M = 00
      for (var k = 0; k < 10; k++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var bits = ((d << 10) | r) ^ 0x5412, j;
      if (reserveOnly) bits = 0;
      for (j = 0; j <= 5; j++) setF(8, j, getBit(bits, j));
      setF(8, 7, getBit(bits, 6)); setF(8, 8, getBit(bits, 7)); setF(7, 8, getBit(bits, 8));
      for (j = 9; j < 15; j++) setF(14 - j, 8, getBit(bits, j));
      for (j = 0; j < 8; j++) setF(size - 1 - j, 8, getBit(bits, j));
      for (j = 8; j < 15; j++) setF(8, size - 15 + j, getBit(bits, j));
      setF(8, size - 8, true);
    }

    // tempatkan data zig-zag
    var idx = 0, right, vert, j2;
    for (right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (vert = 0; vert < size; vert++) {
        for (j2 = 0; j2 < 2; j2++) {
          x = right - j2;
          var upward = ((right + 1) & 2) === 0;
          y = upward ? size - 1 - vert : vert;
          if (!f[y][x] && idx < codewords.length * 8) { m[y][x] = getBit(codewords[idx >>> 3], 7 - (idx & 7)); idx++; }
        }
      }
    }

    function applyMask(mask) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) {
        if (f[yy][xx]) continue;
        var inv;
        switch (mask) {
          case 0: inv = (xx + yy) % 2 === 0; break;
          case 1: inv = yy % 2 === 0; break;
          case 2: inv = xx % 3 === 0; break;
          case 3: inv = (xx + yy) % 3 === 0; break;
          case 4: inv = (Math.floor(xx / 3) + Math.floor(yy / 2)) % 2 === 0; break;
          case 5: inv = (xx * yy) % 2 + (xx * yy) % 3 === 0; break;
          case 6: inv = ((xx * yy) % 2 + (xx * yy) % 3) % 2 === 0; break;
          default: inv = ((xx + yy) % 2 + (xx * yy) % 3) % 2 === 0;
        }
        if (inv) m[yy][xx] = !m[yy][xx];
      }
    }

    function penalty() {
      var p = 0, yy, xx, run, k;
      for (yy = 0; yy < size; yy++) { // aturan 1 baris
        run = 1;
        for (xx = 1; xx < size; xx++) {
          if (m[yy][xx] === m[yy][xx - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
        }
      }
      for (xx = 0; xx < size; xx++) { // aturan 1 kolom
        run = 1;
        for (yy = 1; yy < size; yy++) {
          if (m[yy][xx] === m[yy - 1][xx]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
        }
      }
      for (yy = 0; yy < size - 1; yy++) for (xx = 0; xx < size - 1; xx++) { // aturan 2 blok 2x2
        var c = m[yy][xx]; if (c === m[yy][xx + 1] && c === m[yy + 1][xx] && c === m[yy + 1][xx + 1]) p += 3;
      }
      var pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
      function match(get, pat) { for (var q = 0; q < 11; q++) if ((get(q) ? 1 : 0) !== pat[q]) return false; return true; }
      for (yy = 0; yy < size; yy++) for (xx = 0; xx <= size - 11; xx++) { // aturan 3
        if (match(function (q) { return m[yy][xx + q]; }, pat1) || match(function (q) { return m[yy][xx + q]; }, pat2)) p += 40;
      }
      for (xx = 0; xx < size; xx++) for (yy = 0; yy <= size - 11; yy++) {
        if (match(function (q) { return m[yy + q][xx]; }, pat1) || match(function (q) { return m[yy + q][xx]; }, pat2)) p += 40;
      }
      var dark = 0; for (yy = 0; yy < size; yy++) for (xx = 0; xx < size; xx++) if (m[yy][xx]) dark++;
      k = Math.ceil(Math.abs(dark * 20 - size * size * 10) / (size * size)) - 1;
      p += Math.max(0, k) * 10;
      return p;
    }

    var best = 0, bestP = Infinity;
    for (var mk = 0; mk < 8; mk++) {
      applyMask(mk); drawFormat(mk, false);
      var pp = penalty(); if (pp < bestP) { bestP = pp; best = mk; }
      applyMask(mk); // kembalikan
    }
    applyMask(best); drawFormat(best, false);
    return { size: size, m: m };
  }

  function encode(text) {
    var bytes = utf8(text), v;
    for (v = 1; v <= 10; v++) {
      var need = 4 + (v < 10 ? 8 : 16) + bytes.length * 8;
      if (need <= dataCapacity(v) * 8) break;
    }
    if (v > 10) throw new Error('Teks QR terlalu panjang (maks. ±213 karakter).');
    var mx = makeMatrix(v, buildCodewords(bytes, v));
    return { size: mx.size, version: v, get: function (x, y) { return mx.m[y][x]; } };
  }

  /** SVG string (satu path, ringan) */
  function svg(text, opt) {
    opt = opt || {};
    var q = encode(text), margin = opt.margin == null ? 2 : opt.margin, n = q.size + margin * 2, d = [], x, y;
    for (y = 0; y < q.size; y++) {
      var x0 = -1;
      for (x = 0; x <= q.size; x++) {
        var on = x < q.size && q.get(x, y);
        if (on && x0 < 0) x0 = x;
        if (!on && x0 >= 0) { d.push('M' + (x0 + margin) + ' ' + (y + margin) + 'h' + (x - x0) + 'v1h-' + (x - x0) + 'z'); x0 = -1; }
      }
    }
    var px = opt.size ? ' width="' + opt.size + '" height="' + opt.size + '"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '"' + px + ' shape-rendering="crispEdges">' +
      '<rect width="' + n + '" height="' + n + '" fill="' + (opt.bg || '#fff') + '"/>' +
      '<path d="' + d.join('') + '" fill="' + (opt.fg || '#000') + '"/></svg>';
  }

  /** Tabel HTML (untuk konversi PDF di GAS yang tidak merender SVG dengan andal) */
  function tableHtml(text, opt) {
    opt = opt || {};
    var q = encode(text), cell = opt.cell || 3, margin = opt.margin == null ? 2 : opt.margin, n = q.size + margin * 2, h = [], x, y;
    h.push('<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#fff;width:' + n * cell + 'px">');
    for (y = 0; y < n; y++) {
      h.push('<tr style="height:' + cell + 'px">');
      for (x = 0; x < n; x++) {
        var qx = x - margin, qy = y - margin, on = qx >= 0 && qy >= 0 && qx < q.size && qy < q.size && q.get(qx, qy);
        h.push('<td style="width:' + cell + 'px;height:' + cell + 'px;padding:0;font-size:1px;line-height:1px;background:' + (on ? '#000' : '#fff') + '"></td>');
      }
      h.push('</tr>');
    }
    h.push('</table>');
    return h.join('');
  }

  return { encode: encode, svg: svg, tableHtml: tableHtml };
});
