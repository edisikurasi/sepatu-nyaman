/**
 * ===================================================================
 * detail-produk.js - Skrip Utama Halaman Detail Produk
 * ===================================================================
 * * Ini adalah titik masuk (entry point) utama untuk semua logika 
 * JavaScript di halaman detail produk.
 * * Tugasnya adalah mengorkestrasi alur kerja aplikasi:
 * 1. Mengimpor semua modul yang diperlukan.
 * 2. Mengambil ID produk dari URL.
 * 3. Menginisialisasi Firebase.
 * 4. Meminta data dari `firebaseService`.
 * 5. Menyerahkan data ke `uiModule` untuk ditampilkan.
 * 6. Memanggil `eventHandlers` untuk membuat halaman menjadi interaktif.
 * 7. Menangani status loading dan error.
 * */

// Impor semua modul yang telah kita buat
import * as firebaseService from './modules/firebaseService.js';
import { uiModule } from './modules/uiModule.js';
import { eventHandlers } from './modules/eventHandlers.js';

function getProductIdFromUrl() {
    return new URLSearchParams(window.location.search).get('id');
}

async function initializePage() {
    const productId = getProductIdFromUrl();
    if (!productId) {
        uiModule.showError("ID produk tidak ditemukan di URL.");
        return;
    }

    try {
        // --- Langkah 1: Ambil data inti (blocking) ---
        const productData = await firebaseService.fetchProductData(productId);
        if (!productData) {
            uiModule.showError(`Produk dengan ID "${productId}" tidak ditemukan.`);
            return;
        }

        // --- Langkah 2: Render konten utama & tampilkan halaman ---
        // Ini terjadi secepat mungkin setelah data inti diterima.
        uiModule.populatePage(productData);
        eventHandlers.initializeInteractiveElements(productData);

        document.getElementById('loading-container').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';

        // --- Langkah 3: Ambil dan render data sekunder secara paralel ---
        // Fungsi-fungsi ini sekarang berjalan di latar belakang tanpa memblokir tampilan utama.

        // Paralel 1: Muat produk terkait
        uiModule.populateRelatedProducts(productData).catch(error => {
            console.error("Gagal memuat produk terkait:", error);
            const relatedSection = document.getElementById('related-products-section');
            if (relatedSection) relatedSection.style.display = 'none';
        });

        // Paralel 2: Muat ulasan pengguna
        firebaseService.fetchUserReviews(productId)
            .then(userReviews => {
                uiModule.populateUserReviews(userReviews);
            })
            .catch(error => {
                console.error("Gagal memuat ulasan pengguna:", error);
                const userReviewsSection = document.getElementById('user-reviews-section');
                if (userReviewsSection) userReviewsSection.style.display = 'none';
            });

    } catch (error) {
        console.error("Terjadi kesalahan fatal saat inisialisasi halaman:", error);
        uiModule.showError("Gagal memuat halaman. Silakan coba lagi nanti.");
    }
}

initializePage();
