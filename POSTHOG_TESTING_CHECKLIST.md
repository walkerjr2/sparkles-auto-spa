# PostHog Integration - Testing Checklist

## Pre-Deployment Testing

### ✅ Step 1: Start Development Server
```bash
npm start
```
**Expected:** Server starts without errors on http://localhost:3000

---

### ✅ Step 2: Check PostHog Initialization
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `posthog`
4. Press Enter

**Expected:** PostHog object is defined with methods like `capture`, `identify`, etc.

---

### ✅ Step 3: Test User Identification
1. Navigate to login page
2. Login as any user (customer/admin)
3. Check Console for PostHog identify call

**Expected:** Console shows:
```
PostHog: User identified: [email]
```

---

### ✅ Step 4: Test Booking Event Tracking

#### 4A: Submit Button Click
1. Navigate to booking page
2. Open DevTools → Network tab
3. Filter for "posthog"
4. Click "Book Now" button (without filling form)
5. Check Network tab for API call

**Expected:** 
- Network request to PostHog API with event `booking_submit_clicked`
- Console log: `PostHog: Captured event 'booking_submit_clicked'`

#### 4B: Validation Failed
1. Try to submit form with missing fields
2. Check Network tab

**Expected:** Event `booking_validation_failed` captured with missing field names

#### 4C: Complete Booking Flow
1. Fill out complete booking form:
   - Service: Full Detail
   - Vehicle Size: Sedan
   - Location: Test address
   - Date & Time: Tomorrow at 10am
   - Contact info: Your email
   - Payment: Cash
2. Submit booking
3. Watch Network tab for multiple PostHog events

**Expected Events in Order:**
1. `booking_submit_clicked`
2. `booking_validation_passed`
3. `booking_saved_to_firebase`
4. `booking_emails_sent` OR `booking_emails_failed`
5. `booking_completed` OR `booking_failed`
6. `booking_attempt_logged`

---

### ✅ Step 5: Check Session Recording Capture

1. After submitting booking, open browser Console
2. Type: `posthog.get_session_id()`
3. Press Enter

**Expected:** Returns a session ID like `"018d1234-5678-7890-abcd-ef1234567890"`

---

### ✅ Step 6: Verify Firestore Session Storage

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open `bookingLogs` collection
4. Find your test booking log
5. Check for these fields:
   - `posthogSessionId`: Should have value
   - `posthogSessionUrl`: Should have URL like `https://app.posthog.com/replay/...`

**Expected:** Both fields populated with PostHog data

---

### ✅ Step 7: Test Forensics Dashboard

1. Login as Admin
2. Navigate to Admin Dashboard → Booking Forensics
3. Find your test booking in the table
4. Look for "PostHog Session" column
5. Click "Watch Replay" button

**Expected:** 
- PostHog session URL visible in table
- Clicking button opens new tab to PostHog
- Session replay loads (may take 30-60 seconds to process)

---

### ✅ Step 8: View Session in PostHog Dashboard

1. Go to https://app.posthog.com
2. Login to your account
3. Click "Session Recordings" in left sidebar
4. Find your session (look for your IP or recent timestamp)
5. Click to watch replay

**Expected:**
- Your session appears within 30-60 seconds
- Can watch full replay of your actions
- Mouse movements, clicks, and navigation visible
- Form inputs are masked for privacy

---

### ✅ Step 9: Verify Event Data in PostHog

1. In PostHog dashboard, click "Events" in sidebar
2. Filter for event: `booking_completed`
3. Click on latest event
4. Review event properties

**Expected:**
- Event has properties: bookingId, service, vehicleSize, paymentMethod
- Timestamp matches your test time
- Associated with your session

---

### ✅ Step 10: Test Error Tracking

1. Turn off internet connection (or use DevTools → Network → Offline)
2. Try to submit a booking
3. Check Console and Network tab

**Expected:**
- Event `booking_failed` captured
- Error details included in event properties
- Session recording captures the error state

---

## Post-Deployment Testing

### ✅ Step 11: Test in Production

After deploying to production:

1. Visit your live site
2. Submit a real booking
3. Check PostHog dashboard for recording
4. Verify forensics dashboard shows session link

**Expected:** Same behavior as development, but on production domain

---

### ✅ Step 12: Monitor First Week

1. Check PostHog daily for first week
2. Monitor session count (should be < 5,000/month)
3. Review booking funnel completion rates
4. Watch sessions where bookings failed

**Expected:**
- Sessions recording properly
- Events tracking accurately
- Useful insights from recordings

---

## Troubleshooting

### Issue: PostHog object is undefined
**Fix:** 
1. Check `src/posthog.js` exists
2. Verify import in `src/App.js`: `import posthog from './posthog'`
3. Clear browser cache
4. Restart dev server

### Issue: No session recordings appear
**Fix:**
1. Wait 60 seconds (processing delay)
2. Check browser console for errors
3. Verify PostHog project has session recording enabled
4. Check API key is correct in `posthog.js`

### Issue: Events not tracking
**Fix:**
1. Check browser console for PostHog capture calls
2. Look for ad blocker blocking PostHog
3. Verify `posthog.capture()` is called in code
4. Check Network tab for blocked requests

### Issue: Session ID is null in Firestore
**Fix:**
1. Ensure PostHog initialized before booking
2. Check `posthog.get_session_id()` returns value in console
3. Verify import in `bookingLogger.js`
4. Restart browser and try again

---

## Success Criteria

✅ **PostHog Integration Successful When:**

1. ✅ PostHog object is available in browser console
2. ✅ Users are identified on login
3. ✅ All 9 booking events are captured
4. ✅ Session ID is stored in Firestore logs
5. ✅ "Watch Replay" button works in forensics dashboard
6. ✅ Sessions appear in PostHog dashboard within 60 seconds
7. ✅ Session replays show user interactions
8. ✅ Form inputs are masked for privacy
9. ✅ Error tracking works (booking_failed events)
10. ✅ No console errors related to PostHog

---

## Quick Test Command

Run this in browser console after submitting a booking:

```javascript
// Check PostHog is working
console.log('PostHog loaded:', typeof posthog !== 'undefined');
console.log('Session ID:', posthog.get_session_id());
console.log('User identified:', posthog.get_distinct_id());

// Manual event test
posthog.capture('test_event', { test: true });
console.log('Test event sent!');
```

**Expected Output:**
```
PostHog loaded: true
Session ID: "018d1234-5678-7890-abcd-ef1234567890"
User identified: "[user-email-or-id]"
Test event sent!
```

---

## Notes

- **Session Processing Time:** 30-60 seconds after activity
- **Event Tracking:** Real-time (appears immediately)
- **Free Tier Limit:** 5,000 recordings/month
- **Current Estimate:** ~150-300 sessions/month
- **Privacy:** All inputs masked by default

---

**Testing Date:** _________________
**Tester Name:** _________________
**Environment:** ☐ Development ☐ Production
**Status:** ☐ Pass ☐ Fail ☐ Needs Review

**Notes:**
________________________________________________________________
________________________________________________________________
________________________________________________________________
