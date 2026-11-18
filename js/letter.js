/* ============================================================
 * Letter.js — Mesin render surat resmi desa (dipakai bersama
 * frontend [pratinjau/cetak] dan backend GAS [arsip PDF]).
 * Semua gaya inline agar konsisten saat dikonversi ke PDF.
 * ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Letter = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function tglId(iso) {
    if (!iso) return '';
    var p = String(iso).slice(0, 10).split('-');
    if (p.length < 3 || !+p[1]) return String(iso);
    return (+p[2]) + ' ' + BULAN[+p[1] - 1] + ' ' + p[0];
  }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function up(s) { return String(s || '').toUpperCase(); }

  /** Kamus placeholder dari data pemohon + isian formulir */
  function fields(c) {
    var pm = c.pemohon || {}, p = pm.p || {}, kk = pm.kk || {}, d = c.desa || {}, s = c.surat || {}, di = s.data_isian || {}, f = {};
    var alamat = [kk.alamat, kk.rt || kk.rw ? 'RT ' + (kk.rt || '-') + ' / RW ' + (kk.rw || '-') : '', kk.dusun ? 'Dusun ' + kk.dusun : '', 'Desa ' + (d.nama_desa || '').replace(/^Desa\s+/i, '')].filter(function (x) { return x; }).join(', ');
    f.nama = p.nama || s.nama || ''; f.nik = p.nik || s.nik || '';
    f.ttl = (p.tempat_lahir ? p.tempat_lahir + ', ' : '') + tglId(p.tgl_lahir);
    f.jk_teks = p.jk === 'L' ? 'Laki-laki' : p.jk === 'P' ? 'Perempuan' : '';
    f.pekerjaan = p.pekerjaan || '-'; f.agama = p.agama || '-'; f.status_kawin = p.status_kawin || '-'; f.pendidikan = p.pendidikan || '-';
    f.alamat = alamat; f.rt = kk.rt || ''; f.rw = kk.rw || ''; f.dusun = kk.dusun || ''; f.no_kk = kk.no_kk || s.no_kk || '';
    f.nama_desa = String(d.nama_desa || '').replace(/^Desa\s+/i, ''); f.kecamatan = d.kecamatan || ''; f.kabupaten = d.kabupaten || ''; f.provinsi = d.provinsi || '';
    f.keperluan = s.keperluan || ''; f.nomor = s.nomor_surat || '';
    f.tanggal = tglId(s.tgl_setuju) || tglId(new Date().toISOString());
    var kolom = (c.jenis && c.jenis.kolom) || [];
    Object.keys(di).forEach(function (k) {
      var def = kolom.filter(function (x) { return x.k === k; })[0];
      f[k] = def && def.t === 'date' ? tglId(di[k]) : di[k];
    });
    return f;
  }
  function fill(tpl, f) {
    return String(tpl || '').replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, function (m, k) {
      var v = f[k]; return v === undefined || v === null || v === '' ? '………' : esc(v);
    });
  }

  /**
   * @param c {desa, jenis{nama,tabel[],template}, surat, pemohon{p,kk}, qr (html/svg), draft}
   * @returns string HTML (satu halaman A4)
   */
  function build(c) {
    var d = c.desa || {}, j = c.jenis || {}, s = c.surat || {}, f = fields(c), draft = !!c.draft;
    var tabel = (j.tabel && j.tabel.length ? j.tabel : [['Nama Lengkap', '{{nama}}'], ['NIK', '{{nik}}'], ['Tempat/Tgl. Lahir', '{{ttl}}'], ['Jenis Kelamin', '{{jk_teks}}'], ['Pekerjaan', '{{pekerjaan}}'], ['Alamat', '{{alamat}}']]);
    var rows = tabel.map(function (r) {
      return '<tr><td style="width:32%;padding:1px 0;vertical-align:top">' + esc(r[0]) + '</td><td style="width:3%;vertical-align:top">:</td><td style="vertical-align:top">' + fill(r[1], f) + '</td></tr>';
    }).join('');
    var paras = String(j.template || '').split(/\n+/).filter(function (x) { return x.trim(); }).map(function (x) {
      return '<p style="margin:0 0 8px;text-align:justify;text-indent:32px">' + fill(x, f) + '</p>';
    }).join('');
    var logo = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/.test(d.logo || '') ? d.logo : '';
    var kades = d.kepala_desa || 'Kepala Desa', nip = d.nip_kades ? '<div style="font-size:10pt">NIP. ' + esc(d.nip_kades) + '</div>' : '';
    var ttd = draft
      ? '<div style="height:78px;border:1px dashed #999;color:#999;font-size:9pt;text-align:center;line-height:78px;margin:6px auto;width:150px">Menunggu TTE</div>'
      : '<div style="margin:6px auto;width:96px">' + (c.qr || '') + '</div><div style="font-size:8pt;color:#333">Ditandatangani secara elektronik<br/>(pindai QR untuk verifikasi keaslian)</div>';
    var wm = draft ? '<div style="position:absolute;left:0;right:0;top:38%;text-align:center;font-size:64px;font-weight:700;color:rgba(0,0,0,0.07);transform:rotate(-28deg);letter-spacing:6px;pointer-events:none">DRAF — BELUM SAH</div>' : '';
    return '<div class="surat-doc" style="position:relative;box-sizing:border-box;font-family:\'Times New Roman\',Times,serif;font-size:12pt;line-height:1.45;color:#000;background:#fff;padding:34px 48px 40px;overflow:hidden">' + wm +
      '<div style="border-bottom:3px double #000;padding-bottom:8px;margin-bottom:14px">' +
      '<table style="width:100%;border-collapse:collapse"><tr>' + (logo ? '<td style="width:78px;vertical-align:middle;padding:0"><img src="' + logo + '" alt="Logo" style="width:70px;height:70px;object-fit:contain;display:block"></td>' : '') +
      '<td style="text-align:center;vertical-align:middle;padding:0">' +
      '<div style="font-size:12pt;letter-spacing:1px">PEMERINTAH KABUPATEN ' + esc(up(d.kabupaten)) + '</div>' +
      '<div style="font-size:12pt;letter-spacing:1px">KECAMATAN ' + esc(up(d.kecamatan)) + '</div>' +
      '<div style="font-size:16pt;font-weight:700;letter-spacing:1px">' + esc(up(d.nama_desa)) + '</div>' +
      '<div style="font-size:9pt">' + esc(d.alamat || '') + (d.telepon ? ' · Telp. ' + esc(d.telepon) : '') + (d.email_kantor ? ' · ' + esc(d.email_kantor) : '') + '</div></td>' + (logo ? '<td style="width:78px;padding:0"></td>' : '') + '</tr></table></div>' +
      '<div style="text-align:center;margin-bottom:12px"><div style="font-size:13pt;font-weight:700;text-decoration:underline">' + esc(up(j.nama || 'SURAT KETERANGAN')) + '</div>' +
      '<div>Nomor: ' + (s.nomor_surat ? esc(s.nomor_surat) : '………/………/………') + '</div></div>' +
      '<p style="margin:0 0 6px;text-align:justify;text-indent:32px">Yang bertanda tangan di bawah ini, Kepala Desa ' + esc(f.nama_desa) + ', Kecamatan ' + esc(f.kecamatan) + ', Kabupaten ' + esc(f.kabupaten) + ', menerangkan bahwa:</p>' +
      '<table style="width:100%;border-collapse:collapse;margin:4px 0 10px 24px;width:calc(100% - 24px)">' + rows + '</table>' + paras +
      '<div style="margin-top:18px;width:240px;margin-left:auto;text-align:center"><div>' + esc(f.nama_desa) + ', ' + esc(f.tanggal) + '</div><div>Kepala Desa ' + esc(f.nama_desa) + '</div>' + ttd +
      '<div style="font-weight:700;text-decoration:underline">' + esc(kades) + '</div>' + nip + '</div></div>';
  }
  return { build: build, fields: fields, fill: fill, tglId: tglId, esc: esc };
});
