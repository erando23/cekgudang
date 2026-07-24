// Vercel Speed Insights - Client-side initialization
// This script initializes Speed Insights for performance monitoring

(function() {
  'use strict';
  
  // Initialize the Speed Insights queue
  if (window.si) return; // Already initialized
  
  window.si = function() {
    (window.siq = window.siq || []).push(arguments);
  };
  
  // Configuration
  var isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
  
  // Only inject in production or when explicitly testing
  if (isDev) {
    console.log('[Speed Insights] Running in development mode - metrics will not be sent');
    return;
  }
  
  // Function to inject the Speed Insights script
  function injectScript() {
    // Get DSN from meta tag if present (for self-hosted scenarios)
    var dsnMeta = document.querySelector('meta[name="vercel-speed-insights-dsn"]');
    var dsn = dsnMeta ? dsnMeta.getAttribute('content') : null;
    
    // Vercel automatically injects the Speed Insights script when enabled in the dashboard
    // This code ensures the queue is initialized and ready
    
    // The actual tracking script is served by Vercel at:
    // /_vercel/insights/script.js
    var script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/speed-insights/script.js';
    
    script.onerror = function() {
      console.log('[Speed Insights] Script not loaded - ensure Speed Insights is enabled in Vercel dashboard');
    };
    
    var firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }
  
  // Inject the script when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectScript);
  } else {
    injectScript();
  }
})();
