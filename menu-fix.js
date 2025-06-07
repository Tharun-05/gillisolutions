// Menu fix to ensure proper mobile navigation toggle behavior
document.addEventListener('DOMContentLoaded', function() {
    console.log("Menu fix loaded");
    
    // Get UI elements
    const menuBtn = document.querySelector('nav .fa-bars');
    const closeBtn = document.querySelector('.nav-links .fa-times');
    const navLinks = document.getElementById("navLinks");
    const menuOverlay = document.querySelector('.menu-overlay');
    
    // Check if elements exist, create if needed
    if (!menuBtn) createMenuButton();
    if (!closeBtn && navLinks) createCloseButton(navLinks);
    if (!menuOverlay) createMenuOverlay();
    
    // Fix button positions and styles
    fixButtonPositions();
    
    // Add event listeners
    setupEventListeners();
    
    // Ensure the global menu functions are defined
    defineGlobalMenuFunctions();
    
    // Helper functions
    function createMenuButton() {
        const nav = document.querySelector('nav');
        if (nav) {
            console.log("Creating hamburger button");
            const newBtn = document.createElement('i');
            newBtn.className = 'fas fa-bars';
            newBtn.style.display = window.innerWidth <= 768 ? "block" : "none";
            styleMenuButton(newBtn);
            
            // Use direct event listener instead of onclick attribute
            newBtn.addEventListener('click', function() {
                toggleMenuImpl();
            });
            
            nav.appendChild(newBtn);
        }
    }
    
    function createCloseButton(navLinks) {
        console.log("Creating close button");
        const newCloseBtn = document.createElement('i');
        newCloseBtn.className = 'fas fa-times';
        styleCloseButton(newCloseBtn);
        
        // Use direct event listener instead of onclick attribute
        newCloseBtn.addEventListener('click', function() {
            hideMenuImpl();
        });
        
        navLinks.insertBefore(newCloseBtn, navLinks.firstChild);
    }
    
    function createMenuOverlay() {
        console.log("Creating menu overlay");
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        styleMenuOverlay(overlay);
        
        // Use direct event listener instead of onclick attribute
        overlay.addEventListener('click', function() {
            hideMenuImpl();
        });
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    function styleMenuButton(btn) {
        btn.style.display = window.innerWidth <= 768 ? "block" : "none";
        btn.style.position = "fixed";
        btn.style.right = "20px";
        btn.style.top = "26px";
        btn.style.zIndex = "1001";
        btn.style.fontSize = "24px";
        btn.style.cursor = "pointer";
        btn.style.padding = "8px";
        btn.style.background = "transparent";
        btn.style.border = "none";
    }
    
    function styleCloseButton(btn) {
        btn.style.display = "block";
        btn.style.position = "absolute";
        btn.style.top = "20px";
        btn.style.right = "20px";
        btn.style.zIndex = "1002"; // Higher z-index than hamburger
        btn.style.fontSize = "24px";
        btn.style.color = "#333";
        btn.style.cursor = "pointer";
        btn.style.padding = "8px";
    }
    
    function styleMenuOverlay(overlay) {
        overlay.style.display = "none";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.5)";
        overlay.style.zIndex = "999";
    }
    
    function fixButtonPositions() {
        const hamburger = document.querySelector('nav .fa-bars');
        const close = document.querySelector('.nav-links .fa-times');
        
        if (hamburger) {
            styleMenuButton(hamburger);
            // Ensure click event is attached
            hamburger.removeEventListener('click', toggleMenuImpl);
            hamburger.addEventListener('click', toggleMenuImpl);
        }
        
        if (close) {
            styleCloseButton(close);
            // Ensure click event is attached
            close.removeEventListener('click', hideMenuImpl);
            close.addEventListener('click', hideMenuImpl);
        }
    }
    
    function setupEventListeners() {
        window.addEventListener('resize', function() {
            const hamburger = document.querySelector('nav .fa-bars');
            if (hamburger) {
                hamburger.style.display = window.innerWidth <= 768 ? "block" : "none";
            }
        });
        
        // Set direct event listener on menu overlay
        const overlay = document.querySelector('.menu-overlay');
        if (overlay) {
            overlay.removeEventListener('click', hideMenuImpl);
            overlay.addEventListener('click', hideMenuImpl);
        }
        
        // Add direct event listeners to the buttons
        const hamburger = document.querySelector('nav .fa-bars');
        if (hamburger) {
            hamburger.removeEventListener('click', toggleMenuImpl);
            hamburger.addEventListener('click', toggleMenuImpl);
        }
        
        const close = document.querySelector('.nav-links .fa-times');
        if (close) {
            close.removeEventListener('click', hideMenuImpl);
            close.addEventListener('click', hideMenuImpl);
        }
    }
    
    function defineGlobalMenuFunctions() {
        // Define the toggle menu function globally
        window.toggleMenu = function() {
            toggleMenuImpl();
        };
        
        // Define the show menu function globally
        window.showMenu = function() {
            showMenuImpl();
        };
        
        // Define the hide menu function globally
        window.hideMenu = function() {
            hideMenuImpl();
        };
    }
    
    function toggleMenuImpl() {
        console.log("Toggle menu implementation called");
        const navLinks = document.getElementById("navLinks");
        
        if (!navLinks) {
            console.error("Navigation links not found");
            return;
        }
        
        // Check if menu is already open
        const computedStyle = window.getComputedStyle(navLinks);
        const isMenuOpen = computedStyle.getPropertyValue('right') === '0px';
        
        console.log("Menu is open:", isMenuOpen);
        
        if (isMenuOpen) {
            hideMenuImpl();
        } else {
            showMenuImpl();
        }
    }
    
    function showMenuImpl() {
        console.log("Show menu implementation called");
        const navLinks = document.getElementById("navLinks");
        const menuOverlay = document.querySelector('.menu-overlay');
        const hamburgerBtn = document.querySelector('nav .fa-bars');
        
        if (!navLinks) return;
        
        navLinks.style.right = "0";
        
        if (menuOverlay) menuOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
        
        // Temporarily hide the hamburger when menu is open to prevent overlap
        if (hamburgerBtn) hamburgerBtn.style.opacity = "0";
    }
    
    function hideMenuImpl() {
        console.log("Hide menu implementation called");
        const navLinks = document.getElementById("navLinks");
        const menuOverlay = document.querySelector('.menu-overlay');
        const hamburgerBtn = document.querySelector('nav .fa-bars');
        
        if (!navLinks) return;
        
        navLinks.style.right = "-250px";
        
        if (menuOverlay) menuOverlay.style.display = "none";
        document.body.style.overflow = "auto";
        
        // Show the hamburger again when menu is closed
        if (hamburgerBtn) hamburgerBtn.style.opacity = "1";
    }
});
