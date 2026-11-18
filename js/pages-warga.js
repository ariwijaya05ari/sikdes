/* Portal Warga: beranda, ajukan surat, lacak surat, data keluarga & perbaikan, pengumuman, profil. */
(function (w) {
  'use strict';
  var U = w.UI, A = w.App, C = w.Common, esc = U.esc, ico = U.ico, $ = U.$;
  var WR = ['warga'];
  var DONE = ['Selesai', 'Ditolak', 'Dibatalkan'];
  var SVC_IC = { SKTM: 'wallet', SKU: 'bld', SKD: 'pin', SKPWNI: 'send', SKL: 'baby', SKK: 'heart' };
  function pre() { API.prefetch('warga.beranda', {}); API.prefetch('jenis.list', {}); }

  function suratCard(s) {
    return '<a class="card p" href="#/w/surat/' + esc(s.id) + '" style="color:inherit;text-decoration:none;display:block"><div class="row sb w"><div><div class="b">' + esc(s.jenis_nama || s.jenis) + '</div><div class="xs mut">' + esc(s.id) + ' · diajukan ' + U.tgl(s.tgl_ajuan) + '</div></div>' + U.badge(s.status) + '</div>' + C.stepper(s) + '<p class="sm mut">' + esc(C.EXPLAIN[s.status] || '') + (s.status === 'Perlu Revisi' && s.catatan ? ' <b style="color:var(--er-tx)">“' + esc(s.catatan) + '”</b>' : '') + '</p></a>';
  }

  // ---------- Beranda ----------
  A.add('/w', {
    auth: 1, roles: WR, menu: 'w-beranda', title: 'Beranda', prefetch: pre,
    render: function (el, ctx) {
      el.innerHTML = '<div class="sk sk-b" style="height:120px"></div>' + '<div class="grid g4 mt16">' + U.skel('k', 4) + '</div>';
      ctx.V('warga.beranda', {}, function (d) {
        A.afterWarga(d);
        var aktif = d.surat.filter(function (s) { return DONE.indexOf(s.status) < 0; }), selesai = d.surat.filter(function (s) { return s.status === 'Selesai'; });
        el.innerHTML = '<div class="card p" style="background:linear-gradient(120deg,var(--navy-900),#264b7b);color:#fff;border:0"><div class="row sb w"><div><div class="xs" style="color:#F1D77A;letter-spacing:.08em;text-transform:uppercase;font-weight:700">Selamat datang</div><h1 style="color:#fff;margin-top:4px">' + esc(d.saya.nama) + '</h1><p style="color:#CBD5E1" class="sm mt8">NIK ' + esc(U.mask(d.saya.nik, 4)) + ' · KK ' + esc(U.mask(d.kk.no_kk, 4)) + ' · RT ' + esc(d.kk.rt) + '/RW ' + esc(d.kk.rw) + ' ' + esc(d.kk.dusun) + '</p></div><a class="btn gold lg" href="#/w/ajukan">' + ico('plus', 's') + ' Ajukan Surat Baru</a></div></div>' +
          '<div class="grid g4 mt16"><div class="card kpi"><span class="t">Surat diproses</span><span class="v">' + aktif.length + '</span><span class="s">Sedang berjalan</span><span class="ic">' + ico('clock') + '</span></div><div class="card kpi"><span class="t">Surat terbit</span><span class="v">' + selesai.length + '</span><span class="s">Siap dicetak</span><span class="ic">' + ico('filec') + '</span></div><div class="card kpi"><span class="t">Anggota keluarga</span><span class="v">' + d.anggota.length + '</span><span class="s">Terdata aktif</span><span class="ic">' + ico('users') + '</span></div><div class="card kpi gd"><span class="t">Bantuan sosial</span><span class="v">' + d.bansos.length + '</span><span class="s">' + (d.bansos.length ? esc(d.bansos.map(function (b) { return b.program; }).join(', ')) : 'Belum terdaftar program') + '</span><span class="ic">' + ico('heart') + '</span></div></div>' +
          '<div class="grid g-main mt16"><div class="col"><div class="row sb"><h2>Pengajuan Surat Saya</h2><a href="#/w/surat" class="b sm">Lihat semua ' + ico('arrow', 's') + '</a></div>' + (d.surat.length ? d.surat.slice(0, 3).map(suratCard).join('') : '<div class="card empty">' + ico('mail') + '<div class="b">Belum ada pengajuan</div><div class="sm">Mulai dengan memilih jenis surat yang Anda perlukan.</div><a class="btn pri mt16" href="#/w/ajukan">Ajukan Surat</a></div>') + '</div>' +
          '<div class="col"><div class="card p"><h3>Pengumuman Desa</h3><div class="mt8">' + (d.pengumuman.length ? d.pengumuman.slice(0, 3).map(function (a) { return '<a href="#/pengumuman/' + esc(a.id) + '" style="display:block;padding:10px 0;border-bottom:1px solid var(--bd);color:inherit"><div class="xs mut">' + U.tgl(a.tgl_terbit) + ' · ' + esc(a.kategori) + '</div><div class="b sm">' + esc(a.judul) + '</div></a>'; }).join('') : '<p class="mut sm">Belum ada pengumuman.</p>') + '</div></div>' +
          '<div class="card p"><h3>Butuh bantuan?</h3><p class="sm mut mt8">Hubungi Ketua RT/RW atau datang ke kantor desa pada jam layanan.</p>' + (d.kontakRt ? '<div class="row mt16"><div class="av">' + esc(U.ini(d.kontakRt.nama)) + '</div><div><div class="b sm">' + esc(d.kontakRt.nama) + '</div><div class="xs mut">Ketua RT/RW Anda' + (d.kontakRt.no_hp ? ' · ' + esc(d.kontakRt.no_hp) : '') + '</div></div></div>' : '') + '</div></div></div>';
      });
    }
  });

  // ---------- Ajukan surat: pilih jenis ----------
  A.add('/w/ajukan', {
    auth: 1, roles: WR, menu: 'w-ajukan', title: 'Ajukan Surat', prefetch: pre,
    render: function (el, ctx) {
      el.innerHTML = '<div class="ph"><div><h1>Ajukan Surat Mandiri</h1><p>Pilih jenis surat. Anda hanya perlu mengisi data tambahan dan mengunggah berkas pendukung; data diri diambil dari data kependudukan desa.</p></div></div><div class="grid g3" id="jl">' + U.skel('b', 6) + '</div>';
      ctx.V('jenis.list', {}, function (d) {
        $('#jl', el).innerHTML = d.rows.filter(function (j) { return j.aktif !== 'Tidak'; }).map(function (j) {
          return '<a class="card svc" href="#/w/ajukan/' + esc(j.kode) + '" style="color:inherit;text-decoration:none"><div class="row sb"><div class="ic">' + ico(SVC_IC[j.kode] || 'file', 'l') + '</div>' + (j.label ? '<span class="bdg gd">' + esc(j.label) + '</span>' : '') + '</div><h3>' + esc(j.nama) + '</h3><p class="mut sm">' + esc(j.deskripsi) + '</p><div class="rq">' + esc(j.syarat.map(function (x) { return x.l; }).join(', ')) + '</div><div class="row sb sm"><span class="mut">' + ico('clock', 's') + ' ' + esc(j.estimasi) + '</span><b style="color:var(--navy-800)">Pilih ' + ico('arrow', 's') + '</b></div></a>';
        }).join('');
      });
    }
  });

  // ---------- Form pengajuan ----------
  A.add('/w/ajukan/:kode', {
    auth: 1, roles: WR, menu: 'w-ajukan', title: 'Formulir Pengajuan', prefetch: pre,
    render: function (el, ctx) {
      el.innerHTML = '<div class="sk sk-b" style="height:300px"></div>';
      var fired = false;
      ctx.V('jenis.list', {}, function (d) {
        if (fired) return; fired = true;
        var j = d.rows.filter(function (x) { return x.kode === ctx.params.kode; })[0];
        if (!j) { el.innerHTML = '<div class="card empty">' + ico('alert') + '<div class="b">Jenis surat tidak ditemukan</div><a class="btn mt16" href="#/w/ajukan">Kembali</a></div>'; return; }
        var me = API.peek('warga.beranda', {}), state = {}, up = j.syarat.filter(function (s) { return !s.auto; }), auto = j.syarat.filter(function (s) { return s.auto; });
        el.innerHTML = '<a href="#/w/ajukan" class="sm">' + ico('chl', 's') + ' Pilih jenis lain</a><div class="ph mt8"><div><h1>' + esc(j.nama) + '</h1><p>' + esc(j.deskripsi) + '</p></div><span class="bdg gd">' + ico('clock', 's') + ' ' + esc(j.estimasi) + '</span></div>' +
          '<form id="fa" class="grid g-main"><div class="col"><div class="card p"><h3>Data Pemohon</h3>' + (me ? '<dl class="dl mt16"><dt>Nama</dt><dd>' + esc(me.saya.nama) + '</dd><dt>NIK</dt><dd>' + esc(me.saya.nik) + '</dd><dt>Alamat</dt><dd>' + esc(me.kk.dusun) + ', RT ' + esc(me.kk.rt) + '/RW ' + esc(me.kk.rw) + '</dd></dl>' : '<p class="sm mut mt8">Data diambil dari data kependudukan desa.</p>') + '</div>' +
          '<div class="card p"><h3>Isian Surat</h3><div class="frm mt16">' + C.fieldsHtml(j.kolom, {}) + U.field('Keperluan', '<textarea class="inp" name="keperluan" maxlength="300" required placeholder="mis. Persyaratan beasiswa anak"></textarea>', { req: 1, cls: 'full' }) + '</div></div>' +
          (up.length ? '<div class="card p"><h3>Berkas Pendukung</h3><div class="frm mt16">' + up.map(function (s) { return C.uploadField(s, state); }).join('') + '</div></div>' : '') + '</div>' +
          '<div class="col"><div class="card p"><h3>Persyaratan</h3><ul class="mt8 sm" style="padding-left:18px;margin-bottom:0">' + j.syarat.map(function (s) { return '<li>' + esc(s.l) + (s.auto ? ' <span class="mut">(otomatis dari data KK)</span>' : s.w ? '' : ' <span class="mut">(opsional)</span>') + '</li>'; }).join('') + '</ul></div><div class="note">' + ico('info') + '<div>Pengajuan Anda akan divalidasi Ketua RT/RW, diverifikasi staf desa, lalu ditandatangani Kepala Desa. Status dapat dipantau di menu Lacak Surat.</div></div><button class="btn pri lg blk" type="submit">' + ico('send', 's') + ' Kirim Pengajuan</button></div></form>';
        C.bindUpload(el, state);
        var f = $('#fa', el);
        f.onsubmit = function (e) {
          e.preventDefault();
          for (var i = 0; i < up.length; i++) if (up[i].w && !state[up[i].k]) { U.toast('Unggah berkas: ' + up[i].l, 'er'); return; }
          U.busy(f.querySelector('[type=submit]'), function () {
            return API.write('surat.ajukan', { jenis: j.kode, keperluan: f.keperluan.value, data_isian: C.fieldsVals(f, j.kolom), dokumen: C.dokList(state, j.syarat) }).then(function (r) { U.ok('Pengajuan terkirim. Nomor registrasi: ' + r.data.id); A.go('/w/surat/' + r.data.id); });
          });
        };
      });
    }
  });

  // ---------- Lacak surat ----------
  A.add('/w/surat', {
    auth: 1, roles: WR, menu: 'w-surat', title: 'Lacak Status Surat', prefetch: pre,
    render: function (el, ctx) {
      var filt = 'semua';
      el.innerHTML = '<div class="ph"><div><h1>Lacak Status Surat</h1><p>Pantau setiap tahap pengajuan Anda. Status diperbarui otomatis.</p></div><a class="btn pri" href="#/w/ajukan">' + ico('plus', 's') + ' Ajukan Surat</a></div><div class="chips mb16" id="ch"></div><div class="col" id="ls">' + U.skel('b', 3) + '</div>';
      var data;
      function draw() {
        var rows = data.surat.filter(function (s) { return filt === 'semua' || (filt === 'aktif' ? DONE.indexOf(s.status) < 0 && s.status !== 'Perlu Revisi' : filt === 'revisi' ? s.status === 'Perlu Revisi' : s.status === 'Selesai'); });
        var n = { semua: data.surat.length, aktif: data.surat.filter(function (s) { return DONE.indexOf(s.status) < 0 && s.status !== 'Perlu Revisi'; }).length, revisi: data.surat.filter(function (s) { return s.status === 'Perlu Revisi'; }).length, selesai: data.surat.filter(function (s) { return s.status === 'Selesai'; }).length };
        $('#ch', el).innerHTML = [['semua', 'Semua'], ['aktif', 'Diproses'], ['revisi', 'Perlu Revisi'], ['selesai', 'Selesai']].map(function (c) { return '<button class="chip' + (filt === c[0] ? ' on' : '') + '" data-f="' + c[0] + '">' + c[1] + ' (' + n[c[0]] + ')</button>'; }).join('');
        $('#ls', el).innerHTML = rows.length ? rows.map(suratCard).join('') : '<div class="card empty">' + ico('mail') + '<div class="b">Tidak ada surat</div></div>';
      }
      $('#ch', el).onclick = function (e) { var b = e.target.closest('[data-f]'); if (b) { filt = b.dataset.f; draw(); } };
      ctx.V('warga.beranda', {}, function (d) { data = d; A.afterWarga(d); draw(); });
    }
  });

  // ---------- Detail surat ----------
  A.add('/w/surat/:id', {
    auth: 1, roles: WR, menu: 'w-surat', title: 'Detail Pengajuan',
    render: function (el, ctx) {
      el.innerHTML = '<div class="sk sk-b" style="height:260px"></div>';
      function draw(d) {
        var s = d.surat, j = d.jenis || { nama: s.jenis, kolom: [], syarat: [] };
        el.innerHTML = '<a href="#/w/surat" class="sm">' + ico('chl', 's') + ' Semua pengajuan</a><div class="ph mt8"><div><h1>' + esc(j.nama) + '</h1><p class="xs">' + esc(s.id) + (s.nomor_surat ? ' · No. ' + esc(s.nomor_surat) : '') + '</p></div><div class="row w">' + U.badge(s.status) +
          (s.status === 'Selesai' ? '<button class="btn gold" id="cetak">' + ico('print', 's') + ' Lihat / Cetak Surat</button>' : '') + (s.status === 'Perlu Revisi' ? '<button class="btn gold" id="rev">' + ico('edit', 's') + ' Perbaiki Berkas</button>' : '') + (['Diajukan', 'Perlu Revisi'].indexOf(s.status) >= 0 ? '<button class="btn dan" id="batal">Batalkan</button>' : '') + '</div></div>' +
          '<div class="card p">' + C.stepper(s) + '<p class="sm mut">' + esc(C.EXPLAIN[s.status] || '') + '</p>' + (s.status === 'Perlu Revisi' || s.status === 'Ditolak' ? '<div class="note er mt16">' + ico('alert') + '<div><b>Catatan petugas:</b> ' + esc(s.catatan || s.rt_catatan || '-') + '</div></div>' : '') + '</div>' +
          '<div class="grid g-main mt16"><div class="card p"><h3>Rincian Pengajuan</h3><dl class="dl mt16"><dt>Keperluan</dt><dd>' + esc(s.keperluan) + '</dd>' + j.kolom.map(function (c) { return '<dt>' + esc(c.l) + '</dt><dd>' + esc(s.data_isian[c.k] || '–') + '</dd>'; }).join('') + '<dt>Diajukan</dt><dd>' + U.tglJam(s.tgl_ajuan) + '</dd></dl><h3 class="mt24">Berkas Terunggah</h3><div class="col mt8">' + (s.dokumen.length ? s.dokumen.map(function (x, i) { return '<div class="fileit">' + ico('filec') + '<div class="grow sm"><b>' + esc(x.l) + '</b><div class="xs mut">' + esc(x.nama) + '</div></div><button class="btn sm" data-view="' + i + '">' + ico('eye', 's') + ' Lihat</button></div>'; }).join('') : '<p class="mut sm">Tidak ada berkas.</p>') + '</div></div><div class="card p"><h3>Riwayat Status</h3><div class="mt16">' + C.timeline(s) + '</div></div></div>';
        var c = $('#cetak', el); if (c) c.onclick = function () { C.openLetter(d); };
        var b = $('#batal', el); if (b) b.onclick = function () { U.confirm('Batalkan pengajuan ini? Tindakan tidak dapat diurungkan.', { danger: 1, ok: 'Ya, batalkan' }).then(function (y) { if (y) U.busy(b, function () { return API.write('surat.batal', { id: s.id }).then(function () { U.ok('Pengajuan dibatalkan.'); return reload(); }); }); }); };
        var r = $('#rev', el); if (r) r.onclick = function () { revisi(d, reload); };
        U.$$('[data-view]', el).forEach(function (v) { v.onclick = function () { viewDoc(s.id, +v.dataset.view, v); }; });
      }
      function reload() { return API.get('surat.detail', { id: ctx.params.id }, { force: true }).then(function (d) { if (el.isConnected) draw(d); }); }
      ctx.V('surat.detail', { id: ctx.params.id }, draw, { fresh: 8 });
    }
  });
  function viewDoc(id, idx, btn) {
    U.busy(btn, function () {
      return API.call('file.get', { id: id, idx: idx }).then(function (r) {
        var d = r.data, bin = atob(d.b64), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
        var url = URL.createObjectURL(new Blob([a], { type: d.mime })), isImg = /^image\//.test(d.mime);
        var m = U.modal({ title: d.nama, size: 'w', body: isImg ? '<img src="' + url + '" alt="' + esc(d.nama) + '" style="max-width:100%;border-radius:8px;display:block;margin:auto">' : '<iframe src="' + url + '" style="width:100%;height:70vh;border:0" title="' + esc(d.nama) + '"></iframe>', onClose: function () { URL.revokeObjectURL(url); } });
      });
    });
  }
  w.viewDoc = viewDoc;
  function revisi(d, done) {
    var s = d.surat, j = d.jenis, state = {}, up = j.syarat.filter(function (x) { return !x.auto; });
    s.dokumen.forEach(function (x) { state[x.k] = x; });
    var m = U.modal({ title: 'Perbaiki Pengajuan', sub: 'Ubah isian atau unggah ulang berkas sesuai catatan petugas.', size: 'w', body: '<form id="fr" class="frm">' + C.fieldsHtml(j.kolom, s.data_isian) + U.field('Keperluan', '<textarea class="inp" name="keperluan" required maxlength="300">' + esc(s.keperluan) + '</textarea>', { req: 1, cls: 'full' }) + up.map(function (x) { return C.uploadField(x, state); }).join('') + '</form>', footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Kirim Perbaikan</button>' });
    C.bindUpload(m.el, state);
    m.$('#ok').onclick = function () { var f = m.$('#fr'); if (!f.reportValidity()) return; U.busy(m.$('#ok'), function () { return API.write('surat.revisi', { id: s.id, keperluan: f.keperluan.value, data_isian: C.fieldsVals(f, j.kolom), dokumen: C.dokList(state, j.syarat) }).then(function () { m.close(); U.ok('Perbaikan terkirim.'); done(); }); }); };
  }

  // ---------- Data keluarga & perbaikan ----------
  var FIELD_LBL = { nama: 'Nama lengkap', tempat_lahir: 'Tempat lahir', tgl_lahir: 'Tanggal lahir', jk: 'Jenis kelamin', agama: 'Agama', status_kawin: 'Status perkawinan', pendidikan: 'Pendidikan', pekerjaan: 'Pekerjaan', gol_darah: 'Golongan darah', no_hp: 'No. HP', email: 'Email' };
  A.add('/w/data', {
    auth: 1, roles: WR, menu: 'w-data', title: 'Data Keluarga', prefetch: pre,
    render: function (el, ctx) {
      el.innerHTML = '<div class="ph"><div><h1>Data Keluarga Saya</h1><p>Periksa data kependudukan keluarga Anda. Jika ada yang keliru, ajukan perbaikan — akan diverifikasi RT/RW dan staf desa.</p></div></div><div class="sk sk-b" style="height:240px"></div>';
      ctx.V('warga.beranda', {}, function (d) {
        el.innerHTML = '<div class="ph"><div><h1>Data Keluarga Saya</h1><p>Periksa data kependudukan keluarga Anda. Jika ada yang keliru, ajukan perbaikan — akan diverifikasi RT/RW dan staf desa.</p></div></div>' +
          '<div class="card p mb16"><div class="row sb w"><div><div class="xs mut">NOMOR KARTU KELUARGA</div><div class="b tnum" style="font-size:18px">' + esc(d.kk.no_kk) + '</div></div><div class="sm mut">' + esc(d.kk.alamat || '') + '<br>' + esc(d.kk.dusun) + ', RT ' + esc(d.kk.rt) + '/RW ' + esc(d.kk.rw) + '</div></div></div>' +
          '<div class="card p0"><div class="tw"><table class="t"><thead><tr><th>Nama</th><th>NIK</th><th>Hubungan</th><th>Tgl lahir</th><th>KTP-el</th><th></th></tr></thead><tbody>' + d.anggota.map(function (a, i) { return '<tr><td><b>' + esc(a.nama) + '</b>' + (a.nik === d.saya.nik ? ' <span class="bdg in">Anda</span>' : '') + '</td><td class="tnum">' + esc(a.nik) + '</td><td>' + esc(a.hubungan) + '</td><td>' + U.tgl(a.tgl_lahir) + ' <span class="mut xs">(' + U.umur(a.tgl_lahir) + ' th)</span></td><td>' + U.badge(a.ktp_status === 'Aktif' ? 'Aktif' : a.ktp_status, a.ktp_status) + '</td><td class="r"><button class="btn sm" data-i="' + i + '">' + ico('edit', 's') + ' Ajukan Perbaikan</button></td></tr>'; }).join('') + '</tbody></table></div></div>' +
          '<h2 class="mt24 mb8">Riwayat Permintaan Perbaikan</h2><div class="card p0">' + (d.perbaikan.length ? '<div class="tw"><table class="t"><thead><tr><th>Tanggal</th><th>Nama</th><th>Data</th><th>Perubahan</th><th>Status</th></tr></thead><tbody>' + d.perbaikan.map(function (r) { return '<tr><td>' + U.tgl(r.tanggal) + '</td><td>' + esc(r.nama) + '</td><td>' + esc(FIELD_LBL[r.field] || r.field) + '</td><td><span class="mut">' + esc(r.nilai_lama || '–') + '</span> → <b>' + esc(r.nilai_baru) + '</b></td><td>' + U.badge(r.status) + (r.catatan ? '<div class="xs mut">' + esc(r.catatan) + '</div>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('shieldc') + '<div>Belum ada permintaan perbaikan.</div></div>') + '</div>';
        U.$$('[data-i]', el).forEach(function (b) { b.onclick = function () { perbaikan(d.anggota[+b.dataset.i], function () { A.go('/w/data', true); location.reload; }); }; });
      });
    }
  });
  function perbaikan(a, done) {
    var m = U.modal({ title: 'Ajukan Perbaikan Data', sub: a.nama + ' · NIK ' + a.nik, body: '<form id="fp" class="col">' + U.field('Data yang diperbaiki', U.sel('field', Object.keys(FIELD_LBL).map(function (k) { return [k, FIELD_LBL[k]]; }), '', 'Pilih data…', { req: 1 }), { req: 1 }) + '<div id="nv">' + U.field('Nilai yang benar', U.inp('nilai_baru', '', { req: 1 }), { req: 1 }) + '</div>' + '<div class="note">' + ico('info') + '<div>Data tidak langsung berubah. Perbaikan berlaku setelah diverifikasi RT/RW dan disetujui staf desa. Bawa dokumen asli (KK/Akta/KTP) bila diminta.</div></div></form>', footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Kirim Permintaan</button>' });
    var f = m.$('#fp'), list = { jk: U.ENUM.jk.map(function (x) { return [x, x === 'L' ? 'Laki-laki' : 'Perempuan']; }), agama: U.ENUM.agama, status_kawin: U.ENUM.status_kawin, pendidikan: U.ENUM.pendidikan, gol_darah: U.ENUM.gol_darah };
    f.field.onchange = function () { var k = f.field.value, cur = a[k] || ''; m.$('#nv').innerHTML = U.field('Nilai yang benar' + (cur ? ' (saat ini: ' + cur + ')' : ''), list[k] ? U.sel('nilai_baru', list[k], '', 'Pilih…', { req: 1 }) : U.inp('nilai_baru', '', { type: k === 'tgl_lahir' ? 'date' : k === 'email' ? 'email' : 'text', req: 1 }), { req: 1 }); };
    m.$('#ok').onclick = function () { if (!f.reportValidity()) return; U.busy(m.$('#ok'), function () { return API.write('perbaikan.ajukan', { nik: a.nik, field: f.field.value, nilai_baru: f.nilai_baru.value }).then(function (r) { m.close(); U.ok(r.message || 'Permintaan dikirim.'); API.invalidate(); A.reroute(); }); }); };
  }

  // ---------- Pengumuman ----------
  A.add('/w/info', {
    auth: 1, roles: WR, menu: 'w-info', title: 'Pengumuman',
    render: function (el, ctx) {
      el.innerHTML = '<div class="ph"><div><h1>Pengumuman Desa</h1></div></div><div class="grid g3" id="l">' + U.skel('b', 3) + '</div>';
      ctx.V('pub.pengumuman', {}, function (d) { $('#l', el).innerHTML = d.rows.length ? d.rows.map(function (a) { return '<a class="card p" href="#/pengumuman/' + esc(a.id) + '" style="color:inherit;text-decoration:none"><div class="row sb"><span class="bdg ' + (a.penting === 'Ya' ? 'gd' : 'in') + '">' + esc(a.kategori) + '</span><span class="xs mut">' + U.tgl(a.tgl_terbit) + '</span></div><h3 class="mt8">' + esc(a.judul) + '</h3><p class="mut sm mt8" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">' + esc(a.isi) + '</p></a>'; }).join('') : '<div class="card empty" style="grid-column:1/-1">' + ico('mega') + '<div>Belum ada pengumuman.</div></div>'; });
    }
  });

  // ---------- Profil (dipakai juga oleh staf) ----------
  w.profilPage = function (el, ctx) {
    var u = A.user;
    el.innerHTML = '<div class="ph"><div><h1>Profil & Keamanan</h1><p>Kelola kata sandi dan sesi perangkat Anda.</p></div></div><div class="grid g2"><div class="card p"><h3>Akun</h3><dl class="dl mt16"><dt>Nama</dt><dd>' + esc(u.nama) + '</dd><dt>Peran</dt><dd>' + esc(A.ROLE_LBL[u.role]) + '</dd><dt>Nama pengguna</dt><dd>' + esc(u.username) + '</dd>' + (u.rt || u.rw ? '<dt>Wilayah</dt><dd>' + (u.rt ? 'RT ' + esc(u.rt) + ' / ' : '') + 'RW ' + esc(u.rw) + '</dd>' : '') + (u.role === 'kades' ? '<dt>PIN otorisasi</dt><dd>' + (u.punyaPin ? '<span class="bdg ok">Sudah diatur</span>' : '<span class="bdg wa">Belum diatur</span>') + '</dd>' : '') + '</dl><div class="mt16 row w"><button class="btn" id="out">' + ico('logout', 's') + ' Keluar dari semua perangkat</button>' + (u.role === 'kades' ? '<button class="btn gold" id="pin">' + ico('key', 's') + ' ' + (u.punyaPin ? 'Ganti' : 'Atur') + ' PIN TTE</button>' : '') + '</div></div>' +
      '<div class="card p"><h3>Ganti Kata Sandi</h3>' + (u.darurat ? '<p class="mut sm mt8">Sandi darurat diganti di Pengaturan → Keamanan.</p>' : '<form id="fp" class="col mt16">' + U.field('Kata sandi lama', U.inp('lama', '', { type: 'password', req: 1, ac: 'current-password' })) + U.field('Kata sandi baru', U.inp('baru', '', { type: 'password', req: 1, ac: 'new-password' }), { hint: 'Minimal 8 karakter, kombinasi huruf dan angka.' }) + '<button class="btn pri" type="submit">Simpan Kata Sandi</button></form>') + '</div></div>';
    var f = U.$('#fp', el); if (f) f.onsubmit = function (e) { e.preventDefault(); U.busy(f.querySelector('[type=submit]'), function () { return API.write('auth.changePassword', { lama: f.lama.value, baru: f.baru.value }).then(function (r) { if (r.data && r.data.token) { API.S.token = r.data.token; } U.ok('Kata sandi diganti. Perangkat lain telah dikeluarkan.'); f.reset(); if (A.user.wajibGanti) { A.user.wajibGanti = false; API.S.user = A.user; API.save(); } }); }); };
    U.$('#out', el).onclick = function (e) { U.confirm('Keluar dari semua perangkat, termasuk perangkat ini?', {}).then(function (y) { if (y) API.call('auth.revokeAll', {}).then(function () { A.logout(true); }, U.er); }); };
    var pb = U.$('#pin', el); if (pb) pb.onclick = function () {
      var m = U.modal({ title: 'PIN Otorisasi TTE', sub: 'PIN 6 digit dipakai setiap menandatangani surat.', body: '<form id="fpin" class="col">' + U.field('PIN baru (6 digit)', U.inp('pin', '', { type: 'password', mode: 'numeric', max: 6, req: 1, ac: 'off' })) + U.field('Konfirmasi kata sandi akun', U.inp('password', '', { type: 'password', req: 1, ac: 'current-password' })) + '</form>', footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Simpan PIN</button>' });
      m.$('#ok').onclick = function () { var g = m.$('#fpin'); if (!g.reportValidity()) return; U.busy(m.$('#ok'), function () { return API.write('auth.setPin', { pin: g.pin.value, password: g.password.value }).then(function () { A.user.punyaPin = true; API.S.user.punyaPin = true; m.close(); U.ok('PIN tersimpan.'); profilPage(el, ctx); }); }); };
    };
  };
  A.add('/w/profil', { auth: 1, roles: WR, menu: 'w-profil', title: 'Profil & Keamanan', render: function (el, ctx) { w.profilPage(el, ctx); } });
})(window);
