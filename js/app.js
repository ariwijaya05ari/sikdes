/* App: router hash, shell (sidebar/topbar/bottom-nav), peran & menu, prefetch, polling, pencarian global. */
(function (w) {
  'use strict';
  var U = w.UI, $ = U.$, esc = U.esc, ico = U.ico;
  var ROLE_LBL = { admin: 'Admin Desa', sekdes: 'Sekretaris Desa', kades: 'Kepala Desa', rt: 'Ketua RT/RW', warga: 'Warga' };
  var STAFF = ['admin', 'sekdes', 'kades', 'rt'], OPS = ['admin', 'sekdes'];
  var MENU = [
    { id: 'dasbor', l: 'Dasbor & Statistik', i: 'dash', p: '/a', r: STAFF, g: 'Kelompok Utama' },
    { id: 'penduduk', l: 'Data Kependudukan', i: 'users', p: '/a/penduduk', r: STAFF, g: 'Kelompok Utama' },
    { id: 'mutasi', l: 'Mutasi Warga', i: 'acc', p: '/a/mutasi', r: STAFF, g: 'Kelompok Utama' },
    { id: 'surat', l: 'Layanan Surat', i: 'mail', p: '/a/surat', r: STAFF, g: 'Pelayanan & Sosial', badge: 'surat' },
    { id: 'bansos', l: 'Bantuan Sosial', i: 'heart', p: '/a/bansos', r: ['admin', 'sekdes', 'kades'], g: 'Pelayanan & Sosial' },
    { id: 'verifikasi', l: 'Verifikasi Data', i: 'shieldc', p: '/a/verifikasi', r: ['admin', 'sekdes', 'rt'], g: 'Pelayanan & Sosial', badge: 'verif' },
    { id: 'pengumuman', l: 'Pengumuman Desa', i: 'mega', p: '/a/pengumuman', r: OPS, g: 'Pengaturan & Sistem' },
    { id: 'laporan', l: 'Laporan & Ekspor', i: 'file', p: '/a/laporan', r: STAFF, g: 'Pengaturan & Sistem' },
    { id: 'impor', l: 'Impor & Migrasi Data', i: 'upload', p: '/a/impor', r: ['admin'], g: 'Pengaturan & Sistem' },
    { id: 'pengguna', l: 'Pengguna', i: 'key', p: '/a/pengguna', r: ['admin'], g: 'Pengaturan & Sistem' },
    { id: 'log', l: 'Audit Log', i: 'clip', p: '/a/log', r: ['admin', 'kades'], g: 'Pengaturan & Sistem' },
    { id: 'pengaturan', l: 'Pengaturan Desa', i: 'gear', p: '/a/pengaturan', r: ['admin'], g: 'Pengaturan & Sistem' },
    { id: 'profil', l: 'Profil & Keamanan', i: 'user', p: '/a/profil', r: STAFF, g: 'Pengaturan & Sistem' },
    // warga
    { id: 'w-beranda', l: 'Beranda', i: 'home', p: '/w', r: ['warga'], bn: 1 },
    { id: 'w-ajukan', l: 'Ajukan Surat', i: 'plus', p: '/w/ajukan', r: ['warga'], bn: 1 },
    { id: 'w-surat', l: 'Lacak Surat', i: 'mail', p: '/w/surat', r: ['warga'], bn: 1, badge: 'wsurat' },
    { id: 'w-data', l: 'Data Keluarga', i: 'users', p: '/w/data', r: ['warga'], bn: 1 },
    { id: 'w-info', l: 'Pengumuman', i: 'mega', p: '/w/info', r: ['warga'] },
    { id: 'w-profil', l: 'Profil & Keamanan', i: 'user', p: '/w/profil', r: ['warga'], bn: 1 }
  ];

  var A = { routes: [], user: null, desa: null, counts: {}, cur: null, cleanups: [], ticks: [], navId: 0, stopPoll: null, root: null };
  w.App = A;

  // ---------- registrasi rute ----------
  A.add = function (path, def) {
    var keys = [], re = new RegExp('^' + path.replace(/:([a-z]+)/g, function (_, k) { keys.push(k); return '([^/]+)'; }) + '/?$');
    def.re = re; def.keys = keys; def.path = path; A.routes.push(def);
  };
  A.go = function (p, replace) { if (replace) location.replace('#' + p); else location.hash = '#' + p; };
  function parse() {
    var h = location.hash.replace(/^#/, '') || '/', q = '', i = h.indexOf('?'); if (i >= 0) { q = h.slice(i + 1); h = h.slice(0, i); }
    var qs = {}; q.split('&').forEach(function (kv) { if (!kv) return; var a = kv.split('='); qs[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || ''); });
    return { path: h, qs: qs };
  }
  A.home = function () { return !A.user ? '/' : A.user.role === 'warga' ? '/w' : '/a'; };
  A.can = function (r) { return !r || (A.user && r.indexOf(A.user.role) >= 0); };

  // ---------- helper tampilan: render dari cache lalu revalidasi ----------
  A.V = function (el, action, data, render, o) {
    o = o || {}; var shown = false;
    function show(d, meta) { if (!el.isConnected) return; shown = true; try { render(d, meta || {}); } catch (e) { console.error(e); el.innerHTML = '<div class="card p">' + errBox(e) + '</div>'; } }
    return API.view(action, data, show, o).catch(function (e) {
      if (!el.isConnected) return; if (e && e.code === 'AUTH') return;
      if (!shown) { el.innerHTML = '<div class="card p">' + errBox(e, true) + '</div>'; var b = el.querySelector('[data-retry]'); b && (b.onclick = function () { el.innerHTML = ''; A.V(el, action, data, render, o); }); }
      else U.er(e);
    });
  };
  function errBox(e, retry) { return '<div class="empty">' + ico('alert') + '<div class="b">Data belum dapat dimuat</div><div class="sm">' + esc(e && e.message || 'Terjadi kesalahan') + '</div>' + (retry ? '<button class="btn mt16" data-retry>' + ico('refresh', 's') + ' Coba lagi</button>' : '') + '</div>'; }
  A.leave = function (fn) { A.cleanups.push(fn); };
  A.tick = function (fn) { A.ticks.push(fn); };

  // ---------- progres ----------
  var progEl, progT;
  function prog(on) {
    if (!progEl) { progEl = document.createElement('div'); progEl.id = 'prog'; document.body.appendChild(progEl); }
    clearTimeout(progT);
    if (on) { progEl.className = 'on'; progEl.style.width = '12%'; progT = setTimeout(function () { progEl.style.width = '70%'; }, 200); }
    else { progEl.style.width = '100%'; progT = setTimeout(function () { progEl.className = ''; progEl.style.width = '0'; }, 220); }
  }

  // ---------- router ----------
  function route() {
    var loc = parse(), def = null, params = {}, i, m;
    for (i = 0; i < A.routes.length; i++) { m = A.routes[i].re.exec(loc.path); if (m) { def = A.routes[i]; A.routes[i].keys.forEach(function (k, j) { params[k] = decodeURIComponent(m[j + 1]); }); break; } }
    if (!def) { def = A.routes.filter(function (r) { return r.path === '/404'; })[0]; }
    var navId = ++A.navId;
    A.cleanups.splice(0).forEach(function (f) { try { f(); } catch (e) { } }); A.ticks = [];
    if (def.auth && !A.user) { A.go('/masuk?next=' + encodeURIComponent(loc.path), true); return; }
    if (def.auth && !A.can(def.roles)) { U.toast('Anda tidak memiliki akses ke halaman itu.', 'er'); A.go(A.home(), true); return; }
    if (def.guest && A.user) { A.go(A.home(), true); return; }
    if (def.auth && A.user && A.user.wajibGanti && !/\/profil$/.test(loc.path)) { U.toast('Demi keamanan, ganti kata sandi sementara Anda terlebih dahulu.', 'wa', 7000); A.go(A.user.role === 'warga' ? '/w/profil' : '/a/profil', true); return; }
    A.cur = { def: def, params: params, qs: loc.qs, path: loc.path };
    var needShell = !!def.auth, hasShell = !!$('#view');
    if (needShell && !hasShell) buildShell(); else if (!needShell) { A.root.innerHTML = ''; document.body.classList.remove('warga'); }
    var host = needShell ? $('#view') : A.root;
    var el = document.createElement('div'); el.className = 'pg'; host.innerHTML = ''; host.appendChild(el);
    if (needShell) { markMenu(def.menu); setCrumb(def.title); document.body.classList.toggle('warga', A.user.role === 'warga'); closeSide(); }
    document.title = (def.title ? def.title + ' · ' : '') + ((A.desa && A.desa.nama_desa) || 'SIPAKDES') + ' — SIPAKDES';
    prog(true); w.scrollTo(0, 0);
    var ctx = { user: A.user, params: params, qs: loc.qs, el: el, V: function (a, d, r, o) { return A.V(el, a, d, r, o); } };
    var out; try { out = def.render(el, ctx); } catch (e) { console.error(e); el.innerHTML = '<div class="card p">' + errBox(e) + '</div>'; }
    Promise.resolve(out).then(function (c) { if (typeof c === 'function') A.leave(c); }).catch(function (e) { console.error(e); }).then(function () { if (navId === A.navId) prog(false); });
    // jaring pengaman: progres tidak menggantung bila halaman menunggu jaringan
    setTimeout(function () { if (navId === A.navId) prog(false); }, 600);
  }

  // ---------- shell ----------
  function menuFor(role) { return MENU.filter(function (m) { return m.r.indexOf(role) >= 0; }); }
  function buildShell() {
    var u = A.user, desa = A.desa || {}, items = menuFor(u.role), h = '', g = '';
    items.forEach(function (m) {
      if (m.g && m.g !== g) { g = m.g; h += '<h6>' + esc(g) + '</h6>'; }
      h += '<a href="#' + m.p + '" data-m="' + m.id + '" data-p="' + m.p + '">' + ico(m.i) + '<span>' + esc(m.l) + '</span>' + (m.badge ? '<span class="cnt hide" data-b="' + m.badge + '"></span>' : '') + '</a>';
    });
    var bn = u.role === 'warga' ? '<nav class="bnav" aria-label="Menu utama">' + items.filter(function (m) { return m.bn; }).map(function (m) { return '<a href="#' + m.p + '" data-m="' + m.id + '" data-p="' + m.p + '">' + ico(m.i, 'l') + '<span>' + esc(m.l.replace('Profil & Keamanan', 'Profil').replace('Data Keluarga', 'Keluarga').replace('Ajukan Surat', 'Ajukan').replace('Lacak Surat', 'Surat')) + '</span></a>'; }).join('') + '</nav>' : '';
    A.root.innerHTML = '<div class="shell"><aside class="side" id="side"><div class="brand"><div class="lg' + (desa.logo ? ' has' : '') + '">' + U.logo(desa) + '</div><div><b>SIPAKDES</b><span>' + esc(desa.nama_desa || 'Desa') + ', ' + esc((desa.kabupaten || '').replace(/^Kab\.?\s*/i, 'Kab. ')) + '</span></div></div><nav class="nav" aria-label="Navigasi">' + h + '</nav><nav class="nav" style="flex:none;border-top:1px solid rgba(255,255,255,.08)"><a href="#" data-logout>' + ico('logout') + '<span>Keluar / Log Out</span></a></nav></aside>' +
      '<div class="main"><header class="top"><button class="ib burger" aria-label="Buka menu" id="burger">' + ico('menu', 'l') + '</button><div class="crumb"><span class="hide-m">' + esc(desa.nama_desa || 'Pemerintah Desa') + '</span>' + ico('chr', 's') + '<b id="crumb"></b></div>' +
      (u.role !== 'warga' ? '<div class="sch ig" style="position:relative"><span>' + ico('search') + '</span><input class="inp" id="gsearch" placeholder="Cari NIK, No. KK, atau nama warga…" autocomplete="off" aria-label="Pencarian global"><div id="gres" class="card hide" style="position:absolute;left:0;right:0;top:44px;max-height:360px;overflow:auto;z-index:50"></div></div>' : '<span class="grow"></span>') +
      '<button class="ib" id="bell" aria-label="Pemberitahuan">' + ico('bell') + '<span class="dot hide" id="belldot" style="position:absolute;margin:-12px 0 0 10px;background:var(--er)"></span></button>' +
      '<div class="user"><div class="meta" style="text-align:right"><div class="b" style="line-height:1.2">' + esc(u.nama) + '</div><span class="bdg gd xs">' + esc(ROLE_LBL[u.role] || u.role) + '</span></div><div class="av">' + esc(U.ini(u.nama)) + '</div></div></header><main class="page" id="view" tabindex="-1"></main></div></div><div class="scrim" id="scrim"></div>' + bn;
    var side = $('#side'), scrim = $('#scrim');
    $('#burger').onclick = function () { side.classList.add('open'); scrim.classList.add('on'); };
    scrim.onclick = closeSide;
    A.root.querySelector('[data-logout]').onclick = function (e) { e.preventDefault(); A.logout(); };
    $('#bell').onclick = function () { A.go(u.role === 'warga' ? '/w/surat' : '/a/surat'); };
    A.root.addEventListener('mouseover', hoverPrefetch); A.root.addEventListener('touchstart', hoverPrefetch, { passive: true }); A.root.addEventListener('focusin', hoverPrefetch);
    if (u.role !== 'warga') bindSearch();
    paintBadges();
    startPolling();
  }
  function closeSide() { var s = $('#side'), c = $('#scrim'); s && s.classList.remove('open'); c && c.classList.remove('on'); }
  function markMenu(id) { U.$$('[data-m]').forEach(function (a) { a.classList.toggle('on', a.dataset.m === id); a.setAttribute('aria-current', a.dataset.m === id ? 'page' : 'false'); }); }
  function setCrumb(t) { var c = $('#crumb'); if (c) c.textContent = t || ''; }
  A.setCrumb = setCrumb;
  function paintBadges() {
    var c = A.counts; U.$$('[data-b]').forEach(function (b) { var n = c[b.dataset.b] || 0; b.textContent = n; b.classList.toggle('hide', !n); });
    var dot = $('#belldot'); if (dot) dot.classList.toggle('hide', !(c.surat || c.wsurat));
  }

  // ---------- prefetch saat hover / idle ----------
  function hoverPrefetch(e) {
    var a = e.target.closest && e.target.closest('[data-p]'); if (!a) return;
    var def = A.routes.filter(function (r) { return r.re.test(a.dataset.p); })[0];
    if (def && def.prefetch && !a._pf) { a._pf = 1; setTimeout(function () { a._pf = 0; }, 8000); try { def.prefetch(A.user); } catch (er) { } }
  }
  function idlePrefetch() {
    var role = A.user && A.user.role, run = w.requestIdleCallback || function (f) { setTimeout(f, 700); };
    run(function () {
      if (!A.user) return;
      A.routes.filter(function (r) { return r.auth && r.prefetch && r.menu && A.can(r.roles) && !/:/.test(r.path); }).forEach(function (r, i) { setTimeout(function () { if (A.user) try { r.prefetch(A.user); } catch (e) { } }, 250 * i); });
    });
  }

  // ---------- polling adaptif ----------
  function startPolling() {
    if (A.stopPoll) A.stopPoll();
    A.stopPoll = API.poll(function () {
      if (!A.user) return;
      if (A.user.role === 'warga') API.get('warga.beranda', {}).then(function (d) { afterWarga(d); }, function () { });
      else API.get('dash.summary', {}).then(function (d) { afterSummary(d); }, function () { });
      A.ticks.forEach(function (f) { try { f(); } catch (e) { } });
    }, 30000, 150000);
  }
  var lastStatus = null;
  function afterWarga(d) {
    if (!d) return; A.counts.wsurat = d.surat.filter(function (s) { return ['Selesai', 'Ditolak', 'Perlu Revisi', 'Dibatalkan'].indexOf(s.status) < 0; }).length; paintBadges();
    var now = {}; d.surat.forEach(function (s) { now[s.id] = s.status; });
    if (lastStatus) d.surat.forEach(function (s) { if (lastStatus[s.id] && lastStatus[s.id] !== s.status) U.toast('Status ' + (s.jenis_nama || 'surat') + ' kini: ' + s.status, s.status === 'Selesai' ? 'ok' : s.status === 'Ditolak' ? 'er' : '', 6000); });
    lastStatus = now;
  }
  function afterSummary(d) {
    if (!d) return; var r = A.user.role;
    A.counts.surat = r === 'kades' ? (d.menungguTte || 0) : r === 'rt' ? (d.menungguValidasi || 0) : (d.menungguProses || 0);
    A.counts.verif = d.verifData || 0; paintBadges();
  }
  A.afterSummary = afterSummary; A.afterWarga = afterWarga; A.reroute = route;
  A.refreshBrand = function () { var d = A.desa || {}; U.$$('.brand .lg').forEach(function (e) { e.innerHTML = U.logo(d); e.classList.toggle('has', !!d.logo); }); };

  // ---------- pencarian global ----------
  function bindSearch() {
    var inp = $('#gsearch'), box = $('#gres'), loaded = false;
    function ensure() { if (!loaded) { loaded = true; API.get('pend.all', {}).then(function () { run(); }, function () { }); } }
    function run() {
      var q = inp.value.trim().toLowerCase(); if (q.length < 2) { box.classList.add('hide'); return; }
      var d = API.peek('pend.all', {}); if (!d) { box.classList.remove('hide'); box.innerHTML = '<div class="empty sm">Memuat data…</div>'; return; }
      var c = d.pc, ni = c.indexOf('nik'), kk = c.indexOf('no_kk'), nm = c.indexOf('nama'), rt = c.indexOf('rt'), rw = c.indexOf('rw'), res = [];
      for (var i = 0; i < d.pr.length && res.length < 8; i++) { var r = d.pr[i]; if (String(r[nm]).toLowerCase().indexOf(q) >= 0 || String(r[ni]).indexOf(q) >= 0 || String(r[kk]).indexOf(q) >= 0) res.push(r); }
      box.classList.remove('hide');
      box.innerHTML = res.length ? res.map(function (r) { return '<a href="#/a/penduduk?nik=' + r[ni] + '" class="row" style="padding:10px 14px;border-bottom:1px solid var(--bd);color:inherit"><div class="av" style="width:30px;height:30px;font-size:11px">' + esc(U.ini(r[nm])) + '</div><div class="grow"><div class="b">' + esc(r[nm]) + '</div><div class="xs mut">NIK ' + esc(r[ni]) + ' · RT ' + esc(r[rt]) + '/RW ' + esc(r[rw]) + '</div></div></a>'; }).join('') : '<div class="empty sm">Tidak ada hasil untuk “' + esc(q) + '”.</div>';
    }
    inp.addEventListener('focus', ensure); inp.addEventListener('input', U.debounce(run, 90));
    document.addEventListener('click', function (e) { if (!e.target.closest('.sch')) box.classList.add('hide'); else if (e.target.closest('#gres a')) { box.classList.add('hide'); inp.value = ''; } });
  }

  // ---------- sesi ----------
  A.login = function (d, next) {
    API.setSession(d); A.user = d.user; A.desa = d.desa || A.desa; A.counts = {}; lastStatus = null; A.root.innerHTML = '';
    var def = A.user.role === 'warga' ? '/w' : '/a'; var go = next && next.indexOf(A.user.role === 'warga' ? '/w' : '/a') === 0 ? next : def;
    if (A.user.role === 'warga') { API.prefetch('warga.beranda', {}); API.prefetch('jenis.list', {}); } else { API.prefetch('dash.summary', {}); }
    if (location.hash === '#' + go) route(); else A.go(go);
    idlePrefetch();
  };
  A.logout = function (silent) {
    var tok = API.S.token; if (tok && !silent) API.call('auth.logout', {}).catch(function () { });
    if (A.stopPoll) A.stopPoll(); API.clearSession(); A.user = null; A.counts = {}; A.root.innerHTML = '';
    document.body.classList.remove('warga'); A.go('/masuk', true); route();
  };

  A.start = function (root) {
    A.root = root; A.user = API.loadSession(); if (A.user) A.desa = API.S.desa;
    API.onAuthLost = function () { U.toast('Sesi Anda berakhir. Silakan masuk kembali.', 'wa', 5000); A.user = null; if (A.stopPoll) A.stopPoll(); A.root.innerHTML = ''; var p = A.cur && A.cur.path; A.go('/masuk' + (p && /^\/(a|w)/.test(p) ? '?next=' + encodeURIComponent(p) : ''), true); };
    w.addEventListener('hashchange', route);
    if (A.user) { idlePrefetch(); } else API.warm('pub');
    route();
    if (A.user) { API.get('auth.me', {}, { fresh: 0 }).then(function (d) { A.user = d.user; A.desa = d.desa; API.S.user = d.user; API.S.desa = d.desa; API.save(); A.refreshBrand(); }, function () { }); }
  };
  A.ROLE_LBL = ROLE_LBL; A.MENU = MENU;
})(window);
