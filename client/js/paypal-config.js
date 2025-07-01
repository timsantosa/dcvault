// PayPal Configuration - Dynamically loads the correct client ID based on config
(function() {
    // Wait for config to be loaded
    function loadPayPalScript() {
        if (window.configVariables) {
            const mode = window.configVariables.PAYPAL_MODE;
            const clientId = mode === 'sandbox' 
                ? window.configVariables.PAYPAL_SANDBOX_ID 
                : window.configVariables.PAYPAL_CLIENT_ID;
            
            // Create and load PayPal script
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
            script.async = true;
            
            // Insert the script into the head
            document.head.appendChild(script);
        } else {
            // If config isn't loaded yet, try again in a moment
            setTimeout(loadPayPalScript, 100);
        }
    }
    
    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPayPalScript);
    } else {
        loadPayPalScript();
    }
})(); 