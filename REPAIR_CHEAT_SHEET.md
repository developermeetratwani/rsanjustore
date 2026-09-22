# 🔧 Repair System - Cheat Sheet

## 🚀 Quick Access

| What | Where | Password |
|------|-------|----------|
| **Repair Admin** | `/repair-admin` | `repair123` |
| **Main Admin** | `/admin` | `admin123` |
| **Customer Booking** | Homepage → Repair Services → Book Now | - |

---

## 📞 Contact Numbers

| Purpose | Number |
|---------|--------|
| **Sales/Second Hand** | +91 8140087845 |
| **Repairs** | +91 8511282930 |
| **Email** | rsanjustore41@gmail.com |
| **Instagram** | @rsanju_phone_hub |

---

## 🎯 Quick Actions

### Customer
```
1. Go to homepage
2. Scroll to "Repair Services"
3. Click "Book Now"
4. Fill form → Submit
```

### Admin
```
1. Go to /repair-admin
2. Login: repair123
3. Appointments → Assign Repairer
4. Create Bill → Complete
```

---

## 📊 Appointment Status

| Status | Meaning | Action |
|--------|---------|--------|
| 🟡 **Pending** | Just booked | Assign repairer |
| 🔵 **In Progress** | Being repaired | Create bill |
| 🟢 **Completed** | Done & paid | Review sent |

---

## 💰 Bill Status

| Status | Meaning | Action |
|--------|---------|--------|
| 🟠 **Draft** | Incomplete | Continue later |
| 🟢 **Completed** | Paid | Review link sent |

---

## 🔄 Quick Workflow

```
Book → Assign → Repair → Bill → Complete → Review
```

---

## 📱 Tabs in Admin

| Tab | Purpose |
|-----|---------|
| 📅 **Appointments** | View & assign repairs |
| 💰 **Bills** | Create & manage bills |
| 🔍 **Search** | Find by phone number |

---

## 💾 Data Storage

| Key | Contains |
|-----|----------|
| `rsanju_appointments` | All appointments |
| `rsanju_bills` | All bills |
| `rsanju_repairers` | Repairer list |

---

## 🕐 Auto Email

- **When**: 12:00 AM IST (Daily)
- **To**: developermeetratwani@gmail.com
- **What**: CSV of completed bills
- **Format**: Bill details in spreadsheet

---

## 🎨 Repairer Types

| Type | Meaning |
|------|---------|
| **Salaried** | Fixed salary employee |
| **Commission** | Paid per job |

---

## 📋 Bill Components

```
Parts Cost + Labor Cost - Discount = Total
```

---

## 🔑 Default Repairers

1. Technician 1 (Salaried)
2. Technician 2 (Commission)
3. Technician 3 (Commission)

---

## 📥 Download CSV

Click "Download CSV" button in admin header

---

## 💬 WhatsApp Review

Sent automatically when bill completed:
```
Thank you for choosing R Sanju Store!
Please share your experience: [Link]
```

---

## 🔍 Search Bills

1. Click "Search" tab
2. Enter 10-digit phone number
3. View all customer bills

---

## ⚡ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate form fields |
| `Enter` | Submit form |
| `Esc` | Close modal |

---

## 🎯 Important Notes

- ✅ Always assign repairer before billing
- ✅ Save as draft if repair incomplete
- ✅ Complete only when customer pays
- ✅ Phone numbers must be 10 digits
- ✅ All times are in IST

---

## 🐛 Quick Fixes

**Can't login?**
→ Check password: `repair123`

**Appointment not showing?**
→ Refresh page

**WhatsApp not opening?**
→ Check phone number format

**CSV not downloading?**
→ Check browser download settings

---

## 📞 Need Help?

Check these docs:
- `REPAIR_QUICK_START.md` - Quick guide
- `REPAIR_SYSTEM_GUIDE.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details

---

## 🎉 That's It!

**Simple. Fast. Efficient.**

Start at: `/repair-admin` 🚀
