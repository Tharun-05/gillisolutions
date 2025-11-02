import {initSupportChat} from "./support_chat.js";
// Product data (mocked)
const products = [
    {
        id: 1,
        name: "Commercial Kitchen Hoods",
        category: "Commercial_Kitchen_Ventilation_Systems",
        description: "A commercial kitchen hood is a ventilation device designed to remove heat, smoke, grease-laden vapors, and odors from the cooking area in commercial kitchens.",
        image: "https://www.commercial-kitchenequipments.com/photo/ps1831771-eh_115_silver_commercial_stainless_steel_exhaust_hood_with_filter_for_kitchen.jpg",
        price: "Rs 2,49,900",
        longDescription: "Commercial kitchen hoods are an essential component of any professional kitchen ventilation system. They capture and remove smoke, steam, grease particles, and unwanted odors generated during cooking. Constructed from durable stainless steel, they are designed for high-performance air extraction and long-term use in demanding foodservice environments. Most hoods are equipped with easy-to-clean baffle filters, integrated lighting for better visibility, and are available in various sizes and airflow capacities to suit different kitchen layouts. Proper installation of a commercial kitchen hood ensures compliance with fire safety and hygiene regulations while improving indoor air quality and comfort for kitchen staff.",
        specifications: [
            "Type:Wall-mounted, island, or low-profile hoods",
            "Material:Stainless steel (18-gauge or 20-gauge)",
            "Airflow Capacity: 500–2500 CFM (cubic feet per minute)",
            "Stainless steel (18-gauge or 20-gauge)",
            "Lighting: Integrated LED lighting",
            "Ducting: Compatible with ducted or ductless configurations",
            "Compliance: NSF, UL, and NFPA 96 standards",
            "Noise Level: 65–75 dB"
        ],
        // reviews: [
        //     "Great product! Worth every penny.",
        //     "Perfect for my restaurant's kitchen."
        // ]
    },
    {
        id: 2,
        name: "Commercial Exhaust Ducting",
        category: "Commercial_Kitchen_Ventilation_Systems",
        description: "Commercial exhaust ducting is a network of ducts used to transport contaminated air, smoke, grease-laden vapors, and odors from kitchen hoods to the exterior of the building.",
        image: "https://tse3.mm.bing.net/th/id/OIP.jgY9wKBCvUyR602Hfzej1gHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
        price: "Rs 1,24,900",
        longDescription: "Commercial exhaust ducting is an integral part of professional kitchen ventilation systems, connecting kitchen hoods to exhaust fans while safely removing smoke, heat, and airborne grease. Constructed from heavy-duty galvanized or stainless steel, these ducts are designed to withstand high temperatures and corrosive kitchen environments. They are sealed and insulated to prevent leaks and meet strict fire safety regulations, including NFPA 96 standards. Properly designed and installed exhaust ducting ensures efficient airflow, minimizes fire hazards, and contributes to a cleaner and safer kitchen environment.",
        specifications: [
            "Material: Galvanized steel, stainless steel (16–20 gauge)",
            "Shape: Round or rectangular",
            "Diameter/Size: 8” to 24” (customizable based on airflow)",
            "Sealing: Welded or flanged joints for airtight performance",
            "Fire Rating: NFPA 96 compliant for grease ducting",
            "Insulation: High-temperature insulation available for fire protection",
            "Length: Custom lengths to match kitchen layout",
            "Mounting: Horizontal or vertical installationS"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    },
    {
        id: 3,
        name: "Centrifugal Blowers",
        category: "Commercial_Kitchen_Ventilation_Systems",
        description: "They provide the necessary airflow to exhaust contaminated air, smoke, and grease vapors from hoods and ducts, ensuring a clean and safe kitchen environment.",
        image: "https://img-new.cgtrader.com/items/943730/28829c9894/large/industrial-centrifugal-blower-fan-animated-3d-model-animated-max-obj-fbx-3dm-mtl.jpg",
        price: "Rs 1,24,900",
        longDescription: "Centrifugal blowers are critical components in commercial kitchen exhaust systems, delivering powerful airflow to remove heat, smoke, and airborne grease particles. Their forward-curved or backward-inclined blades provide high efficiency and quiet operation, even in demanding ventilation setups. These blowers are available in various configurations, including direct-drive and belt-drive, to suit different kitchen sizes and duct layouts. Designed with durable materials and corrosion-resistant finishes, centrifugal blowers ensure long-term reliability and compliance with commercial kitchen ventilation standards. Their high static pressure capacity makes them ideal for systems with extended ductwork and heavy-duty ventilation needs.",
        specifications: [
            "Type: Single inlet or double inlet centrifugal blower",
            "Material: Galvanized steel or aluminum housing with steel impellers",
            "Airflow Capacity: 500 – 10,000 CFM",
            "Motor: Direct-drive or belt-drive",
            "Speed: Variable speed options available",
            "Noise Level: Low noise operation (55–75 dB)",
            "Mounting: Roof-mounted or wall-mounted configurations",
            "Efficiency: High static pressure handling for long duct runs",
            "Compliance: UL and AMCA certified"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    },
    {
        id: 4,
        name: "Commercial Hood Filters",
        category: "Commercial_Kitchen_Ventilation_Systems",
        description: "Designed to trap grease, smoke, and airborne particles generated during cooking.",
        image: "https://m.media-amazon.com/images/I/510ggsd2CkL._AC_SL1500_.jpg",
        price: "Rs 12,490",
        longDescription: "Commercial hood filters play a vital role in kitchen ventilation systems by capturing grease-laden vapors before they enter the exhaust ducts. Stainless steel baffle filters are widely used for their superior durability, fire safety compliance, and ease of cleaning. Their angled baffle design allows efficient grease separation while maintaining airflow performance. These filters are NSF-approved, making them safe for foodservice applications, and are fully dishwasher-safe for quick maintenance. By using high-quality hood filters, commercial kitchens can significantly reduce fire risks, extend the life of exhaust ducting and fans, and ensure regulatory compliance with ventilation safety standards.",
        specifications: [
            "Type: Baffle filters or mesh filters (preferred: stainless steel baffle)",
            "Material: Stainless steel or aluminum (heavy-duty, corrosion-resistant)",
            "Size: Standard sizes (10'x20', 16'x20', 20'x20') or custom sizes",
            "Construction: Welded or riveted frames with handles for easy removal",
            "Efficiency: High grease-trapping efficiency with low airflow restriction",
            "Cleaning: Dishwasher-safe and reusable",
            "Compliance: NSF-certified and UL-listed (grease-rated)",
            "Operating Temperature: Up to 400°F (204°C)"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    },
    {
        id: 5,
        name: "Dampers",
        category: "Commercial_Kitchen_Ventilation_Systems",
        description: "They help balance air distribution, improve energy efficiency, and maintain proper ventilation pressure.",
        image: "https://airmasteremirates.com/wp-content/uploads/2016/02/GI-Volume-Control-Damper-1.jpg",
        price: "Rs 24,900",
        longDescription: "Ducting dampers are crucial for maintaining airflow control and efficiency in commercial kitchen ventilation systems. They allow precise adjustment of exhaust and supply air, helping maintain balanced pressure within the kitchen. Motorized dampers can be integrated with building automation systems for automatic operation, while manual dampers provide simple and cost-effective control. Backdraft dampers are used to prevent reverse airflow when the system is off. Constructed from heavy-duty galvanized or stainless steel, these dampers are durable, fire-code compliant, and designed for continuous operation in demanding kitchen environments. Proper damper use ensures improved indoor air quality, energy efficiency, and compliance with ventilation safety standards.",
        specifications: [
            "Type: Manual, motorized (automatic), or backdraft dampers",
            "Material: Galvanized steel or stainless steel",
            "Size: 4” to 24” diameter (round) or rectangular sizes (custom available)",
            "Operation: Lever-operated (manual) or actuator-controlled (motorized)",
            "Sealing: Airtight with gasketed blades for leakage prevention",
            "Temperature Rating: Up to 250°F (121°C) for standard dampers",
            "Compliance: AMCA-certified and NFPA 96 compatible (for grease exhaust systems)",
            "Installation: Horizontal or vertical duct mounting"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    },
    {
        id: 6,
        name: "Silencers",
        category: "Commercial_Kitchen_Ventilation_Systems",
        description: "They help maintain a quieter kitchen environment while ensuring efficient airflow.",
        image: "https://www.mdpi.com/applsci/applsci-13-04426/article_deploy/html/images/applsci-13-04426-g005-550.jpg",
        price: "Rs 49,900",
        longDescription: "Silencers for blowers are essential components in commercial kitchen ventilation systems where noise control is a priority. They are designed to absorb and attenuate the sound produced by exhaust and makeup air blowers, reducing the noise transmitted through ducts. Constructed from heavy-duty galvanized or stainless steel with internal acoustic insulation, these silencers maintain high airflow performance without causing significant pressure drops. They are available in various sizes and configurations to suit different ventilation designs. By installing silencers, commercial kitchens can create a more comfortable working environment, comply with noise control regulations, and maintain optimal ventilation efficiency.",
        specifications: [
            "Type: Rectangular or cylindrical duct silencers",
            "Material: Galvanized steel or stainless-steel casing",
            "Internal Lining: Acoustic insulation with perforated metal liner",
            "Noise Reduction: 20–40 dB (varies by model and design)",
            "Airflow Capacity: Compatible with high-volume ventilation systems",
            "Temperature Rating: Up to 250°F (121°C)",
            "Length: Typically, 3–10 feet (custom options available)",
            "Compliance: AMCA and ASHRAE standards for sound control",
            "Installation: Horizontal or vertical duct mounting"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    },
    {
        id: 7,
        name: "Collar For Fresh Air",
        category: "Commercial_Kitchen_Ventilation_&_HVAC_Accessories",
        description: "They help secure air distribution components and ensure airtight connections for efficient airflow in fresh air supply systems.",
        image: "https://tse1.mm.bing.net/th/id/OIP.TANRma-tuKETlCmsosk23AHaG1?rs=1&pid=ImgDetMain&o=7&rm=3",
        price: "Rs 7,490",
        longDescription: "Collars used in fresh air systems serve as connection interfaces between ducts, diffusers, and plenums in commercial ventilation setups. They ensure secure and leak-proof transitions, improving the efficiency of air delivery. Available in both round and rectangular shapes, these collars are typically manufactured from galvanized or stainless steel for durability and resistance to corrosion. Many models include gaskets or pre-applied sealants for airtight performance. By using properly sized collars, fresh air systems achieve better airflow distribution, reduced energy loss, and compliance with ventilation standards.",
        specifications: [
            "Type: Round or rectangular duct collars",
            "Material: Galvanized steel, stainless steel, or aluminium",
            "Size Range: 4” to 24” (round) or custom rectangular sizes",
            "Connection: Slip-in or flange-mounted design",
            "Sealing: Equipped with gaskets or sealants to prevent air leakage",
            "Finish: Corrosion-resistant coating (zinc-coated or powder-coated)",
            "Temperature Range: Suitable for standard HVAC and commercial kitchen environments",
            "Compliance: SMACNA standards for duct fittings"
        ],
        reviews: [
            "Excellent performance, super strong motor.",
            "Handles heavy-duty tasks with ease."
        ]
    }
    // Add more products as needed
];

// Make products available globally for product navigation
window.products = products;

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
    // If we're on the Products page
    if (window.location.pathname.includes('Products.html')) {
        // Check if there's a hash in the URL
        const categoryHash = window.location.hash.substring(1);
        if (categoryHash) {
            // Filter products by the category in the hash
            loadProducts(categoryHash);
        } else {
            // Otherwise load all products
            loadProducts();
        }
    }
    // Other initialization code...
    initializeEventListeners();
});

// Add this to handle hash changes
window.addEventListener('hashchange', function() {
    if (window.location.pathname.includes('Products.html')) {
        const categoryHash = window.location.hash.substring(1);
        if (categoryHash) {
            loadProducts(categoryHash);
        } else {
            loadProducts();
        }
    }
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
                    <button onclick="window.location.href='product-detail.html?id=${product.id}'">Details</button>
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
        navLinks.style.right = "0";
        menuOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
    }
    
    function hideMenu() {
        const navLinks = document.getElementById("navLinks");
        const menuOverlay = document.querySelector(".menu-overlay");
        navLinks.style.right = "-250px";
        menuOverlay.style.display = "none";
        document.body.style.overflow = "auto";
    }
    
    // Make functions available globally
    window.showMenu = showMenu;
    window.hideMenu = hideMenu;

// Function to open the lightbox
// /** @function openLightbox - Used in HTML onclick attributes */
function openLightbox(imageUrl) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    lightbox.style.display = "flex";
    lightboxImage.src = imageUrl;
}
window.openLightbox = openLightbox;

// Function to close the lightbox
// /** @function closeLightbox - Used in HTML onclick attributes */
function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    lightbox.style.display = "none";
}
window.closeLightbox = closeLightbox;
// Door Animation and Loading Screen
// Door Animation and Loading Screen
document.addEventListener('DOMContentLoaded', () => {
    // Hide main content initially
    if (document.querySelector('.hero')) {
        document.querySelector('.hero').style.display = 'none';
    }
    document.body.style.overflow = 'hidden';

    // Wait for 3 seconds (time for loading screen)
    setTimeout(() => {
        // Hide loading screen
        if (document.getElementById('loadingScreen')) {
            document.getElementById('loadingScreen').style.display = 'none';
        }
        
        // Show door animation
        const doorAnimation = document.getElementById('doorAnimation');
        if (doorAnimation) {
            doorAnimation.style.display = 'flex';
            
            // Setup door trigger click event
            const doorTrigger = document.getElementById('doorTrigger');
            if (doorTrigger) {
                doorTrigger.addEventListener('click', function() {
                    // Add open class to animate doors
                    doorAnimation.classList.add('door-open');
                    
                    // Wait for animation to complete, then show mobile phones
                    setTimeout(() => {
                        doorAnimation.style.display = 'none';
                        
                        // Show mobile phones section
                        const mobilePhonesSection = document.getElementById('mobilePhonesSection');
                        if (mobilePhonesSection) {
                            mobilePhonesSection.style.display = 'flex';
                            // Add a small delay before fading in for smoother transition
                            setTimeout(() => {
                                mobilePhonesSection.style.opacity = '1';
                            }, 100);
                            
                            // Add event listener to the continue button
                            const continueBtn = document.getElementById('continueToSite');
                            if (continueBtn) {
                                continueBtn.addEventListener('click', function() {
                                    // Fade out mobile section
                                    mobilePhonesSection.style.opacity = '0';
                                    
                                    // After fade out, hide mobile section and show main content
                                    setTimeout(() => {
                                        mobilePhonesSection.style.display = 'none';
                                        
                                        // Show main content
                                        if (document.querySelector('.hero')) {
                                            document.querySelector('.hero').style.display = 'flex';
                                        } else {
                                            // Fallback if hero section isn't found
                                            const mainContent = document.getElementById('mainContent');
                                            if (mainContent) {
                                                mainContent.style.display = 'block';
                                            }
                                        }
                                        document.body.style.overflow = 'auto';
                                    }, 800); // Match with opacity transition duration
                                });
                            }
                        } else {
                            // Fallback if mobile phones section isn't found
                            if (document.querySelector('.hero')) {
                                document.querySelector('.hero').style.display = 'flex';
                            } else {
                                const mainContent = document.getElementById('mainContent');
                                if (mainContent) {
                                    mainContent.style.display = 'block';
                                }
                            }
                            document.body.style.overflow = 'auto';
                        }
                    }, 1500); // Match this with door animation duration
                });
            }
        } 
        else {
            // Fallback if door animation isn't implemented
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.style.display = 'block';
            } else if (document.querySelector('.hero')) {
                document.querySelector('.hero').style.display = 'flex';
            }
            document.body.style.overflow = 'auto';
        }
    }, 3000); // 3 seconds delay after loading screen
});
// Function to restore scrolling - add this to your script.js file
function restoreScrolling() {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto'; // For Safari
}

// Modify the existing continue button handler
document.addEventListener('DOMContentLoaded', function() {
    const continueBtn = document.getElementById('continueToSite');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            const mobilePhonesSection = document.getElementById('mobilePhonesSection');
            if (mobilePhonesSection) {
                mobilePhonesSection.style.opacity = '0';
                
                setTimeout(() => {
                    mobilePhonesSection.style.display = 'none';
                    
                    if (document.querySelector('.hero')) {
                        document.querySelector('.hero').style.display = 'flex';
                    } else {
                        const mainContent = document.getElementById('mainContent');
                        if (mainContent) {
                            mainContent.style.display = 'block';
                        }
                    }
                    restoreScrolling();
                }, 800);
            }
        });
    }
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
            if (window.innerWidth <= 1300) {
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
        if (window.innerWidth <= 1300) {
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
            if (window.innerWidth <= 1300 && !link.classList.contains('dropbtn')) {
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
    
    initSwiperSliders();
    initStatCounters();
    initSupportChat();
    const carousel = {
        container: document.querySelector('.carousel-container'),
        slides: document.querySelectorAll('.carousel-slide'),
        prevBtn: document.querySelector('.carousel-btn.prev'),
        nextBtn: document.querySelector('.carousel-btn.next'),
        dotsContainer: document.querySelector('.carousel-dots'),
        currentSlide: 0,
        interval: null,
        autoPlayDuration: 10000, // 5 seconds per slide

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
            // this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            // this.container.addEventListener('mouseleave', () => this.startAutoPlay());
            
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
            this.slides.forEach(slide => {
                slide.classList.remove('active');

                // Pause and reset any videos in all slides
                const video = slide.querySelector('video');
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            });
            
            const videoSlide = document.querySelector('#video-slide video');
            if (videoSlide) {
                videoSlide.addEventListener('ended', () => {
                    carousel.nextSlide();
                });
            }

            const dots = this.dotsContainer.querySelectorAll('.dot');
            dots.forEach(dot => dot.classList.remove('active'));

            // Add active class to current slide and dot
            this.currentSlide = index;
            const currentSlideElement = this.slides[index];
            currentSlideElement.classList.add('active');
            dots[index].classList.add('active');

            // Play video if present in the current slide
            const activeVideo = currentSlideElement.querySelector('video');
            if (activeVideo) {
                activeVideo.play();
            }
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
// /** @function inquireProduct - Used in HTML onclick attributes */
function inquireProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Redirect to the product detail page with the product ID in the URL
        window.location.href = `product-detail.html?id=${product.id}`;
    }
}
window.inquireProduct = inquireProduct;

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
/**
 * Initialize Swiper sliders
 */
function initSwiperSliders() {
    // Only initialize if Swiper is loaded
    if (typeof Swiper === 'undefined') return;
    
    // Testimonials slider
    const testimonialSwiper = new Swiper('.swiper-testimonials', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        breakpoints: {
            1300: {
                slidesPerView: 2
            },
            1024: {
                slidesPerView: 3
            }
        }
    });
}

/**
 * Initialize animated stat counters
 */
function initStatCounters() {
    const counters = document.querySelectorAll('.stat-counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        
        // Use Intersection Observer to start counting when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let count = 0;
                    const duration = 2000; // 2 seconds
                    const interval = duration / target;
                    
                    const timer = setInterval(() => {
                        count++;
                        counter.textContent = count;
                        
                        if (count >= target) {
                            clearInterval(timer);
                        }
                    }, interval);
                    
                    // Unobserve after animation starts
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}


// Window Resize Handler
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        const navLinks = document.getElementById("navLinks");
        const menuOverlay = document.querySelector(".menu-overlay");
        
        if (window.innerWidth > 1300) {
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