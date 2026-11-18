/* Komponen bersama warga & admin: stepper status, linimasa, pratinjau/cetak surat, unggah berkas. */
(function (w) {
  'use strict';
  var U = w.UI, A = w.App, esc = U.esc, ico = U.ico;
  var STEPS = ['Diajukan', 'Validasi RT/RW', 'Verifikasi Desa', 'Tanda Tangan Kades', 'Selesai'];
  var IDX = { 'Diajukan': 0, 'Divalidasi RT': 1, 'Diproses': 2, 'Menunggu TTE': 3, 'Selesai': 4 };
  var EXPLAIN = { 'Diajukan': 'Menunggu validasi Ketua RT/RW.', 'Divalidasi RT': 'Sudah divalidasi RT/RW, menunggu verifikasi staf desa.', 'Diproses': 'Berkas sedang diverifikasi staf desa.', 'Menunggu TTE': 'Menunggu tanda tangan elektronik Kepala Desa.', 'Selesai': 'Surat sudah terbit dan siap dicetak.', 'Perlu Revisi': 'Berkas perlu diperbaiki oleh pemohon.', 'Ditolak': 'Pengajuan ditolak.', 'Dibatalkan': 'Pengajuan dibatalkan oleh pemohon.' };
  function stepper(s) {
    var st = s.status, bad = ['Perlu Revisi', 'Ditolak', 'Dibatalkan'].indexOf(st) >= 0, cur = IDX[st];
    if (bad) { var rw = s.riwayat || [], k = -1; for (var i = rw.length - 1; i >= 0; i--) if (IDX[rw[i].s] !== undefined) { k = IDX[rw[i].s]; break; } cur = k < 0 ? 0 : k; }
    return '<div class="steps" role="list">' + STEPS.map(function (l, i) { var c = (i < cur || (st === 'Selesai')) ? 'done' : i === cur ? (bad ? 'bad' : 'cur') : ''; return '<div class="stp ' + c + '" role="listitem"><b>' + (c === 'done' ? ico('check', 's') : (c === 'bad' ? '!' : i + 1)) + '</b>' + esc(l) + '</div>'; }).join('') + '</div>';
  }
  function timeline(s) {
    var rw = (s.riwayat || []).slice().reverse();
    return '<ul class="tl">' + rw.map(function (r, i) { return '<li class="' + (i === 0 ? 'cur' : '') + (['Ditolak', 'Perlu Revisi', 'Dibatalkan'].indexOf(r.s) >= 0 ? ' bad' : '') + '"><div class="b">' + esc(r.s) + '</div><div class="xs mut">' + U.tglJam(r.t) + ' · ' + esc(r.oleh || '') + '</div>' + (r.c ? '<div class="sm mt8" style="background:#F8FAFC;border-radius:8px;padding:8px 10px">' + esc(r.c) + '</div>' : '') + '</li>'; }).join('') + '</ul>';
  }
  function verifUrl(d) { var base = (d.url_frontend || '').replace(/\/+$/, '') || (location.origin + location.pathname.replace(/\/[^\/]*$/, '')); return base + '/#/verifikasi/' + d.surat.token_qr; }
  /** HTML surat siap tampil/cetak (draft bila belum terbit) */
  function letterHtml(d) {
    var done = d.surat.status === 'Selesai' && d.surat.token_qr;
    return w.Letter.build({ desa: d.desa, jenis: d.jenis, surat: d.surat, pemohon: d.pemohon, qr: done ? w.QR.svg(verifUrl(d), { size: 96, margin: 0 }) : '', draft: !done });
  }
  /** Pratinjau surat dalam modal + tombol cetak */
  function openLetter(d, o) {
    o = o || {}; var done = d.surat.status === 'Selesai', html = letterHtml(d);
    var m = U.modal({ title: done ? 'Surat ' + esc(d.surat.nomor_surat || '') : 'Pratinjau Surat (Draf)', sub: done ? 'Dokumen resmi — cetak atau simpan sebagai PDF dari dialog cetak.' : 'Draf belum sah sampai ditandatangani Kepala Desa.', size: 'xw', body: '<div class="tw" style="background:#E5EAF1;padding:16px;border-radius:10px"><div class="sheet">' + html + '</div></div>', footer: '<button class="btn" data-x>Tutup</button>' + '<button class="btn pri" id="pr">' + ico('print', 's') + ' Cetak / Simpan PDF</button>' });
    m.$('#pr').onclick = function () { U.printHtml(html); };
    return m;
  }
  /** Kompres gambar di klien (maks 1600 px, JPEG) agar unggahan ringan */
  function prepFile(file) {
    var max = 3 * 1024 * 1024;
    if (/^image\/(png|jpe?g|webp)$/.test(file.type) && w.createImageBitmap) {
      return createImageBitmap(file).then(function (bm) {
        var sc = Math.min(1, 1600 / Math.max(bm.width, bm.height)), c = document.createElement('canvas'); c.width = Math.round(bm.width * sc); c.height = Math.round(bm.height * sc);
        c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
        return new Promise(function (res) { c.toBlob(function (b) { res({ blob: b, mime: 'image/jpeg', nama: file.name.replace(/\.\w+$/, '') + '.jpg' }); }, 'image/jpeg', .82); });
      }).catch(function () { return { blob: file, mime: file.type, nama: file.name }; });
    }
    if (file.type !== 'application/pdf') return Promise.reject(new Error('Format berkas harus PDF, JPG, PNG, atau WEBP.'));
    if (file.size > max) return Promise.reject(new Error('Ukuran PDF maksimal 3 MB.'));
    return Promise.resolve({ blob: file, mime: file.type, nama: file.name });
  }
  function uploadFile(file, tipe) {
    return prepFile(file).then(function (p) {
      if (p.blob.size > 3 * 1024 * 1024) throw new Error('Ukuran berkas maksimal 3 MB.');
      return U.b64(p.blob).then(function (b64) { return API.call('upload.file', { nama: p.nama, mime: p.mime, b64: b64, tipe: tipe }); });
    }).then(function (r) { var d = r.data; d.k = tipe; return d; });
  }
  /** Kolom unggah: kembalikan HTML + pengikat. state[k] = {id,nama,...} */
  function uploadField(sy, state) {
    return '<div class="fld full" data-up="' + esc(sy.k) + '"><label' + (sy.w ? ' class="req"' : '') + '>' + esc(sy.l) + '</label><div class="dz" tabindex="0" role="button" aria-label="Unggah ' + esc(sy.l) + '"><input type="file" accept="image/*,application/pdf" hidden><div class="sm">' + ico('upload') + ' <b>Pilih berkas</b> atau seret ke sini<br><span class="xs mut">PDF/JPG/PNG · maks. 3 MB</span></div></div><div class="up-out"></div></div>';
  }
  function bindUpload(root, state, onChange) {
    U.$$('[data-up]', root).forEach(function (f) {
      var k = f.dataset.up, dz = U.$('.dz', f), inp = U.$('input', f), out = U.$('.up-out', f);
      function paint() { var x = state[k]; out.innerHTML = x ? '<div class="fileit mt8">' + ico('filec') + '<div class="grow sm"><b>' + esc(x.nama) + '</b><div class="xs mut">' + Math.round((x.size || 0) / 1024) + ' KB</div></div><button type="button" class="ib" aria-label="Hapus">' + ico('x') + '</button></div>' : ''; if (x) { dz.classList.add('hide'); U.$('button', out).onclick = function () { delete state[k]; dz.classList.remove('hide'); paint(); onChange && onChange(); }; } }
      function pick(file) { if (!file) return; dz.innerHTML = '<span class="spin" style="display:inline-block;width:16px;height:16px;border:2px solid var(--navy-800);border-right-color:transparent;border-radius:50%;animation:rot .6s linear infinite"></span> Mengunggah…'; uploadFile(file, k).then(function (d) { state[k] = d; paint(); onChange && onChange(); }).catch(function (e) { U.er(e); }).then(function () { dz.innerHTML = '<div class="sm">' + ico('upload') + ' <b>Pilih berkas</b> atau seret ke sini<br><span class="xs mut">PDF/JPG/PNG · maks. 3 MB</span></div>'; }); }
      dz.onclick = function () { inp.click(); }; dz.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } };
      inp.onchange = function () { pick(inp.files[0]); inp.value = ''; };
      ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); }); });
      dz.addEventListener('drop', function (e) { pick(e.dataTransfer.files[0]); });
      paint();
    });
  }
  /** Formulir dinamis dari definisi kolom jenis surat */
  function fieldsHtml(kolom, vals) {
    vals = vals || {};
    return kolom.map(function (c) {
      var inner = c.t === 'select' ? U.sel('f_' + c.k, c.o || [], vals[c.k], 'Pilih…', { req: c.w }) : U.inp('f_' + c.k, vals[c.k], { type: c.t === 'date' ? 'date' : c.t === 'number' ? 'number' : 'text', req: c.w });
      return U.field(c.l, inner, { req: c.w, cls: c.t === 'text' && /alamat|nama_usaha/.test(c.k) ? 'full' : '' });
    }).join('');
  }
  function fieldsVals(form, kolom) { var o = {}; kolom.forEach(function (c) { var el = form.elements['f_' + c.k]; if (el) o[c.k] = el.value; }); return o; }
  function dokList(state, syarat) { return syarat.filter(function (s) { return !s.auto && state[s.k]; }).map(function (s) { return state[s.k]; }); }
  w.Common = { stepper: stepper, timeline: timeline, openLetter: openLetter, letterHtml: letterHtml, uploadField: uploadField, bindUpload: bindUpload, fieldsHtml: fieldsHtml, fieldsVals: fieldsVals, dokList: dokList, EXPLAIN: EXPLAIN, verifUrl: verifUrl, uploadFile: uploadFile };
})(window);
