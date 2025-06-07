// Initialize AOS animations
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
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
    
    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Toggle active class on clicked item
            item.classList.toggle('active');
            
            // Update icon
            const icon = this.querySelector('.faq-icon i');
            if (item.classList.contains('active')) {
                icon.classList.replace('fa-plus', 'fa-minus');
            } else {
                icon.classList.replace('fa-minus', 'fa-plus');
            }
        });
    });
    
    // Stat counter animation
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
    
    const statsSection = document.querySelector('.service-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
    
    // Testimonial slider
    const testimonialTrack = document.querySelector('.testimonial-track');
    const testimonials = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.testimonial-dots');
    
    let currentIndex = 0;
    
    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Get all dots
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    
    // Function to go to a specific slide
    function goToSlide(index) {
        currentIndex = index;
        testimonialTrack.style.transform = `translateX(-\${currentIndex * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            goToSlide(currentIndex);
        });
        
        // Auto-advance slides every 5 seconds
        let slideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            goToSlide(currentIndex);
        }, 5000);
        
        // Pause auto-advance on hover
        const testimonialSlider = document.querySelector('.testimonial-slider');
        testimonialSlider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        testimonialSlider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % testimonials.length;
                goToSlide(currentIndex);
            }, 5000);
        });
        
        // Form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Basic form validation
                const formData = new FormData(this);
                let isValid = true;
                
                for (const [key, value] of formData.entries()) {
                    if (!value.trim()) {
                        isValid = false;
                        const input = document.getElementById(key);
                        input.classList.add('error');
                    }
                }
                
                if (isValid) {
                    // Form is valid, you can submit it or handle with EmailJS
                    const submitBtn = this.querySelector('.btn-submit');
                    const originalText = submitBtn.textContent;
                    
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                    
                    // Simulate form submission (replace with actual EmailJS code)
                    setTimeout(() => {
                        alert('Thank you! Your message has been sent. We will contact you shortly.');
                        contactForm.reset();
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }, 1500);
                }
            });
            
            // Remove error class on input
            const formInputs = contactForm.querySelectorAll('input, textarea, select');
            formInputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.classList.remove('error');
                });
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