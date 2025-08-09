/**
 * ===================================================================
 * uiModule.js - Modul Manipulasi UI untuk Sepatu Nyaman
 * ===================================================================
 * * Modul ini bertanggung jawab untuk semua pembaruan pada DOM (Document Object Model).
 * Fungsinya adalah mengambil data dan menampilkannya di halaman HTML.
 * Ini mencakup pembuatan elemen, pembaruan teks, dan pengelolaan visibilitas komponen.
 * */

// Impor layanan firebase untuk mengambil data produk terkait (jika diperlukan di masa depan)
// import * as firebaseService from './firebaseService.js';

/**
 * Mengoptimalkan URL gambar dari Blogger untuk format WebP yang lebih cepat.
 * @param {string} originalUrl - URL gambar asli dari Blogger.
 * @returns {string} URL gambar yang sudah dioptimalkan dengan parameter -rw.
 */
import * as firebaseService from './firebaseService.js';

function getBloggerWebpUrl(originalUrl) {
    if (!originalUrl || typeof originalUrl !== 'string') return '';
    return originalUrl.replace(/\/(s|w|h)\d+(-[ch\d]+)?\//, '/s1600-rw/');
}

function createPictureElement(originalUrl, altText, id = '', className = '') {
    const webpUrl = getBloggerWebpUrl(originalUrl);
    let pictureHtml = `<picture>`;
    if (webpUrl) pictureHtml += `<source srcset="${webpUrl}" type="image/webp">`;
    pictureHtml += `<img src="${originalUrl}" alt="${altText}"`;
    if (id) pictureHtml += ` id="${id}"`;
    if (className) pictureHtml += ` class="${className}"`;
    pictureHtml += ` loading="lazy">`;
    pictureHtml += `</picture>`;
    return pictureHtml;
}

function getSummaryFromReviewContent(reviewContent) {
    if (!Array.isArray(reviewContent) || reviewContent.length === 0) {
        return "Ulasan mendalam dan spesifikasi lengkap produk ini.";
    }
    const firstParagraph = reviewContent.find(block => block.type === 'paragraph');
    return firstParagraph ? firstParagraph.content : "Ulasan mendalam dan spesifikasi lengkap produk ini.";
}

function updateMetaAndSchema(product) {
    let allImageUrls = [];
    if (product.color_variants && product.color_variants.length > 0) {
        product.color_variants.forEach(variant => {
            if (variant.images && variant.images.length > 0) {
                allImageUrls.push(...variant.images);
            }
        });
    }
    if (allImageUrls.length === 0 && product.img_url) {
        allImageUrls.push(product.img_url);
    }
    allImageUrls = [...new Set(allImageUrls)];

    const summary = getSummaryFromReviewContent(product.review_content);
    document.title = `Ulasan: ${product.name} | Sepatu Nyaman`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', summary);

    const homeUrl = "https://sepatunyamanid.blogspot.com/";
    const categoryName = product.category || 'Koleksi';
    const categoryUrl = `${homeUrl}p/${product.category_page_slug || 'koleksi'}.html`;

    const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Beranda", "item": homeUrl }, { "@type": "ListItem", "position": 2, "name": categoryName, "item": categoryUrl }, { "@type": "ListItem", "position": 3, "name": product.name }] };
    
    const productSchema = { "@context": "https://schema.org/", "@type": "Product", "name": product.name, "image": allImageUrls, "description": summary, "sku": product.id, "brand": { "@type": "Brand", "name": product.brand || "Unknown" }, "offers": { "@type": "Offer", "url": product.affiliate_url, "priceCurrency": "IDR", "price": product.price, "availability": product.in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] } };

    if (product.gtin) productSchema.gtin13 = product.gtin;
    if (product.mpn) productSchema.mpn = product.mpn;
    if (product.condition === 'new') productSchema.itemCondition = "https://schema.org/NewCondition";

    if (product.editor_author_name && product.publish_date && product.comfort_score) {
        const publishDateObj = product.publish_date.toDate ? product.publish_date.toDate() : new Date(product.publish_date);
        
        productSchema.review = {
            "@type": "Review", "reviewBody": summary,
            "reviewRating": { "@type": "Rating", "ratingValue": product.comfort_score, "bestRating": "10" },
            "author": { "@type": "Person", "name": product.editor_author_name },
            "datePublished": publishDateObj.toISOString().split('T')[0]
        };

        if (product.last_updated) {
            const lastUpdatedDateObj = product.last_updated.toDate ? product.last_updated.toDate() : new Date(product.last_updated);
            productSchema.review.dateModified = lastUpdatedDateObj.toISOString().split('T')[0];
        }
    }

    if (product.user_review_count > 0) {
        productSchema.aggregateRating = { "@type": "AggregateRating", "ratingValue": product.user_rating_average, "reviewCount": product.user_review_count };
    } else if (product.editor_author_name && product.comfort_score) {
        productSchema.aggregateRating = { "@type": "AggregateRating", "ratingValue": product.comfort_score, "reviewCount": "1", "bestRating": "5" };
    }

    const finalSchema = [breadcrumbSchema, productSchema];
    document.getElementById('product-schema').textContent = JSON.stringify(finalSchema, null, 2);
}

function populateReviewContent(reviewContent) {
    const container = document.getElementById('review-content-container');
    container.innerHTML = '';
    if (!Array.isArray(reviewContent) || reviewContent.length === 0) {
        container.innerHTML = '<p>Ulasan untuk produk ini belum tersedia.</p>';
        return;
    }
    reviewContent.forEach(block => {
        let elementHtml = '';
        switch (block.type) {
            case 'paragraph': elementHtml = `<p>${block.content}</p>`; break;
            case 'heading': elementHtml = `<h4>${block.content}</h4>`; break;
            case 'image':
                elementHtml = `<figure>${createPictureElement(block.content.url, block.content.caption || 'Gambar ulasan')}${block.content.caption ? `<figcaption>${block.content.caption}</figcaption>` : ''}</figure>`;
                break;
            case 'list':
                if (Array.isArray(block.content)) {
                    elementHtml = `<ul>${block.content.map(item => `<li>${item}</li>`).join('')}</ul>`;
                }
                break;
            case 'quote': elementHtml = `<blockquote>${block.content}</blockquote>`; break;
        }
        container.innerHTML += elementHtml;
    });
}

function updateGallery(images) {
    const mainImageContainer = document.getElementById('main-image-picture');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    
    if (!images || images.length === 0) {
        mainImageContainer.innerHTML = createPictureElement('https://placehold.co/600x600', 'Gambar tidak tersedia', 'main-product-image');
        thumbnailContainer.innerHTML = '';
        return;
    }
    
    mainImageContainer.innerHTML = createPictureElement(images[0], 'Gambar produk utama', 'main-product-image');
    thumbnailContainer.innerHTML = images.map((imgSrc) => `<div class="thumb-wrapper" data-full-src="${imgSrc}">${createPictureElement(imgSrc, 'Thumbnail')}</div>`).join('');
    
    const firstThumb = thumbnailContainer.querySelector('.thumb-wrapper img');
    if (firstThumb) firstThumb.classList.add('active');
}

async function populatePage(product) {
    updateMetaAndSchema(product);
    const homeUrl = "https://sepatunyamanid.blogspot.com/";
    const categoryName = product.category || 'Koleksi';
    
    const viewAllLink = document.getElementById('view-all-link');
    const breadcrumbsContainer = document.getElementById('breadcrumbs-container');

    if (product.category_page_slug) {
        const categoryUrl = `${window.location.origin}/p/${product.category_page_slug}`;
        breadcrumbsContainer.innerHTML = `<a href="${homeUrl}">Beranda</a><span class="delimiter">/</span><a href="${categoryUrl}">${categoryName}</a><span class="delimiter">/</span><span>${product.name}</span>`;
        if (viewAllLink) {
            viewAllLink.href = categoryUrl;
        }
    } else {
        breadcrumbsContainer.innerHTML = `<a href="${homeUrl}">Beranda</a><span class="delimiter">/</span><span>${product.name}</span>`;
        if (viewAllLink) {
            viewAllLink.parentElement.style.display = 'none';
        }
    }
    
    const colorSelector = document.getElementById('color-selector-container');
    const selectedColorName = document.getElementById('selected-color-name');
    if (product.color_variants && product.color_variants.length > 0) {
        updateGallery(product.color_variants[0].images);
        
        colorSelector.innerHTML = product.color_variants.map((variant, index) => `
            <button class="color-swatch ${index === 0 ? 'active' : ''}" data-variant-index="${index}" title="${variant.colorName}">
                <div class="color-swatch-inner" style="background: ${variant.colorValue};"></div>
            </button>
        `).join('');
        selectedColorName.textContent = product.color_variants[0].colorName;
    } else {
        updateGallery([product.img_url]);
        document.querySelector('.sn-color-selector').style.display = 'none';
    }

    document.getElementById('product-brand').textContent = product.brand || 'Tanpa Merek';
    document.getElementById('product-name').textContent = product.name;
    if (product.comfort_score) {
        document.getElementById('comfort-score-container').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.305-.772 1.626 0l1.373 3.311A1.25 1.25 0 0015.11 7.5H18.5a1.25 1.25 0 01.962 1.951l-2.825 2.553a1.25 1.25 0 00-.463 1.29l1.07 3.884a1.25 1.25 0 01-1.882 1.393l-3.262-2.22a1.25 1.25 0 00-1.42 0l-3.262 2.22a1.25 1.25 0 01-1.882-1.393l1.07-3.884a1.25 1.25 0 00-.463-1.29L.538 9.451a1.25 1.25 0 01.962-1.951H4.89a1.25 1.25 0 001.142-1.305l1.373-3.311z" clip-rule="evenodd" /></svg><span>Skor Kenyamanan: ${product.comfort_score}/5</span>`;
    }
    document.getElementById('product-price').textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price);
    if (product.old_price) {
        document.getElementById('product-old-price').textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.old_price);
        document.getElementById('product-old-price').style.display = 'inline';
    }
    if (product.available_sizes && product.available_sizes.length > 0) {
        document.getElementById('size-options-container').innerHTML = product.available_sizes.map(size => `<button>${size}</button>`).join('');
    }
    document.getElementById('affiliate-button').href = product.affiliate_url || '#';
    populateReviewContent(product.review_content);

    // Tampilkan info tanggal publikasi dan pembaruan
    const reviewSection = document.querySelector('.sn-review-section');
    if (reviewSection && product.publish_date) {
        const publishDate = product.publish_date.toDate ? product.publish_date.toDate() : new Date(product.publish_date);

        let metaHTML = `<div class="sn-review-meta">`;
        metaHTML += `<span>Dipublikasikan: ${publishDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>`;
        
        if (product.last_updated) {
            const lastUpdatedDate = product.last_updated.toDate ? product.last_updated.toDate() : new Date(product.last_updated);
            if (lastUpdatedDate.getTime() !== publishDate.getTime()) {
                metaHTML += ` | <span class="last-updated">Diperbarui: ${lastUpdatedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>`;
            }
        }

        metaHTML += `</div>`;
        const reviewTitle = reviewSection.querySelector('h2');
        if (reviewTitle) reviewTitle.insertAdjacentHTML('afterend', metaHTML);
    }

    if (product.advantages && product.advantages.length > 0) {
        document.getElementById('advantages-list').innerHTML = product.advantages.map(item => `<li>${item}</li>`).join('');
    }
    if (product.disadvantages && product.disadvantages.length > 0) {
        document.getElementById('disadvantages-list').innerHTML = product.disadvantages.map(item => `<li>${item}</li>`).join('');
    }
    if (product.specifications && product.specifications.length > 0) {
        document.getElementById('specs-table-body').innerHTML = product.specifications.map(spec => `<tr><th>${spec.label}</th><td>${spec.value}</td></tr>`).join('');
    }
    if (product.style_gallery_images && product.style_gallery_images.length > 0) {
        document.getElementById('style-gallery-section').style.display = 'block';
        document.getElementById('style-carousel-container').innerHTML = product.style_gallery_images.map(imgSrc => `<div class="sn-style-item">${createPictureElement(imgSrc, 'Inspirasi Gaya')}</div>`).join('');
    }
    if (product.discount_badge) {
        document.getElementById('badge-promo').textContent = product.discount_badge;
        document.getElementById('badge-promo').style.display = 'inline-block';
    }
    if (product.in_stock === false) {
        document.getElementById('badge-stock').textContent = 'Stok Habis';
        document.getElementById('badge-stock').style.display = 'inline-block';
    }
    if (product.editorPickRank && product.editorPickRank > 0) {
        const mainImageContainer = document.querySelector('.main-image-container');
        const editorBadge = document.getElementById('editor-pick-badge-detail');
        if (mainImageContainer) mainImageContainer.classList.add('is-top-pick');
        if (editorBadge) editorBadge.style.display = 'flex';
    }
}

function createProductCardHTML(product, compareItems = []) {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price);
    const isCompared = compareItems.some(item => item.id === product.id);
    const isTopPick = product.editorPickRank && product.editorPickRank > 0;

    return `
        <div class="sn-product-card ${isTopPick ? 'is-top-pick' : ''}" data-id="${product.id}">
            <a href="${product.review_url || '#'}" class="sn-product-link">
                <div class="sn-product-image-wrapper">
                    ${product.discount_badge ? `<div class="sn-product-badge">${product.discount_badge}</div>` : ''}
                    ${createPictureElement(product.img_url || 'https://placehold.co/400x400', product.name || 'Gambar Produk')}
                    ${product.comfort_score ? `<div class="sn-comfort-score-badge"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.305-.772 1.626 0l1.373 3.311A1.25 1.25 0 0015.11 7.5H18.5a1.25 1.25 0 01.962 1.951l-2.825 2.553a1.25 1.25 0 00-.463 1.29l1.07 3.884a1.25 1.25 0 01-1.882 1.393l-3.262-2.22a1.25 1.25 0 00-1.42 0l-3.262 2.22a1.25 1.25 0 01-1.882-1.393l1.07-3.884a1.25 1.25 0 00-.463-1.29L.538 9.451a1.25 1.25 0 01.962-1.951H4.89a1.25 1.25 0 001.142-1.305l1.373-3.311z" clip-rule="evenodd" /></svg><span>${product.comfort_score}</span></div>` : ''}
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
            <button class="sn-compare-button ${isCompared ? 'selected' : ''}" aria-label="Bandingkan"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662a48.678 48.678 0 000 7.324 4.006 4.006 0 003.7 3.7 48.678 48.678 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.21.138-2.43.138-3.662zM12 15a3 3 0 100-6 3 3 0 000 6z" /></svg></button>
        </div>
    `;
}

async function populateRelatedProducts(currentProduct) {
    const relatedProducts = await firebaseService.fetchRelatedProducts(currentProduct.category, currentProduct.id);
    if (relatedProducts.length > 0) {
        const grid = document.getElementById('related-product-grid');
        grid.innerHTML = relatedProducts.map(p => createProductCardHTML(p)).join('');
        document.getElementById('related-products-section').style.display = 'block';
    }
}

function populateUserReviews(reviews) {
    const list = document.getElementById('user-reviews-list');
    if (!reviews || reviews.length === 0) {
        list.innerHTML = '<li>Jadilah yang pertama memberikan ulasan untuk produk ini!</li>';
        return;
    }
    const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
    list.innerHTML = reviews.map(review => {
        const date = review.timestamp?.toDate ? review.timestamp.toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal tidak tersedia';
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += `<span class="${i < review.rating ? 'filled' : ''}">${starSvg}</span>`;
        }
        return `
            <li class="user-review-item">
                <div class="review-header">
                    <span class="review-author">${review.authorName}</span>
                    <span class="review-date">${date}</span>
                </div>
                <div class="star-rating">${stars}</div>
                <p class="review-text">${review.reviewText}</p>
            </li>
        `;
    }).join('');
}

function showError(message) {
    document.getElementById('loading-container').innerHTML = `<p style="color: var(--danger-color);">${message}</p>`;
}

export const uiModule = { populatePage, showError, createPictureElement, populateUserReviews, updateGallery, populateRelatedProducts, createProductCardHTML };
