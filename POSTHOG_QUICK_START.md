# 🚀 PostHog Quick Start (10 Minutes to FREE Session Replay)

## ⚡ Fastest Way to Get Session Replay Running

---

## Step 1: Sign Up (2 minutes)

1. Go to https://posthog.com
2. Click "Get started - free"
3. Enter email (no credit card needed!)
4. Create account
5. Create your first project
6. **Copy your Project API Key** (starts with `phc_...`)

---

## Step 2: Install (1 minute)

```bash
npm install posthog-js
```

---

## Step 3: Initialize (2 minutes)

Create a new file:

```javascript
// File: src/posthog.js
import posthog from 'posthog-js';

// Initialize PostHog
posthog.init('phc_YOUR_API_KEY_HERE', {
  api_host: 'https://app.posthog.com',
  
  // Enable session recording
  session_recording: {
    enabled: true,
    maskAllInputs: true, // Privacy: mask passwords, credit cards
    maskAllText: false, // Don't mask regular text
    sampleRate: 1.0, // Record 100% of sessions (you have 5,000/month free)
  },
  
  // Autocapture clicks and interactions
  autocapture: true,
  
  // Capture page views
  capture_pageview: true,
  
  // Capture console logs
  capture_console: ['error', 'warn'],
  
  // Capture performance metrics
  capture_performance: true,
});

export default posthog;
```

---

## Step 4: Add to Your App (2 minutes)

```javascript
// File: src/App.js
import posthog from './posthog'; // Import at top

function App() {
  // ... your existing code ...
  
  // Identify user when they log in (optional but helpful)
  useEffect(() => {
    if (user?.email) {
      posthog.identify(user.email, {
        name: user.name,
        email: user.email,
        userType: 'customer', // or 'admin', etc.
      });
    }
  }, [user]);
  
  // Your existing code continues...
}
```

---

## Step 5: Track Custom Events (2 minutes)

Add event tracking to your booking flow:

```javascript
// In your booking submission function
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  
  // Track the booking attempt
  posthog.capture('booking_attempt_started', {
    service: bookingData.service,
    vehicleSize: bookingData.vehicleSize,
    location: bookingData.location,
    date: bookingData.date,
  });
  
  try {
    // Your existing booking logic...
    await saveBookingToFirebase();
    
    // Track success
    posthog.capture('booking_completed', {
      service: bookingData.service,
      bookingId: newBookingId,
    });
    
  } catch (error) {
    // Track failure
    posthog.capture('booking_failed', {
      error: error.message,
      service: bookingData.service,
    });
  }
};
```

---

## Step 6: Link to Forensics (Optional - 3 minutes)

Update your booking logger to include PostHog session links:

```javascript
// File: src/utils/bookingLogger.js
import posthog from '../posthog';

export const logBookingAttempt = async (status, bookingDetails, additionalData = {}) => {
  // Get PostHog session ID and URL
  const sessionId = posthog.get_session_id();
  const sessionUrl = sessionId 
    ? `https://app.posthog.com/project/YOUR_PROJECT_ID/replay/${sessionId}`
    : null;
  
  await addDoc(collection(db, 'booking_attempts'), {
    status,
    bookingDetails,
    timestamp: serverTimestamp(),
    
    // NEW: Add PostHog session link
    posthogSessionId: sessionId,
    posthogSessionUrl: sessionUrl,
    
    ...additionalData
  });
};
```

Then in your BookingForensics.js table, add a column:

```javascript
// Add to table header
<th>Replay</th>

// Add to table body
<td className="px-4 py-3 text-sm">
  {log.posthogSessionUrl ? (
    <a
      href={log.posthogSessionUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
    >
      🎬 Watch
    </a>
  ) : (
    <span className="text-gray-400">—</span>
  )}
</td>
```

---

## Step 7: Deploy & Test (1 minute)

```bash
# Commit your changes
git add .
git commit -m "Add PostHog session replay"

# Deploy (if using Vercel)
git push

# Or run locally
npm start
```

---

## Step 8: View Recordings!

1. Go to https://app.posthog.com
2. Click "Session Recordings" in left menu
3. Wait 1-2 minutes for data to appear
4. Click on any recording
5. **Watch your user's session like a video!** 🎬

---

## 🎯 What You'll See

When you watch a recording:

### **Player Controls:**
- ⏯️  Play/Pause
- ⏩ Speed controls (1x, 2x, 4x, 8x)
- ⏪ Skip backward/forward
- 📊 Events timeline

### **User Actions:**
- 🖱️  Mouse cursor movements (live)
- 👆 Clicks (highlighted in red)
- 📜 Scroll behavior
- ⌨️  Form inputs (masked for privacy)
- 🔄 Page navigation
- 📱 Mobile gestures

### **Technical Info:**
- 🌐 Browser and OS
- 📐 Screen resolution
- ⚡ Page load times
- 🔗 Network requests
- ❌ JavaScript errors
- 📝 Console logs

### **User Journey:**
- 📍 Entry point (where they came from)
- 🗺️  Page path (where they went)
- ⏱️  Time on each page
- 🎯 Exit point (where they left)

---

## 🎁 Bonus Features (All Free!)

### **1. Person Profiles**
See all recordings from one user:
- Click on any recording
- Click the person's name
- See their entire history

### **2. Filters**
Find specific recordings:
- Filter by page URL
- Filter by event (e.g., "booking_failed")
- Filter by user properties
- Filter by date range
- Filter by duration

### **3. Playlists**
Create playlists:
- "Booking failures"
- "Mobile users"
- "First-time visitors"
- "VIP customers"

### **4. Comments**
Add notes to recordings:
- Mark specific timestamps
- Tag team members
- Discuss issues
- Track follow-ups

### **5. Sharing**
Share recordings:
- Generate shareable link
- Set expiration
- No login required for viewer
- Great for demos

---

## 🔧 Advanced Configuration (Optional)

### **Record Only Specific Pages:**

```javascript
posthog.init('YOUR_KEY', {
  session_recording: {
    enabled: true,
    recordCondition: () => {
      // Only record booking page
      return window.location.pathname.includes('/book');
    },
  },
});
```

### **Sample Rate (Save Quota):**

```javascript
posthog.init('YOUR_KEY', {
  session_recording: {
    enabled: true,
    sampleRate: 0.5, // Record 50% of sessions
    // This doubles your quota: 5,000 → 10,000 effective sessions
  },
});
```

### **Enhanced Privacy:**

```javascript
posthog.init('YOUR_KEY', {
  session_recording: {
    enabled: true,
    maskAllInputs: true,
    maskAllText: true, // Mask ALL text (maximum privacy)
    maskTextSelector: '.sensitive, .private', // Extra selectors
    blockSelector: '.secret', // Completely block elements
  },
});
```

### **Performance Optimization:**

```javascript
posthog.init('YOUR_KEY', {
  session_recording: {
    enabled: true,
    inactivityThreshold: 60000, // Stop after 60s idle
    minimumDuration: 1000, // Don't save sessions < 1 second
  },
});
```

---

## 📊 Understanding Your Dashboard

### **Key Metrics to Watch:**

1. **Recording Count**
   - How many sessions recorded today
   - Trend over time
   - You have 5,000/month free

2. **Average Session Duration**
   - How long users stay
   - Longer = more engaged

3. **Top Pages**
   - Which pages are viewed most
   - Which cause problems

4. **Event Frequency**
   - How often bookings attempted
   - How often they succeed/fail

5. **Rage Clicks**
   - When users click repeatedly (frustrated)
   - Indicates broken UI

6. **Dead Clicks**
   - When users click non-interactive elements
   - Indicates confusing UI

---

## 🐛 Troubleshooting

### **No recordings showing?**
1. Check API key is correct
2. Wait 2-3 minutes for data
3. Check browser console for errors
4. Verify PostHog is initialized before user interacts

### **Recordings are blank?**
1. Check Content Security Policy (CSP)
2. Verify no ad blockers on test device
3. Check privacy settings aren't too strict

### **Missing some interactions?**
1. Check `autocapture: true` is enabled
2. Verify no custom click handlers blocking
3. Check privacy masking settings

---

## ✅ Success Checklist

- [ ] Signed up for PostHog (free)
- [ ] Got API key
- [ ] Installed `posthog-js`
- [ ] Initialized in App.js
- [ ] Deployed to production
- [ ] Tested a booking
- [ ] Saw first recording in PostHog
- [ ] Linked to forensics dashboard
- [ ] Shared with team

---

## 🎉 You're Done!

You now have:
- ✅ Session replay running
- ✅ 5,000 free recordings/month
- ✅ Mouse tracking
- ✅ Click tracking
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ User analytics
- ✅ Heatmaps
- ✅ Funnels
- ✅ Feature flags
- ✅ A/B testing

**All for $0/month!** 🎁

---

## 📞 Need Help?

- **PostHog Docs:** https://posthog.com/docs
- **Community:** https://posthog.com/slack
- **Tutorials:** https://posthog.com/tutorials
- **Support:** support@posthog.com

---

## 🚀 Next Steps

1. **Week 1:** Watch recordings daily, learn user behavior
2. **Week 2:** Create playlists for different issues
3. **Week 3:** Use insights to fix top problems
4. **Week 4:** Track improvements in conversion funnel

---

**Total Setup Time: 10 minutes**  
**Total Cost: $0/month**  
**Value: Priceless insights into your users!** 🎬✨

Start now: https://posthog.com 🚀
