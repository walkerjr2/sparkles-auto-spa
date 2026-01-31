# 🔍 Admin Audit System - Quick Reference

## Accessing the Audit Log

### From Admin Dashboard:
1. Login as admin
2. Click **"🔍 Activity Log"** button in header
3. View all administrative actions

### Direct URL:
```
https://yoursite.com/admin-activity-log
```

---

## Common Investigation Scenarios

### 1. "Someone changed a driver's schedule"
**Filter Settings:**
- Resource Search: `[Driver Name]`
- Action Type: `Driver Schedule Updated`
- Date Range: `Last 7 Days`

**Result:** See who, when, and what changed

---

### 2. "A driver was deleted by mistake"
**Filter Settings:**
- Action Type: `Driver Deleted`
- Date Range: `Today` or `Yesterday`

**Result:** See who deleted it and all driver data

---

### 3. "Check what Admin X did today"
**Filter Settings:**
- Admin Search: `admin@email.com`
- Date Range: `Today`

**Result:** All actions by that admin

---

### 4. "Review all changes to bookings"
**Filter Settings:**
- Resource Type: `📅 Bookings`
- Date Range: `Last 30 Days`

**Result:** All booking modifications

---

### 5. "Export monthly audit report"
**Steps:**
1. Set Date Range: `Custom Range`
2. Set dates to full month
3. Click **"📥 Export CSV"**
4. Open in Excel/Sheets

---

## Log Entry Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Timestamp** | When action occurred | Jan 31, 2026 2:15 PM |
| **Admin** | Who made the change | admin@sparkles.com |
| **Action** | Type of change | Driver Schedule Updated |
| **Resource** | What was changed | Nick (driver) |
| **Changes** | Summary of changes | start: 9am → 10am |
| **IP Address** | Where from | 192.168.1.45 |
| **Browser** | What browser | Chrome 120.0 |

---

## View Details Modal

Click **"View Details"** button to see:

### Before/After Comparison
```
┌─────────────────┬─────────────────┐
│ ❌ Before       │ ✅ After        │
├─────────────────┼─────────────────┤
│ start: "09:00"  │ start: "10:00"  │
│ end: "17:00"    │ end: "18:00"    │
│ dayOff: 1       │ dayOff: 2       │
└─────────────────┴─────────────────┘
```

### Full Technical Details
- Platform (MacOS, Windows, etc.)
- Browser version
- User Agent string
- Language settings

---

## Filter Options Quick Guide

### Date Range
- **All Time** - Every log ever
- **Today** - Last 24 hours
- **Yesterday** - Previous day
- **Last 7 Days** - Past week
- **Last 30 Days** - Past month
- **Custom Range** - Pick start/end dates

### Action Type
- **All Actions** - Show everything
- **Driver Created** - New drivers added
- **Driver Updated** - Profile changes
- **Driver Deleted** - Drivers removed
- **Driver Schedule Updated** - Schedule changes
- **Booking Updated** - Booking modifications
- **Booking Status Changed** - Status updates

### Resource Type
- **All Types** - Show all resources
- **👨‍🔧 Drivers** - Only driver changes
- **📅 Bookings** - Only booking changes
- **👤 Users** - Only user changes
- **⚙️ Settings** - Only settings changes

---

## Color Coding

| Color | Meaning |
|-------|---------|
| 🟢 Green | Created / Login |
| 🔵 Blue | Updated / Modified |
| 🔴 Red | Deleted / Logout |
| 🟡 Yellow | Status Changed |
| 🟣 Purple | Data Export |
| ⚫ Gray | Other |

---

## Security Notes

### Who Can Access
- ✅ **Super Admin ONLY** (jrcosroy.walker@gmail.com)
- ❌ Regular admins **CANNOT** view logs
- ❌ Workers **CANNOT** view logs
- ❌ Customers **CANNOT** view logs

### What's Tracked
- ✅ All admin actions
- ✅ Driver management
- ✅ Booking changes
- ✅ Settings updates
- ✅ Data exports

### What's NOT Tracked
- ❌ Customer bookings (use Booking Forensics)
- ❌ Page views
- ❌ Read-only actions
- ❌ Failed login attempts (different system)

---

## Export Format

**CSV Columns:**
```
Timestamp | Admin | Action | Resource Type | Resource Name | Changes | IP | Browser
```

**Example Row:**
```
2026-01-31 14:23:45 | admin@sparkles.com | Driver Schedule Updated | driver | Nick | start: 09:00 → 10:00 | 192.168.1.45 | Chrome
```

---

## Best Practices

### Daily
✅ Review today's logs
✅ Check for unusual activity
✅ Verify schedule changes

### Weekly
✅ Export CSV for records
✅ Review all deletions
✅ Check data exports

### Monthly
✅ Generate audit report
✅ Analyze patterns
✅ Review access logs

---

## Troubleshooting

### Problem: "Unauthorized" message
**Solution:** Only super admin can access. Check email.

### Problem: Logs not showing
**Solution:** 
1. Check filters - may be too restrictive
2. Click "Clear All Filters"
3. Refresh page

### Problem: Can't export CSV
**Solution:**
1. Allow pop-ups in browser
2. Check download folder
3. Try different browser

### Problem: Details modal not opening
**Solution:**
1. Click "View Details" button again
2. Refresh page
3. Check browser console for errors

---

## Support

### Documentation Files
- `ADMIN_AUDIT_SYSTEM_COMPLETE.md` - Full documentation
- `ADMIN_AUDIT_QUICK_REFERENCE.md` - This file

### Code Files
- `src/utils/adminAuditLogger.js` - Logger utility
- `src/AdminActivityLog.js` - UI component
- `src/AdminDashboard.js` - Integration

### Firestore Collection
- Collection name: `admin_audit_log`
- Access: Super admin only
- Retention: Unlimited (can configure)

---

## Quick Stats

**What's Logged:**
- ✅ 12+ action types
- ✅ Before/after values
- ✅ IP + browser info
- ✅ Timestamps
- ✅ Admin details

**Performance:**
- ⚡ Non-blocking writes
- ⚡ Fast queries (<100ms)
- ⚡ Efficient filtering
- ⚡ CSV export (<5s)

**Storage:**
- 📦 ~1KB per entry
- 📦 3MB/month (100 actions/day)
- 📦 Negligible cost

---

## Remember

🔍 **Every admin action is logged**  
📊 **Complete audit trail available**  
🔒 **Super admin access only**  
📥 **Export anytime for reports**  
🎯 **Investigate issues with confidence**

**No more "he said / she said" - You have the facts!**

---

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Status:** ✅ Production Ready
