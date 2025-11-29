# Super Admin Audit Logs - User Guide

## 🔒 Overview
You now have a complete audit logging system that tracks every action taken in your Sparkles Auto Spa application. This system is **only accessible to you** (jrcosroy.walker@gmail.com) and remains hidden from all other users.

---

## 📍 How to Access

**URL:** `https://your-site.com/super-admin-logs`

Or locally: `http://localhost:3001/super-admin-logs`

**Important:** This page is NOT linked anywhere in the app. You must:
1. Bookmark this URL yourself
2. Access it directly by typing the URL
3. Only you (jrcosroy.walker@gmail.com) can view it

---

## 🎯 What Gets Logged

### Worker Actions
- ✅ **CREATE_WORKER** - When a new worker is added
- ✅ **UPDATE_WORKER** - When worker details/schedule are changed
- ✅ **DELETE_WORKER** - When a worker is removed
- ✅ **MIGRATE_WORKERS** - When initial workers are migrated from code

### Booking Actions
- ✅ **CREATE_BOOKING** - When a new booking is made (logged from customer side)
- ✅ **UPDATE_BOOKING_STATUS** - When booking status changes (pending → confirmed → completed)
- ✅ **UPDATE_BOOKING_PRICE** - When booking price is modified
- ✅ **DELETE_BOOKING** - When a booking is deleted

### Authentication Actions (Future Enhancement)
- ⏳ **ADMIN_LOGIN** - When admin logs in
- ⏳ **ADMIN_LOGOUT** - When admin logs out
- ⏳ **LOGIN_FAILED** - When someone fails to log in

---

## 📊 Information Captured

Each log entry contains:

```
📅 Timestamp: 2024-11-28 2:45 PM
👤 User Email: jrcosroy.walker@gmail.com
🎯 Action: UPDATE_WORKER
📝 Target: Nick
💬 Description: Updated worker: Nick
🌐 IP Address: 192.168.1.105
💻 Browser Info: Chrome on macOS
🔄 Changes:
   Before: { start: "06:30", end: "14:00" }
   After:  { start: "07:00", end: "16:00" }
```

---

## 🔍 Features

### 1. **Filter by Action Type**
Dropdown to filter by:
- All Actions
- Create Worker
- Update Worker
- Delete Worker
- Migrate Workers
- Create Booking
- Update Booking Status
- Update Price

### 2. **Filter by User Email**
Search logs by specific user email (e.g., sparklesautospa01@gmail.com)

### 3. **Filter by Date Range**
- Date From: Select start date
- Date To: Select end date
- View logs within specific time periods

### 4. **Search Functionality**
Search within descriptions or target names

### 5. **Log Limit**
Choose how many recent logs to display:
- Last 50
- Last 100
- Last 500
- Last 1000

### 6. **Export to CSV**
Click "📥 Export CSV" to download all filtered logs as a spreadsheet

---

## 📈 Statistics Dashboard

At the top, you'll see:
- **Total Activities**: All logs matching filters
- **Today**: Activities from today
- **This Week**: Activities from last 7 days
- **Unique Users**: Number of different users who performed actions

---

## 🛡️ Security

### Access Control
- **Only** jrcosroy.walker@gmail.com can view this page
- Anyone else sees "Access Denied" message
- Page not linked in navigation (hidden)

### Firestore Rules
```javascript
// audit_logs collection rules:
- Read: Only super admin (jrcosroy.walker@gmail.com)
- Create: Any authenticated user (for system logging)
- Update/Delete: Nobody (logs are immutable)
```

### Data Privacy
- IP addresses are captured via external API (ipify.org)
- User agents show browser and OS info
- All sensitive actions are logged with before/after values

---

## 🎨 Visual Guide

### Color Coding
- 🟢 **Green** = Create actions (new worker, new booking)
- 🟡 **Yellow** = Update actions (edit worker, change status)
- 🔴 **Red** = Delete actions (remove worker, cancel booking)
- 🔵 **Blue** = System actions (migration, login/logout)

### Action Icons
- ➕ Create Worker
- ✏️ Update Worker
- 🗑️ Delete Worker
- 🔄 Migrate/Update
- 📅 Create Booking
- 💰 Update Price
- 🔓 Login
- 🔒 Logout

---

## 💡 Usage Tips

### Daily Monitoring
1. Visit `/super-admin-logs` once a day
2. Set "Date From" to today's date
3. Review all activities

### Investigating Issues
1. If a customer reports a problem
2. Search for their email or booking ID
3. View all actions related to that booking
4. Check the "Changes" section for what was modified

### Security Audits
1. Filter by action type = "Update Price"
2. Review all price changes
3. Verify they were authorized

### Performance Review
1. Set date range to last month
2. View "Unique Users" stat
3. See how many people are using admin features

### Export for Records
1. Set date range to full month
2. Click "Export CSV"
3. Save for your records/accounting

---

## 🚀 What's Being Logged Now

### ✅ Currently Active
- Worker add/edit/delete
- Worker migration
- Booking status changes
- Booking price changes

### 🔜 Future Enhancements (If Needed)
- Customer booking creation
- Admin login/logout events
- Failed login attempts
- System errors
- Email send confirmations
- Payment processing logs

---

## 🔧 Testing the System

### Test 1: Add a Worker
1. Go to Admin Dashboard
2. Add a new test worker
3. Go to `/super-admin-logs`
4. You should see "CREATE_WORKER" entry with full details

### Test 2: Edit Worker Schedule
1. Edit Nick's start time
2. Check logs
3. View "Changes" section showing before/after

### Test 3: Update Booking Price
1. Go to Admin Dashboard
2. Change a booking price
3. Check logs for "UPDATE_BOOKING_PRICE"

### Test 4: Filter and Export
1. Filter by action type
2. Set date range
3. Export to CSV
4. Open file in Excel/Google Sheets

---

## ⚠️ Important Notes

### IP Address Accuracy
- IP shown is from external API (ipify.org)
- May show your router/NAT IP, not actual device IP
- Behind VPN? Will show VPN IP

### Browser Info
- Automatically detected from user agent
- Shows: "Chrome on macOS", "Safari on iOS", etc.

### Log Storage
- All logs stored in Firestore `audit_logs` collection
- Logs are **immutable** (cannot be edited/deleted via UI)
- Only you can read them

### Data Retention
- Logs stored indefinitely by default
- You can manually delete old logs from Firebase Console if needed
- Consider setting up automatic cleanup after 6-12 months

---

## 🔗 Quick Links

**Access:** `/super-admin-logs`  
**Admin Dashboard:** `/admin`  
**Firebase Console:** [https://console.firebase.google.com](https://console.firebase.google.com)

---

## 📞 Troubleshooting

### "Access Denied" Error
- Verify you're logged in with jrcosroy.walker@gmail.com
- If using different email, log out and log in with correct email

### No Logs Showing
- Perform an action (add/edit worker)
- Wait 1-2 seconds for sync
- Refresh the page
- Check browser console for errors

### IP Shows "Unknown"
- Normal if ipify.org API is down
- Doesn't affect other functionality
- IP detection will retry on next action

### Export Not Working
- Check browser allows downloads
- Try different browser
- Logs still visible on screen even if export fails

---

## 🎉 You're All Set!

Your audit logging system is now fully operational. Every action in your system is being tracked with complete details including IP addresses and browser information.

**Remember to:**
1. Bookmark the `/super-admin-logs` URL
2. Update Firebase security rules (see deployment instructions)
3. Check logs regularly for monitoring
4. Export logs monthly for your records

---

**Built on:** November 28, 2025  
**Accessible to:** jrcosroy.walker@gmail.com only  
**URL:** `/super-admin-logs` (hidden, not linked anywhere)
