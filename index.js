// Root index.js - Entry point for Render deployment
console.log('Starting Agromap Azerbaijan server...');

try {
  // Try to require the built server code
  require('./server/dist/index.js');
} catch (error) {
  console.error('Error loading server:', error.message);
  
  // Fallback to direct source if build isn't available
  try {
    require('./server/src/index.ts');
    console.log('Running from TypeScript source via ts-node');
  } catch (secondError) {
    console.error('Fatal error: Could not load server from any location');
    console.error(secondError);
    process.exit(1);
  }
} 