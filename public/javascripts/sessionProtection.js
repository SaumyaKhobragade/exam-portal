// Session validation script for protected pages
// This script should be included in all protected pages

(function() {
    'use strict';
    
    // Check if session is valid when page loads
    async function validateSession() {
        try {
            const response = await fetch('/api/v1/auth/validate-session', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.log('Session validation failed, redirecting to login');
                window.location.replace('/login?message=Session expired. Please login again.&type=warning');
                return false;
            }
            
            return true;
        } catch (error) {
            console.log('Session validation error:', error);
            window.location.replace('/login?message=Session expired. Please login again.&type=error');
            return false;
        }
    }
    
    // Prevent caching of protected pages
    function preventCaching() {
        // Disable browser caching
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, window.location.href);
            window.onpopstate = function () {
                // Validate session when user tries to go back
                validateSession().then(valid => {
                    if (!valid) {
                        window.location.replace('/login?message=Session expired. Please login again.&type=warning');
                    } else {
                        window.history.go(1);
                    }
                });
            };
        }
        
        // Add meta tags to prevent caching if not already present
        if (!document.querySelector('meta[http-equiv="Cache-Control"]')) {
            const metaCache = document.createElement('meta');
            metaCache.setAttribute('http-equiv', 'Cache-Control');
            metaCache.setAttribute('content', 'no-cache, no-store, must-revalidate');
            document.head.appendChild(metaCache);
            
            const metaPragma = document.createElement('meta');
            metaPragma.setAttribute('http-equiv', 'Pragma');
            metaPragma.setAttribute('content', 'no-cache');
            document.head.appendChild(metaPragma);
            
            const metaExpires = document.createElement('meta');
            metaExpires.setAttribute('http-equiv', 'Expires');
            metaExpires.setAttribute('content', '0');
            document.head.appendChild(metaExpires);
        }
    }
    
    // Handle page visibility change (when user comes back to tab)
    function handleVisibilityChange() {
        if (!document.hidden) {
            // Page became visible, validate session
            validateSession();
        }
    }
    
    // Initialize session protection
    function initSessionProtection() {
        preventCaching();
        
        // Validate session on page load
        validateSession();
        
        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Validate session periodically (every 5 minutes)
        setInterval(validateSession, 5 * 60 * 1000);
        
        // Add beforeunload listener to clear any cached data
        window.addEventListener('beforeunload', function() {
            // Clear any sensitive data from memory
            if (window.sessionStorage) {
                sessionStorage.clear();
            }
        });
        
        console.log('Session protection initialized');
    }
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSessionProtection);
    } else {
        initSessionProtection();
    }
    
    // Expose validateSession function globally for manual checks
    window.validateUserSession = validateSession;
    
})();
