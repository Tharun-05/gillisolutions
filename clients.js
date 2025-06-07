// Initialize AOS animations
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

document.addEventListener('DOMContentLoaded', function() {
    // Stats counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            let count = 0;
            const duration = 2000; // 2 seconds
            const increment = Math.ceil(target / (duration / 16)); // 60fps
            
            const timer = setInterval(() => {
                count += increment;
                if (count >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = count;
                }
            }, 16);
        });
    }
    
    // Use Intersection Observer to trigger animation when stats are visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        observer.observe(statsContainer);
    }
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Gallery filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all filter buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Show/hide gallery items based on filter
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Initialize Lightbox
    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'disableScrolling': true
    });
    
    // Client logos carousel effect
    const logoContainer = document.querySelector('.client-logos');
    if (logoContainer) {
        // Clone logos for infinite scroll effect
        const logos = document.querySelectorAll('.logo-item');
        
        // Clone each logo and append to container
        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            logoContainer.appendChild(clone);
        });
        
        // Make sure we have enough logos for smooth scrolling
        if (logos.length < 10) {
            // Add more clones if needed
            logos.forEach(logo => {
                const clone = logo.cloneNode(true);
                logoContainer.appendChild(clone);
            });
        }
        
        // Add animation class
        logoContainer.classList.add('animate');
        
        // Pause animation on hover
        logoContainer.addEventListener('mouseenter', () => {
            logoContainer.style.animationPlayState = 'paused';
        });
        
        logoContainer.addEventListener('mouseleave', () => {
            logoContainer.style.animationPlayState = 'running';
        });
    }
}); 

// Mobile menu functions
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