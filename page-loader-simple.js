/**
 * Simple Page Loader - Shows for 2 seconds
 */

(function() {
    'use strict';
    
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Remove loader after 2 seconds
    function removeLoader() {
        const loader = document.getElementById('pageLoader');
        if (!loader) return;
        
        // Final scroll to top
        window.scrollTo(0, 0);
        
        // Remove loading class
        if (document.documentElement) {
            document.documentElement.classList.remove('loading');
        }
        if (document.body) {
            document.body.classList.remove('loading');
        }
        
        // Fade out
        loader.classList.add('fade-out');
        
        // Remove from DOM
        setTimeout(function() {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 600);
    }
    
    // Wait for DOM, then show for 2 seconds
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(removeLoader, 3000);
        });
    } else {
        setTimeout(removeLoader, 3000);
    }
    
})();
