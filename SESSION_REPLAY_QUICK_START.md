# 🎬 Session Replay Quick Reference

## 🏆 Best Option for Your Project: **Sentry Session Replay**

### ✅ Why Sentry?
- Already installed in your project
- 2 lines of code to enable
- Free tier: 50 replays/month
- Automatic error correlation
- See EXACTLY what user saw when error occurred

---

## ⚡ Quick Setup (5 Minutes)

### **Step 1: Install Package**
```bash
npm install @sentry/react
```

### **Step 2: Update Sentry Config**
Find where you initialize Sentry (probably in `src/index.js` or `src/App.js`):

```javascript
import * as Sentry from "@sentry/react";
import { Replay } from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    new Replay({
      maskAllInputs: true,      // Hide passwords, credit cards
      sessionSampleRate: 0.1,    // Record 10% of all sessions
      errorSampleRate: 1.0,      // Record 100% of error sessions
    }),
  ],
  tracesSampleRate: 1.0,
});
```

### **Step 3: Link to Forensics**
Update your `bookingLogger.js`:

```javascript
import * as Sentry from "@sentry/react";

export const logBookingAttempt = async (status, bookingDetails) => {
  // Get Sentry replay ID
  const replayId = Sentry.getCurrentHub()
    .getClient()
    ?.getIntegration(Replay)
    ?.getReplayId();
  
  await addDoc(collection(db, 'booking_attempts'), {
    status,
    bookingDetails,
    timestamp: serverTimestamp(),
    
    // Add replay link!
    sentryReplayId: replayId,
    sentryReplayUrl: replayId ? `https://sentry.io/replays/${replayId}/` : null,
    
    // ... rest of your data
  });
};
```

### **Step 4: Add Button in Forensics Dashboard**
In `BookingForensics.js`, add a new column:

```javascript
<th>Replay</th>

// In tbody:
<td>
  {log.sentryReplayUrl ? (
    <a 
      href={log.sentryReplayUrl}
      target="_blank"
      className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
    >
      🎬 Watch Replay
    </a>
  ) : (
    <span className="text-gray-400">—</span>
  )}
</td>
```

---

## 🎥 What You'll See in Sentry

When you click the replay link:

1. **Video-like playback** of user's session
2. **Mouse cursor** moving around the page
3. **Clicks** highlighted in red
4. **Scrolling** behavior
5. **Form inputs** (masked for security)
6. **Page navigation**
7. **Network requests** timeline
8. **Console logs** synced to replay
9. **Error moment** highlighted
10. **Breadcrumb trail** of actions

---

## 🎯 How It Helps Your Booking System

### **Scenario 1: "I clicked submit but nothing happened"**
- Watch replay
- See if they actually clicked submit
- See if button was visible
- Check if loading spinner appeared
- Verify network request was sent

### **Scenario 2: "Form kept saying error"**
- Watch replay
- See which field had the red error
- See what they typed
- Check if error message was clear
- Verify form validation rules

### **Scenario 3: "Page froze"**
- Watch replay
- See exactly when page stopped responding
- Check console for JavaScript errors
- See network requests that timed out
- Identify performance bottleneck

### **Scenario 4: "I filled everything out!"**
- Watch replay
- See if they actually filled all fields
- Check if they missed a required field
- See if they clicked wrong button
- Verify their claim or prove otherwise

---

## 📊 What Gets Recorded

### ✅ **Recorded:**
- Mouse movements and position
- Clicks and taps
- Scroll position and behavior
- Page navigation (route changes)
- Form interactions (with masking)
- Console logs and errors
- Network requests (timing, status)
- DOM changes and updates
- Viewport size changes
- Tab visibility (active/inactive)

### ❌ **NOT Recorded (Privacy):**
- Passwords (automatically masked)
- Credit card numbers (masked)
- Any input with `type="password"`
- Elements with `.private` class
- Anything you specifically block

---

## 🔒 Privacy & Security

### **Automatic Privacy Features:**
```javascript
new Replay({
  maskAllInputs: true,           // Masks ALL input fields
  blockAllMedia: false,          // Can block images/videos
  maskTextSelector: '.sensitive', // Custom mask selectors
  blockSelector: '.private',      // Custom block selectors
})
```

### **GDPR Compliance:**
- ✅ Add to your privacy policy
- ✅ Get user consent (cookie banner)
- ✅ Only record after consent
- ✅ Allow users to opt-out
- ✅ Provide data deletion

### **Example Privacy Policy Addition:**
```
"We use Sentry to record user sessions for debugging purposes. 
This includes mouse movements, clicks, and interactions with our 
website. Sensitive information like passwords and payment details 
are automatically masked. You can opt-out via cookie settings."
```

---

## 💰 Pricing Breakdown

### **Sentry Free Tier:**
- ✅ 50 replay sessions/month
- ✅ Unlimited errors
- ✅ 7 day retention
- ✅ Perfect for small business

### **Sentry Team ($29/mo):**
- ✅ 500 replay sessions/month
- ✅ 90 day retention
- ✅ Better for growing business

### **Cost Optimization:**
```javascript
// Only record 10% of normal sessions
sessionSampleRate: 0.1,

// But record 100% of sessions with errors
errorSampleRate: 1.0,
```

This means:
- Most sessions → Not recorded (saves money)
- Sessions with errors → Always recorded (catch bugs)

---

## 🚀 Alternative Tools Comparison

| Tool | Best For | Free Tier | Paid From |
|------|----------|-----------|-----------|
| **Sentry** | Error debugging | 50/mo | $29/mo |
| **LogRocket** | Product analytics | 1000/mo | $99/mo |
| **Hotjar** | UX research | 35/day | $32/mo |
| **FullStory** | Enterprise | None | $299/mo |
| **Custom (rrweb)** | Full control | Unlimited* | Storage cost |

*Storage costs apply

---

## 🎬 Real Example: Booking Error Investigation

### **Before Session Replay:**
Customer: "I tried booking 5 times and it never worked!"
You: "Can you describe what happened?"
Customer: "I don't remember, it just didn't work"
You: 🤷 *Guess what might be wrong*

### **After Session Replay:**
Customer: "I tried booking 5 times and it never worked!"
You: *Opens Sentry, finds their 5 sessions*
You: *Watches replays*
You: "I see the issue! The phone number field expected format (xxx) xxx-xxxx but you entered xxx-xxx-xxxx. Let me fix that validation."

**Problem solved in 2 minutes instead of 2 hours!**

---

## 📝 Implementation Checklist

- [ ] Install `@sentry/react` package
- [ ] Add Replay integration to Sentry.init()
- [ ] Configure privacy settings (maskAllInputs)
- [ ] Update bookingLogger to capture replay ID
- [ ] Add "Watch Replay" button to forensics table
- [ ] Update privacy policy
- [ ] Add cookie consent for analytics
- [ ] Test with a booking attempt
- [ ] Verify replay appears in Sentry
- [ ] Train team on using replays
- [ ] Set up alerts for critical errors

---

## 🎯 Next Steps

1. **Install Sentry Replay** (today - 5 minutes)
2. **Link to forensics logs** (tomorrow - 15 minutes)
3. **Test with real bookings** (this week)
4. **Consider Hotjar** (next month if needed for heatmaps)
5. **Upgrade Sentry plan** (when you hit 50 replays/month)

---

## 📞 Support & Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/session-replay/
- **Sentry Pricing:** https://sentry.io/pricing/
- **Full Guide:** See `SESSION_REPLAY_GUIDE.md`
- **Questions?** Check Sentry community forum

---

**Start with Sentry Replay - it's the fastest and easiest way to see what your users see!** 🚀
