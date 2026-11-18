/* Panel admin (3): pengumuman, laporan, impor & migrasi, pengguna, log, pengaturan, profil. */
(function (w) {
  'use strict';
  var U = w.UI, A = w.App, esc = U.esc, ico = U.ico, $ = U.$;
  var ST = ['admin', 'sekdes', 'kades', 'rt'], OPS = ['admin', 'sekdes'], ADM = ['admin'];

  // ================= PENGUMUMAN =================
  A.add('/a/pengumuman', {
    auth: 1, roles: OPS, menu: 'pengumuman', title: 'Pengumuman', prefetch: function () { API.prefetch('pengumuman.list', {}); },
    render: function (el) {
      el.innerHTML = '<div class="ph"><div><h1>Pengumuman Desa</h1><p>Tampil di beranda publik dan portal warga.</p></div><button class="btn pri" id="add">' + ico('plus', 's') + ' Buat Pengumuman</button></div><div class="card p0" id="gr">' + U.skel('l', 5) + '</div>';
      function load() {
        A.V($('#gr', el), 'pengumuman.list', {}, function (d) {
          U.grid($('#gr', el), { rows: d.rows, size: 15, empty: 'Belum ada pengumuman', cols: [{ k: 'tgl_terbit', l: 'Terbit', sort: 1, f: function (r) { return U.tgl(r.tgl_terbit); } }, { k: 'judul', l: 'Judul', f: function (r) { return (r.penting === 'Ya' ? '<span class="bdg er">Penting</span> ' : '') + '<b>' + esc(r.judul) + '</b><div class="xs mut">' + esc((r.isi || '').slice(0, 90)) + '…</div>'; } }, { k: 'kategori', l: 'Kategori' }, { k: 'tgl_berakhir', l: 'Berakhir', f: function (r) { return r.tgl_berakhir ? U.tgl(r.tgl_berakhir) : '–'; } }, { k: 'status', l: 'Status', f: function (r) { return U.badge(r.status === 'Terbit' ? 'Aktif' : 'Draft', r.status); } }], onRow: function (r) { form(r); } });
        }, { fresh: 10 });
      }
      function form(r) {
        r = r || {}; var today = new Date().toISOString().slice(0, 10);
        var m = U.modal({ title: r.id ? 'Ubah Pengumuman' : 'Pengumuman Baru', size: 'w', body: '<form id="f" class="frm">' + U.field('Judul', U.inp('judul', r.judul, { req: 1, max: 150 }), { req: 1, cls: 'full' }) + U.field('Isi pengumuman', '<textarea class="inp" name="isi" rows="6" required maxlength="4000">' + esc(r.isi || '') + '</textarea>', { req: 1, cls: 'full' }) + U.field('Kategori', U.sel('kategori', ['Umum', 'Layanan', 'Kegiatan', 'Kesehatan', 'Bantuan Sosial', 'Darurat'], r.kategori || 'Umum')) + U.field('Status', U.sel('status', ['Terbit', 'Draft'], r.status || 'Terbit')) + U.field('Tanggal terbit', U.inp('tgl_terbit', r.tgl_terbit || today, { type: 'date' })) + U.field('Tanggal berakhir', U.inp('tgl_berakhir', r.tgl_berakhir, { type: 'date' }), { hint: 'Kosongkan bila tidak ada batas.' }) + '<label class="chk full"><input type="checkbox" name="penting"' + (r.penting === 'Ya' ? ' checked' : '') + '> Tandai sebagai penting</label></form>', footer: (r.id ? '<button class="btn dan" id="del" style="margin-right:auto">Hapus</button>' : '') + '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Simpan</button>' });
        m.$('#ok').onclick = function () { var f = m.$('#f'); if (!f.reportValidity()) return; var o = U.formObj(f); if (r.id) o.id = r.id; U.busy(m.$('#ok'), function () { return API.write('pengumuman.save', o).then(function (x) { m.close(); U.ok(x.message); load(); }); }); };
        var del = m.$('#del'); if (del) del.onclick = function () { U.confirm('Hapus pengumuman ini?', { danger: 1, ok: 'Hapus' }).then(function (y) { if (y) U.busy(del, function () { return API.write('pengumuman.hapus', { id: r.id }).then(function () { m.close(); U.ok('Dihapus.'); load(); }); }); }); };
      }
      $('#add', el).onclick = function () { form(); };
      load();
    }
  });

  // ================= LAPORAN =================
  var LAP = { penduduk: 'Daftar Penduduk', kk: 'Daftar Kartu Keluarga', mutasi: 'Mutasi Penduduk', surat: 'Layanan Surat', bansos: 'Penerima Bansos', penyaluran: 'Penyaluran Bantuan' };
  A.add('/a/laporan', {
    auth: 1, roles: ST, menu: 'laporan', title: 'Laporan', prefetch: null,
    render: function (el, ctx) {
      var res = null, role = ctx.user.role, kena = ['mutasi', 'surat', 'penyaluran'];
      el.innerHTML = '<div class="ph"><div><h1>Laporan & Ekspor Data</h1><p>Hasilkan laporan untuk rapat, pelaporan kecamatan, atau arsip. Data pribadi — jaga kerahasiaan berkas yang diunduh.</p></div></div><div class="card p"><form id="f" class="frm">' + U.field('Jenis laporan', U.sel('tipe', Object.keys(LAP).filter(function (k) { return role !== 'rt' || ['penduduk', 'kk', 'mutasi', 'surat'].indexOf(k) >= 0; }).map(function (k) { return [k, LAP[k]]; }), 'penduduk')) + U.field('Dusun', U.inp('dusun', '')) + U.field('RT', U.inp('rt', '', { mode: 'numeric', max: 3 })) + U.field('RW', U.inp('rw', '', { mode: 'numeric', max: 3 })) + '<div id="tg" class="full frm" style="display:none;grid-template-columns:1fr 1fr">' + U.field('Dari tanggal', U.inp('dari', '', { type: 'date' })) + U.field('Sampai tanggal', U.inp('sampai', '', { type: 'date' })) + '</div><div class="full"><button class="btn pri" type="submit">' + ico('chart', 's') + ' Tampilkan Laporan</button></div></form></div><div id="out" class="mt16"></div>';
      var f = $('#f', el); f.tipe.onchange = function () { $('#tg', el).style.display = kena.indexOf(f.tipe.value) >= 0 ? 'grid' : 'none'; }; f.tipe.onchange();
      f.onsubmit = function (e) {
        e.preventDefault(); var o = U.formObj(f); Object.keys(o).forEach(function (k) { if (!o[k]) delete o[k]; });
        U.busy(f.querySelector('[type=submit]'), function () { return API.call('laporan.run', o).then(function (r) { res = r.data; show(); }); });
      };
      function show() {
        var d = res; $('#out', el).innerHTML = '<div class="card p0"><div class="card-h"><div><h2>' + esc(d.judul) + '</h2><div class="xs mut">' + U.num(d.total) + ' baris' + (d.dipotong ? ' (ditampilkan 5.000 pertama — persempit filter)' : '') + ' · dibuat ' + U.tglJam(d.dibuat) + ' oleh ' + esc(d.oleh) + '</div></div><div class="row gap8"><button class="btn" id="csv">' + ico('download', 's') + ' CSV</button><button class="btn" id="prt">' + ico('print', 's') + ' Cetak</button></div></div><div id="g"></div></div>';
        U.grid($('#g', el), { rows: d.rows, size: 25, cols: d.cols.map(function (c, i) { return { k: 'c' + i, l: c.l, v: function (r) { return r[i]; }, sort: 1, f: function (r) { return esc(r[i]); } }; }) });
        $('#csv', el).onclick = function () { U.download('laporan-' + f.tipe.value + '.csv', U.toCSV(d.cols.map(function (c) { return c.l; }), d.rows), 'text/csv;charset=utf-8'); U.ok('Berkas diunduh. Jaga kerahasiaannya.'); };
        $('#prt', el).onclick = function () { var desa = A.desa || {}; U.printHtml('<div style="padding:14mm;font-family:Arial,sans-serif;font-size:10pt"><h2 style="margin:0">' + esc(d.judul) + '</h2><div style="margin-bottom:8px">Pemerintah Desa ' + esc(desa.nama_desa || '') + ' · ' + U.tglJam(d.dibuat) + '</div><table style="width:100%;border-collapse:collapse"><thead><tr>' + d.cols.map(function (c) { return '<th style="border:1px solid #888;padding:3px 5px;background:#eee;text-align:left;font-size:9pt">' + esc(c.l) + '</th>'; }).join('') + '</tr></thead><tbody>' + d.rows.map(function (r) { return '<tr>' + r.map(function (v) { return '<td style="border:1px solid #bbb;padding:3px 5px;font-size:9pt">' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'); };
      }
    }
  });

  // ================= IMPOR & MIGRASI =================
  var ALIAS = {
    nik: ['nik', 'no nik', 'nomor induk kependudukan', 'nomor nik'], no_kk: ['no kk', 'nomor kk', 'no kartu keluarga', 'nomor kartu keluarga', 'kk', 'no_kk'], nama: ['nama', 'nama lengkap', 'nama penduduk'],
    tempat_lahir: ['tempat lahir', 'tmp lahir', 'tempat_lahir', 'tempat'], tgl_lahir: ['tanggal lahir', 'tgl lahir', 'tgl_lahir', 'tanggal_lahir'], jk: ['jk', 'jenis kelamin', 'jenis_kelamin', 'l p', 'sex', 'gender'],
    status_kawin: ['status perkawinan', 'status kawin', 'status_kawin', 'perkawinan'], agama: ['agama'], pendidikan: ['pendidikan', 'pendidikan terakhir'], pekerjaan: ['pekerjaan', 'jenis pekerjaan'], gol_darah: ['golongan darah', 'gol darah', 'gol_darah'],
    hubungan: ['hubungan', 'status hubungan dalam keluarga', 'shdk', 'hubungan keluarga', 'status dalam keluarga'], alamat: ['alamat', 'alamat lengkap'], rt: ['rt'], rw: ['rw'], dusun: ['dusun', 'dukuh', 'kampung'],
    no_hp: ['no hp', 'hp', 'telepon', 'no telepon', 'no wa', 'whatsapp', 'no handphone'], email: ['email', 'e mail'], status_kependudukan: ['status kependudukan', 'status penduduk']
  };
  var FLAB = { nik: 'NIK', no_kk: 'No. KK', nama: 'Nama', tempat_lahir: 'Tempat lahir', tgl_lahir: 'Tgl lahir', jk: 'Jenis kelamin', status_kawin: 'Status kawin', agama: 'Agama', pendidikan: 'Pendidikan', pekerjaan: 'Pekerjaan', gol_darah: 'Gol. darah', hubungan: 'Hubungan', alamat: 'Alamat', rt: 'RT', rw: 'RW', dusun: 'Dusun', no_hp: 'No. HP', email: 'Email', status_kependudukan: 'Status penduduk' };
  function nh(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function autoMap(headers) { var map = {}, used = {}; Object.keys(ALIAS).forEach(function (f) { for (var i = 0; i < headers.length; i++) { if (used[i]) continue; if (ALIAS[f].indexOf(nh(headers[i])) >= 0) { map[f] = headers[i]; used[i] = 1; break; } } }); return map; }
  function mapUi(headers, map, prefix) { return '<div class="frm" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">' + Object.keys(FLAB).map(function (f) { return '<div class="fld"><label' + (f === 'nik' || f === 'nama' ? ' class="req"' : '') + '>' + FLAB[f] + '</label><select class="inp" data-map="' + f + '"><option value="">— tidak diimpor —</option>' + headers.map(function (h) { return '<option value="' + esc(h) + '"' + (map[f] === h ? ' selected' : '') + '>' + esc(h) + '</option>'; }).join('') + '</select></div>'; }).join('') + '</div>'; }
  function readMap(root) { var m = {}; U.$$('[data-map]', root).forEach(function (s) { if (s.value) m[s.dataset.map] = s.value; }); return m; }
  function reportHtml(r) {
    return '<div class="grid g4"><div class="card p"><div class="xs mut">Baris dibaca</div><b style="font-size:22px">' + U.num(r.total) + '</b></div><div class="card p"><div class="xs mut">Akan ditambah</div><b style="font-size:22px;color:var(--ok-tx)">' + U.num(r.inserted) + '</b></div><div class="card p"><div class="xs mut">Diperbarui</div><b style="font-size:22px;color:var(--in)">' + U.num(r.updated) + '</b></div><div class="card p"><div class="xs mut">Dilewati / galat</div><b style="font-size:22px;color:var(--wa-tx)">' + U.num(r.skipped) + ' / ' + U.num(r.galat) + '</b></div></div>' + (r.errors && r.errors.length ? '<div class="note er mt16">' + ico('alert') + '<div><b>Baris bermasalah (' + r.galat + ')</b><ul style="margin:6px 0 0 18px">' + r.errors.slice(0, 15).map(function (e) { return '<li>Baris ' + esc(e.baris) + ': ' + esc(e.pesan) + '</li>'; }).join('') + '</ul></div></div>' : '');
  }
  A.add('/a/impor', {
    auth: 1, roles: ADM, menu: 'impor', title: 'Impor & Migrasi Data', prefetch: null,
    render: function (el) {
      var tab = 'file', st = { headers: [], rows: [], map: {} };
      el.innerHTML = '<div class="ph"><div><h1>Impor & Migrasi Data</h1><p>Pindahkan data penduduk dari berkas atau spreadsheet lama. Aman diulang — NIK yang sama diperbarui, bukan digandakan.</p></div></div><div class="card p0"><div class="tabs" id="tb"><button class="tab" data-t="file">Dari berkas CSV / Excel</button><button class="tab" data-t="sheet">Dari Spreadsheet lama</button><button class="tab" data-t="cutover">Panduan cutover</button></div><div class="p" id="pn"></div></div>';
      function show() { U.$$('.tab', el).forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); }); ({ file: tFile, sheet: tSheet, cutover: tCut })[tab](); }
      $('#tb', el).onclick = function (e) { var b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; show(); } };
      var pn = $('#pn', el);
      function tFile() {
        pn.innerHTML = '<div class="note">' + ico('info') + '<div>Format: baris pertama = nama kolom. Kolom wajib: <b>NIK, Nama</b>. Untuk KK baru sertakan <b>Alamat, RT, RW</b>. <b>NIK & No. KK harus berformat teks</b> agar 16 digit tidak terpotong.</div></div><div class="row w gap8 mt16"><label class="btn pri" for="fl" style="cursor:pointer">' + ico('upload', 's') + ' Pilih berkas…</label><input type="file" id="fl" accept=".csv,.txt,.xlsx" hidden><button class="btn" id="tpl">' + ico('download', 's') + ' Unduh templat CSV</button><span class="sm mut" id="fn"></span></div><div id="mp" class="mt16"></div><div id="rs" class="mt16"></div>';
        $('#tpl', pn).onclick = function () { U.download('templat-penduduk.csv', U.toCSV(['NIK', 'No KK', 'Nama', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Hubungan', 'Agama', 'Status Perkawinan', 'Pendidikan', 'Pekerjaan', 'Alamat', 'RT', 'RW', 'Dusun'], [['3201000000000001', '3201000000000100', 'Contoh Nama', 'L', 'Bogor', '1985-04-17', 'Kepala Keluarga', 'Islam', 'Kawin', 'SMA/Sederajat', 'Petani', 'Jl. Contoh No. 1', '01', '02', 'Mawar']]), 'text/csv;charset=utf-8'); };
        $('#fl', pn).onchange = function (e) {
          var f = e.target.files[0]; if (!f) return; $('#fn', pn).textContent = f.name + ' (' + Math.round(f.size / 1024) + ' KB)';
          var isX = /\.xlsx$/i.test(f.name), rd = new FileReader();
          rd.onload = function () { Promise.resolve(isX ? U.readXlsx(rd.result) : U.parseCSV(rd.result)).then(function (t) { if (!t || t.length < 2) { U.toast('Berkas kosong atau tidak terbaca.', 'er'); return; } st.headers = t[0].map(function (x) { return String(x).trim(); }); st.rows = t.slice(1); st.map = autoMap(st.headers); mapping(); }).catch(function (er) { U.toast((er && er.message) || 'Berkas tidak dapat dibaca. Simpan ulang sebagai CSV.', 'er'); }); };
          isX ? rd.readAsArrayBuffer(f) : rd.readAsText(f);
        };
      }
      function mapping() {
        var mp = $('#mp', pn); mp.innerHTML = '<h3>Cocokkan kolom</h3><p class="sm mut mb8">' + U.num(st.rows.length) + ' baris data terbaca. Periksa pemetaan otomatis di bawah.</p>' + mapUi(st.headers, st.map) + '<div class="row w gap8 mt16"><button class="btn" id="dry">' + ico('search', 's') + ' Pindai (uji tanpa menyimpan)</button><button class="btn pri" id="go" disabled>' + ico('upload', 's') + ' Jalankan Impor</button></div>';
        var dry = $('#dry', mp), go = $('#go', mp), rs = $('#rs', pn);
        function build() { var map = readMap(mp); return st.rows.map(function (r, i) { var o = { _baris: i + 2 }; Object.keys(map).forEach(function (f) { var ix = st.headers.indexOf(map[f]); o[f] = ix >= 0 ? r[ix] : ''; }); return o; }); }
        function run(dryRun, btn) {
          var map = readMap(mp); if (!map.nik || !map.nama) { U.toast('Kolom NIK dan Nama wajib dipetakan.', 'er'); return Promise.resolve(); }
          var all = build(), chunks = [], i; for (i = 0; i < all.length; i += 1000) chunks.push(all.slice(i, i + 1000));
          var tot = { total: 0, valid: 0, inserted: 0, updated: 0, skipped: 0, galat: 0, errors: [] };
          return chunks.reduce(function (p, ch, ci) { return p.then(function () { if (chunks.length > 1) U.toast('Memproses bagian ' + (ci + 1) + ' dari ' + chunks.length + '…'); return API.write('pend.import', { rows: ch, dryRun: dryRun }).then(function (r) { var d = r.data; ['total', 'valid', 'inserted', 'updated', 'skipped', 'galat'].forEach(function (k) { tot[k] += d[k] || 0; }); tot.errors = tot.errors.concat(d.errors || []); }); }); }, Promise.resolve()).then(function () { rs.innerHTML = '<h3 class="mb8">' + (dryRun ? 'Hasil pindai (belum ada data disimpan)' : 'Impor selesai') + '</h3>' + reportHtml(tot); if (dryRun) go.disabled = tot.valid === 0; else { U.ok('Impor selesai: ' + tot.inserted + ' ditambah, ' + tot.updated + ' diperbarui.'); API.invalidate(); go.disabled = true; } });
        }
        dry.onclick = function () { U.busy(dry, function () { return run(true, dry); }); };
        go.onclick = function () { U.confirm('Jalankan impor ke data penduduk? Anda bisa mengulangnya kapan saja — NIK yang sama hanya diperbarui.', { ok: 'Ya, impor' }).then(function (y) { if (y) U.busy(go, function () { return run(false, go); }); }); };
        mp.scrollIntoView && mp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      function tSheet() {
        pn.innerHTML = '<div class="note">' + ico('shieldc') + '<div>Spreadsheet lama hanya <b>dibaca</b>, tidak pernah diubah. Gunakan akun Google yang sama dengan pemilik spreadsheet lama. Pastikan kolom NIK/No. KK di sheet lama berformat <b>teks</b>.</div></div><div class="frm mt16">' + U.field('URL atau ID Spreadsheet lama', '<input class="inp" id="src" placeholder="https://docs.google.com/spreadsheets/d/…">', { cls: 'full' }) + '<div class="full"><button class="btn" id="sc">' + ico('search', 's') + ' Pindai Spreadsheet</button></div></div><div id="m2" class="mt16"></div>';
        $('#sc', pn).onclick = function () { var src = $('#src', pn).value.trim(); if (!src) { U.toast('Tempel URL atau ID spreadsheet lama.', 'er'); return; } U.busy($('#sc', pn), function () { return API.call('migrasi.pindai', { sumber: src }).then(function (r) { pilihSheet(src, r.data); }); }); };
      }
      function pilihSheet(src, d) {
        var m2 = $('#m2', pn); m2.innerHTML = '<h3>' + esc(d.judul) + '</h3><div class="row w gap8 mt8"><select class="inp" id="sh" style="width:auto">' + U.opts(d.sheets.map(function (s) { return [s.nama, s.nama + ' (' + U.num(s.baris) + ' baris)']; }), '', 'Pilih sheet data penduduk…') + '</select></div><div id="m3" class="mt16"></div>';
        $('#sh', m2).onchange = function (e) { var nm = e.target.value; if (!nm) return; API.call('migrasi.pindai', { sumber: src, sheet: nm }).then(function (r) { var x = r.data, m3 = $('#m3', m2); m3.innerHTML = '<p class="sm mut mb8">Pratinjau pemetaan kolom (dapat diubah):</p>' + mapUi(x.headers, x.mapping) + '<div class="row w gap8 mt16"><button class="btn" id="d1">' + ico('search', 's') + ' Pindai (uji)</button><button class="btn pri" id="g1" disabled>' + ico('upload', 's') + ' Jalankan Migrasi</button></div><div id="r1" class="mt16"></div>'; var d1 = $('#d1', m3), g1 = $('#g1', m3), r1 = $('#r1', m3);
          function run(dry, btn) { return API.write('migrasi.jalankan', { sumber: src, sheet: nm, mapping: readMap(m3), dryRun: dry }).then(function (z) { var q = z.data; r1.innerHTML = '<h3 class="mb8">' + (dry ? 'Hasil pindai (belum ada data disimpan)' : 'Migrasi selesai') + '</h3>' + reportHtml(q.laporan) + (q.peringatan.length ? '<div class="note mt16">' + ico('alert') + '<div>' + q.peringatan.map(esc).join('<br>') + '</div></div>' : ''); if (dry) g1.disabled = false; else { U.ok('Migrasi selesai.'); API.invalidate(); } }); }
          d1.onclick = function () { U.busy(d1, function () { return run(true); }); };
          g1.onclick = function () { U.confirm('Jalankan migrasi dari sheet "' + nm + '"? Dapat diulang untuk menangkap data baru (delta).', { ok: 'Ya, migrasikan' }).then(function (y) { if (y) U.busy(g1, function () { return run(false); }); }); };
        }); };
      }
      function tCut() {
        pn.innerHTML = '<h3>Langkah cutover dari aplikasi lama</h3><ol class="steps-l" style="margin:12px 0 0 20px;line-height:1.9"><li>Pasang aplikasi baru, masuk sebagai admin, buka menu ini.</li><li>Pilih <b>Spreadsheet lama</b> → <b>Pindai</b> → periksa jumlah ditambah/diperbarui/galat → <b>Jalankan Migrasi</b>.</li><li>Periksa data di <b>Data Penduduk</b>, uji satu akun warga, dan uji pengajuan satu surat.</li><li>Tepat sebelum beralih: jalankan migrasi <b>sekali lagi</b> (delta) untuk menangkap data yang masuk selama masa transisi.</li><li>Umumkan alamat aplikasi baru kepada perangkat desa dan warga.</li></ol><div class="note mt16">' + ico('info') + '<div>Sesi login lama tidak ikut pindah — pengguna cukup masuk ulang. Akun warga dibuat saat warga mendaftar dengan NIK yang sudah terdata.</div></div>';
      }
      show();
    }
  });

  // ================= PENGGUNA =================
  var RL = { admin: 'Administrator', sekdes: 'Sekretaris Desa', kades: 'Kepala Desa', rt: 'Ketua RT/RW', warga: 'Warga' };
  A.add('/a/pengguna', {
    auth: 1, roles: ADM, menu: 'pengguna', title: 'Manajemen Pengguna', prefetch: null,
    render: function (el, ctx) {
      var role = '', q = '', WIL = [];
      el.innerHTML = '<div class="ph"><div><h1>Manajemen Pengguna</h1><p>Akun perangkat desa. Akun warga dibuat sendiri lewat pendaftaran dengan NIK.</p></div><button class="btn pri" id="add">' + ico('plus', 's') + ' Tambah Pengguna</button></div><div class="card p0"><div class="toolbar"><div class="ig"><span>' + ico('search') + '</span><input class="inp" id="q" placeholder="Cari nama atau nama pengguna…"></div><select class="inp" id="fr" aria-label="Peran">' + U.opts(Object.keys(RL).map(function (k) { return [k, RL[k]]; }), '', 'Perangkat desa') + '</select></div><div id="gr">' + U.skel('l', 5) + '</div></div>';
      function load() { var d = {}; if (role) d.role = role; if (q) d.q = q; A.V($('#gr', el), 'user.list', d, function (r) {
        WIL = r.wilayah || [];
        U.grid($('#gr', el), { rows: r.rows, size: 20, empty: 'Tidak ada pengguna', cols: [{ k: 'nama', l: 'Nama', sort: 1, f: function (u) { return '<div class="row gap8"><div class="av" style="width:32px;height:32px;font-size:11px">' + esc(U.ini(u.nama)) + '</div><div><b>' + esc(u.nama) + '</b><div class="xs mut">' + esc(u.username) + '</div></div></div>'; } }, { k: 'role', l: 'Peran', f: function (u) { return esc(RL[u.role] || u.role) + (u.role === 'rt' ? '<div class="xs mut">' + (u.rw ? (u.rt ? 'RT ' + esc(u.rt) + ' / RW ' + esc(u.rw) : 'Ketua RW ' + esc(u.rw) + ' (semua RT)') : 'Wilayah belum diisi') + '</div>' + (u.cakupan_kk > 0 ? '<div class="xs mut">' + U.num(u.cakupan_kk) + ' KK · ' + U.num(u.cakupan_jiwa) + ' jiwa terlihat</div>' : '<div class="xs" style="color:var(--er-tx);font-weight:600">⚠ Tidak ada data di wilayah ini</div>') : (u.rt || u.rw ? '<div class="xs mut">RT ' + esc(u.rt || '–') + ' / RW ' + esc(u.rw || '–') + '</div>' : '')); } }, { k: 'no_hp', l: 'Kontak', f: function (u) { return esc(u.no_hp || '–') + '<div class="xs mut">' + esc(u.email || '') + '</div>'; } }, { k: 'login_terakhir', l: 'Login terakhir', f: function (u) { return u.login_terakhir ? U.tglJam(u.login_terakhir) : '–'; } }, { k: 'aktif', l: 'Status', f: function (u) { return U.badge(u.aktif === 'Tidak' ? 'Nonaktif' : 'Aktif'); } }], onRow: function (u) { form(u); } });
      }, { fresh: 5 }); }
      function form(u) {
        u = u || {};
        var m = U.modal({ title: u.id ? 'Ubah Pengguna' : 'Pengguna Baru', size: 'w', body: '<form id="f" class="frm">' + U.field('Nama lengkap', U.inp('nama', u.nama, { req: 1 }), { req: 1 }) + U.field('Nama pengguna', U.inp('username', u.username, { req: 1, ac: 'off', ph: 'mis. sekdes.budi' }), { req: 1, hint: 'Huruf kecil, angka, titik, strip (3–30).' }) + U.field('Peran', U.sel('role', Object.keys(RL).filter(function (k) { return k !== 'warga' || u.role === 'warga'; }).map(function (k) { return [k, RL[k]]; }), u.role || 'rt', null, { req: 1 }), { req: 1 }) + U.field('No. HP / WA', U.inp('no_hp', u.no_hp, { mode: 'tel' })) + U.field('Email', U.inp('email', u.email, { type: 'email' })) + U.field('RT', U.inp('rt', u.rt, { mode: 'numeric', max: 3 }), { hint: 'Ketua RT: wajib diisi. Ketua RW: kosongkan (melihat semua RT di RW-nya).' }) + U.field('RW', U.inp('rw', u.rw, { mode: 'numeric', max: 3 }), { hint: 'Wajib untuk Ketua RT/RW. Harus sama dengan RW pada data KK warga.' }) + (u.id ? '<label class="chk full"><input type="checkbox" name="aktif"' + (u.aktif !== 'Tidak' ? ' checked' : '') + '> Akun aktif</label>' : '') + '</form>' + (u.id ? '<div class="mt16"><button class="btn" id="rs">' + ico('key', 's') + ' Reset Sandi</button></div>' : ''), footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Simpan</button>' });
        if (WIL.length) {
          var seen = {}, chips = WIL.filter(function (e) { return e.rw && e.rt; }).map(function (e) { return '<button type="button" class="chip" data-rt="' + esc(e.rt) + '" data-rw="' + esc(e.rw) + '">RT ' + esc(e.rt) + ' / RW ' + esc(e.rw) + ' · ' + U.num(e.kk) + ' KK</button>'; }).join('');
          m.$('#f').insertAdjacentHTML('beforeend', '<div class="full"><div class="xs mut" style="margin-bottom:6px">Wilayah yang ada di data KK (klik untuk mengisi RT/RW — bila Ketua RW, kosongkan RT):</div><div class="chips" id="wl">' + chips + '</div></div>');
          m.$('#wl').onclick = function (e) { var b = e.target.closest('[data-rt]'); if (!b) return; var f = m.$('#f'); f.elements.rt.value = b.dataset.rt; f.elements.rw.value = b.dataset.rw; };
        }
        m.$('#ok').onclick = function () { var f = m.$('#f'); if (!f.reportValidity()) return; var o = U.formObj(f); if (u.id) { o.id = u.id; o.aktif = o.aktif === 'Ya' ? 'Ya' : 'Tidak'; } U.busy(m.$('#ok'), function () { return API.write('user.save', o).then(function (r) { m.close(); API.invalidate(); load(); if (r.data && r.data.sandiSementara) tempPass(o.username, r.data.sandiSementara); else U.ok('Pengguna disimpan.'); }); }); };
        var rs = m.$('#rs'); if (rs) rs.onclick = function () { U.confirm('Reset sandi ' + u.nama + '? Semua sesi aktifnya akan berakhir.', { ok: 'Reset sandi' }).then(function (y) { if (y) U.busy(rs, function () { return API.write('user.reset', { id: u.id }).then(function (r) { m.close(); tempPass(u.username, r.data.sandiSementara); }); }); }); };
      }
      function tempPass(uname, p) { var m = U.modal({ title: 'Sandi Sementara', sub: 'Catat sekarang — tidak akan ditampilkan lagi.', size: 'sm', sticky: true, body: '<div class="note ok">' + ico('check') + '<div>Nama pengguna: <b>' + esc(uname) + '</b></div></div><div class="mt16" style="background:#F1F5F9;border-radius:10px;padding:16px;text-align:center"><code id="pw" style="font-size:22px;letter-spacing:.08em;font-weight:700">' + esc(p) + '</code></div><p class="sm mut mt16">Pengguna wajib mengganti sandi saat login pertama.</p>', footer: '<button class="btn" id="cp">' + ico('copy', 's') + ' Salin</button><button class="btn pri" data-x>Sudah dicatat</button>' }); m.$('#cp').onclick = function () { U.copy(p); U.ok('Disalin.'); }; }
      $('#add', el).onclick = function () { form(); };
      $('#q', el).oninput = U.debounce(function (e) { q = e.target.value; load(); }, 250); $('#fr', el).onchange = function (e) { role = e.target.value; load(); };
      load();
    }
  });

  // ================= LOG AKTIVITAS =================
  A.add('/a/log', {
    auth: 1, roles: ['admin', 'kades'], menu: 'log', title: 'Log Aktivitas', prefetch: null,
    render: function (el) {
      var q = '';
      el.innerHTML = '<div class="ph"><div><h1>Log Aktivitas</h1><p>Jejak audit setiap perubahan data. Data sensitif tidak pernah dicatat.</p></div></div><div class="card p0"><div class="toolbar"><div class="ig"><span>' + ico('search') + '</span><input class="inp" id="q" placeholder="Cari pengguna, aksi, atau ID data…"></div></div><div id="gr">' + U.skel('l', 6) + '</div></div>';
      function load() { A.V($('#gr', el), 'log.list', q ? { q: q } : {}, function (d) { U.grid($('#gr', el), { rows: d.rows, size: 25, empty: 'Belum ada aktivitas', cols: [{ k: 'waktu', l: 'Waktu', f: function (r) { return U.tglJam(r.waktu); } }, { k: 'pengguna', l: 'Pengguna', f: function (r) { return '<b>' + esc(r.pengguna) + '</b><div class="xs mut">' + esc(r.peran) + '</div>'; } }, { k: 'aksi', l: 'Aksi', f: function (r) { return '<span class="bdg">' + esc(r.aksi) + '</span>'; } }, { k: 'sheet', l: 'Data', f: function (r) { return esc(r.sheet) + '<div class="xs mut tnum">' + esc(r.id_data) + '</div>'; } }, { k: 'nilai_sesudah', l: 'Perubahan', f: function (r) { return '<span class="xs mut">' + esc((r.nilai_sesudah || '').slice(0, 100)) + '</span>'; } }] }); }, { fresh: 5 }); }
      $('#q', el).oninput = U.debounce(function (e) { q = e.target.value; load(); }, 300); load();
    }
  });


  /** Perkecil logo di perangkat agar muat di database (≤ ~38 KB). Mengembalikan data URL. */
  function logoDariFile(file) {
    return new Promise(function (res, rej) {
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return rej(new Error('Gunakan gambar PNG, JPG, atau WebP.'));
      if (file.size > 8 * 1024 * 1024) return rej(new Error('Berkas terlalu besar (maks. 8 MB).'));
      var url = URL.createObjectURL(file), img = new Image();
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Gambar tidak dapat dibaca.')); };
      img.onload = function () {
        URL.revokeObjectURL(url);
        var tries = [[256, 'image/png'], [200, 'image/png'], [160, 'image/png'], [256, 'image/webp'], [200, 'image/webp'], [160, 'image/jpeg'], [128, 'image/jpeg'], [96, 'image/jpeg']];
        for (var i = 0; i < tries.length; i++) {
          var mx = tries[i][0], r = Math.min(1, mx / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * r)); c.height = Math.max(1, Math.round(img.height * r));
          var g = c.getContext('2d'); if (tries[i][1] === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); } g.drawImage(img, 0, 0, c.width, c.height);
          var out = c.toDataURL(tries[i][1], 0.88); if (out.indexOf('data:' + tries[i][1]) === 0 && out.length <= 38000) return res(out);
        }
        rej(new Error('Gambar terlalu rumit untuk dijadikan logo kecil. Gunakan logo yang lebih sederhana.'));
      };
      img.src = url;
    });
  }

  // ================= PENGATURAN =================
  var SG = [['Identitas Desa', ['nama_desa', 'kecamatan', 'kabupaten', 'provinsi', 'alamat', 'telepon', 'whatsapp', 'email_kantor', 'tagline']], ['Pejabat & Layanan', ['kepala_desa', 'nip_kades', 'sekdes', 'jam_layanan', 'jam_istirahat', 'hotline_darurat']], ['Surat', ['format_nomor']], ['Bantuan Sosial', ['program_bansos']], ['Notifikasi', ['notif_email_aktif', 'notif_wa_aktif']], ['Alamat Aplikasi', ['url_frontend']]];
  var SL = { nama_desa: 'Nama desa', kecamatan: 'Kecamatan', kabupaten: 'Kabupaten', provinsi: 'Provinsi', alamat: 'Alamat kantor', telepon: 'Telepon', whatsapp: 'WhatsApp', email_kantor: 'Email kantor', tagline: 'Tagline', kepala_desa: 'Nama Kepala Desa', nip_kades: 'NIP/NIAP Kepala Desa', sekdes: 'Nama Sekretaris Desa', jam_layanan: 'Jam layanan', jam_istirahat: 'Jam istirahat', hotline_darurat: 'Hotline darurat', format_nomor: 'Format nomor surat', program_bansos: 'Program bantuan (pisah koma)', notif_email_aktif: 'Notifikasi email', notif_wa_aktif: 'Notifikasi WhatsApp', url_frontend: 'URL situs frontend (https://…)' };
  A.add('/a/pengaturan', {
    auth: 1, roles: ADM, menu: 'pengaturan', title: 'Pengaturan', prefetch: null,
    render: function (el) {
      var tab = 'umum';
      el.innerHTML = '<div class="ph"><div><h1>Pengaturan</h1><p>Identitas desa, integrasi, keamanan, dan templat surat.</p></div></div><div class="card p0"><div class="tabs" id="tb"><button class="tab" data-t="umum">Umum</button><button class="tab" data-t="integrasi">Integrasi & Keamanan</button><button class="tab" data-t="jenis">Jenis Surat</button><button class="tab" data-t="sistem">Status Sistem</button></div><div class="p" id="pn"></div></div>';
      var pn = $('#pn', el);
      function show() { U.$$('.tab', el).forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); }); pn.innerHTML = U.skel('l', 6); ({ umum: tUmum, integrasi: tInt, jenis: tJenis, sistem: tSis })[tab](); }
      $('#tb', el).onclick = function (e) { var b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; show(); } };
      function tUmum() {
        A.V(pn, 'set.get', {}, function (d) {
          var s = d.settings; pn.innerHTML = '<h3 class="mb8 mt8">Logo Desa</h3><div class="card p" style="box-shadow:none"><div class="row w" style="gap:20px;align-items:center"><div id="lgp" style="width:96px;height:96px;border:1px dashed var(--bd);border-radius:12px;display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden">' + (s.logo ? '<img src="' + s.logo + '" alt="Logo desa" style="max-width:100%;max-height:100%">' : '<span class="xs mut">Belum ada</span>') + '</div><div class="grow"><p class="sm mut">Tampil di menu samping, halaman masuk, beranda publik, dan kop surat. Format PNG/JPG/WebP — latar transparan (PNG) paling baik. Gambar diperkecil otomatis di perangkat Anda.</p><div class="row w gap8 mt8"><label class="btn" for="lgf" style="cursor:pointer">' + ico('upload', 's') + ' Pilih gambar…</label><input type="file" id="lgf" accept="image/png,image/jpeg,image/webp" hidden><button class="btn pri" id="lgs" disabled>Simpan Logo</button>' + (s.logo ? '<button class="btn dan" id="lgd">Hapus Logo</button>' : '') + '</div></div></div></div><form id="f">' + SG.map(function (g) { return '<h3 class="mt16 mb8">' + g[0] + '</h3><div class="frm">' + g[1].map(function (k) { return k.indexOf('notif_') === 0 ? U.field(SL[k], U.sel(k, ['Ya', 'Tidak'], s[k])) : U.field(SL[k], U.inp(k, s[k]), { cls: ['alamat', 'tagline', 'program_bansos', 'url_frontend', 'format_nomor'].indexOf(k) >= 0 ? 'full' : '', hint: k === 'format_nomor' ? 'Token: {klas} {urut} {tahun} {bulan} {kode}' : k === 'url_frontend' ? 'Dipakai pada tautan verifikasi QR di surat.' : '' }); }).join('') + '</div>'; }).join('') + '<div class="mt24"><button class="btn pri" type="submit">Simpan Pengaturan</button></div></form>';
          var pend = '';
          function simpanLogo(val, btn, msg) {
            return U.busy(btn, function () {
              return API.write('set.save', { values: { logo: val } }).then(function (r) {
                var dd = r.data || {};
                if (dd.logo === undefined || dd.n < 1) throw new Error('Server belum mendukung fitur logo — backend (Kode.gs) masih versi lama. Tempel Kode.gs terbaru, lalu Terapkan → Kelola penerapan → Versi baru.');
                if (dd.logo === false) throw new Error('Logo gagal tersimpan di database. Coba gambar yang lebih kecil/sederhana.');
                return API.call('set.get', {});
              }).then(function (r2) {
                if ((r2.data.settings.logo || '') !== val) throw new Error('Logo tidak tersimpan permanen di server. Pastikan penerapan Aplikasi Web memakai versi terbaru (Kelola penerapan → Versi baru).');
                A.desa = A.desa || {}; A.desa.logo = val; if (API.S) { API.S.desa = A.desa; API.save && API.save(); }
                API.clearCache(); A.refreshBrand && A.refreshBrand(); U.ok(msg); tUmum();
              });
            });
          }
          $('#lgf', pn).onchange = function (e) { var f = e.target.files[0]; if (!f) return; logoDariFile(f).then(function (url) { pend = url; $('#lgp', pn).innerHTML = '<img src="' + url + '" alt="Pratinjau logo" style="max-width:100%;max-height:100%">'; $('#lgs', pn).disabled = false; }, function (er) { U.toast(er.message, 'er'); }); };
          $('#lgs', pn).onclick = function () { if (pend) simpanLogo(pend, this, 'Logo desa diperbarui.'); };
          var ld = $('#lgd', pn); if (ld) ld.onclick = function () { var b = this; U.confirm('Hapus logo desa?', { danger: 1, ok: 'Hapus' }).then(function (y) { if (y) simpanLogo('', b, 'Logo dihapus.'); }); };
          $('#f', pn).onsubmit = function (e) { e.preventDefault(); U.busy($('[type=submit]', pn), function () { return API.write('set.save', { values: U.formObj($('#f', pn)) }).then(function () { U.ok('Pengaturan disimpan.'); }); }); };
        }, { fresh: 5 });
      }
      function tInt() {
        API.call('rahasia.status', {}).then(function (r) {
          var f = r.data.FONNTE_TOKEN || {};
          pn.innerHTML = '<h3>Token WhatsApp (Fonnte)</h3><p class="sm mut mt8">Disimpan aman di server (Script Properties) — tidak pernah ditampilkan kembali, hanya versi tersamar. Dipakai untuk notifikasi WA ke warga.</p><div class="row w gap8 mt16"><span class="bdg ' + (f.ada ? 'ok' : '') + '">' + (f.ada ? 'Terpasang: ' + esc(f.samar) : 'Belum diisi') + '</span></div><form id="ft" class="frm mt16" autocomplete="off">' + U.field('Token baru', '<input class="inp" name="nilai" type="password" autocomplete="new-password" placeholder="' + (f.ada ? 'Kosongkan bila tidak diubah' : 'Tempel token Fonnte') + '">', { cls: 'full' }) + '<div class="full row gap8"><button class="btn pri" type="submit">Simpan Token</button>' + (f.ada ? '<button class="btn dan" type="button" id="hp">Hapus Token</button>' : '') + '</div></form><hr style="border:0;border-top:1px solid var(--line);margin:28px 0"><h3>Akses Darurat</h3><p class="sm mut mt8">Akun cadangan bila akun Google/sandi biasa bermasalah. Ganti sandi secara berkala; sandi lama langsung tidak berlaku.</p><form id="fd" class="frm mt16" autocomplete="off">' + U.field('Sandi darurat baru', '<input class="inp" name="baru" type="password" autocomplete="new-password" minlength="12" required>', { hint: 'Minimal 12 karakter, huruf dan angka.', cls: 'full' }) + '<div class="full"><button class="btn" type="submit">Rotasi Sandi Darurat</button></div></form>';
          $('#ft', pn).onsubmit = function (e) { e.preventDefault(); var v = this.nilai.value.trim(); if (!v) { U.toast('Isi token baru.', 'er'); return; } var fm = this; U.busy($('[type=submit]', fm), function () { return API.call('rahasia.simpan', { kunci: 'FONNTE_TOKEN', nilai: v }).then(function () { fm.nilai.value = ''; U.ok('Token tersimpan.'); tInt(); }); }); };
          var hp = $('#hp', pn); if (hp) hp.onclick = function () { U.confirm('Hapus token WhatsApp?', { danger: 1, ok: 'Hapus' }).then(function (y) { if (y) API.call('rahasia.simpan', { kunci: 'FONNTE_TOKEN', nilai: '__HAPUS__' }).then(function () { U.ok('Token dihapus.'); tInt(); }, U.er); }); };
          $('#fd', pn).onsubmit = function (e) { e.preventDefault(); var fm = this; U.busy($('[type=submit]', fm), function () { return API.write('auth.daruratRotasi', { password: fm.baru.value }).then(function () { fm.reset(); U.ok('Sandi darurat diganti.'); }); }); };
        }, U.er);
      }
      function tJenis() {
        A.V(pn, 'jenis.list', {}, function (d) {
          pn.innerHTML = '<div class="row sb w"><p class="sm mut">Atur jenis surat, isian pemohon, persyaratan berkas, dan templat isi surat.</p><button class="btn pri" id="nj">' + ico('plus', 's') + ' Jenis Baru</button></div><div class="tw mt16"><table class="t"><thead><tr><th>Kode</th><th>Nama</th><th>Klasifikasi</th><th>Estimasi</th><th>Status</th></tr></thead><tbody>' + d.rows.map(function (j) { return '<tr class="click" data-k="' + esc(j.kode) + '"><td><b>' + esc(j.kode) + '</b></td><td>' + esc(j.nama) + '<div class="xs mut">' + esc(j.kategori) + '</div></td><td>' + esc(j.klas) + '</td><td>' + esc(j.estimasi) + '</td><td>' + U.badge(j.aktif === 'Tidak' ? 'Nonaktif' : 'Aktif') + '</td></tr>'; }).join('') + '</tbody></table></div>';
          U.$$('tr[data-k]', pn).forEach(function (tr) { tr.onclick = function () { jenisForm(d.rows.filter(function (j) { return j.kode === tr.dataset.k; })[0]); }; });
          $('#nj', pn).onclick = function () { jenisForm(null); };
        }, { fresh: 5 });
      }
      function jenisForm(j) {
        var baru = !j; j = j || { kolom: [], syarat: [], tabel: [], template: 'Yang bertanda tangan di bawah ini {{kepala_desa}}, Kepala Desa {{nama_desa}}, menerangkan bahwa:\n\nNama : {{nama}}\nNIK : {{nik}}\n\nBenar penduduk desa ini.', aktif: 'Ya' };
        var m = U.modal({ title: baru ? 'Jenis Surat Baru' : 'Ubah Jenis Surat', size: 'xw', body: '<form id="f" class="frm">' + U.field('Kode', U.inp('kode', j.kode, { req: 1, max: 10, ro: !baru }), { req: 1, hint: '2–10 huruf/angka, mis. SKTM' }) + U.field('Nama surat', U.inp('nama', j.nama, { req: 1 }), { req: 1 }) + U.field('Kategori', U.inp('kategori', j.kategori)) + U.field('Klasifikasi (untuk nomor)', U.inp('klas', j.klas)) + U.field('Estimasi', U.inp('estimasi', j.estimasi, { ph: '1 Hari Kerja' })) + U.field('Aktif', U.sel('aktif', ['Ya', 'Tidak'], j.aktif || 'Ya')) + U.field('Deskripsi', U.inp('deskripsi', j.deskripsi), { cls: 'full' }) + U.field('Templat isi surat', '<textarea class="inp" name="template" rows="9" required style="font-family:ui-monospace,monospace;font-size:13px">' + esc(j.template || '') + '</textarea>', { req: 1, cls: 'full', hint: 'Gunakan {{nama}}, {{nik}}, {{tempat_lahir}}, {{tgl_lahir}}, {{alamat}}, {{keperluan}}, dan isian khusus jenis ini.' }) + U.field('Isian pemohon (JSON)', '<textarea class="inp" name="kolom" rows="4" style="font-family:ui-monospace,monospace;font-size:12px">' + esc(JSON.stringify(j.kolom || [], null, 1)) + '</textarea>', { cls: 'full', hint: 'Contoh: [{"k":"penghasilan","l":"Penghasilan per bulan","t":"number","w":1}]' }) + U.field('Persyaratan berkas (JSON)', '<textarea class="inp" name="syarat" rows="4" style="font-family:ui-monospace,monospace;font-size:12px">' + esc(JSON.stringify(j.syarat || [], null, 1)) + '</textarea>', { cls: 'full', hint: 'Contoh: [{"k":"ktp","l":"Foto KTP","w":1}]' }) + '</form>', footer: '<button class="btn" data-x>Batal</button><button class="btn pri" id="ok">Simpan</button>' });
        m.$('#ok').onclick = function () { var f = m.$('#f'); if (!f.reportValidity()) return; var o = U.formObj(f); try { o.kolom = JSON.parse(o.kolom || '[]'); o.syarat = JSON.parse(o.syarat || '[]'); } catch (e) { U.toast('Format JSON isian/persyaratan tidak valid.', 'er'); return; } o.tabel = j.tabel && j.tabel.length ? j.tabel : undefined; o.urutan = j.urutan; if (!baru) o.kode = j.kode; U.busy(m.$('#ok'), function () { return API.write('jenis.save', o).then(function () { m.close(); U.ok('Jenis surat disimpan.'); show(); }); }); };
      }
      function tSis() {
        API.call('sys.status', {}).then(function (r) {
          var d = r.data; pn.innerHTML = '<div class="grid g3"><div class="card p"><div class="xs mut">Versi aplikasi</div><b>' + esc(d.versi) + '</b></div><div class="card p"><div class="xs mut">Antrean notifikasi</div><b>' + d.antrean + '</b></div><div class="card p"><div class="xs mut">Keep-warm</div><b>' + esc(d.keepWarm || '–') + '</b></div></div><h3 class="mt16 mb8">Jumlah baris data</h3><dl class="dl">' + Object.keys(d.tabel).map(function (k) { return '<dt>' + esc(k.replace(/_/g, ' ')) + '</dt><dd class="tnum">' + U.num(d.tabel[k]) + '</dd>'; }).join('') + '</dl><div class="note mt16">' + ico('info') + '<div>Cache terakhir dipanaskan: ' + (d.warm ? esc(d.warm.at || '') : '–') + '. Untuk mengukur kecepatan klik antar menu, buka Console peramban dan jalankan <code>Perf.table()</code>.</div></div>';
        }, function (e) { pn.innerHTML = '<div class="empty">' + ico('alert') + '<div>' + esc(e.message) + '</div></div>'; });
      }
      show();
    }
  });

  // ================= PROFIL STAF =================
  A.add('/a/profil', { auth: 1, roles: ST, menu: 'profil', title: 'Profil & Keamanan', render: function (el, ctx) { w.profilPage(el, ctx); } });
})(window);
