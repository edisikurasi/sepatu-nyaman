// Modul ini bertanggung jawab untuk semua interaksi dengan Firebase Firestore.

// Impor fungsi yang dibutuhkan dari Firebase SDK modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, where, query } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { firebaseConfig } from '../../../config.js';

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Mengambil semua produk untuk kategori tertentu dari Firestore.
 * @param {string} category - Kategori produk yang akan diambil.
 * @returns {Promise<Array>} - Sebuah promise yang resolve dengan array objek produk.
 */
async function fetchAllProductsForCategory(category) {
    const allProducts = [];
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('category', '==', category));
        const snapshot = await getDocs(q);

        snapshot.forEach(doc => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Berhasil mengambil ${allProducts.length} total produk untuk kategori "${category}".`);
        return allProducts;
    } catch (error) {
        console.error("Gagal mengambil data produk:", error);
        // Mengembalikan array kosong jika terjadi error agar aplikasi tidak crash
        return [];
    }
}

// Ekspor fungsi yang akan digunakan oleh modul lain
export { fetchAllProductsForCategory };
