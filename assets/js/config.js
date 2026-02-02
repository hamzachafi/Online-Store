// Basic store configuration — customize here.
window.STORE_CONFIG = {
  STORE_NAME: 'Hamza Chafi',
  CONTACT_EMAIL: 'orders@example.com', // change to your order inbox
  CURRENCY: 'MAD', // e.g., 'MAD', 'USD', 'EUR'
  CURRENCY_SYMBOL: 'د.م',
  TAX_RATE: 0.0, // e.g., 0.2 for 20%
  SHIPPING_FLAT: 0.0,
  PAYMENT: {
    MODE: 'mailto', // 'mailto' | 'stripe_link' | 'paypal'
    STRIPE_LINK_URL: '', // e.g., https://buy.stripe.com/...
    PAYPAL_CHECKOUT_URL: '' // e.g., https://www.paypal.com/checkoutnow?token=...
  }
};
