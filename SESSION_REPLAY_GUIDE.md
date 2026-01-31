# 🎬 Session Replay & Advanced Monitoring Implementation Guide

## 📋 Overview

This guide explains how to implement advanced user session monitoring, including screen recording, mouse tracking, click events, and more - similar to what you see in Sentry or LogRocket.

---

## 🔍 What is Session Replay?

Session replay technology records and plays back user sessions showing:
- ✅ Mouse movements and cursor position
- ✅ Click events and tap locations
- ✅ Scroll behavior
- ✅ Form field interactions (with privacy masking)
- ✅ Page navigation and route changes
- ✅ Console errors and warnings
- ✅ Network requests and API calls
- ✅ Device and browser information
- ✅ Screen size and viewport changes

---

## 🚀 **OPTION 1: Sentry Session Replay (RECOMMENDED)**

### **Why Choose Sentry:**
- ✅ You already have Sentry installed
- ✅ Easiest to implement (2 lines of code)
- ✅ Automatic error correlation with replays
- ✅ Privacy controls built-in
- ✅ Free tier: 50 replays/month
- ✅ Paid: $29/mo for 500 replays

### **Installation:**

```bash
# Install Sentry Session Replay package
npm install --save @sentry/react @sentry/browser
```

### **Update Your Sentry Configuration:**

**File: `src/sentry.js` (or wherever you initialize Sentry)**

```javascript
import * as Sentry from "@sentry/react";
import { Replay } from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    new Replay({
      // Session Replay Configuration
      maskAllText: false, // Set to true to mask all text for privacy
      maskAllInputs: true, // Masks password, credit card fields
      blockAllMedia: false, // Set to true to block images/videos
      
      // Sample rate for normal sessions (10% of sessions)
      sessionSampleRate: 0.1,
      
      // Sample rate for sessions with errors (100% of error sessions)
      errorSampleRate: 1.0,
      
      // Privacy settings
      privacy: {
        maskTextSelector: '.sensitive-data', // CSS selector for text to mask
        blockSelector: '.private-content', // CSS selector for content to block
        ignoreSelector: '.analytics-ignore', // Don't record these elements
      },
    }),
  ],
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Release tracking
  release: "sparkles-auto-spa@1.0.0",
  environment: process.env.NODE_ENV,
});
```

### **Usage in Your App:**

```javascript
// In your booking form or anywhere you want extra monitoring
import * as Sentry from "@sentry/react";

// Manually start a replay for important user flows
Sentry.getCurrentHub().getIntegration(Replay)?.start();

// Add breadcrumbs for custom events
Sentry.addBreadcrumb({
  message: 'User clicked submit button',
  level: 'info',
  data: {
    service: bookingData.service,
    timestamp: new Date().toISOString()
  }
});
```

### **View Replays in Sentry:**
1. Go to https://sentry.io/organizations/your-org/replays/
2. Click on any session
3. Watch the replay like a video
4. See exact mouse movements, clicks, scrolls
5. Correlated with errors automatically

---

## 🚀 **OPTION 2: LogRocket (Best for Product Analytics)**

### **Why Choose LogRocket:**
- ✅ Best-in-class session replay
- ✅ Advanced analytics and funnels
- ✅ Redux/state tracking
- ✅ Network monitoring
- ✅ Free tier: 1,000 sessions/month
- ✅ Paid: Starting at $99/mo

### **Installation:**

```bash
npm install --save logrocket logrocket-react
```

### **Implementation:**

```javascript
// File: src/logrocket-init.js
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

// Initialize LogRocket
LogRocket.init('YOUR_APP_ID/your-project');

// Setup React plugin
setupLogRocketReact(LogRocket);

// Identify users
export const identifyUser = (user) => {
  LogRocket.identify(user.email, {
    name: user.name,
    email: user.email,
    // Add custom user properties
  });
};

// Track custom events
export const trackBookingAttempt = (bookingData) => {
  LogRocket.track('Booking Attempted', {
    service: bookingData.service,
    vehicleSize: bookingData.vehicleSize,
    timestamp: new Date().toISOString()
  });
};
```

### **Add to App.js:**

```javascript
import './logrocket-init';
import { identifyUser, trackBookingAttempt } from './logrocket-init';

// When user logs in
useEffect(() => {
  if (user) {
    identifyUser(user);
  }
}, [user]);

// When booking is attempted
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  trackBookingAttempt(bookingData);
  // ... rest of your booking logic
};
```

---

## 🚀 **OPTION 3: Hotjar (Best for UX/Heatmaps)**

### **Why Choose Hotjar:**
- ✅ Session recordings
- ✅ Heatmaps and click maps
- ✅ Feedback polls and surveys
- ✅ Free tier: 35 daily sessions
- ✅ Paid: Starting at $32/mo

### **Installation:**

```bash
npm install --save react-hotjar
```

### **Implementation:**

```javascript
// File: src/hotjar-init.js
import { hotjar } from 'react-hotjar';

const HOTJAR_ID = 'YOUR_HOTJAR_ID';
const HOTJAR_VERSION = 6;

export const initHotjar = () => {
  hotjar.initialize(HOTJAR_ID, HOTJAR_VERSION);
};

// Track custom events
export const trackHotjarEvent = (eventName) => {
  hotjar.event(eventName);
};

// Identify users
export const identifyHotjarUser = (userId, attributes) => {
  hotjar.identify(userId, attributes);
};
```

### **Add to App.js:**

```javascript
import { initHotjar, trackHotjarEvent } from './hotjar-init';

useEffect(() => {
  initHotjar();
}, []);

// Track booking attempts
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  trackHotjarEvent('booking_attempt');
  // ... rest of your logic
};
```

---

## 🚀 **OPTION 4: FullStory (Enterprise Level)**

### **Why Choose FullStory:**
- ✅ Most advanced session replay
- ✅ AI-powered insights
- ✅ Advanced search and filtering
- ✅ Paid only: Starting at $299/mo

### **Installation:**

```javascript
// Add to public/index.html before </head>
<script>
window['_fs_debug'] = false;
window['_fs_host'] = 'fullstory.com';
window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
window['_fs_org'] = 'YOUR_ORG_ID';
window['_fs_namespace'] = 'FS';
(function(m,n,e,t,l,o,g,y){
  // FullStory snippet (get from FullStory dashboard)
})();
</script>
```

---

## 🚀 **OPTION 5: Build Your Own (Most Control, Most Work)**

### **Technologies Needed:**

1. **rrweb** - Session recording library (open source)
2. **Custom backend** - Store recordings
3. **Replay viewer** - Playback interface

### **Installation:**

```bash
npm install --save rrweb rrweb-player
```

### **Implementation:**

```javascript
// File: src/utils/sessionRecorder.js
import rrweb from 'rrweb';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

let events = [];
let sessionId = null;
let stopRecording = null;

export const startSessionRecording = () => {
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  stopRecording = rrweb.record({
    emit(event) {
      // Collect events
      events.push(event);
      
      // Save to Firebase every 10 seconds
      if (events.length >= 50) {
        saveEvents();
      }
    },
    
    // Recording options
    checkoutEveryNms: 15000, // Periodic full snapshot
    checkoutEveryNth: 200, // Full snapshot every N events
    
    // Privacy options
    maskAllInputs: true,
    maskTextSelector: '.sensitive',
    blockSelector: '.private',
    
    // Performance
    sampling: {
      mousemove: true,
      mouseInteraction: true,
      scroll: 150, // ms
      input: 'last', // Record only last input value
    },
    
    // Collect console logs
    recordLog: true,
    
    // Collect network requests
    recordCanvas: false, // Heavy on performance
  });
  
  console.log('🎬 Session recording started:', sessionId);
  
  // Save session metadata
  saveSessionMetadata();
};

const saveEvents = async () => {
  if (events.length === 0) return;
  
  const eventsToSave = [...events];
  events = []; // Clear array
  
  try {
    await addDoc(collection(db, 'session_recordings'), {
      sessionId,
      events: eventsToSave,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to save session events:', error);
  }
};

const saveSessionMetadata = async () => {
  try {
    await addDoc(collection(db, 'session_metadata'), {
      sessionId,
      startTime: new Date(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      platform: navigator.platform,
    });
  } catch (error) {
    console.error('Failed to save session metadata:', error);
  }
};

export const stopSessionRecording = () => {
  if (stopRecording) {
    stopRecording();
    saveEvents(); // Save remaining events
    console.log('🛑 Session recording stopped:', sessionId);
  }
};

// Auto-stop on page unload
window.addEventListener('beforeunload', () => {
  stopSessionRecording();
});
```

### **Add to App.js:**

```javascript
import { startSessionRecording, stopSessionRecording } from './utils/sessionRecorder';

function App() {
  useEffect(() => {
    // Start recording when app loads
    startSessionRecording();
    
    return () => {
      stopSessionRecording();
    };
  }, []);
  
  // ... rest of your app
}
```

### **Create a Replay Viewer:**

```javascript
// File: src/SessionReplayViewer.js
import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

export default function SessionReplayViewer() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [events, setEvents] = useState([]);
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      const q = query(
        collection(db, 'session_metadata'),
        orderBy('startTime', 'desc')
      );
      const snapshot = await getDocs(q);
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate()
      }));
      setSessions(sessionsData);
    };
    loadSessions();
  }, []);

  // Load events for selected session
  const loadSessionEvents = async (sessionId) => {
    const q = query(
      collection(db, 'session_recordings'),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    const allEvents = [];
    snapshot.docs.forEach(doc => {
      allEvents.push(...doc.data().events);
    });
    setEvents(allEvents);
  };

  // Play session
  useEffect(() => {
    if (events.length > 0 && playerRef.current) {
      // Clean up previous player
      if (playerInstance.current) {
        playerInstance.current.pause();
      }
      
      // Create new player
      playerInstance.current = new rrwebPlayer({
        target: playerRef.current,
        props: {
          events,
          width: 1024,
          height: 768,
          autoPlay: false,
          showController: true,
          speedOption: [1, 2, 4, 8],
        },
      });
    }
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎬 Session Replay Viewer</h1>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Sessions</h2>
            <div className="space-y-2">
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session);
                    loadSessionEvents(session.sessionId);
                  }}
                  className={`p-3 rounded cursor-pointer ${
                    selectedSession?.id === session.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {session.startTime.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {session.url}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.userAgent.includes('Mobile') ? '📱' : '💻'} 
                    {session.viewport}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player */}
          <div className="col-span-2 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Replay</h2>
            {selectedSession ? (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="text-sm"><strong>Session ID:</strong> {selectedSession.sessionId}</div>
                  <div className="text-sm"><strong>Started:</strong> {selectedSession.startTime.toLocaleString()}</div>
                  <div className="text-sm"><strong>URL:</strong> {selectedSession.url}</div>
                  <div className="text-sm"><strong>Device:</strong> {selectedSession.userAgent}</div>
                </div>
                <div ref={playerRef} className="border rounded" />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select a session to view replay
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 **Comparison Table**

| Feature | Sentry | LogRocket | Hotjar | FullStory | Custom (rrweb) |
|---------|--------|-----------|--------|-----------|----------------|
| **Session Replay** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Error Correlation** | ✅✅✅ | ✅✅ | ❌ | ✅✅ | 🔧 Build it |
| **Heatmaps** | ❌ | ✅ | ✅✅✅ | ✅✅ | 🔧 Build it |
| **Funnels/Analytics** | ❌ | ✅✅✅ | ✅ | ✅✅✅ | 🔧 Build it |
| **Free Tier** | 50/mo | 1000/mo | 35/day | ❌ | ∞ (storage cost) |
| **Pricing** | $29/mo | $99/mo | $32/mo | $299/mo | Storage costs |
| **Setup Time** | 5 min | 10 min | 5 min | 15 min | 2-3 days |
| **Privacy Controls** | ✅✅✅ | ✅✅ | ✅ | ✅✅✅ | ✅✅✅ |
| **Performance Impact** | Low | Low | Very Low | Low | Medium |

---

## 🎯 **Recommended Approach for Your Project**

### **Phase 1: Start with Sentry (NOW)**
You already have Sentry! Just add session replay:
```bash
npm install @sentry/react
```
- Takes 5 minutes
- Free tier: 50 replays/month
- Perfect for debugging booking errors
- Automatic correlation with errors

### **Phase 2: Add Hotjar (1 Month)**
If you want heatmaps and user behavior:
- See where users click most
- Identify confusing UI elements
- Get user feedback
- Complement Sentry's error tracking

### **Phase 3: Consider LogRocket (3 Months)**
If you need advanced analytics:
- Better for product analytics
- Advanced filtering and search
- Redux/state time-travel debugging
- More expensive but more features

---

## 🔒 **Privacy & GDPR Compliance**

### **Critical Privacy Settings:**

```javascript
// Mask sensitive data
maskAllInputs: true, // Passwords, credit cards
maskAllText: false, // Don't mask all text unless required
blockSelector: '.credit-card, .ssn, .password', // Block specific elements

// Add data attributes to HTML
<input className="sensitive" data-private /> // Will be masked
<div className="private-content">Secret info</div> // Will be blocked
```

### **GDPR Requirements:**
1. ✅ Add to privacy policy
2. ✅ Get user consent (cookie banner)
3. ✅ Allow users to opt-out
4. ✅ Provide data deletion option
5. ✅ Mask all sensitive data

### **Cookie Consent:**

```javascript
// Only start recording if user consents
if (getCookieConsent('analytics')) {
  startSessionRecording();
}
```

---

## 📈 **Integration with Your Booking Forensics**

### **Link Session Replays to Forensics Logs:**

```javascript
// In your booking logger (src/utils/bookingLogger.js)
import * as Sentry from "@sentry/react";

export const logBookingAttempt = async (status, bookingDetails, additionalData = {}) => {
  // Get Sentry replay ID
  const replayId = Sentry.getCurrentHub()
    .getClient()
    ?.getIntegration(Replay)
    ?.getReplayId();
  
  // Add to your forensics log
  await addDoc(collection(db, 'booking_attempts'), {
    status,
    bookingDetails,
    timestamp: serverTimestamp(),
    // ... other fields ...
    
    // NEW: Add session replay link
    sentryReplayId: replayId,
    sentryReplayUrl: replayId 
      ? `https://sentry.io/replays/${replayId}/` 
      : null,
    
    ...additionalData
  });
};
```

### **Add Replay Link to Forensics Dashboard:**

```javascript
// In BookingForensics.js table
<td className="px-4 py-3 text-sm">
  {log.sentryReplayUrl && (
    <a 
      href={log.sentryReplayUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
    >
      🎬 Watch Replay
    </a>
  )}
</td>
```

Now you can click directly from your forensics page to watch the session!

---

## 🚀 **Quick Start: Enable Sentry Replay Now**

1. **Install:**
```bash
npm install @sentry/react
```

2. **Update sentry.js:**
```javascript
import { Replay } from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new Replay({
    maskAllInputs: true,
    sessionSampleRate: 0.1,
    errorSampleRate: 1.0,
  })],
});
```

3. **Done!** Check Sentry dashboard in 5 minutes.

---

## 📚 **Resources**

- [Sentry Session Replay Docs](https://docs.sentry.io/platforms/javascript/session-replay/)
- [LogRocket Documentation](https://docs.logrocket.com/)
- [Hotjar Documentation](https://help.hotjar.com/)
- [rrweb GitHub](https://github.com/rrweb-io/rrweb)
- [FullStory Documentation](https://help.fullstory.com/)

---

**Ready to implement?** Start with Sentry Replay - you'll have it running in 5 minutes! 🚀
