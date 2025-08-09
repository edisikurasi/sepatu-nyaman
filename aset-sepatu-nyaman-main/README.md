# Proyek Halaman Detail Produk - Sepatu Nyaman

Selamat datang di direktori aset untuk **Halaman Detail Produk**. Bagian ini berisi semua file frontend (JavaScript, CSS) yang bertanggung jawab untuk menampilkan informasi lengkap dan interaktif tentang satu produk sepatu.

Halaman ini dirancang untuk menjadi kaya fitur, data-driven, dan sangat dioptimalkan untuk pengalaman pengguna serta SEO.

## Fitur Utama

*   **Rendering Dinamis dari Firestore**: Semua konten—mulai dari nama produk, harga, spesifikasi, hingga ulasan—diambil secara *real-time* dari Cloud Firestore menggunakan ID produk.
*   **Galeri Gambar Lanjutan**:
    *   Mendukung **varian warna** produk, di mana setiap pilihan warna akan memperbarui galeri gambar.
    *   Dilengkapi **thumbnail interaktif** untuk navigasi yang mudah.
    *   Menggunakan elemen `<picture>` untuk menyajikan **gambar WebP** secara otomatis dengan *fallback* ke format standar, demi kecepatan muat yang optimal.
*   **Informasi Produk Komprehensif**:
    *   Menampilkan **skor kenyamanan**, daftar **kelebihan & kekurangan**, dan **tabel spesifikasi** teknis.
    *   Menyajikan **ulasan mendalam dari editor** yang kontennya (paragraf, gambar, daftar) dirender secara dinamis.
    *   Menampilkan tanggal publikasi dan tanggal pembaruan terakhir untuk transparansi.
*   **Sistem Ulasan Pengguna**:
    *   Menampilkan daftar ulasan dari pengguna lain, lengkap dengan nama, tanggal, dan **rating bintang**.
    *   Menyediakan formulir bagi pengguna untuk mengirimkan ulasan mereka sendiri langsung ke database.
*   **Rekomendasi Produk Terkait**: Secara otomatis mengambil dan menampilkan produk lain dari kategori yang sama untuk meningkatkan keterlibatan pengguna.
*   **SEO & Skema Teroptimasi**:
    *   Memperbarui `meta tags` (judul, deskripsi) secara dinamis.
    *   Menghasilkan **JSON-LD (Schema.org)** yang kaya untuk tipe `Product`, `Review`, `AggregateRating`, dan `BreadcrumbList` untuk meningkatkan visibilitas di hasil pencarian Google.

## Tumpukan Teknologi (Tech Stack)

*   **HTML5**: Markup semantik untuk struktur yang kokoh.
*   **CSS3**: Menggunakan **CSS Variables** untuk sistem tema (terang/gelap) yang terpusat di `theme.css`.
*   **JavaScript (ES6 Modules)**: Arsitektur modular Vanilla JS untuk kode yang bersih, terorganisir, dan berperforma tinggi.
*   **Firebase (Cloud Firestore)**: Berfungsi sebagai backend NoSQL untuk semua data produk dan ulasan.

## Struktur Modul JavaScript

Logika JavaScript dipecah menjadi beberapa modul dengan tanggung jawab yang jelas:

```
js/
├── 📁 modules/
│   ├── 📄 firebaseService.js # Mengelola semua permintaan ke dan dari Firestore (get/post data).
│   ├── 📄 uiModule.js        # Bertanggung jawab untuk semua manipulasi DOM dan rendering data ke halaman.
│   └── 📄 eventHandlers.js   # (Contoh) Menangani semua interaksi pengguna seperti klik, hover, dan submit form.
└── 📄 main-detail.js         # (Contoh) Titik masuk utama yang menginisialisasi dan mengorkestrasi semua modul.
```

## Alur Kerja Halaman

1.  **Inisialisasi**: Halaman dimuat, dan skrip utama mengambil ID produk (misalnya dari URL atau atribut data).
2.  **Pengambilan Data**: `firebaseService.js` dipanggil untuk mengambil data produk utama, ulasan pengguna, dan produk terkait secara asinkron.
3.  **Rendering UI**:
    *   Jika data berhasil diambil, `uiModule.js` akan menggunakan data tersebut untuk mengisi semua bagian halaman: galeri, detail harga, spesifikasi, ulasan, dll.
    *   Jika terjadi kesalahan, `uiModule.js` akan menampilkan pesan kesalahan yang informatif.
4.  **Interaktivitas**: Event listener dipasang untuk menangani aksi pengguna, seperti:
    *   Mengklik thumbnail atau pilihan warna untuk memperbarui gambar utama.
    *   Mengirimkan formulir ulasan.
    *   Membuka gambar di lightbox (jika diimplementasikan).
