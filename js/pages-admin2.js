/* Panel admin (2): layanan surat (RT → staf → Kepala Desa/TTE) dan bantuan sosial. */
(function (w) {
  'use strict';
  var U = w.UI, A = w.App, C = w.Common, esc = U.esc, ico = U.ico, $ = U.$;
  var ST = ['admin', 'sekdes', 'kades', 'rt'], OPS = ['admin', 'sekdes'], KEU = ['admin', 'sekdes', 'kades'];
  var STATUSES = ['Diajukan', 'Divalidasi RT', 'Diproses', 'Menunggu TTE', 'Selesai', 'Perlu Revisi', 'Ditolak', 'Dibatalkan'];
  var DEF_TAB = { rt: 'Diajukan', admin: 'Divalidasi RT', sekdes: 'Divalidasi RT', kades: 'Menunggu TTE' };

  function jenisMap(cb) { API.get('jenis.list', {}, { fresh: 120 }).then(function (d) { var m = {}; (d.rows || d.jenis || d || []).forEach(function (j) { m[j.kode] = j; }); cb(m); }, function () { cb({}); }); }

  // ---------- PIN TTE ----------
  function pinModal(title, sub, onOk) {
    var m = U.modal({ title: title, sub: sub, size: 'sm', sticky: false, body: '<div class="fld"><label class="req">PIN Tanda Tangan Elektronik</label><input class="inp" id="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="••••••" style="font-size:20px;letter-spacing:.3em;text-align:center"><span class="hint">PIN hanya diketahui Kepala Desa. Belum punya PIN? Atur di menu Profil.</span></div><div class="note mt16">' + ico('shieldc') + '<div>Dengan menandatangani, Anda mengesahkan surat. Tanda tangan bersifat <b>internal desa</b> dan dapat diverifikasi publik melalui kode QR — bukan sertifikat BSrE.</div></div>', footer: '<button class="btn" data-x>Batal</button><button class="btn gold" id="ok">' + ico('key', 's') + ' Tandatangani</button>' });
    var go = function () { var pin = m.$('#pin').value; if (!pin) { U.toast('Masukkan PIN.', 'er'); return; } U.busy(m.$('#ok'), function () { return onOk(pin, m); }); };
    m.$('#ok').onclick = go; m.$('#pin').onkeydown = function (e) { if (e.key === 'Enter') go(); };
    return m;
  }
  function noteModal(title, label, btn, cls, onOk, req) {
    var m = U.modal({ title: title, size: 'sm', body: U.field(label, '<textarea class="inp" id="c" rows="4"' + (req ? ' required' : '') + ' placeholder="Tulis catatan…"></textarea>', { req: req }), footer: '<button class="btn" data-x>Batal</button><button class="btn ' + cls + '" id="ok">' + btn + '</button>' });
    m.$('#ok').onclick = function () { var c = m.$('#c').value.trim(); if (req && !c) { U.toast('Catatan wajib diisi.', 'er'); return; } U.busy(m.$('#ok'), function () { return onOk(c, m); }); };
  }

  // ================= ANTREAN SURAT =================
  A.add('/a/surat', {
    auth: 1, roles: ST, menu: 'surat', title: 'Layanan Surat', prefetch: function () { API.prefetch('surat.antrean', {}); API.prefetch('jenis.list', {}); },
    render: function (el, ctx) {
      var role = ctx.user.role, tab = ctx.qs.status || DEF_TAB[role] || 'semua', jm = {}, data = null, sel = {}, q = '';
      el.innerHTML = '<div class="ph"><div><h1>Layanan Surat Keterangan</h1><p>' + ({ rt: 'Validasi pengajuan warga di wilayah RT/RW Anda.', kades: 'Tandatangani surat yang telah diverifikasi staf desa.' }[role] || 'Verifikasi berkas, terbitkan nomor surat, dan teruskan ke Kepala Desa.') + '</p></div></div><div class="card p0"><div class="tabs sc" id="tb"></div><div class="toolbar"><div class="ig"><span>' + ico('search') + '</span><input class="inp" id="q" placeholder="Cari nama, nomor registrasi, nomor surat…" aria-label="Cari"></div><span class="grow"></span><span id="bk"></span></div><div id="gr">' + U.skel('l', 6) + '</div></div>';
      var g;
      function counts() { var c = data.counts, h = ''; [['semua', 'Semua']].concat(STATUSES.map(function (s) { return [s, s]; })).forEach(function (t) { var n = c[t[0]] || 0; if (t[0] !== 'semua' && !n && t[0] !== tab && ['Diajukan', 'Divalidasi RT', 'Diproses', 'Menunggu TTE', 'Selesai'].indexOf(t[0]) < 0) return; h += '<button class="tab' + (t[0] === tab ? ' on' : '') + '" data-t="' + esc(t[0]) + '">' + esc(t[1]) + ' <span class="n">' + n + '</span></button>'; }); $('#tb', el).innerHTML = h; }
      function bulk() { var ids = Object.keys(sel), box = $('#bk', el); box.innerHTML = role === 'kades' && tab === 'Menunggu TTE' && data.rows.length ? '<button class="btn gold" id="mass"' + (ids.length ? '' : ' disabled') + '>' + ico('key', 's') + ' Tandatangani ' + (ids.length || '') + ' terpilih</button>' : ''; var b = $('#mass', el); if (b) b.onclick = function () { pinModal('Tandatangani ' + ids.length + ' surat', 'Seluruh surat terpilih akan diterbitkan dengan nomor & QR verifikasi.', function (pin, m) { return API.write('surat.setujuiMassal', { ids: ids, pin: pin }).then(function (r) { m.close(); sel = {}; U.ok(r.message || 'Diterbitkan.'); if (r.data && r.data.gagal && r.data.gagal.length) U.toast(r.data.gagal.length + ' surat gagal diterbitkan — buka satu per satu.', 'er'); load(); }); }); }; }
      function draw() {
        counts(); bulk();
        var showSel = role === 'kades' && tab === 'Menunggu TTE', s = q.toLowerCase();
        var cols = [];
        if (showSel) cols.push({ k: '_s', l: '<input type="checkbox" id="all" aria-label="Pilih semua">', f: function (r) { return '<input type="checkbox" data-s="' + esc(r.id) + '"' + (sel[r.id] ? ' checked' : '') + ' aria-label="Pilih ' + esc(r.id) + '">'; } });
        cols = cols.concat([{ k: 'id', l: 'Registrasi', sort: 1, f: function (r) { return '<b class="tnum xs">' + esc(r.id) + '</b>' + (r.nomor_surat ? '<div class="xs mut">' + esc(r.nomor_surat) + '</div>' : ''); } }, { k: 'jenis', l: 'Jenis surat', f: function (r) { return esc((jm[r.jenis] || {}).nama || r.jenis); } }, { k: 'nama', l: 'Pemohon', sort: 1, f: function (r) { return '<b>' + esc(r.nama) + '</b><div class="xs mut">RT ' + esc(r.rt) + '/RW ' + esc(r.rw) + ' · ' + esc(r.dusun) + '</div>'; } }, { k: 'keperluan', l: 'Keperluan', f: function (r) { return '<span class="xs">' + esc(r.keperluan || '–') + '</span>'; } }, { k: 'updated_at', l: 'Diperbarui', sort: 1, f: function (r) { return U.tglJam(r.updated_at); } }, { k: 'status', l: 'Status', f: function (r) { return U.badge(r.status); } }]);
        g = U.grid($('#gr', el), { rows: data.rows, size: 20, empty: 'Tidak ada surat pada tahap ini', cols: cols, filter: function (r) { return !s || (r.nama + ' ' + r.id + ' ' + (r.nomor_surat || '')).toLowerCase().indexOf(s) >= 0; }, onRow: function (r) { A.go('/a/surat/' + r.id); } });
        var all = $('#all', el); if (all) all.onchange = function () { g.state.view.forEach(function (r) { all.checked ? sel[r.id] = 1 : delete sel[r.id]; }); U.$$('[data-s]', el).forEach(function (c) { c.checked = all.checked; }); bulk(); };
        $('#gr', el).onchange = function (e) { var c = e.target.closest('[data-s]'); if (c) { c.checked ? sel[c.dataset.s] = 1 : delete sel[c.dataset.s]; bulk(); } };
        $('#gr', el).addEventListener('click', function (e) { if (e.target.closest('input[type=checkbox]')) e.stopPropagation(); }, true);
      }
      function load() { jenisMap(function (m) { jm = m; A.V($('#gr', el), 'surat.antrean', tab === 'semua' ? {} : { status: tab }, function (d) { data = d; draw(); }, { fresh: 10 }); }); }
      $('#tb', el).onclick = function (e) { var b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; sel = {}; if (data) $('#gr', el).innerHTML = U.skel('l', 5); load(); } };
      $('#q', el).oninput = U.debounce(function (e) { q = e.target.value; g && g.refresh(); }, 80);
      A.tick(function () { if (el.isConnected) API.get('surat.antrean', tab === 'semua' ? {} : { status: tab }).then(function () { }, function () { }); });
      load();
    }
  });

  // ================= DETAIL SURAT =================
  A.add('/a/surat/:id', {
    auth: 1, roles: ST, menu: 'surat', title: 'Detail Permohonan', prefetch: null,
    render: function (el, ctx) {
      var id = ctx.params.id, role = ctx.user.role;
      el.innerHTML = '<div class="sk sk-b" style="height:300px"></div>';
      function reload() { API.invalidate(); return API.get('surat.detail', { id: id }, { fresh: 0 }).then(function (d) { if (el.isConnected) draw(d); }); }
      function act(btn, action, data, msg, after) { return U.busy(btn, function () { return API.write(action, data).then(function (r) { U.ok(msg || r.message || 'Tersimpan.'); after ? after(r) : reload(); }); }); }
      function draw(d) {
        var s = d.surat, j = d.jenis || { nama: s.jenis, kolom: [], syarat: [] }, p = (d.pemohon || {}).p || {}, kk = (d.pemohon || {}).kk || {}, st = s.status, btns = '';
        if (role === 'rt' && st === 'Diajukan') btns = '<button class="btn pri" data-a="v-setuju">' + ico('check', 's') + ' Validasi & Teruskan</button><button class="btn" data-a="v-revisi">Minta Revisi</button><button class="btn dan" data-a="v-tolak">Tolak</button>';
        else if ((role === 'admin' || role === 'sekdes') && st === 'Divalidasi RT') btns = '<button class="btn pri" data-a="p-mulai">' + ico('check', 's') + ' Mulai Verifikasi Berkas</button><button class="btn" data-a="p-revisi">Kembalikan ke Warga</button><button class="btn dan" data-a="p-tolak">Tolak</button>';
        else if ((role === 'admin' || role === 'sekdes') && st === 'Diproses') btns = '<button class="btn pri" data-a="p-teruskan">' + ico('send', 's') + ' Teruskan ke Kepala Desa</button><button class="btn" data-a="p-revisi">Kembalikan ke Warga</button><button class="btn dan" data-a="p-tolak">Tolak</button>';
        else if (role === 'kades' && st === 'Menunggu TTE') btns = '<button class="btn gold" data-a="k-setuju">' + ico('key', 's') + ' Tandatangani Surat</button><button class="btn" data-a="k-kembali">Kembalikan ke Staf</button><button class="btn dan" data-a="k-tolak">Tolak</button>';
        var hint = (role === 'rt' && st !== 'Diajukan') || ((role === 'admin' || role === 'sekdes') && st === 'Diajukan') ? '<div class="note mt16">' + ico('info') + '<div>' + (st === 'Diajukan' ? 'Menunggu validasi Ketua RT/RW pemohon sebelum dapat diproses staf desa.' : 'Pengajuan ini bukan pada tahap yang menjadi tanggung jawab Anda.') + '</div></div>' : '';
        el.innerHTML = '<a href="#/a/surat" class="sm">' + ico('chl', 's') + ' Daftar permohonan</a><div class="ph mt8"><div><h1>' + esc(j.nama) + '</h1><p class="xs">' + esc(s.id) + (s.nomor_surat ? ' · No. ' + esc(s.nomor_surat) : '') + '</p></div><div class="row w">' + U.badge(st) + '<button class="btn" id="pv">' + ico('eye', 's') + ' ' + (st === 'Selesai' ? 'Lihat / Cetak' : 'Pratinjau Surat') + '</button></div></div>' +
          '<div class="card p">' + C.stepper(s) + (s.catatan && ['Perlu Revisi', 'Ditolak', 'Diproses'].indexOf(st) >= 0 ? '<div class="note er mt16">' + ico('alert') + '<div><b>Catatan:</b> ' + esc(s.catatan) + '</div></div>' : '') + (btns ? '<div class="row w gap8 mt16" id="ac">' + btns + '</div>' : '') + hint + '</div>' +
          '<div class="grid g-main mt16"><div class="col"><div class="card p"><h3>Data Pemohon</h3><dl class="dl mt16"><dt>Nama</dt><dd><b>' + esc(p.nama || s.nama) + '</b></dd><dt>NIK</dt><dd class="tnum">' + esc(p.nik || s.nik) + '</dd><dt>No. KK</dt><dd class="tnum">' + esc(p.no_kk || '–') + '</dd><dt>TTL</dt><dd>' + esc(p.tempat_lahir || '–') + ', ' + U.tgl(p.tgl_lahir, true) + '</dd><dt>Pekerjaan</dt><dd>' + esc(p.pekerjaan || '–') + '</dd><dt>Alamat</dt><dd>' + esc(kk.alamat || '–') + ' RT ' + esc(kk.rt || s.rt) + '/RW ' + esc(kk.rw || s.rw) + ' ' + esc(kk.dusun || s.dusun) + '</dd><dt>Status data</dt><dd>' + U.badge(p.status_kependudukan || 'Tetap') + '</dd></dl></div>' +
          '<div class="card p"><h3>Rincian Pengajuan</h3><dl class="dl mt16"><dt>Keperluan</dt><dd>' + esc(s.keperluan) + '</dd>' + j.kolom.map(function (c) { return '<dt>' + esc(c.l) + '</dt><dd>' + esc(s.data_isian[c.k] || '–') + '</dd>'; }).join('') + '<dt>Diajukan</dt><dd>' + U.tglJam(s.tgl_ajuan) + '</dd></dl><h3 class="mt24 mb8">Berkas Terunggah</h3><div class="col">' + (s.dokumen.length ? s.dokumen.map(function (x, i) { return '<div class="fileit">' + ico('filec') + '<div class="grow sm"><b>' + esc(x.l) + '</b><div class="xs mut">' + esc(x.nama) + '</div></div><button class="btn sm" data-view="' + i + '">' + ico('eye', 's') + ' Periksa</button></div>'; }).join('') : '<div class="sm mut">Tidak ada berkas.</div>') + '</div></div></div>' +
          '<div class="card p"><h3>Riwayat Proses</h3><div class="mt16">' + C.timeline(s) + '</div></div></div>';
        $('#pv', el).onclick = function () { C.openLetter(d); };
        U.$$('[data-view]', el).forEach(function (v) { v.onclick = function () { w.viewDoc(s.id, +v.dataset.view, v); }; });
        U.$$('[data-a]', el).forEach(function (b) { b.onclick = function () { handle(b, b.dataset.a, d); }; });
      }
      function handle(b, a, d) {
        var s = d.surat;
        switch (a) {
          case 'v-setuju': return act(b, 'surat.validasiRt', { id: s.id, aksi: 'setuju' }, 'Pengajuan divalidasi dan diteruskan ke staf desa.');
          case 'v-revisi': return noteModal('Minta revisi dari pemohon', 'Catatan untuk pemohon', 'Kirim Permintaan Revisi', 'pri', function (c, m) { return API.write('surat.validasiRt', { id: s.id, aksi: 'revisi', catatan: c }).then(function () { m.close(); U.ok('Permintaan revisi dikirim.'); reload(); }); }, 1);
          case 'v-tolak': return noteModal('Tolak pengajuan', 'Alasan penolakan', 'Tolak Pengajuan', 'dan', function (c, m) { return API.write('surat.validasiRt', { id: s.id, aksi: 'tolak', catatan: c }).then(function () { m.close(); U.ok('Pengajuan ditolak.'); reload(); }); }, 1);
          case 'p-mulai': return act(b, 'surat.proses', { id: s.id, aksi: 'mulai' }, 'Verifikasi dimulai.');
          case 'p-teruskan': return noteModal('Teruskan ke Kepala Desa', 'Catatan untuk Kepala Desa (opsional)', 'Teruskan', 'pri', function (c, m) { return API.write('surat.proses', { id: s.id, aksi: 'teruskan', catatan: c }).then(function (r) { m.close(); U.ok('Nomor surat ' + ((r.data && r.data.nomor_surat) || '') + ' dibuat. Diteruskan ke Kepala Desa.'); reload(); }); }, 0);
          case 'p-revisi': return noteModal('Kembalikan ke warga', 'Apa yang perlu diperbaiki?', 'Kirim', 'pri', function (c, m) { return API.write('surat.proses', { id: s.id, aksi: 'revisi', catatan: c }).then(function () { m.close(); U.ok('Dikembalikan ke pemohon.'); reload(); }); }, 1);
          case 'p-tolak': return noteModal('Tolak pengajuan', 'Alasan penolakan', 'Tolak Pengajuan', 'dan', function (c, m) { return API.write('surat.proses', { id: s.id, aksi: 'tolak', catatan: c }).then(function () { m.close(); U.ok('Pengajuan ditolak.'); reload(); }); }, 1);
          case 'k-setuju': return pinModal('Tandatangani surat', (d.jenis ? d.jenis.nama : '') + ' · ' + (s.nomor_surat || ''), function (pin, m) { return API.write('surat.keputusan', { id: s.id, aksi: 'setuju', pin: pin }).then(function () { m.close(); U.ok('Surat ditandatangani dan diterbitkan.'); reload().then(function () { API.get('surat.detail', { id: s.id }, { fresh: 0 }).then(function (dd) { C.openLetter(dd); }); }); }); });
          case 'k-kembali': return noteModal('Kembalikan ke staf', 'Catatan perbaikan', 'Kembalikan', 'pri', function (c, m) { return API.write('surat.keputusan', { id: s.id, aksi: 'kembalikan', catatan: c }).then(function () { m.close(); U.ok('Dikembalikan ke staf.'); reload(); }); }, 1);
          case 'k-tolak': return noteModal('Tolak pengajuan', 'Alasan penolakan', 'Tolak', 'dan', function (c, m) { return API.write('surat.keputusan', { id: s.id, aksi: 'tolak', catatan: c }).then(function () { m.close(); U.ok('Pengajuan ditolak.'); reload(); }); }, 1);
        }
      }
      ctx.V('surat.detail', { id: id }, draw, { fresh: 6 });
    }
  });

  // ================= BANSOS =================
  A.add('/a/bansos', {
    auth: 1, roles: KEU, menu: 'bansos', title: 'Bantuan Sosial', prefetch: function () { API.prefetch('bansos.screening', {}); API.prefetch('bansos.penerima', {}); },
    render: function (el, ctx) {
      var canEdit = A.can(OPS), tab = ctx.qs.tab || 'screening', F = { q: '', st: '', prog: '', dusun: '' };
      el.innerHTML = '<div class="ph"><div><h1>Bantuan Sosial</h1><p>Screening kelayakan KK berbasis kriteria objektif. Keputusan penetapan tetap di tangan petugas desa.</p></div></div><div class="card p0"><div class="tabs" id="tb"><button class="tab" data-t="screening">Screening Kelayakan</button><button class="tab" data-t="penerima">Penerima</button><button class="tab" data-t="riwayat">Riwayat Penyaluran</button><button class="tab" data-t="kriteria">Kriteria</button></div><div id="pn"></div></div>';
      var pn = $('#pn', el);
      function tabs() { U.$$('.tab', el).forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); }); }
      function show() { tabs(); pn.innerHTML = '<div class="p">' + U.skel('l', 6) + '</div>'; ({ screening: tScreening, penerima: tPenerima, riwayat: tRiwayat, kriteria: tKriteria })[tab](); }
      $('#tb', el).onclick = function (e) { var b = e.target.closest('[data-t]'); if (b && b.dataset.t !== tab) { tab = b.dataset.t; show(); } };

      function tScreening() {
        A.V(pn, 'bansos.screening', {}, function (d) {
          var progs = (API.peek('bansos.penerima', {}) || {}).programs || [];
          pn.innerHTML = '<div class="toolbar"><div class="ig"><span>' + ico('search') + '</span><input class="inp" id="q" placeholder="Cari No. KK atau kepala keluarga…" value="' + esc(F.q) + '"></div><select class="inp" id="fs" aria-label="Status kelayakan">' + U.opts(['Layak', 'Dipertimbangkan', 'Tidak Layak'], F.st, 'Semua status') + '</select><span class="grow"></span><span class="xs mut">Ambang: Layak ≥ ' + d.ambang.layak + ' · Dipertimbangkan ≥ ' + d.ambang.timbang + '</span></div><div id="g"></div>';
          var g = U.grid($('#g', pn), { rows: d.rows, size: 15, empty: 'Tidak ada KK',
            filter: function (r) { var s = F.q.toLowerCase(); return (!s || (r.no_kk + ' ' + r.kepala).toLowerCase().indexOf(s) >= 0) && (!F.st || r.status === F.st); },
            cols: [{ k: 'kepala', l: 'Kepala keluarga', sort: 1, f: function (r) { return '<b>' + esc(r.kepala) + '</b><div class="xs mut tnum">' + esc(r.no_kk) + '</div>'; } }, { k: 'rt', l: 'RT/RW · Dusun', f: function (r) { return esc(r.rt) + '/' + esc(r.rw) + ' · ' + esc(r.dusun); } }, { k: 'anggota', l: 'Jiwa', cls: 'num', sort: 1 }, { k: 'skor', l: 'Skor', cls: 'num', sort: 1, f: function (r) { return '<b class="tnum">' + r.skor + '</b>'; } }, { k: 'status', l: 'Kelayakan', f: function (r) { return U.badge(r.status); } }, { k: 'program_aktif', l: 'Program aktif', f: function (r) { return r.program_aktif.length ? r.program_aktif.map(function (x) { return '<span class="bdg gd">' + esc(x) + '</span>'; }).join(' ') : '<span class="mut xs">–</span>'; } }],
            onRow: function (r) { detail(r, d, progs); } });
          $('#q', pn).oninput = U.debounce(function (e) { F.q = e.target.value; g.refresh(); }, 80); $('#fs', pn).onchange = function (e) { F.st = e.target.value; g.refresh(); };
        }, { fresh: 20 });
      }
      function detail(r, d, progs) {
        API.get('bansos.penerima', {}, { fresh: 30 }).then(function (pd) {
          var progs2 = pd.programs;
          var m = U.modal({ title: 'Rincian Skor Kelayakan', sub: r.kepala + ' · KK ' + r.no_kk, size: 'w', body: '<div class="row sb w"><div><span class="tnum b" style="font-size:36px">' + r.skor + '</span><span class="mut"> / 100</span></div>' + U.badge(r.status) + '</div><div class="tw mt16"><table class="t"><thead><tr><th>Kriteria</th><th>Kondisi KK</th><th class="num">Bobot</th><th class="num">Nilai</th></tr></thead><tbody>' + r.detail.map(function (x) { return '<tr><td>' + esc(x.kriteria) + '</td><td>' + esc(x.ket) + '</td><td class="num">' + x.bobot + '</td><td class="num"><b>' + x.nilai + '</b></td></tr>'; }).join('') + '</tbody></table></div>' + (r.program_aktif.length ? '<div class="note mt16">' + ico('info') + '<div>Sudah terdaftar aktif: <b>' + r.program_aktif.map(esc).join(', ') + '</b></div></div>' : '') + (canEdit ? '<div class="row w gap8 mt16"><select class="inp" id="pg" style="width:auto">' + U.opts(progs2.filter(function (p) { return r.program_aktif.indexOf(p) < 0; }), '', 'Pilih program…') + '</select><button class="btn pri" id="tt">' + ico('plus', 's') + ' Tetapkan sebagai Penerima</button></div>' : ''), footer: '<button class="btn" data-x>Tutup</button>' });
          var tt = m.$('#tt'); if (tt) tt.onclick = function () { var pg = m.$('#pg').value; if (!pg) { U.toast('Pilih program.', 'er'); return; } U.busy(tt, function () { return API.write('bansos.tetapkan', { no_kk: r.no_kk, program: pg }).then(function (x) { m.close(); U.ok('Penerima ditetapkan.'); if (x.data && x.data.peringatan) U.toast(x.data.peringatan, 'wa'); show(); }); }); };
        });
      }
      function tPenerima() {
        A.V(pn, 'bansos.penerima', {}, function (d) {
          pn.innerHTML = '<div class="toolbar"><select class="inp" id="fp" aria-label="Program">' + U.opts(d.programs, F.prog, 'Semua program') + '</select>' + d.programs.map(function (p) { return '<span class="bdg gd">' + esc(p) + ': ' + (d.perProgram[p] || 0) + ' KK</span>'; }).join(' ') + '<span class="grow"></span>' + (canEdit ? '<button class="btn pri" id="sl">' + ico('wallet', 's') + ' Catat Penyaluran</button>' : '') + '<button class="btn" id="ex">' + ico('download', 's') + ' CSV</button></div><div id="g"></div>';
          var g = U.grid($('#g', pn), { rows: d.rows, size: 15, empty: 'Belum ada penerima', filter: function (r) { return !F.prog || r.program === F.prog; },
            cols: [{ k: 'nama', l: 'Penerima', sort: 1, f: function (r) { return '<b>' + esc(r.nama) + '</b><div class="xs mut tnum">KK ' + esc(r.no_kk) + '</div>'; } }, { k: 'program', l: 'Program', f: function (r) { return '<span class="bdg gd">' + esc(r.program) + '</span>'; } }, { k: 'rt', l: 'RT/RW', f: function (r) { return esc(r.rt) + '/' + esc(r.rw); } }, { k: 'skor', l: 'Skor', cls: 'num', sort: 1 }, { k: 'tgl_penetapan', l: 'Ditetapkan', f: function (r) { return U.tgl(r.tgl_penetapan); } }, { k: 'status', l: 'Status', f: function (r) { return U.badge(r.status); } }, { k: '_', l: '', f: function (r) { return canEdit && r.status === 'Aktif' ? '<button class="btn sm dan" data-c="' + esc(r.id) + '">Cabut</button>' : ''; } }] });
          $('#fp', pn).onchange = function (e) { F.prog = e.target.value; g.refresh(); };
          $('#g', pn).addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (!b) return; e.stopPropagation(); noteModal('Cabut status penerima', 'Alasan', 'Nonaktifkan', 'dan', function (c, m) { return API.write('bansos.cabut', { id: b.dataset.c, alasan: c }).then(function () { m.close(); U.ok('Penerima dinonaktifkan.'); show(); }); }, 1); }, true);
          $('#ex', pn).onclick = function () { U.download('penerima-bansos.csv', U.toCSV(['Program', 'Nama', 'No KK', 'RT', 'RW', 'Dusun', 'Skor', 'Ditetapkan', 'Status'], g.state.view.map(function (r) { return [r.program, r.nama, r.no_kk, r.rt, r.rw, r.dusun, r.skor, r.tgl_penetapan, r.status]; })), 'text/csv;charset=utf-8'); };
          var sl = $('#sl', pn); if (sl) sl.onclick = function () {
            var today = new Date().toISOString().slice(0, 10), m = U.modal({ title: 'Catat Penyaluran Bantuan', body: '<form id="f" class="frm">' + U.field('Program', U.sel('program', d.programs, d.programs[0], null, { req: 1 }), { req: 1 }) + U.field('Periode', U.inp('periode', '', { ph: 'Tahap 1 2026', req: 1 }), { req: 1 }) + U.field('Jumlah per KK (Rp)', U.inp('jumlah', '', { mode: 'numeric', req: 1 }), { req: 1 }) + U.field('Tanggal salur', U.inp('tgl', today, { type: 'date' })) + U.field('Keterangan', U.inp('keterangan', ''), { cls: 'full' }) + '</form><p class="xs mut mt8">Dicatat untuk seluruh penerima aktif program terpilih. KK yang sudah tercatat pada periode yang sama dilewati otomatis.</p>', footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Catat Penyaluran</button>' });
            m.$('#ok').onclick = function () { var f = m.$('#f'); if (!f.reportValidity()) return; U.busy(m.$('#ok'), function () { return API.write('bansos.salur', U.formObj(f)).then(function (r) { m.close(); U.ok(r.message + (r.data && r.data.dilewati ? ' (' + r.data.dilewati + ' dilewati karena sudah tercatat)' : '')); }); }); };
          };
        }, { fresh: 20 });
      }
      function tRiwayat() {
        A.V(pn, 'bansos.riwayat', {}, function (d) {
          pn.innerHTML = '<div class="toolbar"><span class="mut sm">' + d.rows.length + ' catatan penyaluran terakhir</span><span class="grow"></span><button class="btn" id="ex">' + ico('download', 's') + ' CSV</button></div><div id="g"></div>';
          var g = U.grid($('#g', pn), { rows: d.rows, size: 20, empty: 'Belum ada penyaluran', cols: [{ k: 'tgl_salur', l: 'Tanggal', sort: 1, f: function (r) { return U.tgl(r.tgl_salur); } }, { k: 'program', l: 'Program', f: function (r) { return '<span class="bdg gd">' + esc(r.program) + '</span>'; } }, { k: 'nama', l: 'Penerima', f: function (r) { return '<b>' + esc(r.nama) + '</b><div class="xs mut tnum">KK ' + esc(r.no_kk) + '</div>'; } }, { k: 'periode', l: 'Periode' }, { k: 'jumlah', l: 'Jumlah', cls: 'num', f: function (r) { return U.rp(r.jumlah); } }, { k: 'petugas', l: 'Petugas' }] });
          $('#ex', pn).onclick = function () { U.download('riwayat-penyaluran.csv', U.toCSV(['Tanggal', 'Program', 'Nama', 'No KK', 'Periode', 'Jumlah', 'Petugas'], g.state.view.map(function (r) { return [r.tgl_salur, r.program, r.nama, r.no_kk, r.periode, r.jumlah, r.petugas]; })), 'text/csv;charset=utf-8'); };
        }, { fresh: 20 });
      }
      function tKriteria() {
        A.V(pn, 'kriteria.get', {}, function (d) {
          pn.innerHTML = '<div class="p"><p class="mut sm">Skor = (jumlah nilai kriteria terpenuhi ÷ total bobot kriteria aktif) × 100. Ubah bobot atau ambang sesuai kebijakan desa; skor KK dihitung ulang otomatis.</p><form id="fk"><div class="tw mt16"><table class="t"><thead><tr><th>Kriteria</th><th class="num" style="width:110px">Bobot</th><th class="num" style="width:130px">Ambang</th><th style="width:80px">Aktif</th></tr></thead><tbody>' + d.kriteria.map(function (k, i) { return '<tr><td>' + esc(k.kriteria) + '<input type="hidden" data-k="' + esc(k.kode) + '"></td><td><input class="inp" data-f="bobot" data-i="' + i + '" value="' + esc(k.bobot) + '" inputmode="numeric"' + (canEdit ? '' : ' disabled') + '></td><td><input class="inp" data-f="ambang" data-i="' + i + '" value="' + esc(k.ambang) + '" inputmode="numeric"' + (canEdit ? '' : ' disabled') + '></td><td><input type="checkbox" data-f="aktif" data-i="' + i + '"' + (k.aktif !== 'Tidak' ? ' checked' : '') + (canEdit ? '' : ' disabled') + '></td></tr>'; }).join('') + '</tbody></table></div><div class="frm mt16">' + U.field('Ambang skor "Layak" (≥)', U.inp('ambang_layak', d.ambang_layak, { mode: 'numeric' })) + U.field('Ambang skor "Dipertimbangkan" (≥)', U.inp('ambang_pertimbangan', d.ambang_pertimbangan, { mode: 'numeric' })) + U.field('Program bantuan (pisahkan koma)', U.inp('program', d.program.join(', ')), { cls: 'full' }) + '</div>' + (canEdit ? '<div class="mt16"><button class="btn pri" type="submit">Simpan Kriteria</button></div>' : '<div class="note mt16">' + ico('info') + '<div>Hanya admin/sekdes yang dapat mengubah kriteria.</div></div>') + '</form></div>';
          var f = $('#fk', pn); f.onsubmit = function (e) { e.preventDefault(); if (!canEdit) return; var kr = d.kriteria.map(function (k, i) { return { kode: k.kode, bobot: f.querySelector('[data-f=bobot][data-i="' + i + '"]').value, ambang: f.querySelector('[data-f=ambang][data-i="' + i + '"]').value, aktif: f.querySelector('[data-f=aktif][data-i="' + i + '"]').checked ? 'Ya' : 'Tidak' }; }); U.busy(f.querySelector('[type=submit]'), function () { return API.write('kriteria.simpan', { kriteria: kr, ambang_layak: f.ambang_layak.value, ambang_pertimbangan: f.ambang_pertimbangan.value, program: f.program.value }).then(function () { U.ok('Kriteria disimpan. Skor dihitung ulang.'); }); }); };
        }, { fresh: 30 });
      }
      show();
    }
  });
})(window);
