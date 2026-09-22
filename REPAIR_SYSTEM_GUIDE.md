# 🔧 Repair Appointment & Billing System Guide

## Overview
Complete repair management system with appointment booking, billing, repairer assignment, and automated reporting.

---

## 🎯 Features

### 1. **Customer Appointment Booking**
- Customers can book repair appointments directly from the website
- Click "Book Now" on any repair service
- Fill in details: Name, Phone, Device Model, Issue Description, Preferred Date/Time
- Automatic IST timestamp for all bookings
- Appointments saved in localStorage

### 2. **Repair Admin Panel**
- Separate admin panel for repair management
- Access at: `/repair-admin`
- Default Password: `repair123`
- Mobile-friendly responsive design

### 3. **Appointment Management**
- View all appointments with status: Pending, In Progress, Completed
- Assign repairers to appointments
- Track repairer type (Salaried/Commission)
- View customer details, device info, and issue description

### 4. **Repairer Assignment**
- Multiple repairers can be added
- Two types: Salaried and Commission-based
- Assign specific repairer to each appointment
- Track who handled which repair

### 5. **Billing System (CMS)**
- Create bills from appointments or standalone
- Add customer details automatically from appointment
- Add multiple parts with individual costs
- Set labor cost
- Apply discounts
- Calculate total automatically
- Save as Draft or Complete Bill

### 6. **Bill Search**
- Search bills by customer phone number
- Quick access to customer repair history
- View all bill details

### 7. **Automated Daily Reports**
- Automatically generates CSV report at 12:00 AM IST
- Sends to: developermeetratwani@gmail.com
- Includes all completed bills from the day
- CSV Format: Bill ID, Date, Time, Customer Name, Phone, Device, Service, Repairer, Parts Cost, Labor Cost, Discount, Total Amount, Status

### 8. **Google Review Integration**
- Automatically sends Google Review link via WhatsApp
- Triggered when bill is completed
- Opens WhatsApp with pre-filled message
- Encourages customer feedback

### 9. **On-Spot Bill Generation**
- Main admin can create bills immediately
- No need to wait for appointment
- Direct walk-in customer support
- Instant bill completion

---

## 📱 How to Use

### For Customers:

1. **Book Repair Appointment**
   - Go to Repair Services section on homepage
   - Click "Book Now" on desired service
   - Fill in the booking form
   - Submit appointment
   - Receive confirmation

### For Repair Admin:

1. **Login**
   - Navigate to `/repair-admin`
   - Enter password: `repair123`
   - Access repair admin panel

2. **View Appointments**
   - Click "Appointments" tab
   - See all pending, in-progress, and completed appointments
   - View customer details and issue description

3. **Assign Repairer**
   - Select repairer from dropdown on pending appointment
   - Appointment status changes to "In Progress"
   - Repairer name and type are recorded

4. **Create Bill**
   - Click "Create Bill" on in-progress appointment
   - Customer details auto-filled
   - Add parts used (name and cost)
   - Enter labor cost
   - Apply discount if needed
   - See total calculated automatically
   - Choose "Save as Draft" or "Complete Bill"

5. **Complete Bill**
   - When bill is completed:
     - Appointment marked as completed
     - Bill saved with timestamp
     - Google Review link sent via WhatsApp
     - Customer can leave feedback

6. **Search Bills**
   - Click "Search" tab
   - Enter customer phone number
   - View all bills for that customer
   - Check repair history

7. **Download Reports**
   - Click "Download CSV" button
   - Get CSV file of all completed bills
   - Manual download anytime needed

---

## 🔐 Admin Access

### Repair Admin
- **URL**: `/repair-admin`
- **Password**: `repair123`
- **Access**: Repair technicians and managers

### Main Admin
- **URL**: `/admin`
- **Password**: `admin123`
- **Access**: Product management + Can access repair admin

---

## 💾 Data Storage

All data is stored in browser's localStorage:

- `rsanju_appointments` - All repair appointments
- `rsanju_bills` - All bills (draft and completed)
- `rsanju_repairers` - List of repairers
- `rsanju_daily_report_[date]` - Daily CSV reports

---

## 📊 Bill Structure

Each bill contains:
- **Bill ID**: Unique identifier (BILL-timestamp)
- **Customer Info**: Name, Phone
- **Device Info**: Model
- **Service Type**: Type of repair
- **Repairer**: Assigned technician name and type
- **Parts**: Array of parts used with costs
- **Labor Cost**: Service charge
- **Discount**: Any discount applied
- **Total Amount**: Final calculated amount
- **Status**: Draft or Completed
- **Created At**: IST timestamp
- **Appointment ID**: Linked appointment (if any)

---

## 🕐 Automatic Email Schedule

- **Time**: 12:00 AM IST (Midnight)
- **Frequency**: Daily
- **Recipient**: developermeetratwani@gmail.com
- **Content**: CSV file with all completed bills from that day
- **Format**: Comma-separated values

### CSV Columns:
1. Bill ID
2. Date
3. Time
4. Customer Name
5. Phone
6. Device
7. Service
8. Repairer
9. Parts Cost
10. Labor Cost
11. Discount
12. Total Amount
13. Status

---

## 📞 WhatsApp Integration

### Google Review Link
When a bill is completed, customer receives:
```
Thank you for choosing R Sanju Store! 
We hope you're satisfied with our service. 
Please share your experience: [Google Review Link]
```

**Note**: Update the Google Review link in `RepairAdminPanel.js`:
```javascript
const googleReviewLink = 'https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review';
```

---

## 🎨 Mobile Responsive

The repair admin panel is fully mobile-friendly:
- Responsive grid layouts
- Touch-friendly buttons
- Optimized forms for mobile input
- Easy navigation on small screens
- Scrollable content areas

---

## 🔧 Customization

### Add New Repairer
In `RepairAdminPanel.js`, modify the initial repairers array:
```javascript
const [repairers, setRepairers] = useState([
  { id: 1, name: 'Technician 1', type: 'salaried' },
  { id: 2, name: 'Technician 2', type: 'commission' },
  { id: 3, name: 'Your Name', type: 'commission' }
]);
```

### Change Admin Password
In `RepairAdminLogin.js`, modify:
```javascript
if (password === 'your_new_password') {
```

### Update Email Recipient
In `RepairAdminPanel.js`, modify:
```javascript
const sendEmailWithCSV = (csvData) => {
  // Change email here
  console.log('Sending email to your_email@gmail.com');
```

---

## 📈 Statistics Dashboard

The repair admin panel shows:
- **Pending Appointments**: Awaiting repairer assignment
- **In Progress**: Currently being worked on
- **Completed**: Finished repairs
- **Total Revenue**: Sum of all completed bills

---

## 🚀 Quick Start

1. **Customer books appointment** → Repair Services → Book Now
2. **Admin logs in** → `/repair-admin` → Password: `repair123`
3. **Admin assigns repairer** → Appointments tab → Select repairer
4. **Admin creates bill** → Click "Create Bill" → Fill details
5. **Admin completes bill** → Click "Complete Bill"
6. **Customer receives review link** → Via WhatsApp
7. **Daily report sent** → Automatically at midnight

---

## 🔄 Workflow

```
Customer Books Appointment
         ↓
Admin Sees Pending Appointment
         ↓
Admin Assigns Repairer
         ↓
Status: In Progress
         ↓
Admin Creates Bill
         ↓
Add Parts + Labor + Discount
         ↓
Complete Bill
         ↓
Customer Gets WhatsApp Review Link
         ↓
Bill Saved for Daily Report
         ↓
Midnight: CSV Sent to Email
```

---

## 💡 Tips

1. **Always assign repairer** before creating bill
2. **Save as draft** if repair not complete
3. **Complete bill** only when customer pays
4. **Search by phone** to check customer history
5. **Download CSV** for manual backup
6. **Update Google Review link** with your actual link

---

## 🐛 Troubleshooting

**Appointments not showing?**
- Check localStorage: `rsanju_appointments`
- Ensure booking form was submitted successfully

**Bills not saving?**
- Check browser console for errors
- Ensure all required fields are filled

**Email not sending?**
- This is a frontend-only implementation
- In production, connect to backend API for actual email sending
- Currently logs to console and saves to localStorage

**WhatsApp not opening?**
- Check phone number format (10 digits)
- Ensure WhatsApp is installed on device

---

## 🔮 Future Enhancements

- Backend API integration for real email sending
- SMS notifications to customers
- Payment gateway integration
- Inventory management for parts
- Advanced analytics and reports
- Customer portal to track repairs
- Photo upload for device condition
- Digital signature on bills

---

## 📞 Support

For any issues or questions:
- **Email**: rsanjustore41@gmail.com
- **Phone**: +91 8140087845 (Sales)
- **Phone**: +91 8511282930 (Repairs)
- **Instagram**: @rsanju_phone_hub

---

**Last Updated**: 2024
**Version**: 1.0.0
