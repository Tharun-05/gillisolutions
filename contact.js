// Initialize AOS animations
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Form validation can be added here if needed
            
            // Show loading state on button
            const submitBtn = this.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            
            btnText.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Form will be submitted normally to Web3Forms
            // This is just for UI feedback
            setTimeout(() => {
                btnText.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
    
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