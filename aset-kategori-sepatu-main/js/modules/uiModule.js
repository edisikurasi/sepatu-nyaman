// Modul ini berisi semua fungsi yang terkait dengan manipulasi DOM dan pembaruan UI.
// Modul ini tidak menyimpan state; ia menerima state dan elemen sebagai argumen.

// Impor logika filter terpusat untuk digunakan dalam penghitungan.
import { filterProducts } from './filterModule.js'; 

/**
 * Membuat dan menginisialisasi slider header menggunakan Glider.js.
 */
function initializeHeaderSlider() {
    const sliderElement = document.querySelector('#header-slider');
    if (!sliderElement || typeof Glider === 'undefined') return;
    const glider = new Glider(sliderElement, {
        slidesToShow: 1,
        slidesToScroll: 1,
        draggable: false,
        rewind: true,
        duration: 1.5,
    });
    setInterval(() => {
        if (glider) {
            glider.scrollItem('next');
        }
    }, 4000);
}

/**
 * Menginisialisasi breadcrumb dengan mengambil judul kategori dari H1.
 */
function initializeBreadcrumbs() {
    const categoryTitleEl = document.getElementById('category-title');
    const breadcrumbCurrentEl = document.getElementById('breadcrumb-current-category');
    if (categoryTitleEl && breadcrumbCurrentEl) {
        breadcrumbCurrentEl.textContent = categoryTitleEl.textContent;
    }
}

/**
 * Menginisialisasi fitur sorotan "Bandingkan Produk" jika belum pernah dilihat oleh pengguna.
 */
function initializeFeatureSpotlight(elements) {
    const storageKey = 'hasSeenCompareSpotlight';
    if (!localStorage.getItem(storageKey)) {
        elements.spotlight.classList.add('visible');
    }
}

/**
 * Merender produk ke dalam grid.
 * @param {object} context - Berisi state dan elemen DOM.
 */
function renderPage(context) {
    const { state, elements } = context;
    const startIndex = (state.currentPage - 1) * state.PRODUCTS_PER_PAGE;
    const endIndex = startIndex + state.PRODUCTS_PER_PAGE;
    const productsToRender = state.displayedProducts.slice(startIndex, endIndex);

    if (state.currentPage === 1 && productsToRender.length === 0) {
        elements.productGrid.innerHTML = '<p style="text-align: center;">Tidak ada produk yang cocok dengan kriteria Anda.</p>';
    }

    productsToRender.forEach((product, index) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createProductCardHTML(product, state.compareItems).trim();
        const actualCardNode = tempDiv.firstChild;
        elements.productGrid.appendChild(actualCardNode);
        setTimeout(() => {
            actualCardNode.classList.add('visible');
        }, index * 50);
    });

    elements.loadMoreWrapper.style.display = endIndex < state.displayedProducts.length ? 'block' : 'none';
}

/**
 * Mengonversi URL gambar Blogger ke format WebP.
 */
function getBloggerWebpUrl(originalUrl) {
    if (!originalUrl || typeof originalUrl !== 'string') return '';
    return originalUrl.replace(/\/(s|w|h)\d+(-[ch\d]+)?\//, '$&-rw/');
}

/**
 * Membuat elemen <picture> untuk optimasi gambar.
 */
function createPictureElement(product) {
    const webpUrl = getBloggerWebpUrl(product.img_url);
    return `
        <picture>
            <source srcset="${webpUrl}" type="image/webp">
            <img src="${product.img_url || 'https://placehold.co/400x400'}" alt="${product.name || 'Gambar Produk'}" loading="lazy" width="400" height="400">
        </picture>
    `;
}

/**
 * Membuat HTML untuk satu kartu produk.
 * @param {object} product - Data produk.
 * @param {Array} compareItems - Array objek produk yang sedang dibandingkan.
 * @returns {string} - String HTML untuk kartu produk.
 */
function createProductCardHTML(product, compareItems) {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price);
    const isCompared = compareItems.some(item => item.id === product.id);
    const isTopPick = product.editorPickRank && product.editorPickRank > 0;

    return `
        <div class="sn-product-card ${isTopPick ? 'is-top-pick' : ''}" data-id="${product.id}">
            <a href="${product.review_url || '#'}" class="sn-product-link">
                <div class="sn-product-image-wrapper">
                    ${product.discount_badge ? `<div class="sn-product-badge">${product.discount_badge}</div>` : ''}
                    ${createPictureElement(product)}
                    ${product.comfort_score ? `<div class="sn-comfort-score-badge"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.305-.772 1.626 0l1.373 3.311A1.25 1.25 0 0015.11 7.5H18.5a1.25 1.25 0 01.962 1.951l-2.825 2.553a1.25 1.25 0 00-.463 1.29l1.07 3.884a1.25 1.25 0 01-1.882 1.393l-3.262-2.22a1.25 1.25 0 00-1.42 0l-3.262 2.22a1.25 1.25 0 01-1.882-1.393l1.07-3.884a1.25 1.25 0 00-.463-1.29L.538 9.451a1.25 1.25 0 01.962-1.951H4.89a1.25 1.25 0 001.142-1.305l1.373-3.311z" clip-rule="evenodd" /></svg><span>${product.comfort_score}</span></div>` : ''}
                    <button class="sn-compare-button ${isCompared ? 'selected' : ''}" aria-label="Bandingkan"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662a48.678 48.678 0 000 7.324 4.006 4.006 0 003.7 3.7 48.678 48.678 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.21.138-2.43.138-3.662zM12 15a3 3 0 100-6 3 3 0 000 6z" /></svg></button>
                </div>
                <div class="sn-product-details">
                    <div class="sn-brand-line">
                        <div class="sn-product-brand">${product.brand || 'Tanpa Merek'}</div>
                        ${isTopPick ? `<div class="sn-editor-pick-badge"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg><span>Pilihan Editor</span></div>` : ''}
                    </div>
                    <h3 class="sn-product-name">${product.name || 'Nama Produk'}</h3>
                    <div class="sn-price-box">
                        <span class="sn-price">${formattedPrice}</span>
                        ${product.old_price ? `<span class="sn-old-price">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.old_price)}</span>` : ''}
                    </div>
                </div>
            </a>
        </div>
    `;
}

/**
 * Memperbarui jumlah produk yang ditampilkan.
 */
function updateProductCount(context) {
    const { state, elements } = context;
    const total = state.displayedProducts.length;
    const currentlyShown = Math.min(total, state.currentPage * state.PRODUCTS_PER_PAGE);
    elements.productCountElement.textContent = `Menampilkan ${currentlyShown} dari ${total} produk`;
}

/**
 * [UPDATED] Mengisi opsi filter (brand, warna, dan fitur) berdasarkan data produk.
 */
function populateFiltersFromData(allProducts, elements) {
    // Pastikan semua elemen yang dibutuhkan ada
    if (!elements || !elements.brandList || !elements.colorList) {
        console.error("Elemen filter dasar (brand/color) tidak ditemukan!");
        return;
    }

    const { brandList, colorList, featureList } = elements;
    const allBrands = new Set();
    const allColors = new Set();
    const allFeatures = new Set();
   
    allProducts.forEach(data => {
        if (data.brand) allBrands.add(data.brand);
        
        if (data.colors && Array.isArray(data.colors)) {
            data.colors.forEach(color => allColors.add(color));
        }

        if (data.features && Array.isArray(data.features)) {
            data.features.forEach(feature => allFeatures.add(feature));
        }
    });

    // Fungsi helper untuk membuat huruf besar di setiap kata
    const capitalize = (s) => s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Render filter Brand 
    brandList.innerHTML = Array.from(allBrands).sort().map(brand =>
        `<li><label><input type="checkbox" name="brand" value="${brand}"> ${capitalize(brand)}<span class="sn-filter-count"></span></label></li>`
    ).join('');

    // Render filter Warna 
    colorList.innerHTML = Array.from(allColors).sort().map(color =>
        `<li><label><input type="checkbox" name="color" value="${color}"> ${capitalize(color)}<span class="sn-filter-count"></span></label></li>`
    ).join('');

    // Render filter Fitur Unggulan 
    // Logika ini secara sengaja menyembunyikan seluruh fieldset jika tidak ada data fitur yang ditemukan
    // untuk produk dalam kategori ini. Ini mencegah ditampilkannya filter kosong.
    const featureFieldset = featureList ? featureList.closest('.sn-filter-group') : null;
    if (featureList && featureFieldset && allFeatures.size > 0) {
        featureFieldset.style.display = ''; 
        featureList.innerHTML = Array.from(allFeatures).sort().map(feature =>
            `<li><label><input type="checkbox" name="features" value="${feature}"> ${capitalize(feature)}<span class="sn-filter-count"></span></label></li>`
        ).join('');
    } else if (featureFieldset) {
        // Sembunyikan jika tidak ada fitur yang tersedia
        featureFieldset.style.display = 'none';
    }
}

/**
 * [REFACTOR] Memperbarui hitungan di samping setiap opsi filter dengan logika faceted search yang akurat.
 * @param {object} context - Berisi allProducts dan activeFilters.
 */
function updateFilterCounts({ allProducts, activeFilters }) {
    const filterGroups = ['brand', 'color', 'price', 'features'];

    filterGroups.forEach(groupName => {
        const groupCheckboxes = document.querySelectorAll(`input[name="${groupName}"]`);
        
        groupCheckboxes.forEach(checkbox => {
            // 1. Buat set filter sementara berdasarkan semua filter aktif dari GRUP LAIN.
            const tempFilters = {
                brands: groupName === 'brand' ? [] : [...activeFilters.brands],
                colors: groupName === 'color' ? [] : [...activeFilters.colors],
                prices: groupName === 'price' ? [] : [...activeFilters.prices],
                features: groupName === 'features' ? [] : [...activeFilters.features],
            };

            // 2. Tambahkan nilai checkbox saat ini ke set filter sementara.
            const pluralGroupName = groupName === 'features' ? 'features' : `${groupName}s`;
            tempFilters[pluralGroupName].push(checkbox.value);

            // 3. Hitung jumlah produk yang cocok.
            const count = filterProducts(allProducts, tempFilters).length;

            // 4. Perbarui elemen UI (desktop & mobile) dengan hitungan baru.
            const uiElements = document.querySelectorAll(`input[name="${checkbox.name}"][value="${checkbox.value}"]`);
            uiElements.forEach(el => {
                const countSpan = el.closest('label')?.querySelector('.sn-filter-count');
                const listItem = el.closest('li');
                if (countSpan) countSpan.textContent = `(${count})`;
                if (listItem) listItem.classList.toggle('disabled', count === 0 && !el.checked);
            });
        });
    });
}

/**
 * Mengontrol visibilitas tombol "Reset Filter".
 */
function checkActiveFilters(elements) {
    const activeFilters = document.querySelectorAll('#desktop-sidebar input[type="checkbox"]:checked, #mobile-filter-container input[type="checkbox"]:checked');
    const hasActiveFilters = activeFilters.length > 0;
    
    if(elements.resetFilterWrapper) {
        elements.resetFilterWrapper.classList.toggle('visible', hasActiveFilters);
    }
    if(elements.resetFilterBtnMobile) {
        elements.resetFilterBtnMobile.classList.toggle('visible', hasActiveFilters);
    }
}

/**
 * Memperbarui URL browser dengan parameter filter.
 */
function updateUrlWithFilters(sortSelect) {
    const params = new URLSearchParams();
    const activeBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(el => el.value);
    const activeColors = Array.from(document.querySelectorAll('input[name="color"]:checked')).map(el => el.value);
    const activePrices = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(el => el.value);
    const activeFeatures = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(el => el.value);
    const sortBy = sortSelect.value;

    activeBrands.forEach(brand => params.append('brand', brand));
    activeColors.forEach(color => params.append('color', color));
    activePrices.forEach(price => params.append('price', price));
    activeFeatures.forEach(feature => params.append('feature', feature));

    if (sortBy !== 'rekomendasi') params.set('sort', sortBy);
    
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

/**
 * Menerapkan filter dari parameter URL saat halaman dimuat.
 */
function applyFiltersFromUrl(sortSelect) {
    const params = new URLSearchParams(window.location.search);
    params.getAll('brand').forEach(brand => { const cb = document.querySelector(`input[name="brand"][value="${brand}"]`); if (cb) cb.checked = true; });
    params.getAll('color').forEach(color => { const cb = document.querySelector(`input[name="color"][value="${color}"]`); if (cb) cb.checked = true; });
    params.getAll('price').forEach(price => { const cb = document.querySelector(`input[name="price"][value="${price}"]`); if (cb) cb.checked = true; });
    params.getAll('feature').forEach(feature => { const cb = document.querySelector(`input[name="features"][value="${feature}"]`); if (cb) cb.checked = true; });
    const sortBy = params.get('sort');
    if (sortBy) sortSelect.value = sortBy;
}

/**
 * Memperbarui Schema Markup JSON-LD.
 */
function updateSchemaMarkup(products) {
    const schemaContainer = document.getElementById('collection-schema');
    if (!schemaContainer) return;

    const itemListElements = products.map((product, index) => ({
        "@type": "ListItem", "position": index + 1,
        "item": {
            "@type": "Product", "name": product.name, "image": product.img_url,
            "description": `Ulasan mendalam dan spesifikasi untuk ${product.name}.`,
            "url": product.review_url,
            "brand": { "@type": "Brand", "name": product.brand },
            "offers": {
                "@type": "Offer", "price": product.price, "priceCurrency": "IDR",
                "availability": product.in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                "url": product.affiliate_url
            }
        }
    }));

    const schema = {
        "@context": "https://schema.org", "@type": "CollectionPage",
        "name": document.getElementById('category-title').textContent,
        "description": document.getElementById('category-description').textContent,
        "url": window.location.href,
        "mainEntity": { "@type": "ItemList", "itemListElement": itemListElements }
    };
    schemaContainer.textContent = JSON.stringify(schema, null, 2);
}

/**
 * Memperbarui baki perbandingan (compare tray).
 */
function updateCompareTray({ state, elements }) {
    elements.compareTray.classList.toggle('visible', state.compareItems.length > 0);
    elements.compareItemsContainer.innerHTML = '';
    state.compareItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('sn-compare-item');
        itemElement.innerHTML = `<img src="${item.img_url}" alt="${item.name}"><div class="sn-compare-item-name">${item.name}</div><button class="sn-remove-compare" data-id="${item.id}">×</button>`;
        elements.compareItemsContainer.appendChild(itemElement);
    });
    elements.compareButtonCTA.disabled = state.compareItems.length < 2;
    elements.compareButtonCTA.textContent = state.compareItems.length >= 2 ? `Bandingkan (${state.compareItems.length})` : 'Bandingkan';
}

/**
 * Menampilkan modal perbandingan produk.
 */
function showCompareModal({ state, elements }) {
    if (state.compareItems.length < 2) return;
    
    let tableHTML = '<table class="sn-compare-table"><thead><tr><th>Fitur</th>';
    state.compareItems.forEach(item => { tableHTML += `<th><img src="${item.img_url}" alt="${item.name}"></th>`; });
    tableHTML += '</tr></thead><tbody>';

    const createRow = (label, key, isArray = false) => {
        let row = `<tr><th>${label}</th>`;
        state.compareItems.forEach(item => {
            let value = item[key] || '-';
            if (isArray && Array.isArray(value)) value = `<ul>${value.map(v => `<li>${v.trim()}</li>`).join('')}</ul>`;
            else if (key === 'price' || key === 'old_price') value = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
            row += `<td>${value}</td>`;
        });
        return row + '</tr>';
    };

    tableHTML += createRow('Merek', 'brand');
    tableHTML += createRow('Nama', 'name');
    tableHTML += createRow('Skor Kenyamanan', 'comfort_score');
    tableHTML += createRow('Harga', 'price');
    tableHTML += createRow('Material', 'material');
    tableHTML += createRow('Kelebihan', 'advantages', true);
    tableHTML += createRow('Kekurangan', 'disadvantages', true);
    tableHTML += '<tr class="cta-cell"><th></th>';
    state.compareItems.forEach(item => {
        tableHTML += `<td><a href="${item.review_url || '#'}" class="sn-cta-button sn-cta-primary" target="_blank">Lihat Detail</a></td>`;
    });
    tableHTML += '</tr></tbody></table>';
    
    elements.compareTableContainer.innerHTML = tableHTML;
    elements.compareModal.style.display = 'flex';
}


export {
    initializeHeaderSlider,
    initializeBreadcrumbs,
    initializeFeatureSpotlight,
    renderPage,
    createProductCardHTML,
    updateProductCount,
    populateFiltersFromData,
    updateFilterCounts,
    checkActiveFilters,
    updateUrlWithFilters,
    applyFiltersFromUrl,
    updateSchemaMarkup,
    updateCompareTray,
    showCompareModal
};
