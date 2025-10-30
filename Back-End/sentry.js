import * as Sentry from '@sentry/node';

// Initialize Sentry BEFORE importing any other modules
Sentry.init({
    dsn: "https://ce953782a2770563dac53b02ba4bc4bd@o4510032350085120.ingest.us.sentry.io/4510032360439808",
    environment: process.env.NODE_ENV || 'development',
    
    // Performance monitoring
    tracesSampleRate: 1.0,
    
    // Additional options for better tracing
    integrations: [
        // Automatically instruments Express routes
        Sentry.expressIntegration(),
        // Instruments HTTP requests
        Sentry.httpIntegration({ tracing: true }),
    ],
});

// Export both Sentry and the setupExpressErrorHandler function
export default Sentry;
