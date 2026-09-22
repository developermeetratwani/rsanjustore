# Quick Start Guide - R SANJU STORE Website

## 🚀 Get Started in 3 Steps

### Step 1: Navigate to Project
```bash
cd r-sanju-store
```

### Step 2: Start Development Server
```bash
npm start
```

### Step 3: Open Browser
The website will automatically open at `http://localhost:3000`

---

## 🎨 What You'll See

### Loading Screen (3 seconds)
- Animated logo with rotating phone icon
- Progress bar
- Floating particles

### Main Website Sections
1. **Hero** - Stunning animated title with floating phones
2. **Special Banner** - Moving marquee with offers
3. **Mega Offers** - 6 animated offer cards
4. **Product Showcase** - 3D rotating products
5. **Repair Services** - Service cards with animations
6. **Customer Reviews** - Auto-scrolling testimonials
7. **Contact** - Animated form and info cards
8. **Footer** - Neon glowing footer with links

### Interactive Elements
- **Top Left**: Music toggle button
- **Bottom Right**: WhatsApp, Call, and Scroll-to-Top buttons
- **Popup**: Special offer modal (appears after loading)

---

## 🎯 Key Features to Test

### Hover Effects
- Hover over any offer card to see 3D rotation
- Hover over product cards for scaling effects
- Hover over buttons for glow effects

### Scroll Animations
- Scroll down to see elements animate into view
- Notice the parallax effects in the hero section
- Watch the particle background move

### Interactive Elements
- Click the music toggle (top left)
- Click WhatsApp button (bottom right)
- Click any "Grab Now" or "Book Now" button
- Fill out the contact form

### Mobile Responsive
- Resize your browser window
- Test on mobile devices
- All animations work on mobile too!

---

## 🛠️ Customization Quick Tips

### Change Store Name
**File**: `src/components/Hero.js`
```javascript
// Line 60-65
<h1 className="hero-title gradient-text">
  YOUR STORE NAME
</h1>
```

### Update Phone Number
**File**: `src/components/FloatingButtons.js`
```javascript
// Line 7
window.open('https://wa.me/YOUR_NUMBER', '_blank');
```

### Modify Offers
**File**: `src/components/MegaOffers.js`
```javascript
// Lines 6-45 - Edit the offers array
const offers = [
  {
    title: 'Your Offer Title',
    description: 'Your Description',
    price: '₹999',
    // ...
  }
];
```

### Change Colors
**File**: `src/App.css`
```css
/* Update gradient colors throughout */
background: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2);
```

---

## 📱 Test Checklist

- [ ] Loading screen appears and disappears
- [ ] Hero section animations work
- [ ] Offer cards have hover effects
- [ ] Products rotate on hover
- [ ] Reviews auto-scroll
- [ ] Contact form can be filled
- [ ] Floating buttons work
- [ ] Popup appears and can be closed
- [ ] Music toggle works
- [ ] Scroll to top button works
- [ ] Mobile responsive layout works
- [ ] All animations are smooth

---

## 🐛 Troubleshooting

### Website doesn't start?
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Animations are laggy?
- Close other browser tabs
- Enable hardware acceleration in browser
- Use Chrome for best performance

### Popup doesn't appear?
- Wait 4 seconds after loading screen
- Check browser console for errors
- Refresh the page

### Buttons don't work?
- Check browser console for errors
- Make sure JavaScript is enabled
- Try a different browser

---

## 🎬 Production Build

When ready to deploy:

```bash
npm run build
```

This creates an optimized build in the `build` folder ready for deployment.

---

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review component files for inline comments
- Test in Chrome browser for best compatibility

---

## 🌟 Enjoy Your Premium Website!

Your futuristic mobile store website is now ready. Customize it, test it, and deploy it!

**R SANJU STORE** - Best Mobile Deals in Town! 📱✨
