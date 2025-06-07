document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetails(productId);
    } else {
        // Handle case where no product ID is provided
        document.querySelector('.product-detail').innerHTML = `
            <div class="container text-center">
                <h2>Product Not Found</h2>
                <p>The product you are looking for could not be found.</p>
                <a href="Products.html" class="btn-primary">Browse All Products</a>
            </div>
        `;
    }
    
    // Initialize tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`\${tabId}-panel`).classList.add('active');
        });
    });
    
    // Form submission
    const inquiryForm = document.getElementById('productInquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                company: document.getElementById('company').value,
                message: document.getElementById('message').value,
                productId: productId,
                productName: document.getElementById('productName').textContent
            };
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                console.log('Form submitted:', formData);
                
                // Reset form
                inquiryForm.reset();
                
                // Show success message
                alert('Your inquiry has been sent successfully. Our team will contact you shortly.');
                
                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }, 1500);
        });
    }
});

// Function to load product details
async function loadProductDetails(productId) {
    try {
        // Fetch product data (replace with your actual API endpoint)
        // For demo purposes, we'll use a mock product
        const product = await fetchProductById(productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Update breadcrumb
        document.getElementById('productCategory').textContent = product.category;
        document.getElementById('breadcrumbProductName').textContent = product.name;
        document.getElementById('displayCategory').textContent = product.category;
        
        // Update product info
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productPrice').textContent = product.price;
        document.getElementById('productImage').src = product.image;
        document.getElementById('productImage').alt = product.name;
        
        // Update lightbox image
        document.getElementById('lightboxImage').src = product.image;
        document.getElementById('lightboxImage').alt = product.name;
        
        // Update long description
        document.getElementById('longProductDescription').innerHTML = product.longDescription || product.description;
        
        // Update features list
        const featuresList = document.getElementById('featuresList');
        if (product.features && product.features.length > 0) {
            featuresList.innerHTML = product.features.map(feature => `<li>\${feature}</li>`).join('');
        } else {
            featuresList.innerHTML = '<li>No features available for this product</li>';
        }
        
        // Update specifications
        const specList = document.getElementById('specList');
        if (product.specifications && Object.keys(product.specifications).length > 0) {
            specList.innerHTML = Object.entries(product.specifications)
                .map(([key, value]) => `<tr><td>\${key}</td><td>\${value}</td></tr>`)
                .join('');
        } else {
            specList.innerHTML = '<tr><td colspan="2">No specifications available for this product</td></tr>';
        }
        
        // Update product video if available
        const productVideo = document.getElementById('productVideo');
        if (product.videoUrl) {
            productVideo.innerHTML = `
                <iframe src="\${product.videoUrl}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        }
        
        // Update technical drawings if available
        const technicalDrawings = document.getElementById('technicalDrawings');
        if (product.technicalDrawings && product.technicalDrawings.length > 0) {
            technicalDrawings.innerHTML = product.technicalDrawings
                .map(drawing => `
                    <div class="drawing-item" onclick="openDrawingLightbox('\${drawing.url}')">
                        <img src="\${drawing.url}" alt="\${drawing.title}">
                    </div>
                `)
                .join('');
        }
        
        // Update reviews
        const reviewsList = document.getElementById('reviewsList');
        if (product.reviews && product.reviews.length > 0) {
            reviewsList.innerHTML = product.reviews
                .map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">
                                    <img src="\${review.avatar || 'https://via.placeholder.com/50'}" alt="\${review.name}">
                                </div>
                                <div>
                                    <div class="reviewer-name">\${review.name}</div>
                                    <div class="review-date">\${review.date}</div>
                                </div>
                            </div>
                            <div class="review-rating">
                                \${getStarRating(review.rating)}
                            </div>
                        </div>
                        <div class="review-content">
                            \${review.comment}
                        </div>
                    </div>
                `)
                .join('');
                
            // Update review count
            document.getElementById('reviewCount').textContent = product.reviews.length;
            document.getElementById('totalReviews').textContent = product.reviews.length;
        } else {
            reviewsList.innerHTML = '<p>No reviews yet for this product.</p>';
        }
        
        // Update related products
        const relatedProducts = document.getElementById('relatedProducts');
        if (product.relatedProducts && product.relatedProducts.length > 0) {
            relatedProducts.innerHTML = product.relatedProducts
                .map(relatedProduct => `
                    <div class="related-product-card">
                        <div class="related-product-image">
                            <img src="\${relatedProduct.image}" alt="\${relatedProduct.name}">
                        </div>
                        <div class="related-product-info">
                            <div class="related-product-name">\${relatedProduct.name}</div>
                            <div class="related-product-category">\${relatedProduct.category}</div>
                            <a href="product-detail.html?id=\${relatedProduct.id}" class="related-product-link">View Details</a>
                        </div>
                    </div>
                `)
                .join('');
        } else {
            relatedProducts.innerHTML = '<p>No related products found.</p>';
        }
        
        // Initialize product gallery slider if multiple images
        if (product.gallery && product.gallery.length > 0) {
            // Add main images to slider
            const mainSliderWrapper = document.querySelector('.product-main-slider .swiper-wrapper');
            mainSliderWrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="product-image-container">
                        <img src="\${product.image}" alt="\${product.name}">
                        <div class="image-zoom-icon" onclick="openLightbox(0)">
                            <i class="fas fa-search-plus"></i>
                        </div>
                    </div>
                </div>
            `;
            
            product.gallery.forEach((image, index) => {
                mainSliderWrapper.innerHTML += `
                    <div class="swiper-slide">
                        <div class="product-image-container">
                            <img src="\${image}" alt="\${product.name} - Image \${index + 2}">
                            <div class="image-zoom-icon" onclick="openLightbox(\${index + 1})">
                                <i class="fas fa-search-plus"></i>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // Add thumbnails
            const thumbsWrapper = document.getElementById('productThumbnails');
            thumbsWrapper.innerHTML = `
                <div class="swiper-slide">
                    <img src="\${product.image}" alt="\${product.name} thumbnail">
                </div>
            `;
            
            product.gallery.forEach((image, index) => {
                thumbsWrapper.innerHTML += `
                    <div class="swiper-slide">
                        <img src="\${image}" alt="\${product.name} - Thumbnail \${index + 2}">
                    </div>
                `;
            });
            
            // Initialize Swiper sliders
            initProductGallery();
        }
        
    } catch (error) {
        console.error('Error loading product details:', error);
        document.querySelector('.product-detail').innerHTML = `
            <div class="container text-center">
                <h2>Error Loading Product</h2>
                <p>There was an error loading the product details. Please try again later.</p>
                <a href="Products.html" class="btn-primary">Browse All Products</a>
            </div>
        `;
    }
}

// Mock function to fetch product by ID (replace with actual API call)
async function fetchProductById(productId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock product data
    return {
        id: productId,
        name: "Commercial Gas Range with 6 Burners",
        category: "Cooking Equipment",
        description: "High-performance commercial gas range with 6 burners, ideal for restaurants and professional kitchens.",
        longDescription: `
            <p>This premium commercial gas range is designed for high-volume cooking operations in professional kitchens. With six powerful burners, it provides consistent heat distribution and precise temperature control for all your cooking needs.</p>
            <p>The durable stainless steel construction ensures longevity even in the most demanding kitchen environments, while the easy-to-clean surfaces make maintenance a breeze. Each burner is independently controlled, allowing chefs to prepare multiple dishes simultaneously at different temperatures.</p>
            <p>The integrated safety features include automatic shut-off valves and flame failure protection, ensuring a safe working environment for your kitchen staff.</p>
        `,
        price: "\$4,999.99",
        image: "https://cdnimg.webstaurantstore.com/images/products/large/525243/2133542.jpg",
        gallery: [
            "https://cdnimg.webstaurantstore.com/images/products/large/525243/2133543.jpg",
            "https://cdnimg.webstaurantstore.com/images/products/large/525243/2133544.jpg",
            "https://cdnimg.webstaurantstore.com/images/products/large/525243/2133545.jpg"
        ],
        features: [
            "Six high-performance gas burners with individual controls",
            "Durable stainless steel construction for long-lasting performance",
            "Heavy-duty cast iron grates for stability and heat retention",
            "Adjustable stainless steel legs for uneven floors",
            "Flame failure safety device on each burner",
            "Easy-to-clean surfaces and removable drip trays",
            "Suitable for natural gas or LPG (conversion kit included)"
        ],
        specifications: {
            "Dimensions": "60\" W x 32\" D x 36\" H",
            "Material": "304 Stainless Steel",
            "Number of Burners": "6",
            "BTU Output": "25,000 BTU per burner",
            "Gas Type": "Natural Gas (LPG conversion kit included)",
            "Weight": "320 lbs",
            "Warranty": "2 Years Parts & Labor",
            "Certification": "ETL, NSF, CE"
        },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        technicalDrawings: [
            {
                title: "Front View",
                url: "https://cdnimg.webstaurantstore.com/images/products/extra_large/525243/2133546.jpg"
            },
            {
                title: "Side View",
                url: "https://cdnimg.webstaurantstore.com/images/products/extra_large/525243/2133547.jpg"
            }
        ],
        reviews: [
            {
                name: "John Smith",
                avatar: "https://randomuser.me/api/portraits/men/1.jpg",
                date: "May 15, 2023",
                rating: 5,
                comment: "Excellent commercial range! We've been using it in our restaurant for 6 months now and it has significantly improved our kitchen efficiency. The burners provide consistent heat and the build quality is outstanding."
            },
            {
                name: "Maria Rodriguez",
                avatar: "https://randomuser.me/api/portraits/women/2.jpg",
                date: "April 3, 2023",
                rating: 4,
                comment: "Great product overall. The burners are powerful and the temperature control is precise. The only minor issue is that it takes a bit longer to clean than expected, but the performance makes up for it."
            },
            {
                name: "David Chen",
                avatar: "https://randomuser.me/api/portraits/men/3.jpg",
                date: "March 22, 2023",
                rating: 5,
                comment: "This range has been a game-changer for our busy kitchen. The multiple burners allow us to prepare several dishes simultaneously, and the build quality is exceptional. Highly recommended!"
            }
        ],
        relatedProducts: [
            {
                id: "102",
                name: "Commercial Gas Fryer",
                category: "Cooking Equipment",
                image: "https://cdnimg.webstaurantstore.com/images/products/large/29759/2252502.jpg"
            },
            {
                id: "103",
                name: "Commercial Convection Oven",
                category: "Cooking Equipment",
                image: "https://cdnimg.webstaurantstore.com/images/products/large/175563/1933162.jpg"
            },
            {
                id: "104",
                name: "Commercial Griddle",
                category: "Cooking Equipment",
                image: "https://cdnimg.webstaurantstore.com/images/products/large/623117/2253038.jpg"
            }
        ]
    };
}

// Initialize product gallery sliders
function initProductGallery() {
    // Initialize thumbnail slider
    const thumbsSlider = new Swiper('.product-thumb-slider', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 3,
            },
            576: {
                slidesPerView: 4,
            },
            768: {
                slidesPerView: 5,
            }
        }
    });
    
    // Initialize main slider
    const mainSlider = new Swiper('.product-main-slider', {
        spaceBetween: 10,
        thumbs: {
            swiper: thumbsSlider,
        }
    });
}

// Lightbox functions
function openLightbox(index = 0) {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Set current image index
    window.currentLightboxIndex = index;
    updateLightboxImage();
    
    // Add event listeners for keyboard navigation
    document.addEventListener('keydown', handleLightboxKeyboard);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
    
    // Remove keyboard event listener
    document.removeEventListener('keydown', handleLightboxKeyboard);
}

function updateLightboxImage() {
    const images = [document.getElementById('productImage').src];
    
    // Add gallery images if available
    const product = window.currentProduct;
    if (product && product.gallery) {
        images.push(...product.gallery);
    }
    
    // Update lightbox image
    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.src = images[window.currentLightboxIndex];
    
    // Setup navigation buttons
    document.getElementById('prevImage').onclick = () => {
        window.currentLightboxIndex = (window.currentLightboxIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    };
    
    document.getElementById('nextImage').onclick = () => {
        window.currentLightboxIndex = (window.currentLightboxIndex + 1) % images.length;
        updateLightboxImage();
    };
}

function handleLightboxKeyboard(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        document.getElementById('prevImage').click();
    } else if (e.key === 'ArrowRight') {
        document.getElementById('nextImage').click();
    }
}

// Function to open technical drawing in lightbox
function openDrawingLightbox(url) {
    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.src = url;
    openLightbox();
}

// Function to scroll to inquiry form
function scrollToInquiryForm() {
    const inquiryForm = document.getElementById('inquiryForm');
    inquiryForm.scrollIntoView({ behavior: 'smooth' });
}

// Function to download product brochure
function downloadBrochure() {
    // In a real implementation, this would trigger a download
    alert('Brochure download will start shortly...');
    // window.location.href = 'path/to/brochure.pdf';
}

// Helper function to generate star rating HTML
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// Menu toggle functions (ensure these are globally available)
window.showMenu = function() {
    document.getElementById("navLinks").classList.add("active");
    document.querySelector(".menu-overlay").classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
}

window.hideMenu = function() {
    document.getElementById("navLinks").classList.remove("active");
    document.querySelector(".menu-overlay").classList.remove("active");
    document.body.style.overflow = ""; // Re-enable scrolling
}

// Make lightbox functions globally available
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.openDrawingLightbox = openDrawingLightbox;
window.scrollToInquiryForm = scrollToInquiryForm;
window.downloadBrochure = downloadBrochure;