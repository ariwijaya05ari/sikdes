# SIPAKDES — Panduan Instalasi

Sistem Informasi Kependudukan & Pelayanan Administrasi Desa. Frontend statis di **GitHub Pages**, backend **Google Apps Script** (REST/JSON), database **Google Sheets** + berkas di **Google Drive**.

Anda menerima 3 hal:

| Berkas | Fungsi | Ke mana |
|---|---|---|
| `Kode.gs` | Seluruh backend | Ditempel ke editor Apps Script |
| `appsscript.json` | Pengaturan proyek Apps Script | Ditempel ke editor Apps Script (manifest) |
| `sipakdes-frontend.zip` | Tampilan web (`index.html`, `css/`, `js/`) | Diekstrak lalu di-push ke GitHub |

Urutan pengerjaan: **A. Backend → B. Frontend → C. GitHub Pages → D. Pengaturan awal → E. Data**. Perkiraan waktu: 30–45 menit.

---

## A. Pasang backend (Google Apps Script)

Gunakan **akun Google milik desa** (bukan akun pribadi perangkat) — semua data & berkas akan tersimpan di Drive akun ini.

1. Buka <https://script.google.com> → **Proyek baru**. Beri nama `SIPAKDES`.
2. Hapus isi `Code.gs` bawaan, lalu tempel **seluruh isi `Kode.gs`**. Klik **Simpan** (ikon disket).
3. Buka **Setelan Proyek** (ikon roda gigi) → centang **Tampilkan file manifes "appsscript.json" di editor**. Kembali ke **Editor**, buka `appsscript.json`, ganti seluruh isinya dengan isi berkas `appsscript.json` dari paket, lalu **Simpan**.
4. Pilih fungsi **`setupAppEnvironment`** pada menu fungsi di atas editor → **Jalankan**.
   - Pertama kali akan muncul izin akses Google. Klik **Tinjau izin** → pilih akun → **Lanjutan** → **Buka SIPAKDES (tidak aman)** → **Izinkan**. (Peringatan ini normal untuk skrip buatan sendiri.)
   - Fungsi ini otomatis membuat folder Drive, spreadsheet database (14 sheet), kunci keamanan, dan pemicu pemanasan.
5. Buka **Log eksekusi**. Anda akan melihat blok seperti ini — **catat sekarang, hanya tampil sekali**:
   ```
   🔐 AKSES DARURAT
      Nama pengguna : darurat
      Kata sandi    : (diacak otomatis)
   ```
   Simpan di tempat aman (pengelola kata sandi / brankas kantor). Bila hilang: jalankan `resetAksesDarurat`.
6. *(Opsional, untuk uji coba)* jalankan **`isiDataContoh`** → log menampilkan akun contoh (admin, sekdes, kades, RT, warga) berikut sandinya dan PIN TTE. **Sebelum dipakai sungguhan, jalankan `hapusDataContoh`** — ia menghapus SEMUA data penduduk/surat/bansos contoh dan akun contoh. Jangan menjalankannya setelah data asli masuk.
7. **Terapkan sebagai Aplikasi Web:** tombol **Terapkan → Penerapan baru** → ikon roda gigi → **Aplikasi web**.
   - *Jalankan sebagai*: **Saya**
   - *Yang memiliki akses*: **Siapa saja**
   - Klik **Terapkan**, lalu **salin URL Aplikasi Web** (berakhiran `/exec`).
8. Uji: tempel URL itu di tab baru. Harus muncul `{"success":true,"app":"SIPAKDES",...}`.

> **Memperbarui backend di kemudian hari:** tempel kode baru → Simpan → **Terapkan → Kelola penerapan → ✏️ → Versi: Versi baru → Terapkan**. Jangan memilih "Penerapan baru" (URL akan berubah).

### Rahasia & keamanan (otomatis)
Semua rahasia (kunci sesi, hash sandi darurat, token WhatsApp, ID spreadsheet/folder) disimpan di **Script Properties** — bukan di kode, bukan di Sheets, bukan di frontend. Anda **tidak perlu** mengisi apa pun secara manual kecuali token WhatsApp (opsional) yang diisi lewat menu **Pengaturan → Integrasi** di aplikasi. Batasi *editor* proyek Apps Script hanya pada orang tepercaya: siapa pun yang bisa mengedit proyek bisa melihat Script Properties.

---

## B. Siapkan frontend

1. Ekstrak `sipakdes-frontend.zip`. Hasilnya **satu folder bernama `sipakdes-frontend`**. Di dalamnya langsung terlihat `index.html`, `css`, `js`, `README.md`, `PANDUAN-INSTALASI.md`.
2. Buka `sipakdes-frontend/js/config.js` dengan Notepad. Ganti tulisan `GANTI_DENGAN_ID_DEPLOYMENT` hingga seluruh alamat sama dengan **URL `/exec`** dari langkah A.7:
   ```js
   window.APP_CONFIG = {
     GAS_URL: 'https://script.google.com/macros/s/ID-PENERAPAN-ANDA/exec'
   };
   ```
   Simpan. Ini satu-satunya nilai yang perlu diubah di frontend (URL ini bukan rahasia).

---

## C. Pasang di GitHub Pages (lewat terminal)

> Jangan memakai "Add file → Upload files" di situs GitHub — struktur folder `css/` dan `js/` akan rusak dan tampilan kosong.

**1. Pasang Git** — Windows: <https://git-scm.com/download/win> (pengaturan bawaan). Mac: ketik `git --version` di Terminal. Cek dengan `git --version`.

**2. Akun GitHub** — daftar di <https://github.com>. Nama pengguna menjadi bagian alamat situs (`namapengguna.github.io`).

**3. Identitas Git (sekali saja):**
```bash
git config --global user.name "Nama Anda"
git config --global user.email "email-akun-github@contoh.com"
```

**4. Buat repository** — di GitHub: **+ → New repository** → nama mis. `sipakdes` → **Public** → **jangan** centang README/.gitignore/license → **Create repository**.

**5. Masuk ke folder yang BENAR.** Folder tempat Anda menjalankan `git init` adalah **`sipakdes-frontend`** — folder yang langsung berisi `index.html`. Bukan folder di atasnya.
   - Windows: buka folder `sipakdes-frontend` di File Explorer → klik kolom alamat → ketik `powershell` → Enter.
   - Verifikasi:
     ```powershell
     dir
     ```
     Harus terlihat **`index.html`**, `css`, `js`. Jika yang terlihat justru folder `sipakdes-frontend` lagi, masuk dulu dengan `cd sipakdes-frontend`. **Jangan lanjut sebelum `index.html` terlihat.**

**6. Push pertama** (satu per satu):
```bash
git init
git add .
git commit -m "Upload pertama SIPAKDES"
git branch -M main
git remote add origin https://github.com/NAMAPENGGUNA/sipakdes.git
git push -u origin main
```
Saat diminta *Username*: nama pengguna GitHub. *Password*: tempel **Personal Access Token** (bukan sandi akun). Layar tampak kosong saat menempel — itu normal; tekan Enter.

**Membuat token:** <https://github.com/settings/tokens> → *Generate new token (classic)* → centang **repo** → *Generate* → salin (`ghp_…`, hanya tampil sekali). Alternatif tanpa token: **GitHub Desktop** (<https://desktop.github.com>).

**7. Aktifkan Pages** — di repo: **Settings → Pages** → *Source*: **Deploy from a branch** → *Branch*: **main** / **(root)** → **Save**. Tunggu 1–2 menit; muncul alamat `https://NAMAPENGGUNA.github.io/sipakdes/`. Centang **Enforce HTTPS**.

**Memperbarui frontend:** ubah berkas di folder `sipakdes-frontend`, lalu dari folder itu:
```bash
git add .
git commit -m "Pembaruan"
git push
```
Tekan **Ctrl+Shift+R** di peramban bila tampilan lama masih muncul.

---

## D. Pengaturan awal (sekali)

1. Buka alamat situs diikuti `/#/darurat` (contoh: `https://NAMAPENGGUNA.github.io/sipakdes/#/darurat`) — halaman akses darurat sengaja tidak ditautkan dari mana pun. Masuk dengan nama pengguna `darurat` + sandi dari langkah A.5.
2. **Pengguna → Tambah Pengguna**: buat akun **Admin**, **Sekdes**, **Kepala Desa**, dan **Ketua RT/RW** (isi RT/RW wilayahnya). Sandi sementara muncul **sekali** — catat dan serahkan ke pemilik akun; mereka wajib menggantinya saat login pertama.
3. Masuk dengan akun Admin baru → **Pengaturan → Umum**: isi identitas desa, nama Kepala Desa/Sekdes, jam layanan, dan **URL situs frontend** (`https://NAMAPENGGUNA.github.io/sipakdes`) — dipakai pada kode QR verifikasi di surat.
4. **Pengaturan → Integrasi & Keamanan**: ganti sandi darurat dengan yang baru (≥12 karakter, huruf+angka); isi token WhatsApp Fonnte bila dipakai.
5. Kepala Desa: masuk → **Profil → Atur PIN TTE** (PIN dipakai saat menandatangani surat).
6. **Pengaturan → Jenis Surat**: periksa 6 templat bawaan (SKTM, SKU, SKD, SKPWNI, SKL, SKK) dan sesuaikan isi/klasifikasi.

---

## E. Memasukkan data penduduk

**Dari berkas (CSV/Excel):** menu **Impor & Migrasi Data → Dari berkas** → unduh templat, isi, unggah → periksa pemetaan kolom → **Pindai** (uji tanpa menyimpan) → **Jalankan Impor**. Aman diulang: NIK yang sama diperbarui, tidak digandakan.

**Dari spreadsheet aplikasi lama (satu akun Google):** **Impor & Migrasi → Dari Spreadsheet lama** → tempel URL → pilih sheet → periksa pemetaan → **Pindai** → **Jalankan Migrasi**. Spreadsheet lama hanya dibaca, tidak diubah.

⚠️ **NIK dan No. KK harus berformat teks** di berkas/sheet sumber. Angka 16 digit yang disimpan sebagai *angka* kehilangan ketelitian (digit terakhir berubah menjadi 0) dan tidak bisa dipulihkan. Di Sheets/Excel: pilih kolom → Format → Teks, lalu ketik ulang/salin dengan benar.

**Cutover dari aplikasi lama:** (1) migrasikan → (2) cek data + uji satu akun warga → (3) tepat sebelum beralih, migrasikan **sekali lagi** (delta) → (4) umumkan alamat baru. Sesi login lama tidak ikut pindah; warga mendaftar akun dengan NIK yang sudah terdata.

---

## Alur layanan surat

Warga mengajukan → **Ketua RT/RW** memvalidasi → **Staf desa** memverifikasi berkas & menerbitkan nomor → **Kepala Desa** menandatangani (PIN) → surat terbit ber-**QR**. Publik dapat memeriksa keaslian di menu **Verifikasi Surat** (nomor surat atau pindai QR).

---

## Performa & kuota — yang perlu Anda tahu

- Aplikasi memakai cache berlapis (memori → peramban → server). Pindah menu yang sudah pernah dibuka tampil seketika; data diperbarui senyap di latar. Daftar penduduk disaring langsung di perangkat tanpa menunggu server.
- Pemicu **keepWarm** (tiap 1 menit) menjaga cache server tetap hangat dan mengirim antrean notifikasi. Ia memakai kira-kira **10–20 menit dari kuota pemicu harian** (batas akun @gmail ≈ 90 menit/hari). Untuk mematikan: jalankan `matikanKeepWarm`; menyalakan lagi: `nyalakanKeepWarm`. Jalankan `cekPerforma` untuk melihat status.
- Untuk mengukur kecepatan: di peramban buka Console (F12) → ketik `Perf.table()`.
- **Kuota email** akun @gmail ≈ **100 email/hari** (Workspace lebih besar). Notifikasi dikirim lewat antrean dan bersifat *best-effort* — bukan jaminan pengiriman.
- Satu spreadsheet nyaman untuk puluhan ribu baris. Bila penduduk > ±50.000, pertimbangkan arsitektur lain.

## Rotasi rahasia

| Kebutuhan | Cara |
|---|---|
| Lupa sandi darurat | Jalankan `resetAksesDarurat` di editor |
| Keluarkan semua sesi login | Jalankan `rotasiSecretSesi` di editor (semua pengguna harus login ulang) |
| Ganti token WhatsApp | Pengaturan → Integrasi & Keamanan |
| Pengguna lupa sandi | Pengguna → pilih akun → Reset Sandi |

---

## Batasan yang perlu diketahui (jujur)

- **Tanda tangan elektronik bersifat internal desa** (PIN Kepala Desa + QR terverifikasi server). **Bukan** tanda tangan tersertifikasi BSrE/BSSN. Untuk dokumen yang mensyaratkan TTE tersertifikasi, gunakan jalur resmi.
- Kode backend **telah diuji otomatis** terhadap simulator Google Apps Script (115 skenario) dan frontend diuji di Chromium terhadap simulator itu; **belum diuji pada Google Apps Script sungguhan**. Lakukan uji penerimaan singkat (login, ajukan satu surat, tandatangani, verifikasi QR) setelah instalasi.
- Peta persebaran KK berupa **skema SVG dari koordinat** (bukan peta jalan/Leaflet).
- Arsip PDF di Drive dibuat **best-effort** di latar; surat selalu bisa dicetak dari peramban.
- Impor Excel (.xlsx) memakai pembaca bawaan peramban modern; bila gagal, simpan sebagai CSV.
- Notifikasi email/WhatsApp tidak menjamin sampai (kuota, nomor salah, layanan pihak ketiga).

## Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| Situs menampilkan 404 | `git init` dijalankan di folder yang salah. Pastikan `index.html` ada di akar repo (lihat C.5). |
| Tampilan tanpa gaya/kosong | Struktur `css/` & `js/` rusak (diunggah lewat web). Push ulang lewat terminal. |
| "Konfigurasi belum lengkap" | `js/config.js` belum diisi URL `/exec`. |
| "Failed to fetch" / tidak bisa masuk | Penerapan Aplikasi Web belum disetel *Siapa saja*, atau URL salah. Buka URL `/exec` langsung — harus menampilkan JSON. |
| Perubahan backend tidak berlaku | Anda harus membuat **Versi baru** pada penerapan yang sama (A, catatan pembaruan). |
| Login ditolak 5× lalu terkunci | Akses darurat terkunci 15 menit; tunggu atau jalankan `resetAksesDarurat`. |
| "Password authentication is not supported" saat `git push` | Gunakan Personal Access Token (C.6). |
| NIK berakhiran `0000` setelah impor | Kolom sumber berformat angka. Ubah ke teks lalu impor ulang. |

Selesai. Bila ada pesan galat yang tidak dikenal, kirim tangkapan layar Console (F12) beserta langkah yang dilakukan.
