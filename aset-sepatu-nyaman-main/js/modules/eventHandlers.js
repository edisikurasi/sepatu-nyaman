/**
 * ===================================================================
 * eventHandlers.js - Modul Penanganan Event untuk Sepatu Nyaman
 * ===================================================================
 * * Modul ini bertanggung jawab untuk mengelola semua interaksi pengguna.
 * Ini mengikat fungsi ke elemen DOM dan menangani logika untuk fitur-fitur
 * interaktif seperti galeri, formulir, perbandingan produk, dan lainnya.
 * */

// Impor modul yang diperlukan
import * as firebaseService from './firebaseService.js';
import { uiModule } from './uiModule.js';

let compareItems = [];
const MAX_COMPARE_ITEMS = 4;
const compareTray = document.getElementById('sn-compare-tray');
const compareItemsContainer = document.getElementById('sn-compare-items-container');
const compareButtonCTA = document.getElementById('sn-compare-button-cta');
const clearCompareButton = document.getElementById('sn-clear-compare');
const compareModal = document.getElementById('sn-compare-modal');
const compareModalClose = document.getElementById('sn-compare-modal-close');
const compareTableContainer = document.getElementById('sn-compare-table-container');

function initializeInteractiveElements(productData) {
    const wearsInput = document.getElementById('wears-per-month');
    document.getElementById('cost-minus-btn').addEventListener('click', () => { if (parseInt(wearsInput.value, 10) > 1) { wearsInput.value = parseInt(wearsInput.value, 10) - 1; calculateCostPerWear(); } });
    document.getElementById('cost-plus-btn').addEventListener('click', () => { wearsInput.value = parseInt(wearsInput.value, 10) + 1; calculateCostPerWear(); });
    wearsInput.addEventListener('input', calculateCostPerWear);
    function calculateCostPerWear() {
        const costResultElement = document.getElementById('cost-per-wear-result');
        let wearsPerMonth = parseInt(wearsInput.value, 10);
        if (isNaN(productData.price) || isNaN(wearsPerMonth) || wearsPerMonth <= 0) { costResultElement.textContent = '-'; return; }
        costResultElement.textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(productData.price / (wearsPerMonth * 12));
    }
    calculateCostPerWear();

    const sizeButtons = document.querySelectorAll('.size-options button');
    sizeButtons.forEach(button => { button.addEventListener('click', () => { sizeButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); }); });
    
    const colorSelector = document.getElementById('color-selector-container');
    colorSelector.addEventListener('click', (e) => {
        const swatch = e.target.closest('.color-swatch');
        if (!swatch) return;
        
        colorSelector.querySelector('.active').classList.remove('active');
        swatch.classList.add('active');
        
        const variantIndex = swatch.dataset.variantIndex;
        const selectedVariant = productData.color_variants[variantIndex];
        if (selectedVariant) {
            uiModule.updateGallery(selectedVariant.images);
            document.getElementById('selected-color-name').textContent = selectedVariant.colorName;
        }
    });

    const thumbnailContainer = document.getElementById('thumbnail-container');
    thumbnailContainer.addEventListener('click', (e) => {
        const thumbWrapper = e.target.closest('.thumb-wrapper');
        if(!thumbWrapper) return;
        
        const mainImageContainer = document.getElementById('main-image-picture');
        mainImageContainer.innerHTML = uiModule.createPictureElement(thumbWrapper.dataset.fullSrc, 'Gambar produk utama', 'main-product-image');
        
        thumbnailContainer.querySelectorAll('.thumb-wrapper img').forEach(img => img.classList.remove('active'));
        thumbWrapper.querySelector('img').classList.add('active');
    });

    initializeCarouselAndLightbox();
    initializeUserReviews(productData.id);

    const relatedGrid = document.getElementById('related-product-grid');
    relatedGrid.addEventListener('click', (event) => {
        const compareButton = event.target.closest('.sn-compare-button');
        if (compareButton) handleCompareClick(compareButton, productData);
    });

    clearCompareButton.addEventListener('click', () => {
        compareItems = [];
        document.querySelectorAll('.sn-compare-button.selected').forEach(btn => btn.classList.remove('selected'));
        updateCompareTray();
    });

    compareItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('sn-remove-compare')) {
            const productId = event.target.dataset.id;
            compareItems = compareItems.filter(item => item.id !== productId);
            const buttonInCard = document.querySelector(`.sn-product-card[data-id="${productId}"] .sn-compare-button`);
            if (buttonInCard) buttonInCard.classList.remove('selected');
            updateCompareTray();
        }
    });

    compareButtonCTA.addEventListener('click', showCompareModal);
    compareModalClose.addEventListener('click', () => compareModal.style.display = 'none');
}

async function handleCompareClick(button, currentProduct) {
    const productCard = button.closest('.sn-product-card');
    if (!productCard) return;
    const productId = productCard.dataset.id;
    const itemIndex = compareItems.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        compareItems.splice(itemIndex, 1);
        button.classList.remove('selected');
    } else {
        if (compareItems.length >= MAX_COMPARE_ITEMS) {
            alert(`Anda hanya bisa membandingkan maksimal ${MAX_COMPARE_ITEMS} produk.`);
            return;
        }

        const productData = await firebaseService.fetchProductData(productId);
        if (productData) {
            compareItems.push(productData);
            button.classList.add('selected');
        }
    }
    updateCompareTray();
}

function updateCompareTray() {
    compareTray.classList.toggle('visible', compareItems.length > 0);
    compareItemsContainer.innerHTML = compareItems.map(item => `<div class="sn-compare-item"><img src="${item.img_url}" alt="${item.name}"><div class="sn-compare-item-name">${item.name}</div><button class="sn-remove-compare" data-id="${item.id}">×</button></div>`).join('');
    compareButtonCTA.disabled = compareItems.length < 2;
    compareButtonCTA.textContent = compareItems.length >= 2 ? `Bandingkan (${compareItems.length})` : 'Bandingkan';
}

function showCompareModal() {
    if (compareItems.length < 2) return;
    
    let tableHTML = '<table class="sn-compare-table"><thead><tr><th>Fitur</th>';
    compareItems.forEach(item => { tableHTML += `<th><img src="${item.img_url}" alt="${item.name}"></th>`; });
    tableHTML += '</tr></thead><tbody>';

    const createRow = (label, key, isArray = false) => {
        let row = `<tr><th>${label}</th>`;
        compareItems.forEach(item => {
            let value = item[key] || '-';
            if (isArray && Array.isArray(value)) {
                value = `<ul>${value.map(v => `<li>${v.trim()}</li>`).join('')}</ul>`;
            } else if (key === 'price' || key === 'old_price') {
                value = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
            }
            row += `<td>${value}</td>`;
        });
        return row + '</tr>';
    };

    tableHTML += createRow('Merek', 'brand');
    tableHTML += createRow('Nama', 'name');
    tableHTML += createRow('Skor Kenyamanan™', 'comfort_score');
    tableHTML += createRow('Harga', 'price');
    tableHTML += createRow('Material', 'material');
    tableHTML += createRow('Kelebihan', 'advantages', true);
    tableHTML += createRow('Kekurangan', 'disadvantages', true);
    tableHTML += `<tr><th></th>${compareItems.map(item => `<td><a href="${item.affiliate_url || '#'}" class="sn-affiliate-button" target="_blank" rel="noopener">Beli di Sini</a></td>`).join('')}</tr>`;
    tableHTML += '</tbody></table>';
    
    compareTableContainer.innerHTML = tableHTML;
    compareModal.style.display = 'flex';
}

function initializeUserReviews(productId) {
    const writeBtn = document.getElementById('write-review-btn');
    const form = document.getElementById('user-review-form');
    const ratingInput = document.getElementById('rating-input');
    const ratingValue = document.getElementById('rating-value');
    const feedbackDiv = document.getElementById('form-feedback');
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.innerHTML = `<svg data-value="${i}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
        ratingInput.appendChild(star);
    }
    const stars = ratingInput.querySelectorAll('svg');

    writeBtn.addEventListener('click', () => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        writeBtn.textContent = form.style.display === 'none' ? 'Tulis Ulasan Anda' : 'Tutup Form';
    });

    ratingInput.addEventListener('click', e => {
        const star = e.target.closest('svg');
        if (!star) return;
        const value = star.dataset.value;
        ratingValue.value = value;
        stars.forEach((s, i) => s.classList.toggle('filled', i < value));
    });
    
    ratingInput.addEventListener('mouseover', e => {
        const star = e.target.closest('svg');
        if (!star) return;
        const value = star.dataset.value;
        stars.forEach((s, i) => s.style.color = i < value ? 'var(--star-color)' : 'var(--light-grey)');
    });

    ratingInput.addEventListener('mouseout', () => {
        const currentValue = ratingValue.value;
        stars.forEach((s, i) => s.style.color = i < currentValue ? 'var(--star-color)' : 'var(--light-grey)');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        feedbackDiv.textContent = 'Mengirim...';
        const reviewData = {
            authorName: document.getElementById('review-author-name').value,
            rating: parseInt(ratingValue.value, 10),
            reviewText: document.getElementById('review-text').value,
            timestamp: serverTimestamp(),
            isApproved: false
        };

        if (reviewData.rating === 0) {
            feedbackDiv.textContent = 'Mohon berikan rating bintang.';
            feedbackDiv.style.color = 'var(--danger-color)';
            return;
        }

        const success = await firebaseService.submitUserReview(productId, reviewData);
        if (success) {
            feedbackDiv.textContent = 'Terima kasih! Ulasan Anda akan tampil setelah disetujui.';
            feedbackDiv.style.color = 'var(--success-color)';
            form.reset();
            stars.forEach(s => s.classList.remove('filled'));
        } else {
            feedbackDiv.textContent = 'Gagal mengirim ulasan. Silakan coba lagi.';
            feedbackDiv.style.color = 'var(--danger-color)';
        }
    });
}

function initializeCarouselAndLightbox() {
    const mainImageContainer = document.getElementById('main-image-picture');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    const styleSlides = document.querySelectorAll('.sn-style-item');
    const styleImages = Array.from(styleSlides).map(s => s.querySelector('img').src);
    const lightboxModal = document.getElementById('sn-lightbox-modal');
    const lightboxPicture = document.getElementById('lightbox-picture');
    let currentLightboxIndex = 0, activeImageArray = [];
    let isPanning = false, isDragging = false, startX, startY, initialTranslate = { x: 0, y: 0 }, currentTranslate = { x: 0, y: 0 };

    const styleGrid = document.querySelector('.sn-style-grid');
    const stylePrevBtn = document.getElementById('style-prev-btn');
    const styleNextBtn = document.getElementById('style-next-btn');

    if (styleGrid && stylePrevBtn && styleNextBtn && styleSlides.length > 0) {
        const updateCarouselButtons = () => {
            const scrollLeft = styleGrid.scrollLeft;
            const scrollWidth = styleGrid.scrollWidth;
            const width = styleGrid.clientWidth;
            stylePrevBtn.disabled = scrollLeft <= 0;
            styleNextBtn.disabled = scrollLeft >= (scrollWidth - width - 1);
        };

        stylePrevBtn.addEventListener('click', () => {
            const itemWidth = styleGrid.querySelector('.sn-style-item').clientWidth;
            styleGrid.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        });

        styleNextBtn.addEventListener('click', () => {
            const itemWidth = styleGrid.querySelector('.sn-style-item').clientWidth;
            styleGrid.scrollBy({ left: itemWidth, behavior: 'smooth' });
        });

        styleGrid.addEventListener('scroll', updateCarouselButtons, { passive: true });
        window.addEventListener('resize', updateCarouselButtons);
        updateCarouselButtons();
    }

    function openLightbox(imageArray, startIndex) {
        activeImageArray = imageArray;
        currentLightboxIndex = startIndex;
        lightboxPicture.innerHTML = uiModule.createPictureElement(activeImageArray[currentLightboxIndex], 'Gambar diperbesar', 'sn-lightbox-img');
        lightboxModal.classList.add('visible');
        updateLightboxNav();
    }

    function updateLightboxNav() {
        const prevBtn = document.getElementById('lightbox-prev-btn');
        const nextBtn = document.getElementById('lightbox-next-btn');
        
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        
        prevBtn.disabled = currentLightboxIndex === 0;
        nextBtn.disabled = currentLightboxIndex === activeImageArray.length - 1;
    }
    
    function showNextImage() { if (currentLightboxIndex < activeImageArray.length - 1) { currentLightboxIndex++; lightboxPicture.innerHTML = uiModule.createPictureElement(activeImageArray[currentLightboxIndex], 'Gambar diperbesar', 'sn-lightbox-img'); updateLightboxNav(); } }
    function showPrevImage() { if (currentLightboxIndex > 0) { currentLightboxIndex--; lightboxPicture.innerHTML = uiModule.createPictureElement(activeImageArray[currentLightboxIndex], 'Gambar diperbesar', 'sn-lightbox-img'); updateLightboxNav(); } }

    if (mainImageContainer) {
        mainImageContainer.addEventListener('click', () => {
            const currentThumbnails = Array.from(thumbnailContainer.querySelectorAll('.thumb-wrapper'));
            const currentImages = currentThumbnails.map(w => w.dataset.fullSrc);
            const activeThumb = thumbnailContainer.querySelector('img.active');
            const activeWrapper = activeThumb ? activeThumb.closest('.thumb-wrapper') : currentThumbnails[0];
            const startIndex = currentThumbnails.indexOf(activeWrapper);
            openLightbox(currentImages, startIndex >= 0 ? startIndex : 0);
        });
    }
    styleSlides.forEach((slide, index) => { slide.addEventListener('click', () => openLightbox(styleImages, index)); });

    document.getElementById('sn-lightbox-close').addEventListener('click', () => {
        lightboxModal.classList.remove('visible');
        const img = lightboxPicture.querySelector('img');
        if(img) {
            img.style.transform = 'scale(1) translate(0px, 0px)';
            img.style.transformOrigin = 'center center';
        }
        lightboxPicture.classList.remove('zoomed');
        currentTranslate = { x: 0, y: 0 };
    });
    lightboxModal.addEventListener('click', (e) => { if (e.target === lightboxModal) document.getElementById('sn-lightbox-close').click(); });
    document.getElementById('lightbox-prev-btn').addEventListener('click', showPrevImage);
    document.getElementById('lightbox-next-btn').addEventListener('click', showNextImage);
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('visible')) return;
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'Escape') document.getElementById('sn-lightbox-close').click();
    });
    
    lightboxPicture.addEventListener('click', (e) => {
        if (e.target.closest('.lightbox-nav-btn') || isDragging) return;
        const img = lightboxPicture.querySelector('img');
        if (!img) return;
        
        lightboxPicture.classList.toggle('zoomed');
        if (lightboxPicture.classList.contains('zoomed')) {
            img.style.transform = 'scale(2.5)';
            img.style.transformOrigin = 'center center';
        } else {
            img.style.transform = 'scale(1) translate(0px, 0px)';
            img.style.transformOrigin = 'center center';
            currentTranslate = { x: 0, y: 0 };
        }
    });

    function startPan(e) {
        if (!lightboxPicture.classList.contains('zoomed')) return;
        isPanning = true;
        startX = e.clientX || e.touches[0].clientX;
        startY = e.clientY || e.touches[0].clientY;
        initialTranslate = { ...currentTranslate };
        lightboxPicture.style.transition = 'none';
    }

    function movePan(e) {
        if (!isPanning) return;
        e.preventDefault();
        
        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        currentTranslate.x = initialTranslate.x + deltaX;
        currentTranslate.y = initialTranslate.y + deltaY;
        
        const img = lightboxPicture.querySelector('img');
        const rect = lightboxPicture.getBoundingClientRect();
        const scale = 2.5;

        const maxTranslateX = (img.offsetWidth * scale - rect.width) / 2;
        const maxTranslateY = (img.offsetHeight * scale - rect.height) / 2;

        currentTranslate.x = Math.max(-maxTranslateX, Math.min(maxTranslateX, currentTranslate.x));
        currentTranslate.y = Math.max(-maxTranslateY, Math.min(maxTranslateY, currentTranslate.y));

        img.style.transform = `scale(${scale}) translate(${currentTranslate.x}px, ${currentTranslate.y}px)`;
    }

    function endPan() {
        isPanning = false;
        lightboxPicture.style.transition = '';
        setTimeout(() => { isDragging = false; }, 50);
    }

    lightboxPicture.addEventListener('mousedown', (e) => { isDragging = false; startPan(e); });
    lightboxPicture.addEventListener('mousemove', (e) => { if(isPanning) isDragging = true; movePan(e); });
    lightboxPicture.addEventListener('mouseup', endPan);
    lightboxPicture.addEventListener('mouseleave', endPan);
    lightboxPicture.addEventListener('touchstart', (e) => { isDragging = false; startPan(e); });
    lightboxPicture.addEventListener('touchmove', (e) => { if(isPanning) isDragging = true; movePan(e); });
    lightboxPicture.addEventListener('touchend', endPan);
}

export const eventHandlers = {
    initializeInteractiveElements
};
