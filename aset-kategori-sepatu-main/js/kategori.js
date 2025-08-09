// File ini bertindak sebagai orkestrator utama (main entry point).
// Ia mengimpor modul, mendefinisikan state aplikasi, dan menghubungkan semuanya.

import { fetchAllProductsForCategory } from './modules/firebaseService.js';
import * as ui from './modules/uiModule.js';
import { filterProducts } from './modules/filterModule.js'; // <-- Impor logika filter
import { initializeEventListeners } from './modules/eventHandlers.js';

// --- KONFIGURASI HALAMAN ---
// Kategori diambil dari atribut data di body, membuat skrip ini generik.
const PAGE_CATEGORY = document.body.dataset.category || '';

const PRODUCTS_PER_PAGE = 9;
const MAX_COMPARE_ITEMS = 4;

// --- STATE APLIKASI ---
// Menyimpan semua state di satu objek agar mudah dikelola dan dilacak.
const state = {
    allProducts: [],
    displayedProducts: [],
    compareItems: [],
    currentPage: 1,
    isLoading: false,
    PRODUCTS_PER_PAGE: PRODUCTS_PER_PAGE,
    MAX_COMPARE_ITEMS: MAX_COMPARE_ITEMS
};

// --- ELEMEN DOM ---
// Mengumpulkan semua referensi elemen DOM di satu tempat.
const elements = {
    productGrid: document.getElementById('product-grid'),
    productCountElement: document.querySelector('.sn-product-count'),
    loadMoreBtn: document.getElementById('muat-lebih-banyak'),
    loadMoreWrapper: document.getElementById('load-more-wrapper'),
    sortSelect: document.getElementById('sort-by'),
    desktopFilterContainer: document.getElementById('filter-container'),
    mobileFilterContainer: document.getElementById('mobile-filter-container'),
    mobileFilterTrigger: document.getElementById('mobile-filter-trigger'),
    filterModal: document.getElementById('sn-filter-modal'),
    filterModalClose: document.getElementById('sn-filter-modal-close'),
    applyFiltersBtn: document.getElementById('sn-apply-filters-btn'),
    compareTray: document.getElementById('sn-compare-tray'),
    compareItemsContainer: document.getElementById('sn-compare-items-container'),
    compareButtonCTA: document.getElementById('sn-compare-button-cta'),
    clearCompareButton: document.getElementById('sn-clear-compare'),
    compareModal: document.getElementById('sn-compare-modal'),
    compareModalClose: document.getElementById('sn-compare-modal-close'),
    compareTableContainer: document.getElementById('sn-compare-table-container'),
    resetFilterWrapper: document.getElementById('reset-filter-wrapper'),
    resetFilterBtn: document.getElementById('reset-filter-btn'),
    resetFilterBtnMobile: document.getElementById('reset-filter-btn-mobile'),
    spotlight: document.getElementById('feature-spotlight'),
    spotlightDismissBtn: document.getElementById('spotlight-dismiss-btn'),
    brandList: document.getElementById('brand-filter-list'),
    colorList: document.getElementById('color-filter-list'),
    featureList: document.getElementById('feature-filter-list')
};

// --- FUNGSI HANDLER DAN ORKESTRASI ---

/**
 * Mengambil semua filter yang aktif dari DOM.
 * @returns {object} - Objek yang berisi array filter aktif.
 */
function getActiveFilters() {
    return {
        brands: Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(el => el.value),
        colors: Array.from(document.querySelectorAll('input[name="color"]:checked')).map(el => el.value),
        prices: Array.from(document.querySelectorAll('input[name="price"]:checked')).map(el => el.value),
        features: Array.from(document.querySelectorAll('input[name="features"]:checked')).map(el => el.value)
    };
}

/**
 * Menerapkan filter dan pengurutan, lalu merender ulang produk.
 * Ini adalah fungsi inti yang dipanggil setiap kali ada perubahan filter atau urutan.
 */
function applyFiltersAndRender() {
    // 1. Tambahkan kelas untuk memulai transisi fade-out (via CSS)
    elements.productGrid.classList.add('filtering');

    // 2. Ambil semua filter yang aktif dari DOM menggunakan fungsi terpusat.
    const activeFilters = getActiveFilters();
    const sortBy = elements.sortSelect.value;

    // 3. Gunakan fungsi filter utama untuk mendapatkan produk yang sesuai.
    let filtered = filterProducts(state.allProducts, activeFilters);

    // 4. Lakukan pengurutan pada produk yang sudah difilter.
    filtered.sort((a, b) => {
        const rankA = a.editorPickRank || Infinity;
        const rankB = b.editorPickRank || Infinity;
        if (rankA !== rankB) return rankA - rankB; // Pilihan Editor selalu di atas
        if (sortBy === 'harga-terendah') return a.price - b.price; // Harga: Terendah ke Tertinggi
        if (sortBy === 'harga-tertinggi') return b.price - a.price; // Harga: Tertinggi ke Terendah
        if (sortBy === 'terbaru') return (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0); // Terbaru
        return (b.comfort_score || 0) - (a.comfort_score || 0); // Default: Rekomendasi (berdasarkan skor)
    });

    // 5. Perbarui state aplikasi dan render ulang UI.
    state.displayedProducts = filtered;
    elements.productGrid.innerHTML = ''; // Hapus konten lama
    state.currentPage = 1;

    // Panggil renderPage dengan konteks yang lengkap
    ui.renderPage({ state, elements });
    ui.updateProductCount({ state, elements });
    ui.updateFilterCounts({ allProducts: state.allProducts, activeFilters });
    ui.updateSchemaMarkup(state.displayedProducts);
    ui.updateUrlWithFilters(elements.sortSelect);

    // 6. Hapus kelas untuk memulai transisi fade-in (via CSS).
    // requestAnimationFrame memastikan browser siap untuk menganimasikan perubahan.
    requestAnimationFrame(() => {
        elements.productGrid.classList.remove('filtering');
    });
}

function handleLoadMore() {
    state.currentPage++;
    // Panggil renderPage dengan konteks yang lengkap
    ui.renderPage({ state, elements });
    ui.updateProductCount({ state, elements });
}

function handleCompareClick(button) {
    const productId = button.closest('.sn-product-card').dataset.id;
    const itemIndex = state.compareItems.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        // Hapus jika sudah ada
        state.compareItems.splice(itemIndex, 1);
        button.classList.remove('selected');
    } else {
        // Tambahkan jika belum ada (dan belum penuh)
        if (state.compareItems.length >= MAX_COMPARE_ITEMS) {
            alert(`Anda hanya bisa membandingkan maksimal ${MAX_COMPARE_ITEMS} produk.`);
            return;
        }
        const productData = state.allProducts.find(p => p.id === productId);
        if (productData) {
            state.compareItems.push(productData);
            button.classList.add('selected');
        }
    }
    ui.updateCompareTray({ state, elements });
}

function handleRemoveCompareItem(productId) {
    state.compareItems = state.compareItems.filter(item => item.id !== productId);
    const buttonInCard = document.querySelector(`.sn-product-card[data-id="${productId}"] .sn-compare-button`);
    if (buttonInCard) buttonInCard.classList.remove('selected');
    ui.updateCompareTray({ state, elements });
}

function handleClearCompare() {
    state.compareItems = [];
    document.querySelectorAll('.sn-compare-button.selected').forEach(btn => btn.classList.remove('selected'));
    ui.updateCompareTray({ state, elements });
}

function handleFilterChange(filterCheckbox, isDesktop) {
    if (isDesktop) {
        const mobileCheckbox = document.querySelector(`#mobile-filter-container input[name="${filterCheckbox.name}"][value="${filterCheckbox.value}"]`);
        if (mobileCheckbox) mobileCheckbox.checked = filterCheckbox.checked;
    } else {
        const desktopCheckbox = document.querySelector(`#desktop-sidebar input[name="${filterCheckbox.name}"][value="${filterCheckbox.value}"]`);
        if (desktopCheckbox) desktopCheckbox.checked = filterCheckbox.checked;
    }
    applyFiltersAndRender();
    ui.checkActiveFilters(elements);
}

function handleResetFilters() {
    const allCheckboxes = document.querySelectorAll('#desktop-sidebar input[type="checkbox"], #mobile-filter-container input[type="checkbox"]');
    allCheckboxes.forEach(cb => cb.checked = false);
    applyFiltersAndRender();
    ui.checkActiveFilters(elements);
}

// --- INISIALISASI HALAMAN ---

/**
 * Fungsi utama untuk menginisialisasi seluruh halaman.
 * Ia memanggil fungsi dari modul lain dalam urutan yang benar.
 */
async function initializePage() {
    // Validasi: Hentikan eksekusi jika kategori tidak ditemukan di HTML.
    if (!PAGE_CATEGORY) {
        console.error('Error: Atribut "data-category" tidak ditemukan pada elemen <body>. Inisialisasi dibatalkan.');
        elements.productGrid.innerHTML = '<p style="text-align: center; color: red;">Kesalahan konfigurasi halaman. Gagal memuat produk.</p>';
        return;
    }
    // 1. Inisialisasi UI awal yang tidak bergantung pada data
    ui.initializeHeaderSlider();
    ui.initializeBreadcrumbs();
    ui.initializeFeatureSpotlight(elements);

    // 2. Ambil data produk dari Firebase
    state.isLoading = true;
    state.allProducts = await fetchAllProductsForCategory(PAGE_CATEGORY);
    state.isLoading = false;

    // 3. Jika data berhasil diambil, lanjutkan inisialisasi
    if (state.allProducts.length > 0) {
        // 4. Isi filter dengan data yang ada & salin ke mobile
        ui.populateFiltersFromData(state.allProducts, elements);
        if (elements.desktopFilterContainer && elements.mobileFilterContainer) {
            elements.mobileFilterContainer.innerHTML = elements.desktopFilterContainer.innerHTML;
        }

        // 5. Daftarkan semua event listener
        const context = {
            state: state,
            elements: elements,
            handlers: {
                applyFiltersAndRender,
                handleLoadMore,
                handleCompareClick,
                handleRemoveCompareItem,
                handleClearCompare,
                handleShowCompareModal: () => ui.showCompareModal({ state, elements }), // Pastikan ini benar
                handleFilterChange,
                handleResetFilters
            }
        };
        initializeEventListeners(context);
        
        // 6. Terapkan filter dari URL (jika ada)
        ui.applyFiltersFromUrl(elements.sortSelect);

        // 7. Lakukan render awal
        applyFiltersAndRender();
        ui.checkActiveFilters(elements);

    } else {
        // Tampilkan pesan error jika tidak ada produk
        elements.productGrid.innerHTML = '<p style="text-align: center; color: red;">Gagal memuat produk. Silakan coba lagi nanti.</p>';
        document.querySelector('.sn-toolbar').style.display = 'none';
    }
}

// Jalankan aplikasi
initializePage();
