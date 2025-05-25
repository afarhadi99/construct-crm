import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
}

// Initialize Stripe with the API version
export const stripeAdmin = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // Use the latest API version
  typescript: true, // Enable TypeScript support
  // appInfo: { // Optional: For Stripe to identify your integration
  //   name: 'ConstructCRM',
  //   version: '0.1.0',
  //   url: 'https://constructcrm.com' // Replace with your app's URL
  // }
});

// Optional: Function to retrieve Stripe Product and Price details
// This can be useful if you want to dynamically fetch prices instead of hardcoding
// or to ensure your local plan definitions match Stripe.

export async function getStripeProductWithPrices(productId: string) {
  try {
    const product = await stripeAdmin.products.retrieve(productId, {
      expand: ['default_price'] // Expands the default price object
    });
    
    const prices = await stripeAdmin.prices.list({
      product: productId,
      active: true, // Only fetch active prices
    });

    return { product, prices: prices.data };
  } catch (error) {
    console.error(`Error fetching Stripe product ${productId}:`, error);
    return null;
  }
}