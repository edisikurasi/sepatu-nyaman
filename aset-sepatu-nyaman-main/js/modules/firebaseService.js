/**
 * ===================================================================
 * firebaseService.js - Modul Layanan Firebase untuk Sepatu Nyaman
 * ===================================================================
 * * Modul ini bertanggung jawab untuk semua interaksi dengan Firebase Firestore.
 * Ini mengisolasi logika database dari bagian lain aplikasi, membuatnya 
 * lebih mudah untuk dikelola dan diuji.
 * * Fungsi yang diekspor:
 * - initializeFirebase: Menginisialisasi aplikasi Firebase.
 * - fetchProductData: Mengambil data satu produk berdasarkan ID.
 * - fetchUserReviews: Mengambil semua ulasan pengguna untuk produk tertentu.
 * - submitUserReview: Mengirim ulasan baru dari pengguna ke database.
 * - fetchRelatedProducts: Mengambil produk terkait dari kategori yang sama.
 * */

// Impor fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, where, query, orderBy, limit, addDoc, documentId } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { firebaseConfig } from '../../../config.js'; // <-- Impor dari file konfigurasi

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchProductData(id) {
    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
        return null;
    } catch (error) { console.error("Error saat mengambil data produk:", error); return null; }
}

async function fetchUserReviews(productId) {
    const reviews = [];
    try {
        const reviewsRef = collection(db, 'products', productId, 'user_reviews');
        const q = query(reviewsRef, where('isApproved', '==', true), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
    } catch (error) { console.error("Error saat mengambil ulasan pengguna:", error); }
    return reviews;
}

async function fetchRelatedProducts(category, currentId, limitCount = 10) {
    const products = [];
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, 
            where('category', '==', category), 
            where(documentId(), '!=', currentId), 
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => { products.push({ id: doc.id, ...doc.data() }); });
    } catch (error) { console.error("Error saat mengambil produk terkait:", error); }
    return products;
}

/**
 * Mengambil semua produk untuk kategori tertentu.
 * @param {string} categoryName - Nama kategori yang akan diambil.
 * @returns {Promise<Array>} - Promise yang resolve dengan array produk.
 */
async function fetchAllProductsForCategory(categoryName) {
    const products = [];
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('category', '==', categoryName));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() }));
    } catch (error) { console.error("Error saat mengambil semua produk:", error); }
    return products;
}

async function submitUserReview(productId, reviewData) {
    try {
        const reviewsRef = collection(db, 'products', productId, 'user_reviews');
        await addDoc(reviewsRef, reviewData);
        return true;
    } catch (error) {
        console.error("Error saat mengirim ulasan:", error);
        return false;
    }
}

export { fetchAllProductsForCategory, fetchProductData, fetchUserReviews, submitUserReview, fetchRelatedProducts };
