# UX/UI Testing Checklist - Gifted Project

**Production URL**: https://gifted-project-blue.vercel.app  
**Test Date**: _______________  
**Tester**: _______________

---

## 🎯 CRITICAL FIXES TO VERIFY

### ✅ Fix #1: Email Confusion Resolved

**Test Steps:**
1. Go to homepage
2. Click any product
3. Toggle "Send as gift" 
4. Enter recipient email: `friend@example.com`
5. Add message (optional)
6. Click "Continue to Checkout"
7. **VERIFY** at checkout:
   - [ ] See reminder box: "Sending gift to: friend@example.com"
   - [ ] Email field says: "Your Email (for order confirmation)"
   - [ ] Helper text: "We'll send the receipt to this address"
   - [ ] NO "Confirm Email" field
   - [ ] Only ONE email input

**Expected Result**: Clear distinction between recipient email (already entered) and buyer email (entering now)

---

### ✅ Fix #2: Button Copy Clear on Mobile

**Test Steps (Mobile Device):**
1. Go to product page (any)
2. Select amount
3. Scroll to bottom sticky CTA
4. **VERIFY**:
   - [ ] Button says "Continue to Checkout" (NOT just "Continue")
   - [ ] Price badge visible next to text
   - [ ] Arrow icon visible
5. Click button
6. **VERIFY**:
   - [ ] Spinner appears
   - [ ] Text changes to "Processing..."
   - [ ] Button disabled during loading

**Expected Result**: Clear, descriptive button copy with loading feedback

---

### ✅ Fix #3: Products Visible Above Fold

**Test Steps (Mobile Device):**
1. Go to homepage
2. DO NOT SCROLL
3. **VERIFY**:
   - [ ] Hero section takes ~30-40% of viewport
   - [ ] At least 1 product card partially visible
   - [ ] Search bar visible
   - [ ] Category chips visible or just below
4. Small scroll down
5. **VERIFY**:
   - [ ] Product grid immediately visible

**Expected Result**: Products accessible without excessive scrolling

---

## 📱 MOBILE EXPERIENCE (iPhone/Android)

### Homepage
- [ ] Hero section proportional (not dominating screen)
- [ ] Scroll indicator subtle (small chevron)
- [ ] First product visible above fold
- [ ] Search bar easily accessible
- [ ] Category chips visible/accessible

### Product Detail Page
- [ ] Image loads
- [ ] Amount selector works
- [ ] Delivery toggle (For me / Send as gift) works
- [ ] Gift form appears when toggled
- [ ] Sticky CTA shows "Continue to Checkout"
- [ ] Price displays in sticky bar
- [ ] No content overlap with bottom nav

### Checkout Page (Gift Flow)
- [ ] Recipient reminder box prominent
- [ ] Mail icon shows
- [ ] Recipient email displays correctly
- [ ] Email input labeled clearly
- [ ] Helper text visible
- [ ] One email field only
- [ ] "Complete Purchase" button works
- [ ] Terms text readable

### Checkout Page (Self Flow)
- [ ] NO recipient reminder box
- [ ] Email field says "Your Email"
- [ ] Helper text: "We'll send your gift card to this address"
- [ ] One email field only
- [ ] Everything else same as gift flow

---

## 💻 DESKTOP EXPERIENCE

### Homepage
- [ ] Hero section balanced (not too tall)
- [ ] Products visible without scroll (on 1080p+)
- [ ] Grid layout looks good
- [ ] Hover effects work on product cards

### Product Detail
- [ ] Desktop CTA shows "Continue to Checkout"
- [ ] CTA positioned right-side (not sticky)
- [ ] All content fits well
- [ ] Forms render properly

### Checkout
- [ ] Two-column layout (order review | form)
- [ ] Recipient reminder box (if gift)
- [ ] Single email field
- [ ] All text readable

---

## 🔬 EDGE CASES

### Invalid Inputs
- [ ] No amount selected → button disabled
- [ ] Gift toggle on, no recipient → validation error
- [ ] Invalid email format → clear error message
- [ ] Empty email → validation prevents submit

### Loading States
- [ ] Click "Continue to Checkout" → spinner shows
- [ ] Button disabled during processing
- [ ] Can't double-click to create duplicate orders
- [ ] Checkout page loads properly after processing

### Browser Back/Forward
- [ ] Back from checkout → product page state preserved
- [ ] Back from success → redirects to home (expected)
- [ ] No broken states from navigation

---

## 🎨 VISUAL QUALITY

### Typography
- [ ] All text readable at mobile sizes
- [ ] Labels clear and distinct
- [ ] Helper text sufficiently subtle vs main labels
- [ ] Button text fits without wrapping

### Spacing
- [ ] Hero section not too cramped (reduced but still nice)
- [ ] Form fields have good breathing room
- [ ] Buttons not too close to screen edges
- [ ] Mobile bottom nav doesn't overlap content

### Colors & Contrast
- [ ] Recipient reminder box stands out (secondary color)
- [ ] Error messages clearly red
- [ ] Helper text muted but readable
- [ ] Disabled states obvious

---

## 🧩 USER FLOWS (END-TO-END)

### Flow A: Gift Purchase - Happy Path
1. [ ] Homepage → Click product
2. [ ] Select amount: $50
3. [ ] Toggle "Send as gift"
4. [ ] Enter recipient: `test@example.com`
5. [ ] Add message: "Happy Birthday!"
6. [ ] Click "Continue to Checkout" (verify text visible)
7. [ ] See loading spinner
8. [ ] Checkout page: verify recipient reminder box
9. [ ] Enter YOUR email: `buyer@example.com`
10. [ ] Click "Complete Purchase"
11. [ ] Success page shows

**Critical Checks:**
- [ ] Never asked to "confirm email"
- [ ] Always clear which email (recipient vs buyer)
- [ ] Button text clear at every step

### Flow B: Self Purchase - Happy Path
1. [ ] Homepage → Click product
2. [ ] Select amount: $25
3. [ ] Leave toggle on "For me"
4. [ ] Click "Continue to Checkout"
5. [ ] NO recipient reminder box
6. [ ] Enter email: `me@example.com`
7. [ ] Helper: "We'll send your gift card to this address"
8. [ ] Complete purchase

**Critical Checks:**
- [ ] No confusion about "recipient"
- [ ] Single email entry
- [ ] Clear this is where gift card goes

---

## 📊 METRICS TO WATCH (Post-Deploy)

### Conversion Funnel
- Product page → Checkout: Expected improvement
- Checkout → Success: Expected +15-25% (fewer fields)

### User Behavior
- Time on checkout page: Expected -20-30 seconds
- Scroll depth on homepage: Expected shallower (products higher)
- Mobile bounce rate: Expected decrease

### Support Tickets
- "Which email do I use?": Expected -80%
- "Didn't receive gift card": Monitor (could indicate email typos)

---

## ❌ KNOWN ISSUES (Not in Scope)

These are NOT bugs from this update:
- Redis warnings in build (expected - using mock data)
- Product images are placeholders (integration pending)
- Some links go nowhere (/help, /faq) - not built yet

---

## 🚨 CRITICAL ISSUES (If Found)

If you find any of these, STOP and report immediately:

- [ ] Email field not working
- [ ] Can create order without email
- [ ] Recipient reminder shows wrong email
- [ ] Button click creates multiple orders
- [ ] Checkout page doesn't load
- [ ] Build errors in production

---

## ✅ SIGN-OFF

**Tester**: _______________  
**Date**: _______________  
**Result**: [ ] PASS [ ] FAIL [ ] ISSUES FOUND

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________

---

**End of Testing Checklist**
