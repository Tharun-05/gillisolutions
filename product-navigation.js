/**
 * Product Navigation Module
 * Handles next/previous navigation between products
 */

class ProductNavigator {
    constructor() {
        this.products = [];
        this.currentProductId = null;
        this.currentIndex = -1;
        this.init();
    }

    async init() {
        // Import products data from main script
        await this.loadProductsData();
        this.getCurrentProduct();
        this.createNavigationElements();
        this.attachEventListeners();
        this.showKeyboardHint();
    }

    async loadProductsData() {
        // Get products from the main script
        try {
            // Wait for the main script to load if needed
            if (typeof window.products !== 'undefined') {
                this.products = window.products;
            } else {
                // Fallback: define products locally if not available
                this.products = [
                    {
                        id: 1,
                        name: "Commercial Kitchen Hoods",
                        category: "Commercial_Kitchen_Ventilation_Systems"
                    },
                    {
                        id: 2,
                        name: "Commercial Exhaust Ducting",
                        category: "Commercial_Kitchen_Ventilation_Systems"
                    },
                    {
                        id: 3,
                        name: "Centrifugal Blowers",
                        category: "Commercial_Kitchen_Ventilation_Systems"
                    },
                    {
                        id: 4,
                        name: "Commercial Hood Filters",
                        category: "Commercial_Kitchen_Ventilation_Systems"
                    },
                    {
                        id: 5,
                        name: "Dampers",
                        category: "Commercial_Kitchen_Ventilation_Systems"
                    },
                    {
                        id: 6,
                        name: "Silencers",
                        category: "Commercial_Kitchen_Ventilation_Systems"
                    },
                    {
                        id: 7,
                        name: "Collar For Fresh Air",
                        category: "Commercial_Kitchen_Ventilation_&_HVAC_Accessories"
                    }
                ];
            }
        } catch (error) {
            console.error('Error loading products data:', error);
        }
    }

    getCurrentProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentProductId = parseInt(urlParams.get('id'), 10);
        this.currentIndex = this.products.findIndex(p => p.id === this.currentProductId);
    }

    createNavigationElements() {
        // Create previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'product-navigation prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Previous Product');
        prevBtn.id = 'prevProductBtn';

        // Create next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'product-navigation next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Next Product');
        nextBtn.id = 'nextProductBtn';

        // Create product counter
        const counter = document.createElement('div');
        counter.className = 'product-counter';
        counter.id = 'productCounter';
        counter.textContent = `${this.currentIndex + 1} of ${this.products.length}`;

        // Add elements to page
        document.body.appendChild(prevBtn);
        document.body.appendChild(nextBtn);
        document.body.appendChild(counter);

        // Update button states
        this.updateNavigationState();
    }

    updateNavigationState() {
        const prevBtn = document.getElementById('prevProductBtn');
        const nextBtn = document.getElementById('nextProductBtn');
        const counter = document.getElementById('productCounter');

        if (prevBtn && nextBtn && counter) {
            // Update counter
            counter.textContent = `${this.currentIndex + 1} of ${this.products.length}`;

            // Update button states
            prevBtn.disabled = this.currentIndex <= 0;
            nextBtn.disabled = this.currentIndex >= this.products.length - 1;

            // Add visual feedback for disabled state
            if (this.currentIndex <= 0) {
                prevBtn.style.opacity = '0.5';
                prevBtn.style.pointerEvents = 'none';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            }

            if (this.currentIndex >= this.products.length - 1) {
                nextBtn.style.opacity = '0.5';
                nextBtn.style.pointerEvents = 'none';
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        }
    }

    attachEventListeners() {
        // Previous button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('#prevProductBtn')) {
                this.navigateToPrevious();
            }
        });

        // Next button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('#nextProductBtn')) {
                this.navigateToNext();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigateToPrevious();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateToNext();
            }
        });

        // Touch/swipe navigation (optional)
        this.attachSwipeListeners();
    }

    attachSwipeListeners() {
        let startX = 0;
        let endX = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            const diff = startX - endX;
            const threshold = 50; // Minimum swipe distance

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swiped left - next product
                    this.navigateToNext();
                } else {
                    // Swiped right - previous product
                    this.navigateToPrevious();
                }
            }
        };

        this.handleSwipe = handleSwipe;
    }

    navigateToPrevious() {
        if (this.currentIndex > 0) {
            const prevProduct = this.products[this.currentIndex - 1];
            this.navigateToProduct(prevProduct.id);
        }
    }

    navigateToNext() {
        if (this.currentIndex < this.products.length - 1) {
            const nextProduct = this.products[this.currentIndex + 1];
            this.navigateToProduct(nextProduct.id);
        }
    }

    navigateToProduct(productId) {
        // Add loading state
        const productDetail = document.querySelector('.product-detail');
        if (productDetail) {
            productDetail.classList.add('loading');
        }

        // Navigate to new product
        setTimeout(() => {
            window.location.href = `product-detail.html?id=${productId}`;
        }, 150);
    }

    showKeyboardHint() {
        // Create keyboard hint
        const hint = document.createElement('div');
        hint.className = 'keyboard-hint';
        hint.textContent = 'Use ← → arrow keys to navigate';
        hint.id = 'keyboardHint';
        document.body.appendChild(hint);

        // Show hint briefly
        setTimeout(() => {
            hint.classList.add('show');
        }, 1000);

        // Hide hint after 3 seconds
        setTimeout(() => {
            hint.classList.remove('show');
        }, 4000);

        // Show hint again on first keyboard use
        let hintShown = false;
        document.addEventListener('keydown', () => {
            if (!hintShown) {
                hintShown = true;
                hint.classList.add('show');
                setTimeout(() => {
                    hint.classList.remove('show');
                }, 2000);
            }
        });
    }

    // Public method to get current product info
    getCurrentProductInfo() {
        return {
            id: this.currentProductId,
            index: this.currentIndex,
            total: this.products.length,
            product: this.products[this.currentIndex]
        };
    }
}

    // Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on product detail page
    if (window.location.pathname.includes('product-detail.html')) {
        window.productNavigator = new ProductNavigator();
        initializeInquireForm();
    }
});

// Initialize inquire form functionality
function initializeInquireForm() {
    // Populate product name in hidden field when product loads
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const productNameElement = document.getElementById('productName');
                const productNameField = document.getElementById('productNameField');
                
                if (productNameElement && productNameField && productNameElement.textContent.trim()) {
                    productNameField.value = productNameElement.textContent.trim();
                    observer.disconnect(); // Stop observing once we have the product name
                }
            }
        });
    });

    // Start observing the product name element
    const productNameElement = document.getElementById('productName');
    if (productNameElement) {
        observer.observe(productNameElement, { childList: true, subtree: true });
    }

    // Handle form submission
    const inquiryForm = document.getElementById('productInquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', handleInquirySubmit);
    }
}

// Navigate to contact page
function scrollToContact() {
    // Get current product name to pass as URL parameter
    const productNameElement = document.getElementById('productName');
    const productName = productNameElement ? productNameElement.textContent.trim() : '';
    
    // Navigate to contact page with product name as parameter
    if (productName) {
        window.location.href = `contact.html?product=${encodeURIComponent(productName)}`;
    } else {
        window.location.href = 'contact.html';
    }
}

// Handle inquiry form submission
function handleInquirySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('i');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    btnIcon.className = 'fas fa-spinner fa-spin';
    
    // Get form data
    const formData = new FormData(form);
    
    // Submit form using fetch
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // Success
            btnText.textContent = 'Sent Successfully!';
            btnIcon.className = 'fas fa-check';
            submitBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            
            // Reset form after delay
            setTimeout(() => {
                form.reset();
                btnText.textContent = 'Send Inquiry';
                btnIcon.className = 'fas fa-paper-plane';
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                
                // Show success message
                showNotification('Your inquiry has been sent successfully! We will get back to you soon.', 'success');
            }, 2000);
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Error state
        btnText.textContent = 'Send Failed';
        btnIcon.className = 'fas fa-exclamation-triangle';
        submitBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
        
        // Reset after delay
        setTimeout(() => {
            btnText.textContent = 'Send Inquiry';
            btnIcon.className = 'fas fa-paper-plane';
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 3000);
        
        showNotification('Failed to send inquiry. Please try again or contact us directly.', 'error');
    });
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 8px;
        padding: 15px 20px;
        max-width: 400px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Make scrollToContact available globally
window.scrollToContact = scrollToContact;// Export for use in other scripts
window.ProductNavigator = ProductNavigator;