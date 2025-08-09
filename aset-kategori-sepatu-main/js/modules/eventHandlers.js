// Modul ini bertanggung jawab untuk mendaftarkan semua event listener di halaman.
// Ia menerima konteks yang berisi elemen DOM, state, dan fungsi handler.

/**
 * Mendaftarkan semua event listener untuk halaman produk.
 * @param {object} context - Objek yang berisi state, elemen, dan fungsi handler.
 */
function initializeEventListeners(context) {
    const { elements, handlers } = context;

    // Listener untuk tombol "Muat Lebih Banyak"
    elements.loadMoreBtn.addEventListener('click', handlers.handleLoadMore);

    // Listener untuk dropdown pengurutan
    elements.sortSelect.addEventListener('change', handlers.applyFiltersAndRender);

    // Listener untuk klik pada grid produk (delegasi event)
    elements.productGrid.addEventListener('click', (event) => {
        const compareButton = event.target.closest('.sn-compare-button');
        if (compareButton) {
            event.preventDefault();
            handlers.handleCompareClick(compareButton);
        }
    });

    // Listener untuk baki perbandingan (delegasi event)
    elements.compareItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('sn-remove-compare')) {
            handlers.handleRemoveCompareItem(event.target.dataset.id);
        }
    });

    // Listener untuk membersihkan semua item perbandingan
    elements.clearCompareButton.addEventListener('click', handlers.handleClearCompare);

    // Listener untuk tombol "Bandingkan" di baki
    elements.compareButtonCTA.addEventListener('click', handlers.handleShowCompareModal);

    // Listener untuk menutup modal perbandingan
    elements.compareModalClose.addEventListener('click', () => {
        elements.compareModal.style.display = 'none';
    });

    // Listener untuk membuka modal filter di mobile
    elements.mobileFilterTrigger.addEventListener('click', () => {
        elements.filterModal.style.display = 'flex';
    });

    // Listener untuk menutup modal filter
    elements.filterModalClose.addEventListener('click', () => {
        elements.filterModal.style.display = 'none';
    });

    // Listener untuk tombol "Terapkan Filter" di mobile (hanya menutup modal)
    elements.applyFiltersBtn.addEventListener('click', () => {
        elements.filterModal.style.display = 'none';
    });

    // Listener untuk menutup sorotan fitur
    elements.spotlightDismissBtn.addEventListener('click', () => {
        elements.spotlight.style.opacity = '0';
        setTimeout(() => { elements.spotlight.style.display = 'none'; }, 500);
        localStorage.setItem('hasSeenCompareSpotlight', 'true');
    });

    // Listener untuk semua checkbox filter dan tombol reset
    const allFilterCheckboxes = document.querySelectorAll('#desktop-sidebar input[type="checkbox"], #mobile-filter-container input[type="checkbox"]');
    allFilterCheckboxes.forEach(filter => {
        filter.addEventListener('change', (event) => {
            handlers.handleFilterChange(filter, event.currentTarget.closest('#desktop-sidebar'));
        });
    });

    const resetButtons = [elements.resetFilterBtn, elements.resetFilterBtnMobile];
    resetButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', handlers.handleResetFilters);
        }
    });
}

export { initializeEventListeners };
