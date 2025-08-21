// PayPal helper functions for the direct JavaScript SDK
const getPayPalClientId = () => {
    const mode = window.configVariables.PAYPAL_MODE;
    return mode === 'production' 
        ? window.configVariables.PAYPAL_CLIENT_ID 
        : window.configVariables.PAYPAL_SANDBOX_ID;
};

const getPayPalOptions = () => {
    return {
        clientId: getPayPalClientId(),
        currency: "USD",
        intent: "capture"
    };
};

// Function to load PayPal SDK dynamically
const loadPayPalSDK = () => {
    return new Promise((resolve, reject) => {
        if (window.paypal) {
            resolve(window.paypal);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${getPayPalClientId()}&currency=USD&intent=capture`;
        script.onload = () => resolve(window.paypal);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

export { getPayPalClientId, getPayPalOptions, loadPayPalSDK }; 