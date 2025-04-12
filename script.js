// Product data (mocked)
const products = [
    {
        id: 1,
        name: "Commercial Oven",
        category: "cooking",
        description: "High-capacity commercial oven for professional kitchens",
        image: "https://static.wixstatic.com/media/fd9026_2278803b508a4a38b4b8dc730540d246~mv2.jpg/v1/fill/w_1000,h_1000,al_c,q_85/fd9026_2278803b508a4a38b4b8dc730540d246~mv2.jpg",
        price: "$2,999",
        longDescription: "This is a commercial oven with high capacity, ideal for professional kitchens...Commercial convection ovens are versatile appliances that can be used for a variety of cooking tasks. They are designed to circulate hot air around food, cooking it quickly and evenly. This means that you can cook a variety of dishes at the same time, without worrying about uneven cooking or burnt edges.",
        specifications: [
            "Capacity: 30 Liters",
            "Energy Efficiency: A+",
            "Warranty: 2 Years"
        ],
        reviews: [
            "Great product! Worth every penny.",
            "Perfect for my restaurant's kitchen."
        ]
    },
    {
        id: 2,
        name: "Industrial Mixer",
        category: "preparation",
        description: "Heavy-duty mixer for large-scale food preparation",
        image: "https://5.imimg.com/data5/ZQ/HF/BH/SELLER-37087478/commercial-mixer-machine-1000x1000.jpg",
        price: "$1,499",
        longDescription: "This industrial mixer can handle large batches of dough, batter, and more...",
        specifications: [
            "Capacity: 50 Liters",
            "Motor Power: 2000W",
            "Warranty: 3 Years"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    },
    {
        id: 3,
        name: "Industrial Mixer",
        category: "preparation",
        description: "Heavy-duty mixer for large-scale food preparation",
        image: "https://static.grainger.com/rp/s/is/image/Grainger/46E338_AS01?$adapimg$&hei=1072&wid=1072",
        price: "$1,499",
        longDescription: "This industrial mixer can handle large batches of dough, batter, and more...",
        specifications: [
            "Capacity: 50 Liters",
            "Motor Power: 2000W",
            "Warranty: 3 Years"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    },
    {
        id: 4,
        name: "Industrial Mixer",
        category: "preparation",
        description: "Heavy-duty mixer for large-scale food preparation",
        image: "https://static.grainger.com/rp/s/is/image/Grainger/46E338_AS01?$adapimg$&hei=1072&wid=1072",
        price: "$1,499",
        longDescription: "This industrial mixer can handle large batches of dough, batter, and more...",
        specifications: [
            "Capacity: 50 Liters",
            "Motor Power: 2000W",
            "Warranty: 3 Years"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    }
    // Add more products as needed
];

// Function to get product ID from URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'), 10);
}

// Load product details
document.addEventListener('DOMContentLoaded', function() {
    const productId = getProductIdFromUrl();
    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('productImage').src = product.image;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productPrice').textContent = product.price;
        document.getElementById('longProductDescription').textContent = product.longDescription;

        const specList = document.getElementById('specList');
        product.specifications.forEach(spec => {
            const li = document.createElement('li');
            li.textContent = spec;
            specList.appendChild(li);
        });

        const reviewsList = document.getElementById('reviewsList');
        product.reviews.forEach(review => {
            const li = document.createElement('li');
            li.textContent = review;
            reviewsList.appendChild(li);
        });
    } else {
        // If the product is not found, show an error message
        document.querySelector('.product-detail-content').innerHTML = '<p>Product not found.</p>';
    }
});

// DOM Load Event
document.addEventListener('DOMContentLoaded', function() {
    // Only load products automatically if we're on the Products page
    if (window.location.pathname.includes('Products.html')) {
        loadProducts();
    }
    initializeEventListeners();
});

// Load products function
function loadProducts(category = null) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) {
        // Only redirect if explicitly asking for a category via dropdown click
        console.error('Product grid element not found');
        return;
    }

    productGrid.innerHTML = ''; // Clear existing content

    try {
        const filteredProducts = category ? products.filter(product => product.category === category) : products;
        const productHTML = filteredProducts.map(product => 
            `<div class="product-card">
                <img src="${product.image}" alt="${product.name}" 
                     onload="this.style.opacity='1'" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=Product+Image'"
                     onclick="openLightbox('${product.image}')">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <span class="price">${product.price}</span>
                    <button onclick="inquireProduct(${product.id})">Inquire Now</button>
                </div>
            </div>`
        ).join('');

        productGrid.innerHTML = productHTML;

        // Adjust grid layout if only one product
        if (filteredProducts.length === 1) {
            productGrid.style.gridTemplateColumns = '1fr';
        } else {
            productGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        }

        console.log('Products loaded successfully');
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<p class="error">Error loading products. Please try again later.</p>';
    }
}

// Mobile Menu Functions
function showMenu() {
    const navLinks = document.getElementById("navLinks");
    const menuOverlay = document.querySelector(".menu-overlay");
    if (navLinks && menuOverlay) {
        navLinks.style.right = "0";
        menuOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
    }
}

function hideMenu() {
    const navLinks = document.getElementById("navLinks");
    const menuOverlay = document.querySelector(".menu-overlay");
    if (navLinks && menuOverlay) {
        navLinks.style.right = "-250px";
        menuOverlay.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// Function to open the lightbox
function openLightbox(imageUrl) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    lightbox.style.display = "flex";
    lightboxImage.src = imageUrl;
}

// Function to close the lightbox
function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    lightbox.style.display = "none";
}
document.addEventListener('DOMContentLoaded', () => {
    // Wait for 3 seconds (time for loading screen)
    setTimeout(() => {
        // Hide loading screen
        document.getElementById('loadingScreen').style.display = 'none';

        // Show main content
        document.getElementById('mainContent').style.display = 'block';
    }, 3000); // 3 seconds delay
});

// Initialize Event Listeners
function initializeEventListeners() {
    const contactForm = document.getElementById('contactForm');

    // Menu Overlay Click
    const menuOverlay = document.querySelector('.menu-overlay');
    if (menuOverlay) {
        menuOverlay.addEventListener('click', hideMenu);
    }

    // Dropdown Menu Handler - Single implementation
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const dropbtn = dropdown.querySelector('.dropbtn');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        
        dropbtn.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                
                // Close all other dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown && other.classList.contains('active')) {
                        other.classList.remove('active');
                        const otherContent = other.querySelector('.dropdown-content');
                        otherContent.style.maxHeight = null;
                        otherContent.style.display = 'none';
                    }
                });

                // Toggle current dropdown
                dropdown.classList.toggle('active');
                
                // Toggle dropdown content
                if (dropdown.classList.contains('active')) {
                    dropdownContent.style.display = 'block';
                    dropdownContent.style.maxHeight = dropdownContent.scrollHeight + "px";
                } else {
                    dropdownContent.style.maxHeight = null;
                    setTimeout(() => {
                        dropdownContent.style.display = 'none';
                    }, 200); // Match this with your transition duration
                }
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const dropdownContent = dropdown.querySelector('.dropdown-content');
                    dropdownContent.style.maxHeight = null;
                    dropdownContent.style.display = 'none';
                });
            }
        }
    });

    // Mobile Menu Links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && !link.classList.contains('dropbtn')) {
                hideMenu();
            }
        });
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });

     // Handle active state for navigation icons
     const navIcons = document.querySelectorAll('.nav-icon');
     navIcons.forEach(icon => {
         icon.addEventListener('click', function() {
             navIcons.forEach(i => i.classList.remove('active'));
             this.classList.add('active');
         });
     });

     // Dropdown category click event
     const categoryLinks = document.querySelectorAll('.dropdown-content a');
     categoryLinks.forEach(link => {
         if (link.id !== 'showAllProductsBtn') {
             link.addEventListener('click', function(e) {
                 e.preventDefault();
                 const category = this.getAttribute('href').split('#')[1];
                 
                 // Always navigate to Products.html with the category hash when clicking a category link
                 window.location.href = `Products.html#${category}`;
             });
         }
     });

     // Show all products button click event
     const showAllProductsBtn = document.getElementById('showAllProductsBtn');
     if (showAllProductsBtn) {
         showAllProductsBtn.addEventListener('click', function() {
             window.location.href = 'Products.html';
         });
     }
}

// Add this function to highlight the current section in navigation
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-icon');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight/3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', updateActiveNavigation);

document.addEventListener('DOMContentLoaded', function() {
    const carousel = {
        container: document.querySelector('.carousel-container'),
        slides: document.querySelectorAll('.carousel-slide'),
        prevBtn: document.querySelector('.carousel-btn.prev'),
        nextBtn: document.querySelector('.carousel-btn.next'),
        dotsContainer: document.querySelector('.carousel-dots'),
        currentSlide: 0,
        interval: null,
        autoPlayDuration: 5000, // 5 seconds per slide

        init() {
            // Create dots
            this.createDots();
            
            // Set first slide as active
            this.showSlide(0);
            
            // Add event listeners
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());
            
            // Start autoplay
            this.startAutoPlay();
            
            // Pause autoplay on hover
            this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());
            
            // Touch events for mobile
            this.setupTouchEvents();
        },

        createDots() {
            for(let i = 0; i < this.slides.length; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                dot.addEventListener('click', () => this.showSlide(i));
                this.dotsContainer.appendChild(dot);
            }
        },

        showSlide(index) {
            // Remove active class from all slides and dots
            this.slides.forEach(slide => slide.classList.remove('active'));
            const dots = this.dotsContainer.querySelectorAll('.dot');
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Add active class to current slide and dot
            this.currentSlide = index;
            this.slides[index].classList.add('active');
            dots[index].classList.add('active');
        },

        nextSlide() {
            const next = (this.currentSlide + 1) % this.slides.length;
            this.showSlide(next);
        },

        prevSlide() {
            const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.showSlide(prev);
        },

        startAutoPlay() {
            if(this.interval) clearInterval(this.interval);
            this.interval = setInterval(() => this.nextSlide(), this.autoPlayDuration);
        },

        stopAutoPlay() {
            if(this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        },

        setupTouchEvents() {
            let touchStartX = 0;
            let touchEndX = 0;
            
            this.container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, false);

            this.container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleTouchMove();
            }, false);
            
            this.handleTouchMove = () => {
                const difference = touchStartX - touchEndX;
                if (Math.abs(difference) > 30) { // Minimum swipe distance
                    if (difference > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            };
        }
    };

    // Initialize carousel
    carousel.init();
});

// Initialize EmailJS
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init('0-cIwNhrl7iIuLaUM');
});

// Form Submission Handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (validateForm(e.target)) {
        const formData = new FormData(e.target);
        
        // Prepare the form data to be sent
        const message = {
            user_name: formData.get('name'),
            user_email: formData.get('email'),
            user_phone: formData.get('phone'),
            user_message: formData.get('message'),
        };
        
        // Send data using EmailJS
        emailjs.send('service_tmsrs7l', 'template_4g7rn8b', message, '0-cIwNhrl7iIuLaUM')
            .then((response) => {
                alert('Thank you for your message. We will get back to you soon!');
                e.target.reset();
            }, (error) => {
                alert('Oops! Something went wrong. Please try again later.');
                console.error('EmailJS Error:', error);

                console.error('Error Details:', error.text);
            });
    }
}

// Form Validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            showError(input, `${input.placeholder} is required`); // Corrected template literal
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            isValid = false;
            showError(input, 'Please enter a valid email address');
        } else {
            removeError(input);
        }
    });
    
    return isValid;
}

// Error Handling Functions
function showError(input, message) {
    const formGroup = input.closest('.form-group');
    let errorDiv = formGroup.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        formGroup.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    input.classList.add('error');
}

function removeError(input) {
    const formGroup = input.closest('.form-group');
    const errorDiv = formGroup.querySelector('.error-message');
    if (errorDiv) {
        formGroup.removeChild(errorDiv);
    }
    input.classList.remove('error');
}

// Email Validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Product Inquiry Handler
function inquireProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Redirect to the product detail page with the product ID in the URL
        window.location.href = `product-detail.html?id=${product.id}`;
    }
}

// Smooth Scroll Handler
function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Window Resize Handler
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        const navLinks = document.getElementById("navLinks");
        const menuOverlay = document.querySelector(".menu-overlay");
        
        if (window.innerWidth > 768) {
            // Reset menu for desktop view
            navLinks.style.right = "0";
            menuOverlay.style.display = "none";
            document.body.style.overflow = "auto";
            
            // Reset dropdowns
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.querySelector('.dropdown-content').classList.remove('show');
            });
        } else {
            // Reset mobile menu
            navLinks.style.right = "-250px";
            menuOverlay.style.display = "none";
            document.body.style.overflow = "auto";
        }
    }, 250);
});

// Add CSS class for error messages
const style = document.createElement('style');
style.textContent = `
    .error-message {
        color: #ff4d4d;
        font-size: 14px;
        margin-top: 5px;
    }
    .error {
        border-color: #ff4d4d !important;
    }
`;
document.head.appendChild(style);