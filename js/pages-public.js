/* Halaman publik: beranda, pengumuman, verifikasi dokumen, masuk, OTP, registrasi, akses darurat. */
(function (w) {
  'use strict';
  var U = w.UI, A = w.App, esc = U.esc, ico = U.ico, $ = U.$;
  var SVC_IC = { SKTM: 'wallet', SKU: 'bld', SKD: 'pin', SKPWNI: 'send', SKL: 'baby', SKK: 'heart' };
  var CAT_LBL = { 'Keterangan Umum': 'Keterangan Umum', 'Kesejahteraan': 'Kesejahteraan', 'Pindah / Mutasi': 'Pindah / Mutasi' };

  function topbar(active, desa) {
    var u = A.user;
    return '<header class="pubtop"><div class="in"><a href="#/" class="row gap8" style="color:#fff;text-decoration:none"><div class="brand" style="padding:0;border:0"><div class="lg" style="width:36px;height:36px">' + ico('bld', 'l') + '</div><div><b style="font-size:15px">SIPAKDES</b><span>' + esc((desa && desa.nama_desa) || 'Pemerintah Desa') + '</span></div></div></a>' +
      '<nav aria-label="Navigasi publik"><a href="#/"' + (active === 'home' ? ' class="on"' : '') + '>Beranda</a><a href="#/" data-sc="layanan">Layanan</a><a href="#/pengumuman"' + (active === 'info' ? ' class="on"' : '') + '>Pengumuman</a><a href="#/verifikasi"' + (active === 'ver' ? ' class="on"' : '') + '>Cek Keaslian Surat</a>' +
      (u ? '<a class="btn gold sm" href="#' + A.home() + '">' + ico('dash', 's') + ' Buka Portal</a>' : '<a class="btn gold sm" href="#/masuk">Masuk / Portal Warga</a>') + '</nav></div></header>';
  }
  function footer(d) {
    d = d || {};
    return '<footer class="foot"><div class="wrap"><div class="grid g3"><div><h4>Kantor Pemerintah ' + esc(d.nama_desa || 'Desa') + '</h4><p>' + esc(d.alamat || '') + '</p>' + (d.email_kantor ? '<p class="mt8">Email: ' + esc(d.email_kantor) + '</p>' : '') + '</div>' +
      '<div><h4>Jam Operasional & Layanan</h4><p>' + esc(d.jam_layanan || '') + '</p><p>' + esc(d.jam_istirahat || '') + '</p></div><div><h4>Hotline & Kontak</h4><p>Telepon: ' + esc(d.telepon || '-') + '</p><p>WhatsApp: ' + esc(d.whatsapp || '-') + '</p><p class="mt8">Darurat: <b style="color:#fff">' + esc(d.hotline_darurat || '112') + '</b></p></div></div>' +
      '<div class="row sb w xs mt24" style="border-top:1px solid rgba(255,255,255,.12);padding-top:14px"><span>© ' + new Date().getFullYear() + ' Pemerintah ' + esc(d.nama_desa || 'Desa') + ' — Sistem Informasi Kependudukan & Pelayanan Administrasi Desa (SIPAKDES)</span><span>Pelayanan Terpadu Satu Pintu Digital</span></div></div></footer>';
  }
  function pubPage(el, active, desa, inner) { el.innerHTML = topbar(active, desa) + inner + footer(desa); }
  function ajukanUrl(kode) { return '#/w/ajukan/' + kode; }

  // ---------- Beranda ----------
  A.add('/', {
    title: '', render: function (el, ctx) {
      pubPage(el, 'home', A.desa, '<div class="hero"><div class="sk" style="height:300px"></div></div>');
      API.warm('pub');
      A.V(el, 'pub.boot', {}, function (d) { A.desa = d.desa; draw(el, d); }, { fresh: 60 });
    }
  });
  function draw(el, d) {
    var s = d.stat, cats = ['Semua'], seen = {};
    d.jenis.forEach(function (j) { if (!seen[j.kategori]) { seen[j.kategori] = 1; cats.push(j.kategori); } });
    function cards(cat) {
      return d.jenis.filter(function (j) { return cat === 'Semua' || j.kategori === cat; }).map(function (j) {
        var req = j.syarat.map(function (x) { return x.l; }).slice(0, 3).join(', ');
        return '<a class="card svc" href="' + ajukanUrl(j.kode) + '" style="color:inherit;text-decoration:none"><div class="row sb"><div class="ic">' + ico(SVC_IC[j.kode] || 'file', 'l') + '</div>' + (j.label ? '<span class="bdg gd">' + esc(j.label) + '</span>' : '') + '</div><h3>' + esc(j.nama) + '</h3><p class="mut sm">' + esc(j.deskripsi) + '</p><div class="rq"><b class="xs" style="letter-spacing:.06em">PERSYARATAN DOKUMEN</b><br>' + esc(req) + '</div><div class="row sb mt8 sm"><span class="mut">' + ico('clock', 's') + ' ' + esc(j.estimasi) + '</span><span class="b" style="color:var(--navy-800)">Ajukan Mandiri ' + ico('arrow', 's') + '</span></div></a>';
      }).join('');
    }
    var inner = '<section class="hero"><span class="tag">Portal Resmi Pelayanan Desa Digital</span><h1>' + esc(d.desa.tagline) + '</h1><p>Sistem resmi Pemerintah ' + esc(d.desa.nama_desa) + ' untuk permohonan surat keterangan warga, pencatatan sipil, pengecekan bansos, dan verifikasi tanda tangan digital Kepala Desa secara daring.</p>' +
      '<div class="row w" style="justify-content:center"><a class="btn gold lg" href="#/w/ajukan">' + ico('file', 's') + ' Ajukan Surat Mandiri ' + ico('arrow', 's') + '</a><a class="btn lg" href="#/verifikasi" style="background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.25)">' + ico('qr', 's') + ' Cek Keaslian Surat (Scan QR)</a></div>' +
      '<div class="row w mt24 xs" style="justify-content:center;gap:18px;color:#CBD5E1"><span>' + ico('shieldc', 's') + ' Data terverifikasi RT/RW</span><span>' + ico('key', 's') + ' Tanda tangan elektronik internal berverifikasi QR</span><span>' + ico('checkc', 's') + ' Pantau status surat langsung</span></div></section>' +
      '<div class="wrap stats"><div class="grid g4"><div class="card kpi"><span class="t">Warga Desa</span><span class="v tnum">' + U.num(s.penduduk) + ' Jiwa</span><span class="s">Penduduk aktif tercatat</span></div><div class="card kpi"><span class="t">Data Keluarga</span><span class="v tnum">' + U.num(s.kk) + ' KK</span><span class="s">Kartu keluarga aktif</span></div><div class="card kpi"><span class="t">Surat Terbit</span><span class="v tnum">' + U.num(s.suratBulanIni) + '</span><span class="s">Bulan ini' + (s.rataJam ? ' · rata-rata ' + s.rataJam + ' jam' : '') + '</span></div><div class="card kpi"><span class="t">Layanan Daring</span><span class="v tnum">' + U.num(s.layanan) + '</span><span class="s">Jenis surat tersedia</span></div></div></div>' +
      '<section class="sec wrap" id="layanan"><div class="eyebrow">Layanan Administrasi</div><div class="row sb w mb16"><div><h2 class="big">Pengurusan Surat Online Resmi ' + esc(d.desa.nama_desa) + '</h2><p class="mut mt8">Pilih kategori dan ajukan permohonan surat administrasi tanpa antre di kantor desa.</p></div><div class="chips" id="cats">' + cats.map(function (c, i) { return '<button class="chip' + (i ? '' : ' on') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div></div><div class="grid g3" id="svcs">' + cards('Semua') + '</div></section>' +
      '<section class="sec verif"><div class="wrap"><div class="grid g2" style="align-items:center"><div><div class="eyebrow">Autentikasi Dokumen</div><h2 class="big">Verifikasi Keaslian Dokumen Desa</h2><p class="mut mt8">Setiap surat yang diterbitkan memiliki kode QR dan nomor unik. Cek keasliannya di sini — sistem mencocokkan tanda tangan digital internal (HMAC) dengan data yang tersimpan di server desa.</p></div><div class="card p" id="vbox"></div></div></div></section>' +
      '<section class="sec wrap"><div class="eyebrow c">Prosedur Pengurusan</div><h2 class="big c mb16">3 Langkah Mudah Pengurusan Surat Warga</h2><div class="grid g3">' +
      [['01', 'file', 'Pilih Layanan & Isi Formulir', 'Masuk dengan akun warga, pilih jenis surat, isi data, dan unggah berkas pendukung dari ponsel Anda.'], ['02', 'shieldc', 'Validasi RT/RW & Staf Desa', 'Ketua RT/RW dan operator desa memeriksa berkas secara daring. Anda mendapat pemberitahuan setiap status berubah.'], ['03', 'key', 'Tanda Tangan Kades & Cetak', 'Kepala Desa menyetujui dengan PIN. Surat ber-QR siap diunduh dan dicetak dari portal warga.']].map(function (x) { return '<div class="card step"><div class="nn">' + x[0] + '</div><div class="ic svc" style="all:unset"></div><h3 class="mt8">' + x[2] + '</h3><p class="mut sm mt8">' + x[3] + '</p></div>'; }).join('') + '</div></section>' +
      (d.pengumuman.length ? '<section class="sec wrap" style="padding-top:0"><div class="row sb mb16"><div><div class="eyebrow">Kabar Pembangunan Desa</div><h2 class="big">Pengumuman & Agenda ' + esc(d.desa.nama_desa) + '</h2></div><a href="#/pengumuman" class="b">Lihat Semua Pengumuman ' + ico('arrow', 's') + '</a></div><div class="grid g3">' + d.pengumuman.slice(0, 3).map(annCard).join('') + '</div></section>' : '') +
      '<section class="sec wrap" style="padding-top:0"><div class="card p"><div class="grid g2"><div><div class="eyebrow">Pusat Pelayanan Warga</div><h2 class="big">Loket Pelayanan Langsung Balai Desa</h2><p class="mut mt8">Bagi warga yang membutuhkan asistensi, petugas siap membantu secara tatap muka.</p><dl class="dl mt16"><dt>Jam Layanan</dt><dd>' + esc(d.desa.jam_layanan) + '<br><span class="mut">' + esc(d.desa.jam_istirahat) + '</span></dd><dt>Alamat Balai Desa</dt><dd>' + esc(d.desa.alamat) + '<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(d.desa.alamat) + '">Buka di Google Maps ' + ico('link', 's') + '</a></dd></dl></div><div class="note er" style="align-self:center">' + ico('alert', 'l') + '<div><b>Kondisi darurat 24 jam</b><br>Hubungi hotline ' + esc(d.desa.hotline_darurat) + ' atau Tim Siaga Bencana desa.<div class="mt8"><a class="btn dan sm" href="tel:' + esc(d.desa.hotline_darurat) + '">' + ico('phone', 's') + ' Hubungi ' + esc(d.desa.hotline_darurat) + '</a></div></div></div></div></div></section>';
    pubPage(el, 'home', d.desa, inner);
    var cats_ = $('#cats', el), sv = $('#svcs', el);
    cats_.onclick = function (e) { var b = e.target.closest('[data-cat]'); if (!b) return; U.$$('.chip', cats_).forEach(function (x) { x.classList.toggle('on', x === b); }); sv.innerHTML = cards(b.dataset.cat); };
    el.querySelector('[data-sc]').onclick = function (e) { e.preventDefault(); var t = $('#layanan', el); t && t.scrollIntoView({ behavior: 'smooth' }); };
    verifBox($('#vbox', el), '');
  }
  function annCard(a) {
    return '<a class="card p0" href="#/pengumuman/' + esc(a.id) + '" style="color:inherit;text-decoration:none;overflow:hidden"><div style="height:6px;background:' + (a.penting === 'Ya' ? 'var(--gold)' : 'var(--navy-800)') + '"></div><div style="padding:18px"><div class="row sb"><span class="bdg ' + (a.penting === 'Ya' ? 'gd' : 'in') + '">' + esc(a.kategori) + '</span><span class="xs mut">' + U.tgl(a.tgl_terbit) + '</span></div><h3 class="mt8">' + esc(a.judul) + '</h3><p class="mut sm mt8" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">' + esc(a.isi) + '</p><span class="b sm mt8" style="display:inline-block;color:var(--navy-800)">Baca Rincian Dokumen ' + ico('arrow', 's') + '</span></div></a>';
  }

  // ---------- Pengumuman ----------
  A.add('/pengumuman', {
    title: 'Pengumuman', render: function (el) {
      pubPage(el, 'info', A.desa, '<div class="wrap" style="padding:32px 20px 56px"><h1>Pengumuman & Agenda Desa</h1><p class="mut mt8 mb16">Informasi resmi dari Pemerintah Desa.</p><div id="lst" class="grid g3">' + U.skel('b', 3) + '</div></div>');
      A.V($('#lst', el), 'pub.pengumuman', {}, function (d) { $('#lst', el).innerHTML = d.rows.length ? d.rows.map(annCard).join('') : '<div class="empty card" style="grid-column:1/-1">' + ico('mega') + '<div>Belum ada pengumuman.</div></div>'; });
    }
  });
  A.add('/pengumuman/:id', {
    title: 'Pengumuman', render: function (el, ctx) {
      pubPage(el, 'info', A.desa, '<div class="wrap" style="padding:32px 20px 56px;max-width:780px"><a href="#/pengumuman" class="sm">' + ico('chl', 's') + ' Semua pengumuman</a><div id="det" class="card p mt16">' + U.skel('l', 6) + '</div></div>');
      A.V($('#det', el), 'pub.pengumuman', { id: ctx.params.id }, function (d) { var a = d.item; $('#det', el).innerHTML = '<span class="bdg gd">' + esc(a.kategori) + '</span><h1 class="mt8">' + esc(a.judul) + '</h1><p class="xs mut mt8">Diterbitkan ' + U.tgl(a.tgl_terbit, true) + ' · ' + esc(a.penulis || '') + '</p><div class="mt16" style="white-space:pre-wrap;line-height:1.7">' + esc(a.isi) + '</div>'; });
    }
  });

  // ---------- Verifikasi dokumen ----------
  function verifBox(box, kode) {
    box.innerHTML = '<h3>Nomor Surat atau Kode Registrasi</h3><p class="mut sm mt8">Tempel kode pada QR di bawah surat, atau nomor surat resmi.</p><form class="row mt16" id="vf"><input class="inp" name="kode" placeholder="mis. 401/001/Pemdes/2026" value="' + esc(kode || '') + '" aria-label="Kode atau nomor surat" required><button class="btn gold" type="submit">' + ico('shieldc', 's') + ' Cek Keabsahan</button></form><div class="row mt8"><button class="btn sm blk" id="scan" type="button">' + ico('qr', 's') + ' Pindai kode QR dengan kamera</button></div><div id="vres" class="mt16" aria-live="polite"></div>';
    var f = $('#vf', box), out = $('#vres', box);
    function run(k) {
      out.innerHTML = '<div class="sk sk-b"></div>';
      API.call('pub.verify', { kode: k }).then(function (r) {
        var d = r.data;
        if (!d.valid) { out.innerHTML = '<div class="res-no"><div class="row">' + ico('xc', 'l') + '<b>TIDAK DITEMUKAN / TIDAK SAH</b></div><p class="sm mt8">Kode ini tidak cocok dengan surat terbit mana pun. Pastikan kode ditulis lengkap, atau hubungi kantor desa bila dokumen dicurigai palsu.</p></div>'; return; }
        out.innerHTML = '<div class="res-ok"><div class="row sb"><span class="bdg ok">' + ico('check', 's') + ' SAH & TERDAFTAR</span><span class="xs mut">' + (d.hmac ? 'Tanda tangan digital cocok' : 'Dicocokkan lewat nomor surat') + '</span></div><dl class="dl mt16"><dt>Jenis Dokumen</dt><dd>' + esc(d.jenis) + '</dd><dt>Nomor Surat</dt><dd>' + esc(d.nomor) + '</dd><dt>Nama Pemohon</dt><dd>' + esc(d.pemohon) + '</dd><dt>Tanggal Terbit</dt><dd>' + U.tglJam(d.tgl_terbit) + '</dd><dt>Penandatangan</dt><dd>' + esc(d.penandatangan) + '</dd><dt>Kode Tanda Tangan</dt><dd class="tnum">' + esc(d.kode_ttd) + '</dd></dl>' + (d.hmac ? '' : '<p class="xs mut mt8">Untuk kepastian penuh, pindai QR pada surat asli.</p>') + '</div>';
      }).catch(function (e) { out.innerHTML = '<div class="res-no">' + esc(e.message) + '</div>'; });
    }
    f.onsubmit = function (e) { e.preventDefault(); run(f.kode.value.trim()); };
    $('#scan', box).onclick = function () { scanner(function (txt) { f.kode.value = txt.replace(/^.*verifikasi\//, '').replace(/^SIPAKDES:/, ''); run(f.kode.value); }); };
    if (kode) run(kode);
  }
  function scanner(done) {
    if (!('BarcodeDetector' in w) || !navigator.mediaDevices) { U.toast('Pemindaian kamera belum didukung peramban ini. Gunakan aplikasi kamera ponsel — QR akan membuka halaman verifikasi otomatis.', 'wa', 7000); return; }
    var stream, stop = false, m = U.modal({ title: 'Pindai Kode QR', body: '<video id="vid" playsinline muted style="width:100%;border-radius:10px;background:#000"></video><p class="sm mut mt8">Arahkan kamera ke kode QR pada surat.</p>', onClose: function () { stop = true; stream && stream.getTracks().forEach(function (t) { t.stop(); }); } });
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (s) {
      stream = s; var v = m.$('#vid'); v.srcObject = s; v.play(); var det = new BarcodeDetector({ formats: ['qr_code'] });
      (function loop() { if (stop) return; det.detect(v).then(function (r) { if (r.length) { var t = r[0].rawValue; m.close(); done(t); } else setTimeout(loop, 250); }, function () { setTimeout(loop, 400); }); })();
    }).catch(function () { m.close(); U.toast('Kamera tidak dapat diakses. Izinkan akses kamera di peramban.', 'er'); });
  }
  function verPage(el, ctx) {
    pubPage(el, 'ver', A.desa, '<div class="wrap" style="padding:32px 20px 56px;max-width:720px"><div class="eyebrow">Autentikasi Dokumen</div><h1>Verifikasi Keaslian Surat Desa</h1><p class="mut mt8 mb16">Pastikan surat yang Anda terima benar-benar diterbitkan oleh Pemerintah Desa.</p><div class="card p" id="vbox"></div><div class="note mt16">' + ico('info') + '<div>Tanda tangan elektronik pada surat desa ini bersifat <b>internal</b> (PIN Kepala Desa + kode HMAC pada QR). Dokumen ini bukan sertifikat elektronik BSrE; keabsahannya dibuktikan lewat pencocokan data di server desa.</div></div></div>');
    verifBox($('#vbox', el), ctx.params.kode || '');
  }
  A.add('/verifikasi', { title: 'Verifikasi Dokumen', render: verPage });
  A.add('/verifikasi/:kode', { title: 'Verifikasi Dokumen', render: verPage });

  // ---------- Masuk ----------
  function authFrame(el, inner) {
    var d = A.desa || {};
    el.innerHTML = '<div class="auth"><div class="l"><a href="#/" class="row gap8" style="color:#fff"><div class="brand" style="padding:0;border:0"><div class="lg">' + ico('bld', 'l') + '</div><div><b>SIPAKDES</b><span>' + esc(d.nama_desa || 'Pemerintah Desa') + '</span></div></div></a><div style="margin-top:auto"><h1>Portal Pelayanan Desa Digital</h1><p style="color:#CBD5E1;margin-top:12px;max-width:44ch" class="hide-m">Ajukan surat, pantau statusnya, lihat data keluarga, dan terima pengumuman desa — kapan saja, dari ponsel Anda.</p></div><div class="xs hide-m" style="color:#94A3B8">' + esc(d.alamat || '') + '</div></div><div class="r"><div class="fm">' + inner + '</div></div></div>';
  }
  A.add('/masuk', {
    guest: true, title: 'Masuk', render: function (el, ctx) {
      API.warm('pub'); var mode = 'warga', next = ctx.qs.next || '', step = 'pw', otpNik = '';
      if (!A.desa) API.get('pub.boot', {}).then(function (d) { A.desa = d.desa; }, function () { });
      function view() {
        var warga = mode === 'warga';
        var body = '<div><h2 style="font-size:22px">Masuk ke Portal</h2><p class="mut mt8 sm">Gunakan akun Anda untuk melanjutkan.</p></div><div class="seg" role="tablist"><button class="' + (warga ? 'on' : '') + '" data-mode="warga" role="tab">Warga</button><button class="' + (warga ? '' : 'on') + '" data-mode="staf" role="tab">Aparatur Desa</button></div>';
        if (step === 'otp') {
          body += '<form id="fo" class="col"><p class="sm mut">Kami mengirim kode 6 digit ke email/WhatsApp yang terdaftar untuk NIK <b>' + esc(U.mask(otpNik, 4)) + '</b>. Berlaku 5 menit.</p><div class="otp" id="otp">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<input inputmode="numeric" maxlength="1" aria-label="Digit ' + (i + 1) + '" autocomplete="' + (i ? 'off' : 'one-time-code') + '">'; }).join('') + '</div><button class="btn pri lg blk" type="submit">Verifikasi & Masuk</button><button class="btn ghost blk" type="button" id="back">← Kembali</button></form>';
        } else {
          body += '<form id="fl" class="col"><div class="fld"><label>' + (warga ? 'NIK (16 digit)' : 'Nama pengguna') + '</label><div class="ig">' + ico(warga ? 'user' : 'users') + '<input class="inp" name="username" ' + (warga ? 'inputmode="numeric" maxlength="16" placeholder="3201xxxxxxxxxxxx"' : 'placeholder="mis. admin.desa"') + ' autocomplete="username" required></div></div><div class="fld"><label>Kata sandi</label><div class="ig">' + ico('lock') + '<input class="inp" name="password" type="password" autocomplete="current-password" required></div></div><button class="btn pri lg blk" type="submit">Masuk</button>' +
            (warga ? '<button class="btn blk" type="button" id="toOtp">Masuk dengan kode OTP</button><p class="c sm mut">Belum punya akun? <a class="b" href="#/daftar">Registrasi Akun Warga</a></p>' : '<p class="c sm mut">Lupa kata sandi? Hubungi Admin Desa untuk reset.</p>') + '</form>';
        }
        authFrame(el, body); bind();
      }
      function bind() {
        U.$$('[data-mode]', el).forEach(function (b) { b.onclick = function () { mode = b.dataset.mode; step = 'pw'; view(); }; });
        var fl = $('#fl', el), fo = $('#fo', el);
        if (fl) { fl.username.focus(); fl.onsubmit = function (e) { e.preventDefault(); var btn = fl.querySelector('[type=submit]'); U.busy(btn, function () { return API.call('auth.login', { username: fl.username.value.trim(), password: fl.password.value, mode: mode }).then(function (r) { A.login(r.data, next); }); }); }; }
        var t = $('#toOtp', el); if (t) t.onclick = function () { var v = (fl.username.value || '').replace(/\D/g, ''); if (v.length !== 16) { U.toast('Isi NIK 16 digit terlebih dahulu.', 'er'); fl.username.focus(); return; } U.busy(t, function () { return API.call('auth.otpRequest', { nik: v }).then(function (r) { otpNik = v; step = 'otp'; U.toast(r.message || 'Kode OTP dikirim.', 'ok', 5000); view(); }); }); };
        if (fo) {
          var ins = U.$$('#otp input', el); ins[0].focus();
          ins.forEach(function (i, k) { i.oninput = function () { i.value = i.value.replace(/\D/g, '').slice(0, 1); if (i.value && ins[k + 1]) ins[k + 1].focus(); }; i.onkeydown = function (e) { if (e.key === 'Backspace' && !i.value && ins[k - 1]) ins[k - 1].focus(); }; i.onpaste = function (e) { var s = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (s.length > 1) { e.preventDefault(); s.split('').forEach(function (c, j) { if (ins[j]) ins[j].value = c; }); ins[Math.min(5, s.length)].focus(); } }; });
          $('#back', el).onclick = function () { step = 'pw'; view(); };
          fo.onsubmit = function (e) { e.preventDefault(); var kode = ins.map(function (x) { return x.value; }).join(''); if (kode.length !== 6) { U.toast('Masukkan 6 digit kode OTP.', 'er'); return; } U.busy(fo.querySelector('[type=submit]'), function () { return API.call('auth.otpVerify', { nik: otpNik, kode: kode }).then(function (r) { A.login(r.data, next); }); }); };
        }
      }
      view();
    }
  });

  // ---------- Registrasi ----------
  A.add('/daftar', {
    guest: true, title: 'Registrasi Akun Warga', render: function (el) {
      authFrame(el, '<div><h2 style="font-size:22px">Registrasi Akun Warga</h2><p class="mut mt8 sm">Aktivasi akun memakai data yang sudah tercatat di desa. Jika data tidak cocok, hubungi kantor desa.</p></div><form id="fr" class="col">' +
        U.field('NIK', U.inp('nik', '', { mode: 'numeric', max: 16, req: 1 }), { req: 1 }) + U.field('Nomor Kartu Keluarga', U.inp('no_kk', '', { mode: 'numeric', max: 16, req: 1 }), { req: 1 }) + U.field('Tanggal lahir', U.inp('tgl_lahir', '', { type: 'date', req: 1 }), { req: 1 }) +
        '<div class="frm">' + U.field('No. HP / WhatsApp', U.inp('no_hp', '', { mode: 'tel', ph: '08xxxxxxxxxx' })) + U.field('Email', U.inp('email', '', { type: 'email' })) + '</div><p class="xs mut" style="margin-top:-6px">Isi minimal salah satu untuk menerima kode OTP.</p>' +
        U.field('Buat kata sandi', U.inp('password', '', { type: 'password', req: 1, ac: 'new-password' }), { req: 1, hint: 'Minimal 8 karakter, kombinasi huruf dan angka.' }) +
        '<button class="btn pri lg blk" type="submit">Aktifkan Akun</button><p class="c sm mut">Sudah punya akun? <a class="b" href="#/masuk">Masuk</a></p></form>');
      var f = $('#fr', el);
      f.onsubmit = function (e) { e.preventDefault(); var o = U.formObj(f); if (!o.no_hp && !o.email) { U.toast('Isi nomor HP atau email.', 'er'); return; } U.busy(f.querySelector('[type=submit]'), function () { return API.call('auth.register', o).then(function (r) { U.ok(r.message || 'Akun aktif.'); A.login(r.data); }); }); };
    }
  });

  // ---------- Akses darurat (tidak ditautkan dari mana pun) ----------
  A.add('/darurat', {
    guest: true, title: 'Akses Darurat', render: function (el) {
      authFrame(el, '<div><h2 style="font-size:22px">Akses Darurat Administrator</h2><div class="note wa mt8">' + ico('alert') + '<div>Hanya untuk pemulihan bila akun admin terkunci. Percobaan gagal dikunci dan dicatat. Segera ganti sandi darurat di Pengaturan setelah masuk.</div></div></div><form id="fd" class="col">' + U.field('Nama pengguna', U.inp('username', '', { req: 1, ac: 'off' })) + U.field('Kata sandi darurat', U.inp('password', '', { type: 'password', req: 1, ac: 'off' })) + '<button class="btn pri lg blk" type="submit">Masuk</button><a class="btn ghost blk" href="#/masuk">← Kembali</a></form>');
      var f = $('#fd', el); f.onsubmit = function (e) { e.preventDefault(); U.busy(f.querySelector('[type=submit]'), function () { return API.call('auth.darurat', { username: f.username.value.trim(), password: f.password.value }).then(function (r) { A.login(r.data, '/a/pengaturan'); }); }); };
    }
  });
  A.add('/404', { title: 'Tidak ditemukan', render: function (el) { pubPage(el, '', A.desa, '<div class="wrap" style="padding:80px 20px;text-align:center"><h1>Halaman tidak ditemukan</h1><p class="mut mt8">Alamat yang Anda tuju tidak tersedia.</p><a class="btn pri mt16" href="#/">Kembali ke Beranda</a></div>'); } });
  w.PubUI = { pubPage: pubPage };
})(window);
