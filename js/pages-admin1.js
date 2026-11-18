/* Panel admin (1): dasbor & statistik, data kependudukan/KK, mutasi, verifikasi data. */
(function (w) {
  'use strict';
  var U = w.UI, A = w.App, C = w.Common, esc = U.esc, ico = U.ico, $ = U.$;
  var ST = ['admin', 'sekdes', 'kades', 'rt'], OPS = ['admin', 'sekdes'], INP = ['admin', 'sekdes', 'rt'];   // INP: boleh mengubah data penduduk (RT/RW dibatasi wilayahnya di server)
  var PEND_CACHE = new WeakMap();
  /** Ubah {pc,pr} menjadi array objek sekali per versi data */
  function pendObjs(d) {
    var c = PEND_CACHE.get(d); if (c) return c;
    var pc = d.pc, rows = d.pr.map(function (r) { var o = {}; for (var i = 0; i < pc.length; i++) o[pc[i]] = r[i]; o._q = (o.nama + ' ' + o.nik + ' ' + o.no_kk).toLowerCase(); return o; });
    var kk = d.kr.map(function (r) { var o = {}; for (var i = 0; i < d.kc.length; i++) o[d.kc[i]] = r[i]; return o; });
    var byKk = {}; rows.forEach(function (p) { (byKk[p.no_kk] = byKk[p.no_kk] || []).push(p); });
    var byNik = {}; rows.forEach(function (p) { byNik[p.nik] = p; });
    c = { rows: rows, kk: kk, byKk: byKk, byNik: byNik }; PEND_CACHE.set(d, c); return c;
  }
  w.pendObjs = pendObjs;
  function aktif(p) { return p.status_kependudukan !== 'Meninggal' && p.status_kependudukan !== 'Pindah'; }
  var PRE_ALL = function (u) { API.prefetch('pend.all', {}); };

  // ================= DASBOR =================
  A.add('/a', {
    auth: 1, roles: ST, menu: 'dasbor', title: 'Dasbor & Statistik', prefetch: function () { API.prefetch('dash.summary', {}); API.prefetch('dash.peta', {}); },
    render: function (el, ctx) {
      var dusun = '', u = ctx.user;
      el.innerHTML = '<div class="grid g6">' + U.skel('k', 6) + '</div>';
      function load() {
        A.V(el, 'dash.summary', dusun ? { dusun: dusun } : {}, function (d) { A.afterSummary(d); draw(d); }, { fresh: 25 });
      }
      A.tick(function () { if (el.isConnected) API.get('dash.summary', dusun ? { dusun: dusun } : {}).then(function () { }, function () { }); });
      function draw(d) {
        var maxPy = Math.max.apply(null, d.piramida.map(function (g) { return Math.max(g.L, g.P); }).concat([1]));
        var kpis = [
          ['Total Penduduk', U.num(d.total), '', 'users', ''], ['Kepala Keluarga', U.num(d.kk), '<span class="s">Rerata ' + d.rataJiwa + ' jiwa/KK</span>', 'users', ''],
          ['Rasio Gender (L/P)', U.num(d.L) + ' <span class="mut" style="font-size:16px">/</span> <span style="color:var(--gold-h)">' + U.num(d.P) + '</span>', '<span class="s">' + U.pct(d.L, d.total) + '% L · ' + U.pct(d.P, d.total) + '% P</span>', 'acc', ''],
          ['Balita (0–5 thn)', U.num(d.balita), '<span class="s">' + U.pct(d.balita, d.total) + '% dari populasi</span>', 'baby', 'gd'], ['Usia Produktif (15–64)', U.num(d.produktif), '<span class="s">' + U.pct(d.produktif, d.total) + '% dari total</span>', 'trend', 'gn'], ['Lansia (60+ thn)', U.num(d.lansia), '<span class="s">' + U.num(d.lansiaBansos) + ' di KK penerima bansos</span>', 'acc', '']
        ];
        var isK = u.role === 'kades';
        el.innerHTML = '<div class="card p mb16"><div class="row sb w" style="align-items:flex-start"><div><h1>Dasbor Kependudukan & Layanan Desa</h1><span class="up mt8" style="margin-top:8px"><span class="dot"></span> Data terbarui ' + U.tgl(d.tanggal, true) + '</span><p class="mut sm mt8" style="max-width:62ch">Pantauan statistik demografi, sebaran wilayah, dan alur perizinan surat Desa' + (A.desa ? ' ' + esc(A.desa.nama_desa) : '') + '.</p></div><div class="row w"><select class="inp" id="fd" aria-label="Filter dusun" style="width:auto"><option value="">Semua Wilayah</option>' + U.opts(d.dusunList, dusun) + '</select><button class="btn" id="exp">' + ico('download', 's') + ' Unduh Ringkasan</button><button class="btn gold" id="prt">' + ico('print', 's') + ' Cetak Statistik</button></div></div></div>' +
          '<div class="grid g6" id="kp">' + kpis.map(function (k, i) { var pctv = i === 0 ? 100 : i === 2 ? U.pct(d.L, d.total) : i === 1 ? 100 : U.pct([0, 0, 0, d.balita, d.produktif, d.lansia][i], d.total); return '<div class="card kpi ' + k[4] + '"><span class="t">' + k[0] + '</span><span class="ic">' + ico(k[3]) + '</span><span class="v tnum">' + k[1] + '</span>' + k[2] + '<div class="bar"><i style="width:' + Math.min(100, pctv) + '%"></i></div></div>'; }).join('') + '</div>' +
          '<div class="grid g-main mt16"><div class="card p"><div class="row sb w"><div><h2>Piramida Struktur Usia & Gender</h2><p class="mut sm mt8">Proporsi kohort per kelompok umur</p></div><div class="legend"><span><i style="background:var(--navy-800)"></i>Laki-laki (' + U.num(d.L) + ')</span><span><i style="background:var(--gold)"></i>Perempuan (' + U.num(d.P) + ')</span></div></div><div class="pyr mt16">' + d.piramida.slice().reverse().map(function (g) { return '<div class="l"><span class="tnum mut">' + U.num(g.L) + '</span><div class="bar bl" style="width:' + (g.L / maxPy * 100) + '%"></div></div><div class="m">' + g.label + '</div><div class="rr"><div class="bar bp" style="width:' + (g.P / maxPy * 100) + '%"></div><span class="tnum mut">' + U.num(g.P) + '</span></div>'; }).join('') + '</div><div class="note ok mt16" style="align-items:center">' + ico('scale', 'l') + '<div><b>Rasio Ketergantungan: ' + d.dependency + '%</b><br>Tiap 100 jiwa usia produktif menanggung ~' + Math.round(d.dependency) + ' jiwa non-produktif. <span class="bdg ok">' + (d.dependency < 50 ? 'Kategori rendah / produktif' : d.dependency < 70 ? 'Kategori sedang' : 'Kategori tinggi') + '</span></div></div></div>' +
          '<div class="col"><div class="card p"><div class="row sb"><h3>Struktur Pendidikan Warga</h3><span class="xs mut">Seluruh penduduk</span></div><div class="mt8">' + U.hbars(d.pendidikan, { pct: 1 }) + '</div></div><div class="card p"><div class="row sb"><h3>Mata Pencaharian Utama</h3><span class="xs mut">Top 5</span></div><div class="mt16">' + U.donut(d.pekerjaan.filter(function (x) { return x.n > 0; }), { center: d.pekerjaan.filter(function (x) { return x.n > 0; }).length, cap: 'Sektor' }) + '</div></div></div></div>' +
          '<div class="grid g-main mt16"><div class="card p"><div class="row sb w"><div><h2>Distribusi Kewilayahan Desa</h2><p class="mut sm mt8">Agregasi jiwa dan KK per dusun</p></div></div><div class="grid g3 mt16">' + d.dusun.map(function (x) { return '<div class="card p" style="box-shadow:none"><div class="row sb"><h3>Dusun ' + esc(x.dusun) + '</h3><span class="bdg">' + x.rtrw + ' RT/RW</span></div><div class="mt8"><span class="tnum b" style="font-size:24px">' + U.num(x.jiwa) + '</span> <span class="mut">Jiwa</span></div><div class="xs mut mt8">' + U.num(x.kk) + ' KK</div><div class="kpi" style="padding:0"><div class="bar"><i style="width:' + U.pct(x.jiwa, d.total) + '%"></i></div></div></div>'; }).join('') + '</div><div id="peta" class="mt16"></div></div>' +
          '<div class="card p"><div class="row sb"><h2>Mutasi Bulan Ini</h2><span class="xs mut">' + esc(U.BLN_F[+d.bulanIni.slice(5) - 1] + ' ' + d.bulanIni.slice(0, 4)) + '</span></div><div class="grid g2 mt16" style="gap:10px">' + [['Kelahiran', '+' + d.mutasiBulanIni.kelahiran + ' Bayi', 'face', 'var(--ok-tx)'], ['Kematian', d.mutasiBulanIni.kematian + ' Jiwa', 'heart', 'var(--er-tx)'], ['Pindah Masuk', '+' + d.mutasiBulanIni.pindah_masuk + ' Jiwa', 'download', 'var(--in)'], ['Pindah Keluar', '-' + d.mutasiBulanIni.pindah_keluar + ' Jiwa', 'upload', 'var(--wa-tx)']].map(function (m) { return '<div style="background:#F8FAFC;border-radius:10px;padding:12px"><div class="xs mut b">' + m[0] + '</div><div class="b mt8" style="color:' + m[3] + ';font-size:16px">' + m[1] + '</div></div>'; }).join('') + '</div><div class="note mt16" style="align-items:center;justify-content:space-between"><span>' + ico('trend') + ' <b>Pertumbuhan Bersih</b></span><b style="font-size:18px">' + (function () { var n = d.mutasiBulanIni.kelahiran + d.mutasiBulanIni.pindah_masuk - d.mutasiBulanIni.kematian - d.mutasiBulanIni.pindah_keluar; return (n > 0 ? '+' : '') + n + ' Jiwa'; })() + '</b></div><h3 class="mt16 mb8">Tren 12 Bulan</h3>' + U.line(d.tumbuh.map(function (t) { return { l: U.BLN_F[+t.bulan.slice(5) - 1].slice(0, 3), v: t.jumlah }; })) + '</div></div>' +
          '<div class="mt16">' + (d.menungguTte && isK ? '<div class="banner mb16"><div class="row"><div class="av" style="background:var(--gold);color:var(--navy-900)">' + ico('key') + '</div><div><h3>Perlu Otorisasi Kepala Desa (' + d.menungguTte + ' Berkas Menunggu TTE) <span class="bdg gd">Prioritas</span></h3><p>Dokumen telah diverifikasi staf desa dan siap untuk ditandatangani secara elektronik.</p></div></div><a class="btn gold" href="#/a/surat?status=Menunggu TTE">' + ico('key', 's') + ' Buka Antrean Otorisasi</a></div>' : '') +
          '<div class="card p0"><div class="card-h"><h2>' + ico('mail') + ' Antrean Cepat Permohonan Surat</h2><a href="#/a/surat" class="b sm">Semua permohonan (' + Object.keys(d.surat).reduce(function (s, k) { return s + d.surat[k]; }, 0) + ') ' + ico('chr', 's') + '</a></div>' + (d.antrean.length ? '<div class="tw"><table class="t"><thead><tr><th>Jenis surat</th><th>Pemohon & domisili</th><th>Waktu masuk</th><th>Status</th><th></th></tr></thead><tbody>' + d.antrean.map(function (s) { return '<tr class="click" data-id="' + esc(s.id) + '"><td><b>' + esc(s.jenis_nama) + '</b><div class="xs mut">' + esc(s.id) + '</div></td><td>' + esc(s.nama) + '<div class="xs mut">RT ' + esc(s.rt) + '/RW ' + esc(s.rw) + ' Dusun ' + esc(s.dusun) + '</div></td><td>' + U.tglJam(s.updated_at) + '</td><td>' + U.badge(s.status) + '</td><td class="r"><a class="btn sm" href="#/a/surat/' + esc(s.id) + '">Buka</a></td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('mail') + '<div>Tidak ada permohonan aktif.</div></div>') + '</div></div>';
        $('#fd', el).onchange = function (e) { dusun = e.target.value; el.innerHTML = '<div class="grid g6">' + U.skel('k', 6) + '</div>'; load(); };
        $('#exp', el).onclick = function () { U.download('ringkasan-kependudukan-' + d.tanggal + '.csv', U.toCSV(['Indikator', 'Nilai'], [['Total penduduk', d.total], ['Jumlah KK', d.kk], ['Laki-laki', d.L], ['Perempuan', d.P], ['Balita', d.balita], ['Usia produktif', d.produktif], ['Lansia', d.lansia], ['Rasio ketergantungan (%)', d.dependency]].concat(d.piramida.map(function (g) { return ['Usia ' + g.label + ' (L/P)', g.L + '/' + g.P]; })).concat(d.pendidikan.map(function (g) { return ['Pendidikan ' + g.label, g.n]; }))), 'text/csv;charset=utf-8'); };
        $('#prt', el).onclick = function () { var c = el.cloneNode(true); U.$$('select,button', c).forEach(function (x) { x.remove(); }); U.printHtml('<div style="padding:18mm 14mm">' + c.innerHTML + '</div>'); };
        U.$$('tr[data-id]', el).forEach(function (tr) { tr.onclick = function (e) { if (!e.target.closest('a')) A.go('/a/surat/' + tr.dataset.id); }; });
        A.V($('#peta', el), 'dash.peta', {}, function (p) { peta($('#peta', el), p); });
      }
      load();
    }
  });
  function peta(el, p) {
    var pts = p.titik; if (!pts.length) { el.innerHTML = '<div class="note">' + ico('info') + '<div>Titik koordinat KK belum diisi. Isi Latitude/Longitude pada data KK untuk menampilkan peta sebaran. Ringkasan per RT/RW: ' + p.kelompok.slice(0, 6).map(function (k) { return 'RT ' + esc(k.rt) + '/' + esc(k.rw) + ' (' + k.kk + ' KK)'; }).join(', ') + '.</div></div>'; return; }
    var la = pts.map(function (x) { return x.lat; }), ln = pts.map(function (x) { return x.lng; }), mnA = Math.min.apply(null, la), mxA = Math.max.apply(null, la), mnN = Math.min.apply(null, ln), mxN = Math.max.apply(null, ln), W = 640, H = 240, P = 24;
    var dA = Math.max(mxA - mnA, 0.0004), dN = Math.max(mxN - mnN, 0.0004), sc = Math.min((W - 2 * P) / dN, (H - 2 * P) / dA), ox = (W - dN * sc) / 2, oy = (H - dA * sc) / 2;
    el.innerHTML = '<div class="row sb mb8"><b class="sm">Peta Persebaran KK (' + pts.length + ' titik)</b><span class="xs mut">Skema sederhana dari koordinat KK — bukan peta jalan</span></div><div class="mapbox"><svg class="ch-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Peta sebaran KK"><defs><pattern id="gr" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#D5E0EE" stroke-width="1"/></pattern></defs><rect width="' + W + '" height="' + H + '" fill="url(#gr)"/>' + pts.map(function (x) { var cx = ox + (x.lng - mnN) * sc, cy = H - oy - (x.lat - mnA) * sc; return '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (4 + Math.min(6, x.jiwa / 2)) + '" fill="#1E3A5F" fill-opacity=".75" stroke="#C9A227" stroke-width="1.5"><title>KK ' + esc(x.no_kk) + ' · ' + x.jiwa + ' jiwa · RT ' + esc(x.rt) + '/RW ' + esc(x.rw) + ' ' + esc(x.dusun) + '</title></circle>'; }).join('') + '</svg></div>';
  }

  // ================= PENDUDUK & KK =================
  function pendForm(p, kk, o) {
    p = p || {}; o = o || {}; var baru = !!o.baru, uu = A.user || {}, lockRt = uu.role === 'rt' && uu.rt, lockRw = uu.role === 'rt' && uu.rw;
    return '<form id="fp" class="frm">' + U.field('NIK', U.inp('nik', p.nik, { mode: 'numeric', max: 16, req: 1, ro: !baru }), { req: 1 }) + U.field('No. KK', U.inp('no_kk', p.no_kk, { mode: 'numeric', max: 16, req: 1, ro: !baru }), { req: 1, hint: baru ? 'Isi nomor KK yang sudah ada, atau KK baru (lalu isi alamat).' : '' }) +
      U.field('Nama lengkap', U.inp('nama', p.nama, { req: 1 }), { req: 1, cls: 'full' }) + U.field('Tempat lahir', U.inp('tempat_lahir', p.tempat_lahir)) + U.field('Tanggal lahir', U.inp('tgl_lahir', p.tgl_lahir, { type: 'date', req: 1 }), { req: 1 }) +
      U.field('Jenis kelamin', U.sel('jk', [['L', 'Laki-laki'], ['P', 'Perempuan']], p.jk, 'Pilih…', { req: 1 }), { req: 1 }) + U.field('Hubungan dalam KK', U.sel('hubungan', U.ENUM.hubungan, p.hubungan, 'Pilih…')) + U.field('Status perkawinan', U.sel('status_kawin', U.ENUM.status_kawin, p.status_kawin, 'Pilih…')) + U.field('Agama', U.sel('agama', U.ENUM.agama, p.agama, 'Pilih…')) +
      U.field('Pendidikan', U.sel('pendidikan', U.ENUM.pendidikan, p.pendidikan, 'Pilih…')) + U.field('Pekerjaan', U.inp('pekerjaan', p.pekerjaan)) + U.field('Golongan darah', U.sel('gol_darah', U.ENUM.gol_darah, p.gol_darah, '–')) + U.field('Disabilitas', U.inp('disabilitas', p.disabilitas, { ph: 'kosongkan bila tidak ada' })) +
      U.field('No. HP', U.inp('no_hp', p.no_hp, { mode: 'tel' })) + U.field('Email', U.inp('email', p.email, { type: 'email' })) +
      (o.kkBaru ? '<div class="full b mt8">Data KK baru</div>' + U.field('Alamat', U.inp('alamat', ''), { cls: 'full' }) + U.field('RT', U.inp('rt', lockRt ? uu.rt : '', { mode: 'numeric', max: 3, ro: !!lockRt }), lockRt ? { hint: 'Otomatis sesuai wilayah Anda.' } : (uu.role === 'rt' ? { hint: 'Wajib diisi untuk KK baru (RT di dalam RW Anda).' } : {})) + U.field('RW', U.inp('rw', lockRw ? uu.rw : '', { mode: 'numeric', max: 3, ro: !!lockRw }), lockRw ? { hint: 'Otomatis sesuai wilayah Anda.' } : {}) + U.field('Dusun', U.inp('dusun', '')) : '') + '</form>';
  }
  function openPend(nik, reload) {
    var m = U.modal({ title: 'Detail Penduduk', size: 'w', body: U.skel('l', 8) });
    API.get('pend.get', { nik: nik }, { fresh: 5 }).then(function (d) {
      var p = d.p, k = d.kk, canEdit = A.can(INP), canTambah = A.can(['admin', 'rt']);
      m.setBody('<div class="row w" style="align-items:flex-start"><div class="av" style="width:56px;height:56px;font-size:18px">' + esc(U.ini(p.nama)) + '</div><div class="grow"><h2>' + esc(p.nama) + '</h2><div class="sm mut">NIK ' + esc(p.nik) + ' · ' + (p.jk === 'L' ? 'Laki-laki' : 'Perempuan') + ' · ' + U.umur(p.tgl_lahir) + ' tahun</div><div class="row w gap8 mt8">' + U.badge(p.status_kependudukan) + (d.bansos.some(function (b) { return b.status === 'Aktif'; }) ? '<span class="bdg gd">' + ico('heart', 's') + ' Penerima Bansos</span>' : '') + '</div></div>' + (canEdit ? '<button class="btn" id="ed">' + ico('edit', 's') + ' Ubah Data</button>' : '') + '</div>' +
        '<div class="grid g2 mt16"><div><h3 class="mb8">Data Diri</h3><dl class="dl"><dt>Tempat, tgl lahir</dt><dd>' + esc(p.tempat_lahir) + ', ' + U.tgl(p.tgl_lahir, true) + '</dd><dt>Agama</dt><dd>' + esc(p.agama || '–') + '</dd><dt>Status kawin</dt><dd>' + esc(p.status_kawin || '–') + '</dd><dt>Pendidikan</dt><dd>' + esc(p.pendidikan || '–') + '</dd><dt>Pekerjaan</dt><dd>' + esc(p.pekerjaan || '–') + '</dd><dt>Gol. darah</dt><dd>' + esc(p.gol_darah || '–') + '</dd><dt>No. HP / Email</dt><dd>' + esc(p.no_hp || '–') + ' / ' + esc(p.email || '–') + '</dd><dt>KTP-el</dt><dd>' + esc(p.ktp_status || '–') + '</dd></dl></div>' +
        '<div><h3 class="mb8">Keluarga & Alamat</h3><dl class="dl"><dt>No. KK</dt><dd class="tnum">' + esc(p.no_kk) + '</dd><dt>Alamat</dt><dd>' + esc(k.alamat || '–') + '</dd><dt>RT/RW/Dusun</dt><dd>' + esc(k.rt) + '/' + esc(k.rw) + ' · ' + esc(k.dusun) + '</dd><dt>Hubungan</dt><dd>' + esc(p.hubungan || '–') + '</dd></dl><h3 class="mt16 mb8">Anggota KK (' + d.anggota.length + ')</h3>' + d.anggota.map(function (a) { return '<div class="row sm" style="padding:4px 0"><span class="grow">' + esc(a.nama) + ' <span class="mut xs">' + esc(a.hubungan) + '</span></span>' + U.badge(a.status_kependudukan) + '</div>'; }).join('') + '</div></div>' +
        (d.mutasi.length ? '<h3 class="mt16 mb8">Riwayat Mutasi</h3>' + d.mutasi.map(function (x) { return '<div class="sm">' + U.tgl(x.tanggal) + ' — <b>' + esc(x.jenis.replace('_', ' ')) + '</b> ' + esc(x.alasan || '') + '</div>'; }).join('') : '') +
        (d.surat.length ? '<h3 class="mt16 mb8">Riwayat Surat</h3>' + d.surat.map(function (x) { return '<div class="row sm" style="padding:3px 0"><span class="grow">' + esc(x.id) + '</span>' + U.badge(x.status) + '</div>'; }).join('') : ''));
      var ed = m.$('#ed'); if (ed) ed.onclick = function () { m.close(); editPend(d, reload); };
    }).catch(function (e) { m.close(); U.er(e); });
  }
  function editPend(d, reload) {
    var m = U.modal({ title: 'Ubah Data Penduduk', sub: d.p.nama, size: 'w', body: pendForm(d.p, d.kk, {}), footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Simpan Perubahan</button>' });
    m.$('#ok').onclick = function () { var f = m.$('#fp'); if (!f.reportValidity()) return; var o = U.formObj(f); o.ubah = true; U.busy(m.$('#ok'), function () { return API.write('pend.save', o).then(function () { m.close(); U.ok('Data diperbarui.'); reload && reload(); }); }); };
  }
  function tambahPend(kkList, reload, pre) {
    pre = pre || {};
    var m = U.modal({ title: pre.no_kk ? 'Tambah Anggota Keluarga' : 'Tambah Penduduk', sub: pre.no_kk || '', size: 'w', body: pendForm({ no_kk: pre.no_kk }, null, { baru: true, kkBaru: !pre.no_kk }), footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Simpan</button>' });
    var f = m.$('#fp'); f.no_kk.setAttribute('list', 'kklist'); f.insertAdjacentHTML('beforeend', '<datalist id="kklist">' + kkList.slice(0, 400).map(function (k) { return '<option value="' + esc(k.no_kk) + '">' + esc(k.alamat || '') + '</option>'; }).join('') + '</datalist>');
    m.$('#ok').onclick = function () { if (!f.reportValidity()) return; U.busy(m.$('#ok'), function () { return API.write('pend.save', U.formObj(f)).then(function () { m.close(); U.ok('Penduduk ditambahkan.'); reload && reload(); }); }); };
  }
  function openKk(no, reload) {
    var m = U.modal({ title: 'Kartu Keluarga', size: 'w', body: U.skel('l', 6) });
    API.get('kk.get', { no_kk: no }, { fresh: 5 }).then(function (d) {
      var k = d.kk, canEdit = A.can(INP), canTambah = A.can(['admin', 'rt']);
      m.setBody('<div class="row sb w"><div><div class="xs mut">NO. KK</div><h2 class="tnum">' + esc(k.no_kk) + '</h2></div>' + (canEdit ? '<div class="row w">' + (canTambah ? '<button class="btn" id="am">' + ico('plus', 's') + ' Tambah anggota</button>' : '') + '<button class="btn" id="ed">' + ico('edit', 's') + ' Ubah KK</button></div>' : '') + '</div><dl class="dl mt16"><dt>Alamat</dt><dd>' + esc(k.alamat) + '</dd><dt>RT/RW/Dusun</dt><dd>' + esc(k.rt) + '/' + esc(k.rw) + ' · ' + esc(k.dusun) + '</dd><dt>Penghasilan</dt><dd>' + (k.penghasilan ? U.rp(k.penghasilan) + '/bulan' : '–') + '</dd><dt>Kondisi rumah</dt><dd>' + esc(k.kondisi_rumah || '–') + '</dd><dt>Koordinat</dt><dd>' + (k.lat ? esc(k.lat) + ', ' + esc(k.lng) : '–') + '</dd></dl><h3 class="mt16 mb8">Anggota (' + d.anggota.length + ')</h3><div class="tw"><table class="t"><tbody>' + d.anggota.map(function (a) { return '<tr class="click" data-n="' + esc(a.nik) + '"><td><b>' + esc(a.nama) + '</b><div class="xs mut">' + esc(a.nik) + '</div></td><td>' + esc(a.hubungan) + '</td><td>' + U.umur(a.tgl_lahir) + ' th</td><td>' + U.badge(a.status_kependudukan) + '</td></tr>'; }).join('') + '</tbody></table></div>' + (d.bansos.length ? '<h3 class="mt16 mb8">Bantuan Sosial</h3>' + d.bansos.map(function (b) { return '<div class="row sm"><span class="grow">' + esc(b.program) + ' · skor ' + esc(b.skor) + '</span>' + U.badge(b.status) + '</div>'; }).join('') : ''));
      U.$$('tr[data-n]', m.el).forEach(function (tr) { tr.onclick = function () { m.close(); openPend(tr.dataset.n, reload); }; });
      var am = m.$('#am'); if (am) am.onclick = function () { m.close(); tambahPend([], reload, { no_kk: k.no_kk }); };
      var ed = m.$('#ed'); if (ed) ed.onclick = function () {
        m.close(); var m2 = U.modal({ title: 'Ubah Data KK', sub: k.no_kk, body: '<form id="fk" class="frm">' + U.field('Alamat', U.inp('alamat', k.alamat), { cls: 'full' }) + U.field('RT', U.inp('rt', k.rt, { mode: 'numeric', max: 3, ro: A.user.role === 'rt' && !!A.user.rt })) + U.field('RW', U.inp('rw', k.rw, { mode: 'numeric', max: 3, ro: A.user.role === 'rt' })) + U.field('Dusun', U.inp('dusun', k.dusun)) + U.field('Penghasilan (Rp/bulan)', U.inp('penghasilan', k.penghasilan, { mode: 'numeric' })) + U.field('Kondisi rumah', U.sel('kondisi_rumah', U.ENUM.kondisi_rumah, k.kondisi_rumah, 'Pilih…')) + U.field('Latitude', U.inp('lat', k.lat, { ph: '-6.48' })) + U.field('Longitude', U.inp('lng', k.lng, { ph: '106.80' })) + '</form>', footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Simpan</button>' });
        m2.$('#ok').onclick = function () { var o = U.formObj(m2.$('#fk')); o.no_kk = k.no_kk; U.busy(m2.$('#ok'), function () { return API.write('kk.save', o).then(function () { m2.close(); U.ok('Data KK diperbarui.'); reload && reload(); }); }); };
      };
    }).catch(function (e) { m.close(); U.er(e); });
  }

  A.add('/a/penduduk', {
    auth: 1, roles: ST, menu: 'penduduk', title: 'Data Kependudukan', prefetch: PRE_ALL,
    render: function (el, ctx) {
      var tab = ctx.qs.tab === 'kk' ? 'kk' : 'pend', data = null, g = null, F = { q: '', dusun: '', rw: '', rt: '', jk: '', st: '', ktp: '', bs: '' };
      var canAdd = ctx.user.role === 'admin' || ctx.user.role === 'rt', canImp = ctx.user.role === 'admin';
      el.innerHTML = '<div class="ph"><div><h1>Data Kependudukan & Kartu Keluarga</h1><p>Pencarian dan penyaringan berjalan langsung di perangkat Anda — tanpa menunggu server.</p></div><div class="row w">' + (canImp ? '<a class="btn" href="#/a/impor">' + ico('upload', 's') + ' Impor</a>' : '') + (canAdd ? '<button class="btn pri" id="add">' + ico('plus', 's') + ' Tambah Penduduk</button>' : '') + '<button class="btn" id="csv">' + ico('download', 's') + ' Ekspor CSV</button></div></div><div class="card p0"><div class="tabs" id="tb"><button class="tab" data-t="pend">Penduduk <span class="n" id="n1">…</span></button><button class="tab" data-t="kk">Kartu Keluarga <span class="n" id="n2">…</span></button></div><div class="toolbar" id="tl"></div><div id="gr"><div class="p">' + U.skel('l', 8) + '</div></div></div>';
      function emptyTxt(w) {
        if (ctx.user.role === 'rt' && data && !data.pr.length && !data.kr.length) return 'Belum ada ' + w + ' terdata di wilayah Anda (' + A.wilayahLabel(ctx.user).replace(/<[^>]*>/g, '') + '). Mulai dengan tombol "Tambah Penduduk" di atas. Bila data seharusnya sudah ada, minta admin desa memeriksa isian RT/RW pada data KK dan pada akun Anda — keduanya harus sama.';
        return 'Tidak ada ' + w + ' yang cocok';
      }
      function reload() { API.get('pend.all', {}, { force: false, fresh: 0 }).then(function (d) { if (el.isConnected) { data = d; draw(); } }); }
      function tools() {
        var o = pendObjs(data), dus = {}; o.kk.forEach(function (k) { if (k.dusun) dus[k.dusun] = 1; });
        var rws = {}, rts = {}; o.kk.forEach(function (k) { if (k.rw) rws[k.rw] = 1; if (k.rt) rts[k.rt] = 1; });
        $('#tl', el).innerHTML = '<div class="ig"><span>' + ico('search') + '</span><input class="inp" id="q" placeholder="' + (tab === 'kk' ? 'Cari No. KK, kepala keluarga, alamat…' : 'Cari nama, NIK, atau No. KK…') + '" value="' + esc(F.q) + '" aria-label="Cari"></div>' + (Object.keys(dus).length > 1 ? '<select class="inp" id="fdus" aria-label="Dusun"><option value="">Semua dusun</option>' + U.opts(Object.keys(dus).sort(), F.dusun) + '</select>' : '') + (ctx.user.role !== 'rt' && Object.keys(rws).length > 1 ? '<select class="inp" id="frw" aria-label="RW"><option value="">Semua RW</option>' + U.opts(Object.keys(rws).sort(), F.rw) + '</select>' : '') + (ctx.user.role === 'rt' && !ctx.user.rt && Object.keys(rts).length > 1 ? '<select class="inp" id="frt" aria-label="RT"><option value="">Semua RT</option>' + U.opts(Object.keys(rts).sort(), F.rt) + '</select>' : '') +
          (tab === 'pend' ? '<select class="inp" id="fjk" aria-label="Jenis kelamin"><option value="">L/P</option><option value="L"' + (F.jk === 'L' ? ' selected' : '') + '>Laki-laki</option><option value="P"' + (F.jk === 'P' ? ' selected' : '') + '>Perempuan</option></select><select class="inp" id="fst" aria-label="Status">' + U.opts(U.ENUM.status_kependudukan, F.st, 'Semua status') + '</select><select class="inp" id="fktp" aria-label="KTP-el">' + U.opts(['Aktif', 'Belum Rekam', 'Tidak Wajib'], F.ktp, 'KTP-el') + '</select><select class="inp" id="fbs" aria-label="Bansos"><option value="">Bansos</option><option value="1"' + (F.bs === '1' ? ' selected' : '') + '>Penerima</option></select>' : '');
        var upd = U.debounce(function () { F.q = $('#q', el).value; g.refresh(); count(); }, 80); $('#q', el).oninput = upd;
        ['fdus:dusun', 'frw:rw', 'frt:rt', 'fjk:jk', 'fst:st', 'fktp:ktp', 'fbs:bs'].forEach(function (x) { var p = x.split(':'), s = $('#' + p[0], el); if (s) s.onchange = function () { F[p[1]] = s.value; g.refresh(); count(); }; });
      }
      function count() { var v = g && g.state.view.length; $(tab === 'kk' ? '#n2' : '#n1', el).textContent = U.num(v); }
      function draw() {
        var o = pendObjs(data); $('#n1', el).textContent = U.num(o.rows.length); $('#n2', el).textContent = U.num(o.kk.length);
        U.$$('.tab', el).forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); });
        tools();
        var q = function () { return F.q.trim().toLowerCase(); };
        if (tab === 'pend') {
          g = U.grid($('#gr', el), { rows: o.rows, size: 25, empty: emptyTxt('penduduk'),
            filter: function (p) { var s = q(); return (!s || p._q.indexOf(s) >= 0) && (!F.dusun || p.dusun === F.dusun) && (!F.rw || p.rw === F.rw) && (!F.rt || p.rt === F.rt) && (!F.jk || p.jk === F.jk) && (!F.st || p.status_kependudukan === F.st) && (!F.ktp || p.ktp_status === F.ktp) && (!F.bs || p.bansos === 1); },
            cols: [{ k: 'nama', l: 'Nama', sort: 1, f: function (p) { return '<div class="row gap8"><div class="av" style="width:32px;height:32px;font-size:11px">' + esc(U.ini(p.nama)) + '</div><div><b>' + esc(p.nama) + '</b><div class="xs mut tnum">' + esc(p.nik) + '</div></div></div>'; } }, { k: 'no_kk', l: 'No. KK', f: function (p) { return '<span class="tnum xs">' + esc(p.no_kk) + '</span>'; } }, { k: 'jk', l: 'L/P', f: function (p) { return p.jk; } },
              { k: 'umur', l: 'Umur', sort: 1, v: function (p) { return U.umur(p.tgl_lahir); }, f: function (p) { return U.umur(p.tgl_lahir) + ' th'; } }, { k: 'hubungan', l: 'Hubungan' }, { k: 'rt', l: 'RT/RW · Dusun', f: function (p) { return esc(p.rt) + '/' + esc(p.rw) + ' · ' + esc(p.dusun); } }, { k: 'status_kependudukan', l: 'Status', f: function (p) { return U.badge(p.status_kependudukan) + (p.bansos ? ' <span class="bdg gd" title="Penerima bansos">' + ico('heart', 's') + '</span>' : ''); } }, { k: 'ktp_status', l: 'KTP-el', f: function (p) { return U.badge(p.ktp_status === 'Aktif' ? 'Aktif' : p.ktp_status === 'Belum Rekam' ? 'Menunggu' : 'Tetap', p.ktp_status); } }],
            onRow: function (p) { openPend(p.nik, reload); }, onDraw: count });
        } else {
          var kepala = function (k) { var x = o.byNik[k.kepala_nik]; return x ? x.nama : '–'; }, jiwa = function (k) { return (o.byKk[k.no_kk] || []).filter(aktif).length; };
          g = U.grid($('#gr', el), { rows: o.kk, size: 25, empty: emptyTxt('KK'),
            filter: function (k) { var s = q(); return (!s || (k.no_kk + ' ' + kepala(k) + ' ' + k.alamat).toLowerCase().indexOf(s) >= 0) && (!F.dusun || k.dusun === F.dusun) && (!F.rw || k.rw === F.rw) && (!F.rt || k.rt === F.rt); },
            cols: [{ k: 'no_kk', l: 'No. KK', sort: 1, f: function (k) { return '<b class="tnum">' + esc(k.no_kk) + '</b>'; } }, { k: 'kepala', l: 'Kepala keluarga', v: kepala, sort: 1, f: function (k) { return esc(kepala(k)); } }, { k: 'alamat', l: 'Alamat' }, { k: 'rt', l: 'RT/RW', f: function (k) { return esc(k.rt) + '/' + esc(k.rw); } }, { k: 'dusun', l: 'Dusun' }, { k: 'j', l: 'Jiwa', cls: 'num', v: jiwa, sort: 1, f: function (k) { return jiwa(k); } }, { k: 'penghasilan', l: 'Penghasilan', cls: 'num', f: function (k) { return k.penghasilan ? U.rp(k.penghasilan) : '–'; } }, { k: 'kondisi_rumah', l: 'Rumah', f: function (k) { return k.kondisi_rumah ? U.badge(k.kondisi_rumah === 'Layak' ? 'Layak' : k.kondisi_rumah === 'Tidak Layak' ? 'Tidak Layak' : 'Dipertimbangkan', k.kondisi_rumah) : '–'; } }],
            onRow: function (k) { openKk(k.no_kk, reload); }, onDraw: count });
        }
        count();
      }
      $('#tb', el).onclick = function (e) { var b = e.target.closest('[data-t]'); if (b && b.dataset.t !== tab) { tab = b.dataset.t; F.q = ''; draw(); } };
      var add = $('#add', el); if (add) add.onclick = function () { tambahPend(pendObjs(data).kk, reload); };
      $('#csv', el).onclick = function () {
        var rows = g.state.view; if (tab === 'pend') U.download('penduduk.csv', U.toCSV(['NIK', 'No KK', 'Nama', 'JK', 'Tgl Lahir', 'Tempat Lahir', 'Hubungan', 'Pekerjaan', 'Pendidikan', 'Agama', 'Status Kawin', 'Status', 'RT', 'RW', 'Dusun'], rows.map(function (p) { return [p.nik, p.no_kk, p.nama, p.jk, p.tgl_lahir, p.tempat_lahir, p.hubungan, p.pekerjaan, p.pendidikan, p.agama, p.status_kawin, p.status_kependudukan, p.rt, p.rw, p.dusun]; })), 'text/csv;charset=utf-8'); else U.download('kk.csv', U.toCSV(['No KK', 'Kepala NIK', 'Alamat', 'RT', 'RW', 'Dusun', 'Penghasilan', 'Kondisi Rumah'], rows.map(function (k) { return [k.no_kk, k.kepala_nik, k.alamat, k.rt, k.rw, k.dusun, k.penghasilan, k.kondisi_rumah]; })), 'text/csv;charset=utf-8');
        U.ok(U.num(rows.length) + ' baris diekspor. Jaga kerahasiaan file ini.');
      };
      A.V(el.querySelector('#gr'), 'pend.all', {}, function (d) { data = d; draw(); if (ctx.qs.nik) { var n = ctx.qs.nik; ctx.qs.nik = ''; openPend(n, reload); } }, { fresh: 20 });
    }
  });

  // ================= MUTASI =================
  var MUT = { kelahiran: ['Kelahiran', 'ok', 'face'], kematian: ['Kematian', 'er', 'heart'], pindah_masuk: ['Pindah Masuk', 'in', 'download'], pindah_keluar: ['Pindah Keluar', 'wa', 'upload'] };
  A.add('/a/mutasi', {
    auth: 1, roles: ST, menu: 'mutasi', title: 'Mutasi Warga', prefetch: function () { API.prefetch('mut.list', {}); API.prefetch('pend.all', {}); },
    render: function (el, ctx) {
      var jenis = '';
      el.innerHTML = '<div class="ph"><div><h1>Mutasi Warga</h1><p>Catat kelahiran, kematian, dan perpindahan penduduk. Status penduduk dan statistik dasbor ikut diperbarui.</p></div>' + (ctx.user.role === 'kades' ? '' : '<button class="btn pri" id="add">' + ico('plus', 's') + ' Catat Mutasi</button>') + '</div><div class="card p0"><div class="toolbar"><div class="chips" id="ch">' + [['', 'Semua']].concat(Object.keys(MUT).map(function (k) { return [k, MUT[k][0]]; })).map(function (c) { return '<button class="chip' + (c[0] === jenis ? ' on' : '') + '" data-j="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div></div><div id="gr">' + U.skel('l', 6) + '</div></div>';
      function load() { A.V($('#gr', el), 'mut.list', jenis ? { jenis: jenis } : {}, function (d) { U.grid($('#gr', el), { rows: d.rows, size: 20, empty: 'Belum ada mutasi', cols: [{ k: 'tanggal', l: 'Tanggal', sort: 1, f: function (m) { return U.tgl(m.tanggal); } }, { k: 'jenis', l: 'Jenis', f: function (m) { var x = MUT[m.jenis] || [m.jenis, '']; return '<span class="bdg ' + x[1] + '">' + esc(x[0]) + '</span>'; } }, { k: 'nama', l: 'Nama', f: function (m) { return '<b>' + esc(m.nama) + '</b><div class="xs mut tnum">' + esc(m.nik) + '</div>'; } }, { k: 'asal', l: 'Asal / Tujuan', f: function (m) { return esc(m.asal || m.tujuan || '–'); } }, { k: 'alasan', l: 'Keterangan' }, { k: 'petugas', l: 'Petugas' }] }); }, { fresh: 15 }); }
      $('#ch', el).onclick = function (e) { var b = e.target.closest('[data-j]'); if (!b) return; jenis = b.dataset.j; U.$$('.chip', el).forEach(function (x) { x.classList.toggle('on', x === b); }); load(); };
      var add = $('#add', el); if (add) add.onclick = function () { formMutasi(function () { API.invalidate(); load(); }); };
      load();
    }
  });
  function formMutasi(done) {
    var m = U.modal({ title: 'Catat Mutasi Penduduk', size: 'w', body: '<div class="fld mb16"><label>Jenis mutasi</label><div class="chips" id="jm">' + Object.keys(MUT).map(function (k, i) { return '<button type="button" class="chip' + (i ? '' : ' on') + '" data-k="' + k + '">' + MUT[k][0] + '</button>'; }).join('') + '</div></div><div id="mf"></div>', footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Simpan Mutasi</button>' });
    var kind = 'kelahiran', pa = API.peek('pend.all', {}), objs = pa ? pendObjs(pa) : null;
    function render() {
      var today = new Date().toISOString().slice(0, 10), h;
      if (kind === 'kematian' || kind === 'pindah_keluar') {
        h = '<form id="f" class="frm">' + U.field('Cari penduduk (NIK / nama)', '<input class="inp" id="cari" list="pl" placeholder="Ketik minimal 3 karakter" autocomplete="off"><datalist id="pl"></datalist><input type="hidden" name="nik">', { req: 1, cls: 'full' }) + '<div id="pick" class="full sm mut"></div>' + U.field('Tanggal', U.inp('tanggal', today, { type: 'date', req: 1 }), { req: 1 }) + (kind === 'pindah_keluar' ? U.field('Tujuan pindah', U.inp('tujuan', '')) + '<label class="chk full"><input type="checkbox" name="seluruh_kk"> Seluruh anggota KK ikut pindah</label>' : '') + U.field(kind === 'kematian' ? 'Sebab / keterangan' : 'Alasan', U.inp('alasan', ''), { cls: 'full' }) + '</form>';
      } else {
        h = '<form id="f" class="frm">' + U.field('Tanggal ' + (kind === 'kelahiran' ? 'lahir' : 'pindah masuk'), U.inp('tanggal', today, { type: 'date', req: 1 }), { req: 1 }) + (kind === 'pindah_masuk' ? U.field('Asal', U.inp('asal', '')) : '<div></div>') + pendForm({ tgl_lahir: today }, null, { baru: true, kkBaru: kind === 'pindah_masuk' }).replace(/^<form id="fp" class="frm">/, '').replace(/<\/form>$/, '') + U.field('Alasan / keterangan', U.inp('alasan', ''), { cls: 'full' }) + '</form>';
      }
      m.$('#mf').innerHTML = h; var f = m.$('#f');
      if (f && f.tgl_lahir && kind === 'kelahiran') { f.tanggal.oninput = function () { f.tgl_lahir.value = f.tanggal.value; }; f.hubungan.value = 'Anak'; }
      if (kind === 'pindah_masuk' && f) { f.hubungan.value = 'Kepala Keluarga'; }
      var cari = m.$('#cari'); if (cari && objs) cari.oninput = function () { var q = cari.value.toLowerCase(); if (q.length < 3) return; var r = objs.rows.filter(function (p) { return aktif(p) && p._q.indexOf(q) >= 0; }).slice(0, 12); m.$('#pl').innerHTML = r.map(function (p) { return '<option value="' + esc(p.nik + ' — ' + p.nama) + '">'; }).join(''); var hit = /^(\d{16})/.exec(cari.value); if (hit) { f.nik.value = hit[1]; var p = objs.byNik[hit[1]]; m.$('#pick').innerHTML = p ? ico('check', 's') + ' ' + esc(p.nama) + ' · KK ' + esc(p.no_kk) : ''; if (p) f.no_kk = f.no_kk; } };
    }
    m.$('#jm').onclick = function (e) { var b = e.target.closest('[data-k]'); if (!b) return; kind = b.dataset.k; U.$$('.chip', m.el).forEach(function (x) { x.classList.toggle('on', x === b); }); render(); };
    m.$('#ok').onclick = function () { var f = m.$('#f'); if ((kind === 'kematian' || kind === 'pindah_keluar') && !f.nik.value) { U.toast('Pilih penduduk dari daftar saran (ketik NIK/nama lalu pilih).', 'er'); return; } if (!f.reportValidity()) return; var o = U.formObj(f); o.jenis = kind; if (kind === 'pindah_keluar' && o.seluruh_kk === 'Ya') { o.seluruh_kk = true; var p = objs && objs.byNik[o.nik]; if (p) o.no_kk = p.no_kk; } else delete o.seluruh_kk;
      U.busy(m.$('#ok'), function () { return API.write('mut.save', o).then(function (r) { m.close(); U.ok(r.message || 'Mutasi dicatat.'); done && done(); }); }); };
    render();
  }

  // ================= VERIFIKASI DATA =================
  var FL = { nama: 'Nama', tempat_lahir: 'Tempat lahir', tgl_lahir: 'Tgl lahir', jk: 'Jenis kelamin', agama: 'Agama', status_kawin: 'Status kawin', pendidikan: 'Pendidikan', pekerjaan: 'Pekerjaan', gol_darah: 'Gol. darah', no_hp: 'No. HP', email: 'Email' };
  A.add('/a/verifikasi', {
    auth: 1, roles: ['admin', 'sekdes', 'rt'], menu: 'verifikasi', title: 'Verifikasi Data', prefetch: function () { API.prefetch('perbaikan.antrean', {}); },
    render: function (el, ctx) {
      var semua = false;
      el.innerHTML = '<div class="ph"><div><h1>Verifikasi Permintaan Perbaikan Data</h1><p>Warga mengajukan koreksi data. Ketua RT/RW memvalidasi, staf desa menyetujui. Perubahan diterapkan otomatis setelah disetujui.</p></div><label class="chk"><input type="checkbox" id="all"> Tampilkan riwayat</label></div><div class="card p0" id="gr">' + U.skel('l', 5) + '</div>';
      function load() {
        A.V($('#gr', el), 'perbaikan.antrean', semua ? { semua: true } : {}, function (d) {
          if (!d.rows.length) { $('#gr', el).innerHTML = '<div class="empty">' + ico('shieldc') + '<div class="b">Tidak ada permintaan menunggu</div></div>'; return; }
          $('#gr', el).innerHTML = '<div class="tw"><table class="t"><thead><tr><th>Tanggal</th><th>Warga</th><th>Data</th><th>Perubahan</th><th>Status</th><th></th></tr></thead><tbody>' + d.rows.map(function (r) { return '<tr><td>' + U.tgl(r.tanggal) + '</td><td><b>' + esc(r.nama) + '</b><div class="xs mut tnum">' + esc(r.nik) + '</div></td><td>' + esc(FL[r.field] || r.field) + '</td><td><span class="mut">' + esc(r.nilai_lama || '–') + '</span> → <b>' + esc(r.nilai_baru) + '</b></td><td>' + U.badge(r.status) + (r.catatan ? '<div class="xs mut">' + esc(r.catatan) + '</div>' : '') + '</td><td class="r">' + (['Menunggu', 'Divalidasi RT'].indexOf(r.status) >= 0 ? '<button class="btn sm pri" data-a="setuju" data-id="' + esc(r.id) + '">' + ico('check', 's') + ' ' + (ctx.user.role === 'rt' ? 'Validasi' : 'Setujui') + '</button> <button class="btn sm" data-a="tolak" data-id="' + esc(r.id) + '">Tolak</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
          U.$$('[data-a]', el).forEach(function (b) { b.onclick = function () { var tolak = b.dataset.a === 'tolak'; var go = function (cat) { U.busy(b, function () { return API.write('perbaikan.putuskan', { id: b.dataset.id, putusan: b.dataset.a, catatan: cat || '' }).then(function (r) { U.ok(r.message || 'Tersimpan.'); load(); }); }); }; if (tolak) { var m = U.modal({ title: 'Tolak permintaan', body: U.field('Alasan penolakan', '<textarea class="inp" id="c" required></textarea>', { req: 1 }), footer: '<button class="btn" data-x>Batal</button><button class="btn dan" id="ok">Tolak</button>' }); m.$('#ok').onclick = function () { var c = m.$('#c').value; if (!c.trim()) { U.toast('Isi alasan.', 'er'); return; } m.close(); go(c); }; } else go(''); }; });
        }, { fresh: 10 });
      }
      $('#all', el).onchange = function (e) { semua = e.target.checked; load(); };
      load();
    }
  });
  w.AdminPend = { openPend: openPend, openKk: openKk };
})(window);
