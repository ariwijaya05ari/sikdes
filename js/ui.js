/* UI toolkit: ikon, format, toast, modal, tabel klien, grafik SVG, CSV/XLSX, cetak. */
(function (w) {
  'use strict';
  var IC = {
    home: 'M3 11l9-8 9 8M5 10v10h14V10', dash: 'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',
    users: 'M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8zM21 20v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
    file: 'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h6',
    filec: 'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 15l2 2 4-4',
    mail: 'M3 5h18v14H3zM3 7l9 6 9-6', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    shieldc: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
    check: 'M5 12l5 5L20 7', checkc: 'M12 21a9 9 0 100-18 9 9 0 000 18zM8 12l3 3 5-6', x: 'M6 6l12 12M18 6L6 18',
    xc: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9 9l6 6M15 9l-6 6',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3', bell: 'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0',
    plus: 'M12 5v14M5 12h14', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z', trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6',
    download: 'M12 3v12M7 10l5 5 5-5M4 21h16', upload: 'M12 21V9M7 14l5-5 5 5M4 3h16', print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z',
    qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M14 20h3M20 20v1',
    pin: 'M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    mega: 'M3 11v3a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM15 9a4 4 0 010 6M18 6a8 8 0 010 12',
    clip: 'M9 4h6v3H9zM8 5H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-2M9 12h6M9 16h4',
    logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9', menu: 'M3 6h18M3 12h18M3 18h18',
    chr: 'M9 6l6 6-6 6', chl: 'M15 6l-6 6 6 6', chd: 'M6 9l6 6 6-6', chu: 'M6 15l6-6 6 6',
    alert: 'M12 3l10 18H2zM12 10v5M12 18h.01', info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h.01',
    clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2', heart: 'M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z',
    baby: 'M12 21a7 7 0 100-14 7 7 0 000 14zM9 12h.01M15 12h.01M10 16c1 .8 3 .8 4 0M12 7c0-2 1-3 3-3',
    bld: 'M4 21V5l8-3 8 3v16M2 21h20M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z', lock: 'M6 11V8a6 6 0 0112 0v3M5 11h14v10H5zM12 15v2',
    key: 'M21 2l-2 2M11.4 11.6a5.5 5.5 0 11-7.8 7.8 5.5 5.5 0 017.8-7.8zM11.4 11.6L15.5 7.5M15.5 7.5l3 3L22 7l-3-3',
    gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2', refresh: 'M21 12a9 9 0 01-15.5 6.2L3 16M3 12A9 9 0 0118.5 5.8L21 8M21 3v5h-5M3 21v-5h5',
    phone: 'M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z',
    cal: 'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4', arrow: 'M5 12h14M13 6l6 6-6 6', filter: 'M3 5h18l-7 8v6l-4 2v-8z', send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
    scale: 'M12 3v18M5 7h14M5 7l-3 8a4 4 0 006 0zM19 7l-3 8a4 4 0 006 0zM8 21h8', trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
    acc: 'M12 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 8l7 1 7-1M12 9v6M9 22l3-7 3 7', folder: 'M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    link: 'M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1', copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    db: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
    more: 'M5 12h.01M12 12h.01M19 12h.01', mapp: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14', face: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9 10h.01M15 10h.01M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8',
    hand: 'M18 11V6a2 2 0 00-4 0M14 10V4a2 2 0 00-4 0v6M10 10.5V6a2 2 0 00-4 0v8a8 8 0 008 8h1a7 7 0 007-7v-4a2 2 0 00-4 0', wallet: 'M3 7h16a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7V5a2 2 0 012-2h12M16 14h2'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ico(n, c) { return '<svg class="i' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (IC[n] || IC.info) + '"/></svg>'; }

  var BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'], BLN_F = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function tgl(d, full) { if (!d) return '–'; var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d); if (!m) return esc(d); return (+m[3]) + ' ' + (full ? BLN_F : BLN)[+m[2] - 1] + ' ' + m[1]; }
  function tglJam(d) { var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(d || ''); return m ? tgl(d) + ', ' + m[4] + '.' + m[5] : tgl(d); }
  function rp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
  function num(n) { return Number(n || 0).toLocaleString('id-ID'); }
  function umur(t, ref) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t || ''); if (!m) return ''; var n = ref ? new Date(ref) : new Date(), a = n.getFullYear() - +m[1]; if (n.getMonth() + 1 < +m[2] || (n.getMonth() + 1 === +m[2] && n.getDate() < +m[3])) a--; return Math.max(0, a); }
  function ini(n) { var p = String(n || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase(); }
  function mask(s, keep) { s = String(s || ''); return s.length <= keep * 2 ? s : s.slice(0, keep) + '•'.repeat(s.length - keep * 2) + s.slice(-keep); }
  function pct(a, b) { return b ? Math.round(a / b * 1000) / 10 : 0; }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var STATUS_CLS = { 'Diajukan': 'in', 'Divalidasi RT': 'in', 'Diproses': 'wa', 'Menunggu TTE': 'gd', 'Selesai': 'ok', 'Ditolak': 'er', 'Perlu Revisi': 'wa', 'Dibatalkan': '', 'Aktif': 'ok', 'Menunggu': 'wa', 'Disetujui': 'ok', 'Tetap': 'ok', 'Pendatang': 'in', 'Pindah': 'wa', 'Meninggal': 'er', 'Layak': 'ok', 'Dipertimbangkan': 'wa', 'Tidak Layak': 'er', 'Nonaktif': '', 'Terbit': 'ok', 'Draft': '' };
  function badge(s, extra) { return '<span class="bdg ' + (STATUS_CLS[s] || '') + '">' + esc(extra || s) + '</span>'; }

  var ENUM = {
    jk: ['L', 'P'], status_kawin: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'], agama: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kepercayaan'],
    pendidikan: ['Tidak/Belum Sekolah', 'Belum Tamat SD', 'SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'Diploma I/II', 'Diploma III', 'Diploma IV/Strata I', 'Strata II', 'Strata III'],
    hubungan: ['Kepala Keluarga', 'Istri', 'Suami', 'Anak', 'Menantu', 'Cucu', 'Orang Tua', 'Mertua', 'Famili Lain', 'Lainnya'],
    status_kependudukan: ['Tetap', 'Pendatang', 'Pindah', 'Meninggal'], kondisi_rumah: ['Layak', 'Semi Permanen', 'Tidak Layak'], gol_darah: ['A', 'B', 'AB', 'O', '-']
  };
  function opts(list, sel, ph) { return (ph != null ? '<option value="">' + esc(ph) + '</option>' : '') + list.map(function (x) { var v = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x; return '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join(''); }

  // ---------- toast ----------
  function toast(msg, type, ms) {
    var box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    var t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.innerHTML = ico(type === 'er' ? 'alert' : type === 'ok' ? 'checkc' : 'info', 'l') + '<div class="grow">' + esc(msg) + '</div>';
    box.appendChild(t); setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .25s'; setTimeout(function () { t.remove(); }, 260); }, ms || (type === 'er' ? 6000 : 3200));
  }
  var ok = function (m) { toast(m, 'ok'); }, er = function (e) { toast(e && e.message ? e.message : String(e), 'er'); };

  // ---------- modal ----------
  var modals = [];
  function modal(o) {
    var el = document.createElement('div'); el.className = 'mdl'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="box ' + (o.size || '') + '"><div class="mh"><div><h2>' + esc(o.title || '') + '</h2>' + (o.sub ? '<p class="mut sm mt8">' + esc(o.sub) + '</p>' : '') + '</div><button class="ib" data-x aria-label="Tutup">' + ico('x') + '</button></div><div class="mb">' + (o.body || '') + '</div>' + (o.footer ? '<div class="mf">' + o.footer + '</div>' : '') + '</div>';
    var prevFocus = document.activeElement;
    var api = { el: el, close: function () { el.remove(); modals = modals.filter(function (m) { return m !== api; }); document.removeEventListener('keydown', onKey); prevFocus && prevFocus.focus && prevFocus.focus(); o.onClose && o.onClose(); }, $: function (s) { return $(s, el); }, $$: function (s) { return $$(s, el); }, setBody: function (h) { $('.mb', el).innerHTML = h; } };
    function onKey(e) { if (e.key === 'Escape' && modals[modals.length - 1] === api && !o.sticky) api.close(); }
    el.addEventListener('mousedown', function (e) { if (e.target === el && !o.sticky) api.close(); });
    el.addEventListener('click', function (e) { if (e.target.closest('[data-x]')) api.close(); });
    document.addEventListener('keydown', onKey); document.body.appendChild(el); modals.push(api);
    var f = $('input:not([type=hidden]),select,textarea', $('.mb', el)); f && setTimeout(function () { f.focus(); }, 30);
    o.onOpen && o.onOpen(api); return api;
  }
  function confirmBox(msg, o) {
    o = o || {};
    return new Promise(function (res) {
      var m = modal({ title: o.title || 'Konfirmasi', body: '<p>' + (o.html ? msg : esc(msg)) + '</p>', footer: '<button class="btn" data-n>Batal</button><button class="btn ' + (o.danger ? 'dan' : 'pri') + '" data-y>' + esc(o.ok || 'Ya, lanjutkan') + '</button>', onClose: function () { res(false); } });
      m.$('[data-n]').onclick = function () { m.close(); };
      m.$('[data-y]').onclick = function () { m.el.remove(); res(true); m.close = function () { }; };
    });
  }
  /** Jalankan aksi async pada tombol: nonaktif + spinner + penanganan galat */
  function busy(btn, fn) {
    if (!btn || btn.disabled) return Promise.resolve();
    var h = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin"></span> ' + btn.textContent.trim();
    return Promise.resolve().then(fn).catch(er).then(function (r) { btn.disabled = false; btn.innerHTML = h; return r; });
  }
  function formObj(form) {
    var o = {}; $$('input,select,textarea', form).forEach(function (el) { if (!el.name) return; if (el.type === 'checkbox') o[el.name] = el.checked ? 'Ya' : 'Tidak'; else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; } else o[el.name] = el.value; });
    return o;
  }
  function field(label, inner, o) { o = o || {}; return '<div class="fld ' + (o.cls || '') + '"><label' + (o.req ? ' class="req"' : '') + '>' + esc(label) + '</label>' + inner + (o.hint ? '<span class="hint">' + esc(o.hint) + '</span>' : '') + '</div>'; }
  function inp(name, v, o) { o = o || {}; return '<input class="inp" name="' + name + '" type="' + (o.type || 'text') + '" value="' + esc(v == null ? '' : v) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.mode ? ' inputmode="' + o.mode + '"' : '') + (o.ro ? ' readonly' : '') + (o.req ? ' required' : '') + (o.ac ? ' autocomplete="' + o.ac + '"' : '') + '>'; }
  function sel(name, list, v, ph, o) { return '<select class="inp" name="' + name + '"' + (o && o.req ? ' required' : '') + '>' + opts(list, v, ph) + '</select>'; }

  // ---------- tabel klien (filter instan + paginasi) ----------
  function grid(el, o) {
    var st = { page: 1, size: o.size || 25, sort: o.sort || null, rows: o.rows || [], view: [] };
    function apply() {
      var r = st.rows; if (o.filter) r = r.filter(o.filter);
      if (st.sort) { var k = st.sort.k, d = st.sort.d, col = o.cols.filter(function (c) { return c.k === k; })[0]; r = r.slice().sort(function (a, b) { var x = col && col.v ? col.v(a) : a[k], y = col && col.v ? col.v(b) : b[k]; if (x === y) return 0; return (x > y ? 1 : -1) * d; }); }
      st.view = r;
    }
    function draw() {
      apply(); var pages = Math.max(1, Math.ceil(st.view.length / st.size)); if (st.page > pages) st.page = pages;
      var from = (st.page - 1) * st.size, rows = st.view.slice(from, from + st.size);
      var h = '<div class="tw"><table class="t"><thead><tr>' + o.cols.map(function (c) { return '<th class="' + (c.cls || '') + '"' + (c.sort ? ' data-sort="' + c.k + '" style="cursor:pointer"' : '') + '>' + esc(c.l) + (st.sort && st.sort.k === c.k ? (st.sort.d > 0 ? ' ▲' : ' ▼') : '') + '</th>'; }).join('') + '</tr></thead><tbody>';
      if (!rows.length) h += '<tr><td colspan="' + o.cols.length + '"><div class="empty">' + ico('search') + '<div class="b">' + esc(o.empty || 'Tidak ada data') + '</div><div class="sm">' + esc(o.emptySub || 'Ubah kata kunci atau filter pencarian.') + '</div></div></td></tr>';
      rows.forEach(function (r, i) { h += '<tr' + (o.onRow ? ' class="click" data-i="' + (from + i) + '"' : '') + '>' + o.cols.map(function (c) { return '<td class="' + (c.cls || '') + '">' + (c.f ? c.f(r) : esc(r[c.k])) + '</td>'; }).join('') + '</tr>'; });
      h += '</tbody></table></div>';
      h += '<div class="pager"><span>' + (st.view.length ? 'Menampilkan ' + (from + 1) + '–' + (from + rows.length) + ' dari ' + num(st.view.length) : '0 data') + '</span><span class="row gap8"><button class="btn sm" data-pg="-1"' + (st.page <= 1 ? ' disabled' : '') + '>' + ico('chl', 's') + ' Sebelumnya</button><span>Hal. ' + st.page + '/' + pages + '</span><button class="btn sm" data-pg="1"' + (st.page >= pages ? ' disabled' : '') + '>Berikutnya ' + ico('chr', 's') + '</button></span></div>';
      el.innerHTML = h; o.onDraw && o.onDraw(st.view);
    }
    el.onclick = function (e) {
      var p = e.target.closest('[data-pg]'); if (p) { st.page += +p.dataset.pg; draw(); el.scrollIntoView && el.getBoundingClientRect().top < 0 && el.scrollIntoView({ block: 'start' }); return; }
      var s = e.target.closest('[data-sort]'); if (s) { var k = s.dataset.sort; st.sort = st.sort && st.sort.k === k ? { k: k, d: -st.sort.d } : { k: k, d: 1 }; draw(); return; }
      var r = e.target.closest('tr[data-i]'); if (r && o.onRow && !e.target.closest('a,button,input,select')) o.onRow(st.view[+r.dataset.i], e);
    };
    draw();
    return { refresh: function (rows) { if (rows) st.rows = rows; st.page = 1; draw(); }, redraw: draw, state: st };
  }

  // ---------- grafik ----------
  var PAL = ['#1E3A5F', '#C9A227', '#2E7D32', '#64748B', '#1D4ED8', '#B7791F', '#7C3AED'];
  function hbars(items, o) {
    o = o || {}; var max = Math.max.apply(null, items.map(function (x) { return x.n; }).concat([1])), tot = items.reduce(function (s, x) { return s + x.n; }, 0);
    return items.map(function (x, i) { return '<div class="hb"><span>' + esc(x.label) + '</span><div class="tr"><i style="width:' + (x.n / max * 100) + '%;background:' + (o.color || PAL[0]) + '"></i></div><span class="tnum b">' + (o.pct ? pct(x.n, tot) + '% (' + num(x.n) + ')' : num(x.n)) + '</span></div>'; }).join('');
  }
  function donut(items, o) {
    o = o || {}; var tot = items.reduce(function (s, x) { return s + x.n; }, 0) || 1, R = 15.9, C = 2 * Math.PI * R, off = 0, segs = '';
    items.forEach(function (x, i) { var len = x.n / tot * C; segs += '<circle r="' + R + '" cx="21" cy="21" fill="none" stroke="' + PAL[i % PAL.length] + '" stroke-width="5" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 21 21)"></circle>'; off += len; });
    return '<div class="row w" style="gap:20px"><svg viewBox="0 0 42 42" width="130" height="130" role="img" aria-label="Diagram">' + segs + '<text x="21" y="22.5" text-anchor="middle" font-size="7" font-weight="700" fill="#152B47">' + (o.center != null ? o.center : '') + '</text>' + (o.cap ? '<text x="21" y="28" text-anchor="middle" font-size="3.2" fill="#64748B">' + esc(o.cap) + '</text>' : '') + '</svg><div class="legend grow" style="flex-direction:column;gap:6px">' + items.map(function (x, i) { return '<span><i style="background:' + PAL[i % PAL.length] + '"></i>' + esc(x.label) + ' <b>(' + pct(x.n, tot) + '%)</b></span>'; }).join('') + '</div></div>';
  }
  function line(points, o) {
    o = o || {}; var W = 560, H = 190, P = 28, vals = points.map(function (p) { return p.v; }), mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); if (mx === mn) { mx += 1; mn -= 1; }
    var pad = (mx - mn) * .15; mn -= pad; mx += pad;
    var xy = points.map(function (p, i) { return [P + i * (W - 2 * P) / Math.max(1, points.length - 1), H - P - (p.v - mn) / (mx - mn) * (H - 2 * P)]; });
    var d = xy.map(function (a, i) { return (i ? 'L' : 'M') + a[0].toFixed(1) + ' ' + a[1].toFixed(1); }).join(' ');
    return '<svg class="ch-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik garis"><path d="' + d + ' L' + xy[xy.length - 1][0] + ' ' + (H - P) + ' L' + xy[0][0] + ' ' + (H - P) + 'Z" fill="rgba(30,58,95,.08)"/><path d="' + d + '" fill="none" stroke="#1E3A5F" stroke-width="2.5" stroke-linejoin="round"/>' + xy.map(function (a, i) { return '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="3.2" fill="#C9A227"><title>' + esc(points[i].l) + ': ' + num(points[i].v) + '</title></circle>' + (i % 2 === 0 || points.length < 8 ? '<text x="' + a[0] + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10" fill="#64748B">' + esc(points[i].l) + '</text>' : ''); }).join('') + '</svg>';
  }
  function skel(kind, n) { var h = ''; for (var i = 0; i < (n || 1); i++) h += kind === 'k' ? '<div class="card sk sk-k"></div>' : kind === 'b' ? '<div class="card sk sk-b"></div>' : '<div class="sk sk-l"></div>'; return h; }

  // ---------- berkas ----------
  function download(name, content, mime) {
    var b = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }
  function csvCell(v) { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function toCSV(cols, rows) { return '﻿' + [cols.join(',')].concat(rows.map(function (r) { return r.map(csvCell).join(','); })).join('\r\n'); }
  function parseCSV(text) {
    text = String(text).replace(/^﻿/, ''); var first = text.split(/\r?\n/)[0] || '', sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? '\t' : ',';
    var rows = [], row = [], cur = '', q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === sep) { row.push(cur); cur = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(function (x) { return x !== ''; })) rows.push(row); row = []; } else cur += c;
    }
    row.push(cur); if (row.some(function (x) { return x !== ''; })) rows.push(row); return rows;
  }
  /** Pembaca XLSX minimal (zip + deflate-raw lewat DecompressionStream). Mengembalikan baris sheet pertama sebagai teks. */
  function readXlsx(buf) {
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('Peramban ini belum mendukung baca Excel. Simpan file sebagai CSV lalu unggah.'));
    var u = new Uint8Array(buf), dv = new DataView(buf), eocd = -1, i;
    for (i = u.length - 22; i >= 0; i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) return Promise.reject(new Error('Berkas Excel tidak valid.'));
    var n = dv.getUint16(eocd + 10, true), p = dv.getUint32(eocd + 16, true), ent = {};
    for (i = 0; i < n; i++) {
      var nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), name = new TextDecoder().decode(u.subarray(p + 46, p + 46 + nl));
      ent[name] = { m: dv.getUint16(p + 10, true), cs: dv.getUint32(p + 20, true), off: dv.getUint32(p + 42, true) }; p += 46 + nl + el + cl;
    }
    function read(name) {
      var e = ent[name]; if (!e) return Promise.resolve(null);
      var l = dv.getUint16(e.off + 26, true) + dv.getUint16(e.off + 28, true), data = u.subarray(e.off + 30 + l, e.off + 30 + l + e.cs);
      if (e.m === 0) return Promise.resolve(new TextDecoder().decode(data));
      var ds = new DecompressionStream('deflate-raw'), wr = ds.writable.getWriter(); wr.write(data); wr.close();
      return new Response(ds.readable).arrayBuffer().then(function (b) { return new TextDecoder().decode(b); });
    }
    function xml(s) { return new DOMParser().parseFromString(s, 'text/xml'); }
    function col(ref) { var m = /^([A-Z]+)/.exec(ref)[1], n = 0; for (var k = 0; k < m.length; k++) n = n * 26 + m.charCodeAt(k) - 64; return n - 1; }
    var sheetName = Object.keys(ent).filter(function (k) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(k); }).sort()[0];
    if (!sheetName) return Promise.reject(new Error('Sheet tidak ditemukan di berkas Excel.'));
    return Promise.all([read('xl/sharedStrings.xml'), read(sheetName)]).then(function (r) {
      var ss = []; if (r[0]) Array.prototype.forEach.call(xml(r[0]).getElementsByTagName('si'), function (si) { ss.push(Array.prototype.map.call(si.getElementsByTagName('t'), function (t) { return t.textContent; }).join('')); });
      var rows = []; Array.prototype.forEach.call(xml(r[1]).getElementsByTagName('row'), function (row) {
        var a = []; Array.prototype.forEach.call(row.getElementsByTagName('c'), function (c) {
          var t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0], val = '';
          if (t === 'inlineStr') val = Array.prototype.map.call(c.getElementsByTagName('t'), function (x) { return x.textContent; }).join(''); else if (v) val = t === 's' ? ss[+v.textContent] : v.textContent;
          a[col(c.getAttribute('r'))] = val == null ? '' : val;
        });
        for (var k = 0; k < a.length; k++) if (a[k] === undefined) a[k] = '';
        if (a.some(function (x) { return x !== ''; })) rows.push(a);
      }); return rows;
    });
  }
  function printHtml(html) {
    var pa = $('#print-area'); if (!pa) { pa = document.createElement('div'); pa.id = 'print-area'; document.body.appendChild(pa); }
    pa.innerHTML = html; var done = function () { pa.innerHTML = ''; w.removeEventListener('afterprint', done); }; w.addEventListener('afterprint', done); setTimeout(function () { w.print(); }, 80);
  }
  function copy(text) { return (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { ok('Disalin ke clipboard.'); }, function () { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok('Disalin.'); } catch (e) { } t.remove(); }); }
  function readFileAsB64(file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.onerror = rej; r.readAsDataURL(file); }); }

  w.UI = { esc: esc, ico: ico, tgl: tgl, tglJam: tglJam, rp: rp, num: num, umur: umur, ini: ini, mask: mask, pct: pct, debounce: debounce, $: $, $$: $$, badge: badge, ENUM: ENUM, opts: opts, toast: toast, ok: ok, er: er, modal: modal, confirm: confirmBox, busy: busy, formObj: formObj, field: field, inp: inp, sel: sel, grid: grid, hbars: hbars, donut: donut, line: line, skel: skel, download: download, toCSV: toCSV, parseCSV: parseCSV, readXlsx: readXlsx, printHtml: printHtml, copy: copy, b64: readFileAsB64, BLN_F: BLN_F, PAL: PAL };
})(window);
