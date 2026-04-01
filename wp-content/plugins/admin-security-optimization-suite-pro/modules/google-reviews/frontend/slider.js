/**
 * Google Reviews Slider - Frontend JavaScript
 */

(function() {
    'use strict';

    class ASOGoogleReviewsSlider {
        constructor(wrapper) {
            console.log('ASOGoogleReviewsSlider: Constructor called');
            this.wrapper = wrapper;
            this.track = wrapper.querySelector('.aso-reviews-track');
            this.prevBtn = wrapper.querySelector('.aso-reviews-nav-prev');
            this.nextBtn = wrapper.querySelector('.aso-reviews-nav-next');
            this.paginationDots = wrapper.querySelectorAll('.aso-pagination-dot');
            this.cards = wrapper.querySelectorAll('.aso-review-card');
            
            console.log('Elements found:', {
                track: !!this.track,
                prevBtn: !!this.prevBtn,
                nextBtn: !!this.nextBtn,
                dotsCount: this.paginationDots.length,
                cardsCount: this.cards.length
            });
            
            const settings = wrapper.getAttribute('data-settings');
            this.settings = settings ? JSON.parse(settings) : {};
            
            console.log('Settings:', this.settings);
            
            this.currentIndex = 0;
            this.autoplayInterval = null;
            
            this.init();
        }

        init() {
            console.log('Init called');
            // Convert string booleans to actual booleans
            this.settings.autoplay = this.settings.autoplay === true || this.settings.autoplay === 'true' || this.settings.autoplay === 1;
            this.settings.loop = this.settings.loop === true || this.settings.loop === 'true' || this.settings.loop === 1;
            this.settings.show_nav = this.settings.show_nav === true || this.settings.show_nav === 'true' || this.settings.show_nav === 1;
            this.settings.show_pagination = this.settings.show_pagination === true || this.settings.show_pagination === 'true' || this.settings.show_pagination === 1;
            
            console.log('Converted booleans:', {
                autoplay: this.settings.autoplay,
                loop: this.settings.loop,
                show_nav: this.settings.show_nav,
                show_pagination: this.settings.show_pagination
            });
            
            // Disable slider functionality for grid layouts
            const isGrid = this.settings.slider_type === 'grid2' || this.settings.slider_type === 'grid3';
            console.log('Is grid layout:', isGrid, 'slider_type:', this.settings.slider_type);
            
            if (!isGrid) {
                console.log('Attaching event listeners...');
                this.attachEventListeners();
                this.checkTextOverflow();
                
                if (this.settings.autoplay) {
                    console.log('Starting autoplay...');
                    this.startAutoplay();
                }
            } else {
                console.log('Grid layout detected, slider disabled');
            }
        }

        checkTextOverflow() {
            // Check each review card to see if text overflows and show Read More button accordingly
            this.cards.forEach(card => {
                const textWrapper = card.querySelector('.aso-review-text-wrapper');
                if (!textWrapper) return;
                
                const textElement = textWrapper.querySelector('.aso-review-text');
                const readMoreBtn = textWrapper.querySelector('.aso-review-read-more');
                
                if (textElement && readMoreBtn) {
                    // Check if text content overflows its container
                    if (textElement.scrollHeight > textElement.clientHeight) {
                        readMoreBtn.classList.add('show');
                    }
                }
            });
        }

        attachEventListeners() {
            console.log('attachEventListeners called');
            // Navigation buttons
            if (this.prevBtn) {
                console.log('Adding click listener to prev button');
                this.prevBtn.addEventListener('click', () => {
                    console.log('Prev button clicked');
                    this.prev();
                });
            } else {
                console.log('No prev button found');
            }

            if (this.nextBtn) {
                console.log('Adding click listener to next button');
                this.nextBtn.addEventListener('click', () => {
                    console.log('Next button clicked');
                    this.next();
                });
            } else {
                console.log('No next button found');
            }

            // Pagination dots
            console.log('Adding listeners to', this.paginationDots.length, 'pagination dots');
            this.paginationDots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    console.log('Pagination dot', index, 'clicked');
                    this.goToSlide(index);
                });
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });

            // Stop autoplay on user interaction
            if (this.track) {
                this.track.addEventListener('mousedown', () => this.stopAutoplay());
            }
            this.wrapper.addEventListener('mouseleave', () => {
                if (this.settings.autoplay) this.startAutoplay();
            });
        }

        prev() {
            const slidesPerView = parseInt(this.settings.slides_per_view) || 1;
            const maxIndex = Math.ceil(this.cards.length / slidesPerView) - 1;
            
            if (this.currentIndex > 0) {
                this.goToSlide(this.currentIndex - 1);
            } else if (this.settings.loop) {
                this.goToSlide(maxIndex);
            }
        }

        next() {
            const slidesPerView = parseInt(this.settings.slides_per_view) || 1;
            const maxIndex = Math.ceil(this.cards.length / slidesPerView) - 1;
            
            if (this.currentIndex < maxIndex) {
                this.goToSlide(this.currentIndex + 1);
            } else if (this.settings.loop) {
                this.goToSlide(0);
            }
        }

        goToSlide(index) {
            const slidesPerView = parseInt(this.settings.slides_per_view) || 1;
            const maxIndex = Math.ceil(this.cards.length / slidesPerView) - 1;
            this.currentIndex = Math.max(0, Math.min(index, maxIndex));
            this.updateSlider();
        }

        updateSlider() {
            const sliderType = this.settings.slider_type || 'horizontal';
            const slidesPerView = parseInt(this.settings.slides_per_view) || 1;

            if (sliderType === 'horizontal') {
                if (this.track && this.cards.length > 0) {
                    // Get the container width
                    const containerWidth = this.track.offsetWidth;
                    // Scroll by full container width for each page
                    const scrollAmount = this.currentIndex * containerWidth;
                    this.track.scrollTo({
                        left: scrollAmount,
                        behavior: 'smooth'
                    });
                }
            } else if (sliderType === 'vertical') {
                if (this.track && this.cards.length > 0) {
                    const containerHeight = this.track.offsetHeight;
                    const scrollAmount = this.currentIndex * containerHeight;
                    this.track.scrollTo({
                        top: scrollAmount,
                        behavior: 'smooth'
                    });
                }
            }

            // Update pagination
            this.paginationDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });

            // Update button states
            const maxIndex = Math.ceil(this.cards.length / slidesPerView) - 1;
            if (!this.settings.loop) {
                if (this.prevBtn) {
                    this.prevBtn.disabled = this.currentIndex === 0;
                }
                if (this.nextBtn) {
                    this.nextBtn.disabled = this.currentIndex >= maxIndex;
                }
            }
        }

        startAutoplay() {
            if (this.autoplayInterval) return;

            this.autoplayInterval = setInterval(() => {
                this.next();
            }, (this.settings.autoplay_speed || 5) * 1000);
        }

        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }

        destroy() {
            this.stopAutoplay();
            if (this.prevBtn) this.prevBtn.removeEventListener('click', null);
            if (this.nextBtn) this.nextBtn.removeEventListener('click', null);
        }
    }

    // Initialize all sliders on page, even if DOMContentLoaded already fired (Elementor/widgets)
    function initASOSliders() {
        const wrappers = document.querySelectorAll('.aso-google-reviews-wrapper');
        wrappers.forEach(wrapper => {
            if (wrapper.dataset.asoInitialized === 'true') return;
            wrapper.dataset.asoInitialized = 'true';
            new ASOGoogleReviewsSlider(wrapper);
        });
    }

    // Run immediately if DOM is ready, else on DOMContentLoaded
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initASOSliders();
    } else {
        document.addEventListener('DOMContentLoaded', initASOSliders);
    }

    // Safety re-run after short delay for late-rendered content (e.g., Elementor widgets)
    setTimeout(initASOSliders, 300);

    // Handle Read More buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('aso-review-read-more')) {
            const card = e.target.closest('.aso-review-card');
            const textElement = card.querySelector('.aso-review-text');
            const fullText = textElement.getAttribute('data-full-text');
            
            const reviewHeader = card.querySelector('.aso-review-header');
            const authorName = reviewHeader.querySelector('.aso-reviewer-name')?.textContent || 'Anonymous';
            const rating = reviewHeader.querySelector('.aso-review-rating')?.innerHTML || '';
            const date = reviewHeader.querySelector('.aso-review-date')?.textContent || '';
            
            const modal = card.closest('.aso-google-reviews-wrapper').querySelector('.aso-review-modal');
            modal.querySelector('.aso-review-modal-author').textContent = authorName;
            modal.querySelector('.aso-review-modal-rating').innerHTML = rating;
            modal.querySelector('.aso-review-modal-date').textContent = date;
            modal.querySelector('.aso-review-modal-text').textContent = fullText;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
        
        // Close modal
        if (e.target.classList.contains('aso-review-modal-close') || 
            e.target.classList.contains('aso-review-modal-overlay')) {
            const modal = e.target.closest('.aso-review-modal');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.aso-review-modal[style*="display: block"]');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });
})();
