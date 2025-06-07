// Initialize AOS animations
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Stats counter animation
document.addEventListener('DOMContentLoaded', function() {
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