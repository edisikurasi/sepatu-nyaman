/**
 * filterModule.js - Modul terpusat untuk semua logika pemfilteran produk.
 * Ini memastikan bahwa aturan filter konsisten di seluruh aplikasi.
 */

/**
 * Fungsi pusat untuk memfilter produk berdasarkan kriteria yang aktif.
 * @param {Array} products - Array produk yang akan difilter.
 * @param {object} filters - Objek yang berisi filter aktif (brands, colors, prices, features).
 * @returns {Array} - Array produk yang sudah difilter.
 */
export function filterProducts(products, filters) {
    return products.filter(p => {
        const brandMatch = !filters.brands.length || filters.brands.includes(p.brand);
        const colorMatch = !filters.colors.length || (p.colors && p.colors.some(c => filters.colors.includes(c)));
        const featureMatch = !filters.features.length || (p.features && p.features.some(f => filters.features.includes(f)));
        const priceMatch = !filters.prices.length || filters.prices.some(range => {
            if (range === 'under500') return p.price < 500000;
            if (range === '500-1jt') return p.price >= 500000 && p.price <= 1000000;
            if (range === 'over1jt') return p.price > 1000000;
            return false;
        });
        return brandMatch && colorMatch && featureMatch && priceMatch;
    });
}