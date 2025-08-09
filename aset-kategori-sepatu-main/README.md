# Proyek Halaman Kategori Produk - Sepatu Nyaman

Selamat datang di direktori aset untuk **Halaman Kategori Produk**. Bagian ini berisi semua file frontend (JavaScript, CSS, HTML) yang membentuk sebuah template canggih dan dapat digunakan kembali untuk menampilkan daftar produk e-commerce.

Arsitektur ini dirancang secara modular dengan tujuan utama untuk memungkinkan pembuatan halaman kategori baru (misalnya, untuk Pria, Wanita, Anak-anak) dengan usaha minimal, memaksimalkan penggunaan kembali kode, dan memastikan pemeliharaan yang mudah.

## Fitur Utama

*   **Rendering Produk Dinamis**: Semua produk diambil secara *real-time* dari Cloud Firestore berdasarkan kategori yang ditentukan.
*   **Filtering & Sorting Canggih**:
    *   **Filter Multi-Kriteria**: Filter produk berdasarkan merek, warna, rentang harga, dan fitur unggulan.
    *   **Faceted Search**: Jumlah produk yang tersedia untuk setiap opsi filter diperbarui secara dinamis saat filter lain diterapkan, memberikan pengalaman belanja yang intuitif.
    *   **Pengurutan Instan**: Urutkan produk berdasarkan rekomendasi, harga (tertinggi/terendah), atau tanggal terbaru tanpa memuat ulang halaman.
*   **Perbandingan Produk Interaktif**:
    *   Pengguna dapat memilih hingga 4 produk untuk dibandingkan.
    *   Menampilkan *tray* perbandingan di bagian bawah layar.
    *   Menampilkan modal dengan tabel perbandingan fitur-demi-fitur yang detail.
*   **Manajemen State di URL**: Filter dan urutan yang aktif disimpan di URL, memungkinkan pengguna untuk membagikan atau me-bookmark hasil pencarian mereka.
*   **Optimasi Pengalaman Pengguna (UX)**:
    *   **Pemuatan Progresif**: Menggunakan *skeleton loaders* untuk memberikan feedback visual saat data sedang diambil.
    *   **Lazy Loading & WebP**: Gambar produk dioptimalkan dengan *lazy loading* dan disajikan dalam format WebP modern (dengan *fallback*) untuk kecepatan muat maksimal.
    *   **Tombol "Muat Lebih Banyak"**: Produk dimuat secara bertahap untuk menjaga performa halaman.
*   **SEO & Skema Teroptimasi**: Secara otomatis menghasilkan **JSON-LD (Schema.org)** untuk tipe `CollectionPage` dan `Product`, meningkatkan visibilitas di hasil pencarian.

## Tumpukan Teknologi

*   **HTML5**: Markup semantik untuk struktur yang kokoh.
*   **CSS3**: Menggunakan **CSS Variables** untuk sistem tema (terang/gelap) yang terpusat.
*   **JavaScript (ES6 Modules)**: Arsitektur modular Vanilla JS untuk kode yang bersih, terorganisir, dan berperforma tinggi.
*   **Firebase (Cloud Firestore)**: Berfungsi sebagai backend NoSQL untuk semua data produk.
*   **Glider.js**: Pustaka ringan untuk slider gambar di header.

## Struktur Direktori

Struktur direktori dirancang untuk memisahkan antara logika, gaya, dan aset.

```
aset-sepatu-nyaman/
├── 📁 css/
│   ├── 📄 main.css           # Gaya utama untuk semua komponen UI
│   └── 📄 theme.css          # Variabel warna untuk tema terang/gelap
├── 📁 html/
│   └── 📄 sneaker-kasual-wanita.html # Halaman utama untuk wanita
└── 📁 js/
    ├── 📁 lib/
    │   └── 📄 glider.min.js  # Pustaka slider
    ├── 📁 modules/
    │   ├── 📄 eventHandlers.js   # Modul untuk semua event listener
    │   ├── 📄 firebaseService.js # Modul untuk interaksi dengan Firestore
    │   └── 📄 uiModule.js        # Modul untuk semua manipulasi DOM & UI
    ├── 📄 kategori-sneakers-kasual-pria.js      # Titik masuk JS untuk halaman pria
    └── 📄 config.js     # Titik masuk JS untuk halaman wanita```

---

## Tutorial: Cara Menambahkan Halaman Kategori Baru

Berkat arsitektur modular, menambahkan halaman kategori baru (misalnya, "Sepatu Formal Pria" atau "Sandal Anak-anak") adalah proses yang sangat efisien. Anda hanya perlu membuat dua file baru dan memodifikasi beberapa baris kode.

Mari kita gunakan "Sneakers & Kasual Wanita" sebagai contoh.

### Langkah 1: Duplikasi dan Penamaan Ulang File Inti

Anda hanya perlu menduplikasi file HTML dan JavaScript dari kategori yang sudah ada.

1.  **Duplikasi File HTML:**
    *   Salin: `aset-sepatu-nyaman/sneakers-kasual-pria.html`
    *   Beri nama baru: `aset-sepatu-nyaman/kategori-sneaker-kasual-wanita.html`

2.  **Duplikasi File JavaScript Utama:**
    *   Salin: `aset-sepatu-nyaman/js/kategori-sneakers-kasual-pria.js`
    *   Beri nama baru: `aset-sepatu-nyaman/js/kategori-sneaker-kasual-wanita.js`

### Langkah 2: Modifikasi File HTML (`kategori-sneaker-kasual-wanita.html`)

Buka file HTML yang baru saja Anda buat dan sesuaikan kontennya agar relevan dengan kategori baru.

1.  **Ubah Judul Halaman (`<title>`):**
    ```html
    <title>Koleksi Sneakers & Kasual Wanita Pilihan | Sepatu Nyaman</title>
    ```

2.  **Ubah Gambar Header:**
    Ganti semua URL `srcset` dan `src` di dalam elemen `<picture>` pada `<div id="header-slider">` dengan gambar yang relevan untuk koleksi wanita.

3.  **Ubah Teks Header (Breadcrumb, H1, Deskripsi):**
    ```html
    <nav class="sn-breadcrumbs" aria-label="breadcrumb">
        <ol>
            ...
            <li>
                <span id="breadcrumb-current-category" class="sn-breadcrumb-current" aria-current="page">Sneakers & Kasual Wanita</span>
            </li>
        </ol>
    </nav>
    <h1 id="category-title">Sneakers & Kasual Wanita</h1>
    <p id="category-description">Jelajahi koleksi sneakers & kasual wanita kami yang dirancang untuk kenyamanan dan gaya maksimal setiap saat.</p> 
    ```

4.  **Ubah Konten "Catatan dari Editor" (`.sn-editors-corner`):**
    ```html
    <div class="sn-editor-text">
        <h3>Catatan dari Editor</h3>
        <p>Hi Ladies! Untuk Anda yang aktif, bulan ini kami hadirkan koleksi sepatu slip-on yang super praktis tanpa mengorbankan gaya. Padukan dengan outfit apapun dan tetap nyaman seharian. Happy shopping!</p>
    </div>
    ```

5.  **PENTING: Perbarui Tautan File JavaScript:**
    Di bagian paling bawah `<body>`, pastikan tag `<script>` menunjuk ke file JavaScript **wanita** yang baru.
    ```html
    <!-- Di bagian akhir <body> -->
    <script src="js/lib/glider.min.js"></script>
    <!-- PASTIKAN INI MENUNJUK KE FILE YANG BENAR -->
    <script type="module" src="js/kategori-sneaker-kasual-wanita.js"></script>
    ```

### Langkah 3: Modifikasi File JavaScript (`js/kategori-sneaker-kasual-wanita.js`)

Ini adalah satu-satunya perubahan teknis yang diperlukan.

1.  **Ubah Variabel Kategori Halaman:**
    Buka file `js/kategori-sneaker-kasual-wanita.js`. Di bagian paling atas, terdapat konstanta `PAGE_CATEGORY`. Ubah nilainya agar cocok dengan nilai `category` pada dokumen produk di database Firestore Anda.

    Ubah baris ini:
    ```javascript
    // --- DEFINISI KONSTANTA ---
    const PAGE_CATEGORY = "sneakers & kasual pria";
    ```
    Menjadi baris ini:
    ```javascript
    // --- DEFINISI KONSTANTA ---
    const PAGE_CATEGORY = "sneakers & kasual wanita"; // <-- UBAH DI SINI
    ```

### Langkah 4: Pastikan Data Ada di Firestore

Langkah terakhir adalah memastikan Anda memiliki data produk di Cloud Firestore yang sesuai dengan kategori baru. Modul `firebaseService.js` akan secara otomatis mencari dokumen di koleksi `products` di mana field `category` memiliki nilai yang sama dengan `PAGE_CATEGORY` yang Anda tetapkan.

Contoh struktur dokumen produk di Firestore:
```json
{
  "name": "Aero Stride Slip-On",
  "brand": "skechers",
  "price": 899000,
  "category": "sneakers & kasual wanita", // <-- Field ini harus cocok
  "img_url": "https://...",
  "comfort_score": 9.5,
  "colors": ["hitam", "putih"],
  "features": ["slip-on", "arch-fit"],
  "review_url": "https://...",
  "affiliate_url": "https://..."
}
```

Selesai! Dengan mengikuti langkah-langkah ini, halaman kategori baru Anda akan langsung berfungsi, mewarisi semua fungsionalitas canggih dari template tanpa perlu menulis ulang logika apa pun.
