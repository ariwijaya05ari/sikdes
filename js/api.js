/* API client — satu pintu ke GAS REST. Batcher, dedupe in-flight, epoch tulis,
   cache SWR (memori + localStorage) dengan etag, prefetch, drain antrean, warmup, pengukur waktu. */
(function (w) {
  'use strict';
  var CFG = w.APP_CONFIG || {}, LP = 'sipakdes.';
  var S = { token: '', user: null, desa: null, epoch: 0 };
  var mem = {}, inflight = {}, queue = null, perf = [];

  function ApiError(msg, code) { var e = new Error(msg); e.code = code || ''; e.isApi = true; return e; }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(LP + k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LP + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function lsDel(k) { try { localStorage.removeItem(LP + k); } catch (e) { } }
  function configured() { return !!CFG.GAS_URL && !/GANTI|XXXX/.test(CFG.GAS_URL); }

  // ---------- sesi ----------
  function loadSession() { var s = lsGet('sesi'); if (s && s.token && s.user) { S.token = s.token; S.user = s.user; S.desa = s.desa || null; } return S.user; }
  function saveSession() { lsSet('sesi', { token: S.token, user: S.user, desa: S.desa }); }
  function setSession(d) { S.token = d.token; S.user = d.user; if (d.desa) S.desa = d.desa; S.epoch++; saveSession(); }
  function clearCache() {
    mem = {}; inflight = {};
    try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(LP + 'c.') === 0) localStorage.removeItem(k); }); } catch (e) { }
  }
  function clearSession() { S.token = ''; S.user = null; lsDel('sesi'); clearCache(); }

  // ---------- jaringan ----------
  function post(body) {
    if (!configured()) return Promise.reject(ApiError('Konfigurasi belum lengkap: isi GAS_URL di js/config.js.', 'CONFIG'));
    if (w.navigator && navigator.onLine === false) return Promise.reject(ApiError('Anda sedang offline. Periksa koneksi internet.', 'OFFLINE'));
    var ctl = w.AbortController ? new AbortController() : null, to = setTimeout(function () { ctl && ctl.abort(); }, 55000);
    return fetch(CFG.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined, redirect: 'follow' })
      .then(function (r) { clearTimeout(to); return r.json(); })
      .catch(function (e) { clearTimeout(to); throw ApiError(e && e.name === 'AbortError' ? 'Server terlalu lama merespons. Coba lagi.' : 'Tidak dapat terhubung ke server. Periksa koneksi Anda.', 'NET'); });
  }
  function absorb(res, ms, label) {
    if (res && res.token && S.token) { S.token = res.token; saveSession(); }
    if (res && res.code === 'AUTH' && S.token) { var cb = API.onAuthLost; clearSession(); cb && cb(); }
    if (res && res.nq) scheduleDrain();
    if (label) { perf.push({ aksi: label, total: ms, server: res && res.ms, cache: !!(res && (res.cached || res.nm)) }); if (perf.length > 200) perf.shift(); }
    return res;
  }
  function unwrap(res) { if (!res || res.success === false) throw ApiError((res && res.message) || 'Terjadi kesalahan.', res && res.code); return res; }

  // ---------- Batcher: pembacaan dalam tik yang sama digabung jadi 1 eksekusi ----------
  function enqueue(action, data) {
    return new Promise(function (resolve, reject) {
      if (!queue) { queue = []; setTimeout(flush, 6); }
      queue.push({ action: action, data: data, resolve: resolve, reject: reject });
    });
  }
  function flush() {
    var q = queue; queue = null; if (!q || !q.length) return;
    for (var i = 0; i < q.length; i += 10) sendChunk(q.slice(i, i + 10));
  }
  function sendChunk(items) {
    var t0 = Date.now();
    if (items.length === 1) {
      var it = items[0];
      post({ action: it.action, token: S.token || undefined, data: it.data }).then(function (res) { it.resolve(absorb(res, Date.now() - t0, it.action)); }, it.reject);
      return;
    }
    post({ action: 'batch', token: S.token || undefined, calls: items.map(function (x) { return { action: x.action, data: x.data }; }) }).then(function (res) {
      var ms = Date.now() - t0;
      if (!res || !res.results) { items.forEach(function (x) { x.resolve(absorb(res, ms)); }); return; }
      var lastTok = null; res.results.forEach(function (r) { if (r && r.token) lastTok = r.token; });
      if (lastTok && S.token) { S.token = lastTok; saveSession(); }
      perf.push({ aksi: 'batch[' + items.length + ']', total: ms, server: res.ms, cache: false });
      items.forEach(function (x, i) { var r = res.results[i] || fail('Respons tidak lengkap.'); if (r.token) delete r.token; x.resolve(absorb(r, ms)); });
    }, function (e) { items.forEach(function (x) { x.reject(e); }); });
  }
  function fail(m) { return { success: false, message: m }; }

  // ---------- cache SWR ----------
  function ckey(action, data) { return action + '|' + (S.user ? S.user.id : '-') + '|' + JSON.stringify(data || {}); }
  function cGet(key) {
    var e = mem[key]; if (e) return e;
    e = lsGet('c.' + key); if (e && e.d !== undefined) { mem[key] = e; return e; }
    return null;
  }
  function cPut(key, res, prev) {
    var e = { d: res.data, etag: res.etag || '', at: Date.now(), ep: S.epoch }; mem[key] = e;
    var s = JSON.stringify(e); if (s.length < 900000) lsSet('c.' + key, e);
    return e;
  }
  function netGet(action, data, ent) {
    var d2 = {}, k; for (k in (data || {})) d2[k] = data[k];
    if (ent && ent.etag) d2._etag = ent.etag;
    var fk = ckey(action, data) + '#' + S.epoch;
    if (inflight[fk]) return inflight[fk];
    var p = enqueue(action, d2).then(function (res) { delete inflight[fk]; return res; }, function (e) { delete inflight[fk]; throw e; });
    inflight[fk] = p; return p;
  }
  /** SWR: cb dipanggil segera dari cache (stale) lalu lagi hanya bila data benar-benar berubah. */
  function view(action, data, cb, opts) {
    opts = opts || {};
    var key = ckey(action, data), ent = cGet(key), freshMs = (opts.fresh == null ? 20 : opts.fresh) * 1000;
    if (ent) {
      cb && cb(ent.d, { stale: true });
      if (!opts.force && Date.now() - ent.at < freshMs && ent.ep === S.epoch) return Promise.resolve(ent.d);
    }
    return netGet(action, data, opts.force ? null : ent).then(function (res) {
      unwrap(res);
      if (res.nm && ent) { ent.at = Date.now(); ent.ep = S.epoch; return ent.d; }
      var n = cPut(key, res, ent), changed = !ent || JSON.stringify(ent.d) !== JSON.stringify(n.d);
      if (changed) cb && cb(n.d, { stale: false });
      return n.d;
    });
  }
  function get(action, data, opts) { var out; return view(action, data, function (d) { out = d; }, opts).then(function (d) { return out !== undefined ? out : d; }); }
  function prefetch(action, data) {
    var key = ckey(action, data), ent = cGet(key);
    if (ent && Date.now() - ent.at < 20000 && ent.ep === S.epoch) return;
    netGet(action, data, ent).then(function (res) { if (res && res.success !== false) { if (res.nm && ent) { ent.at = Date.now(); ent.ep = S.epoch; } else if (res.data !== undefined) cPut(key, res, ent); } }, function () { });
  }
  function peek(action, data) { var e = cGet(ckey(action, data)); return e ? e.d : undefined; }

  // ---------- tulis ----------
  function write(action, data) {
    S.epoch++;
    var t0 = Date.now();
    return post({ action: action, token: S.token || undefined, data: data || {} }).then(function (res) {
      absorb(res, Date.now() - t0, action); S.epoch++; unwrap(res); return res;
    });
  }
  /** panggilan sekali pakai tanpa cache (login, unggah, OTP, dll) */
  function call(action, data) {
    var t0 = Date.now();
    return post({ action: action, token: S.token || undefined, data: data || {} }).then(function (res) { absorb(res, Date.now() - t0, action); return unwrap(res); });
  }

  // ---------- antrean notifikasi ----------
  var drainT = null, drainN = 0;
  function scheduleDrain() { clearTimeout(drainT); drainT = setTimeout(function () { drainN = 0; runDrain(); }, 500); }
  function runDrain() {
    post({ action: 'sys.drain', data: {} }).then(function (r) { if (r && r.success && r.data && r.data.left > 0 && ++drainN < 3) setTimeout(runDrain, 1500); }, function () { });
  }

  // ---------- pemanasan server ----------
  function warm(scope) {
    if (!configured()) return;
    try {
      var k = 'warm_' + scope, last = +sessionStorage.getItem(k) || 0;
      if (Date.now() - last < 4 * 60000) return; sessionStorage.setItem(k, String(Date.now()));
    } catch (e) { }
    try { fetch(CFG.GAS_URL + '?w=' + encodeURIComponent(scope), { mode: 'no-cors', cache: 'no-store' }).catch(function () { }); } catch (e) { }
  }

  // ---------- polling adaptif ----------
  var act = Date.now(), actInit = false;
  function initAct() {
    if (actInit) return; actInit = true;
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'focus'].forEach(function (ev) { w.addEventListener(ev, function () { act = Date.now(); }, { passive: true }); });
  }
  function poll(fn, activeMs, idleMs) {
    initAct(); var stop = false, t;
    (function loop() {
      var idle = Date.now() - act > 120000, ms = idle ? idleMs : activeMs;
      t = setTimeout(function () { if (stop) return; if (document.visibilityState === 'visible') { try { fn(); } catch (e) { } } loop(); }, ms);
    })();
    return function () { stop = true; clearTimeout(t); };
  }

  var API = {
    S: S, save: saveSession, configured: configured, loadSession: loadSession, setSession: setSession, clearSession: clearSession, clearCache: clearCache,
    view: view, get: get, prefetch: prefetch, peek: peek, write: write, call: call, warm: warm, poll: poll, onAuthLost: null,
    invalidate: function () { S.epoch++; }, error: ApiError,
    perf: { table: function () { console.table(perf); }, summary: function () { var m = {}; perf.forEach(function (p) { var a = m[p.aksi] = m[p.aksi] || { n: 0, total: 0, server: 0 }; a.n++; a.total += p.total; a.server += p.server || 0; }); var o = {}; Object.keys(m).forEach(function (k) { o[k] = { n: m[k].n, rataTotalMs: Math.round(m[k].total / m[k].n), rataServerMs: Math.round(m[k].server / m[k].n) }; }); console.table(o); } }
  };
  w.API = API; w.Perf = API.perf;
})(window);
