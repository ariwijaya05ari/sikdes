# SIPAKDES — Frontend

Sistem Informasi Kependudukan & Pelayanan Administrasi Desa. Folder ini adalah **akar repository GitHub Pages**: `index.html` harus berada langsung di sini.

```
sipakdes-frontend/
├── index.html
├── css/style.css
├── js/
│   ├── config.js        ← satu-satunya berkas yang Anda ubah (URL /exec backend)
│   ├── api.js           ← klien API: batch, cache SWR, dedupe, polling adaptif
│   ├── ui.js, common.js, app.js (router SPA)
│   ├── pages-public.js, pages-warga.js, pages-admin1.js … pages-admin3.js
│   └── qr.js, letter.js ← kode QR & pembangun surat (cetak dari peramban)
├── README.md
└── PANDUAN-INSTALASI.md ← mulai dari sini
```

Backend (`Kode.gs`, `appsscript.json`) **tidak** termasuk di folder ini — ditempel ke Google Apps Script. Ikuti `PANDUAN-INSTALASI.md`.

Tanpa framework dan tanpa langkah build; HTML/CSS/JS murni. Tidak ada rahasia di frontend (hanya URL `/exec` yang memang publik).
