# Proyek E-commerce "Sepatu Nyaman"

Selamat datang di repositori utama untuk proyek "Sepatu Nyaman". Proyek ini adalah implementasi front-end canggih untuk sebuah situs e-commerce sepatu, yang dirancang dengan arsitektur modular, modern, dan skalabel menggunakan JavaScript ES6 dan Firebase.

## Arsitektur Proyek

Proyek ini secara cerdas dibagi menjadi dua komponen utama yang saling melengkapi, masing-masing dengan asetnya sendiri untuk memastikan pemisahan tanggung jawab (separation of concerns) yang jelas:

1.  **Halaman Kategori Produk (`aset-kategori-sepatu-main`)**
    *   Bertanggung jawab untuk menampilkan daftar produk dalam satu kategori.
    *   Dilengkapi dengan fitur-fitur canggih seperti filtering multi-kriteria (merek, warna, harga), pengurutan, dan fungsionalitas perbandingan produk yang interaktif.
    *   Dirancang agar mudah diduplikasi untuk membuat halaman kategori baru (misal: Pria, Wanita, Anak-anak) dengan usaha minimal.

2.  **Halaman Detail Produk (`aset-sepatu-nyaman-main`)**
    *   Menampilkan informasi lengkap untuk satu produk yang dipilih.
    *   Fitur termasuk galeri gambar multi-varian dengan lightbox dan zoom, kalkulator biaya per pemakaian, tabel spesifikasi, ulasan editor, serta formulir dan tampilan ulasan dari pengguna.

Kedua bagian ini menggunakan satu file konfigurasi Firebase terpusat (`config.js`) yang berada di direktori root untuk efisiensi dan kemudahan pengelolaan.

## Tumpukan Teknologi (Tech Stack)

*   **HTML5**: Markup semantik modern untuk struktur yang kokoh dan SEO-friendly.
*   **CSS3**:
    *   **CSS Variables (Custom Properties)**: Untuk sistem tema (mode terang/gelap) yang terpusat dan mudah dikelola.
    *   **Flexbox & Grid**: Untuk layout yang kompleks dan responsif.
*   **JavaScript (ES6 Modules)**:
    *   Arsitektur modular dengan `import`/`export` untuk kode yang bersih dan terorganisir.
    *   Logika dipisahkan ke dalam modul-modul spesifik (UI, Services, Event Handlers).
    *   Tidak menggunakan framework, fokus pada Vanilla JS untuk performa maksimal.
*   **Firebase (Cloud Firestore)**:
    *   Berfungsi sebagai backend NoSQL real-time untuk menyimpan dan mengambil semua data produk, ulasan, dan kategori.

## Fitur Unggulan

- **Manajemen Konfigurasi Terpusat**: Satu file `config.js` untuk seluruh proyek.
- **Rendering Dinamis**: Semua konten produk dan ulasan diambil langsung dari Firestore.
- **Filtering & Sorting Instan**: Filter sisi klien yang cepat tanpa perlu memuat ulang halaman.
- **Perbandingan Produk Lintas Halaman**: Pengguna dapat menambahkan produk dari halaman kategori dan melihat perbandingannya di halaman detail.
- **Galeri Gambar Lanjutan**: Galeri dengan varian warna, thumbnail, lightbox, dan fungsionalitas *pan & zoom*.
- **Optimasi Gambar**: Penggunaan format WebP secara otomatis dengan fallback ke format standar melalui elemen `<picture>`.
- **Skema & SEO**: Implementasi JSON-LD (Schema.org) untuk `Product` dan `CollectionPage` untuk meningkatkan visibilitas di mesin pencari.
- **Desain Responsif**: Tampilan yang dioptimalkan untuk semua ukuran layar, dari desktop hingga mobile.

## Struktur Direktori Utama

```
sepatu-nyaman/
├── 📄 config.js               # File konfigurasi Firebase.
├── 📄 config.example.js       # Contoh file konfigurasi untuk developer.
├── 📁 aset-kategori-sepatu-main/ # Semua aset untuk halaman KATEGORI.
│   ├── css/
│   ├── js/
│   └── ...
└── 📁 aset-sepatu-nyaman-main/  # Semua aset untuk halaman DETAIL PRODUK.
    ├── css/
    ├── js/
    └── ...
```

## Cara Menjalankan Proyek

Karena proyek ini menggunakan ES6 Modules, Anda tidak bisa membukanya langsung dari file system (`file:///...`). Anda perlu menjalankannya melalui server lokal.

1.  **Konfigurasi Firebase:**
    *   Salin `config.example.js` dan ganti namanya menjadi `config.js`.
    *   Buka `config.js` dan isi semua kredensial Firebase Anda. **PENTING**: File `config.js` sudah ada di dalam `.gitignore` dan tidak boleh diunggah ke repositori publik.

2.  **Jalankan dengan Server Lokal:**
    *   Jika Anda menggunakan Visual Studio Code, cara termudah adalah dengan menginstal ekstensi **Live Server**.
    *   Setelah terinstal, klik kanan pada file HTML yang ingin Anda lihat (misalnya, `sneakers-kasual-pria.html`) dan pilih "Open with Live Server".

## Kontribusi & Pengembangan

Untuk detail tentang cara menambahkan halaman kategori baru atau memodifikasi fungsionalitas spesifik, silakan merujuk ke file `README.md` yang ada di dalam masing-masing direktori aset:

- `aset-kategori-sepatu-main/README.md`
- `aset-sepatu-nyaman-main/README.md`
