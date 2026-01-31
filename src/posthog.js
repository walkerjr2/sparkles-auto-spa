import posthog from 'posthog-js';

// Initialize PostHog with your API key
posthog.init('phc_qCGhZUvsK3zB2C2pMHvLxH4vK6g2kmSd216kt1gcdwa', {
  api_host: 'https://app.posthog.com',
  
  // Enable session recording
  session_recording: {
    enabled: true,
    maskAllInputs: true, // Privacy: mask passwords, credit cards automatically
    maskAllText: false, // Don't mask regular text (so you can see what users see)
    
    // Record 100% of sessions (you have 5,000/month free)
    sampleRate: 1.0,
    
    // Record console errors for debugging
    recordConsole: ['error', 'warn'],
    
    // Privacy controls
    blockSelector: '.sensitive-data, .private-content', // Block these elements completely
    maskTextSelector: '.mask-text', // Mask text in these elements
  },
  
  // Automatically capture clicks, page views, form submits
  autocapture: true,
  
  // Capture page views automatically
  capture_pageview: true,
  
  // Capture console logs
  capture_console: ['error', 'warn'],
  
  // Capture performance metrics
  capture_performance: true,
  
  // Persistence
  persistence: 'localStorage',
  
  // Debugging (set to false in production)
  loaded: (posthog) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ PostHog initialized successfully!');
      console.log('🎬 Session recording enabled');
      console.log('📊 Analytics tracking enabled');
    }
  },
});

export default posthog;
