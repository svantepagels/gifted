# GIFTED - Troubleshooting Guide

**Quick reference for common issues during implementation**

---

## Build & Setup Issues

### ❌ `Error: Cannot find module 'framer-motion'`

**Cause:** Dependencies not installed.

**Fix:**
```bash
npm install framer-motion lucide-react clsx tailwind-merge react-hook-form @hookform/resolvers zod date-fns
```

---

### ❌ `TypeError: Cannot read properties of undefined (reading 'variable')`

**Cause:** Font variables not properly configured in `layout.tsx`.

**Fix:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',  // This is critical!
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>  {/* Add variable here */}
      <body>{children}</body>
    </html>
  );
}
```

---

### ❌ `Error: Invalid tailwind config`

**Cause:** CSS custom properties not wrapped in `var()` in `tailwind.config.ts`.

**Fix:**
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',  // ✅ Correct
      // NOT: primary: '--color-primary',  // ❌ Wrong
    }
  }
}
```

---

## Styling Issues

### ❌ Design tokens not applying

**Cause:** CSS custom properties defined after Tailwind imports.

**Fix:**
```css
/* globals.css - CORRECT ORDER */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #0F172A;
    /* ... other tokens */
  }
}
```

---

### ❌ Typography classes not working (`.display-lg`, `.headline-sm`)

**Cause:** Typography classes defined outside `@layer base`.

**Fix:**
```css
/* globals.css */
@layer base {
  .display-lg {
    font-family: 'Archivo Black', sans-serif;
    font-size: 3.5rem;
    /* ... */
  }
}
```

---

### ❌ Fonts not loading / FOIT (Flash of Invisible Text)

**Cause:** Missing `display: 'swap'` in font config.

**Fix:**
```typescript
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',  // Add this!
  variable: '--font-inter',
});
```

---

## Hydration Errors

### ❌ `Error: Hydration failed because the initial UI does not match`

**Common Causes:**

**1. Using browser APIs in Server Components**
```typescript
// ❌ Wrong
export default function Page() {
  const width = window.innerWidth;  // window is undefined on server
  return <div>{width}</div>;
}

// ✅ Right
'use client';
export default function Page() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  return <div>{width || 'Loading...'}</div>;
}
```

**2. Inconsistent date formatting**
```typescript
// ❌ Wrong
export default function Timestamp() {
  return <div>{new Date().toISOString()}</div>;
}

// ✅ Right
'use client';
export default function Timestamp() {
  const [time, setTime] = useState('');
  useEffect(() => {
    setTime(new Date().toISOString());
  }, []);
  return <div>{time || 'Loading...'}</div>;
}
```

**3. Conditional rendering differs between server/client**
```typescript
// ❌ Wrong
<div>
  {typeof window !== 'undefined' && <MobileMenu />}
</div>

// ✅ Right
'use client';
<div>
  {isMobile && <MobileMenu />}
</div>
```

---

## Framer Motion Issues

### ❌ `Warning: Function components cannot be given refs`

**Cause:** Trying to animate a component that doesn't forward refs.

**Fix:**
```typescript
// ❌ Wrong
const Button = ({ children }) => <button>{children}</button>;
<motion.div whileHover={{ scale: 1.05 }}>
  <Button />  {/* This won't animate */}
</motion.div>

// ✅ Right
import { motion } from 'framer-motion';
const MotionButton = motion.button;  // Use motion.button directly

<MotionButton whileHover={{ scale: 1.05 }}>
  Click me
</MotionButton>
```

---

### ❌ `Layout shift when animation starts`

**Cause:** Animating properties that trigger reflow (width, height, top, left).

**Fix:**
```typescript
// ❌ Wrong (causes layout shift)
<motion.div animate={{ width: 200 }}>

// ✅ Right (uses transform, no reflow)
<motion.div animate={{ scale: 1.2 }}>
```

---

## Playwright Issues

### ❌ `Error: browserType.launch: Executable doesn't exist`

**Cause:** Playwright browsers not installed.

**Fix:**
```bash
npx playwright install --with-deps
```

---

### ❌ Visual regression test always failing (diff images show slight differences)

**Cause:** Font rendering, anti-aliasing differences between environments.

**Fix 1: Increase tolerance**
```typescript
expect(screenshot).toMatchSnapshot('page.png', {
  threshold: 0.3,  // Increase from 0.2 to 0.3
  maxDiffPixels: 200,  // Increase from 100
});
```

**Fix 2: Use consistent environment**
```yaml
# .github/workflows/test.yml
runs-on: ubuntu-22.04  # Pin exact OS version
```

**Fix 3: Disable font anti-aliasing**
```typescript
await page.addStyleTag({
  content: `
    * {
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }
  `
});
```

---

### ❌ `TimeoutError: page.goto: Timeout 30000ms exceeded`

**Cause:** Page taking too long to load or server not running.

**Fix:**
```bash
# Ensure dev server is running
npm run dev

# Or increase timeout
await page.goto('/', { timeout: 60000 });
```

---

## Form Validation Issues

### ❌ `TypeError: Cannot read properties of undefined (reading 'message')`

**Cause:** Accessing error before checking if it exists.

**Fix:**
```typescript
// ❌ Wrong
{errors.email.message}

// ✅ Right
{errors.email && errors.email.message}
// or
{errors.email?.message}
```

---

### ❌ Form validation not triggering

**Cause:** Missing `resolver` in `useForm`.

**Fix:**
```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),  // Add this!
});
```

---

### ❌ Zod error: `Expected string, received undefined`

**Cause:** Field not registered with React Hook Form.

**Fix:**
```typescript
// ❌ Wrong
<input type="email" name="email" />

// ✅ Right
<input {...register('email')} type="email" />
```

---

## API Integration Issues

### ❌ `401 Unauthorized` from Reloadly

**Cause:** Token expired or invalid credentials.

**Fix:**
```typescript
// Check token expiration before each request
async function ensureAuthenticated() {
  if (!this.token || this.tokenExpiry < new Date()) {
    await this.refreshToken();
  }
}
```

---

### ❌ `TypeError: Cannot read properties of null (reading 'productId')`

**Cause:** Reloadly API response structure changed or missing data.

**Fix:**
```typescript
// Add defensive checks
const product = data.content.map(item => ({
  id: item.productId?.toString() || 'unknown',
  brandName: item.productName || 'Unknown Brand',
  // ... with fallbacks
}));
```

---

### ❌ Lemon Squeezy webhook not triggering

**Cause 1:** Webhook URL incorrect or not accessible.

**Fix:** Use ngrok for local development
```bash
ngrok http 3000
# Use: https://abc123.ngrok.io/api/webhooks/lemon-squeezy
```

**Cause 2:** Webhook signature verification failing.

**Fix:** Check secret matches
```typescript
const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
console.log('Using secret:', secret);  // Debug log
```

---

## Performance Issues

### ❌ Slow initial page load (LCP > 5s)

**Causes & Fixes:**

**1. Large JavaScript bundle**
```bash
# Check bundle size
npm run build
# Look for large chunks in .next/static/chunks/

# Fix: Code split heavy components
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

**2. Unoptimized images**
```typescript
// ❌ Wrong
<img src={product.logo} />

// ✅ Right
<Image src={product.logo} width={200} height={200} priority />
```

**3. Blocking resources**
```typescript
// Preload critical fonts
<link
  rel="preload"
  href="/fonts/ArchivoBlack.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

---

### ❌ Janky animations / low FPS

**Cause:** Animating properties that trigger reflow.

**Fix:** Only animate `transform` and `opacity`
```typescript
// ❌ Causes reflow
animate={{ width: 200, height: 100, top: 50 }}

// ✅ Uses GPU acceleration
animate={{ scale: 1.2, opacity: 1, y: -10 }}
```

---

## Mobile Issues

### ❌ Layout breaks on iOS Safari

**Cause 1:** Using `vh` units (iOS Safari's viewport changes when scrolling).

**Fix:**
```typescript
// ❌ Wrong
<div className="h-screen">

// ✅ Right (use dvh = dynamic viewport height)
<div className="h-dvh">
```

**Cause 2:** Fixed positioning breaks on iOS.

**Fix:**
```css
/* Add to globals.css for iOS compatibility */
@supports (-webkit-touch-callout: none) {
  .fixed {
    position: -webkit-sticky;
    position: sticky;
  }
}
```

---

### ❌ Touch gestures not working

**Cause:** Event listeners not registering touch events.

**Fix:**
```typescript
// Add both mouse and touch handlers
<div
  onMouseDown={handleStart}
  onTouchStart={handleStart}
  onMouseMove={handleMove}
  onTouchMove={handleMove}
>
```

---

## Accessibility Audit Failures

### ❌ Lighthouse: "Background and foreground colors do not have sufficient contrast"

**Cause:** Color combinations fail WCAG AA (4.5:1 ratio).

**Fix:** Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

```typescript
// ❌ Fails (3:1 ratio)
<p className="text-gray-400 bg-white">

// ✅ Passes (7:1 ratio)
<p className="text-gray-700 bg-white">
```

---

### ❌ Lighthouse: "Interactive controls are not keyboard focusable"

**Cause:** Using `<div>` with `onClick` instead of `<button>`.

**Fix:**
```typescript
// ❌ Wrong
<div onClick={handleClick}>Submit</div>

// ✅ Right
<button onClick={handleClick}>Submit</button>
```

---

### ❌ Lighthouse: "Image elements do not have alt attributes"

**Fix:**
```typescript
// ❌ Wrong
<Image src={logo} width={100} height={100} />

// ✅ Right
<Image src={logo} alt={`${brand} logo`} width={100} height={100} />
```

---

## Environment Variables Not Loading

### ❌ `process.env.RELOADLY_CLIENT_ID is undefined`

**Cause 1:** `.env.local` not in project root.

**Fix:** Create `.env.local` in same directory as `package.json`.

**Cause 2:** Variable name doesn't start with `NEXT_PUBLIC_` (for client-side access).

**Fix:**
```bash
# Server-only (API routes, server components)
RELOADLY_CLIENT_ID=abc123

# Client-side (browser JavaScript)
NEXT_PUBLIC_SITE_NAME=GIFTED
```

**Cause 3:** Dev server not restarted after adding variables.

**Fix:**
```bash
# Stop server (Ctrl+C) and restart
npm run dev
```

---

## TypeScript Errors

### ❌ `Type 'X' is not assignable to type 'Y'`

**Cause:** Zod schema type doesn't match component props.

**Fix:**
```typescript
// Ensure consistency
const schema = z.object({ email: z.string() });
type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => void;  // Use inferred type
}
```

---

### ❌ `Property 'X' does not exist on type 'never'`

**Cause:** Accessing array without checking if it exists.

**Fix:**
```typescript
// ❌ Wrong
const first = products[0].name;

// ✅ Right
const first = products.length > 0 ? products[0].name : 'N/A';
```

---

## Git & Version Control

### ❌ Large files causing push failures (design reference screenshots)

**Fix:** Add to `.gitattributes`
```
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
```

---

## Quick Debugging Commands

```bash
# Check Next.js build for errors
npm run build

# Check TypeScript types
npx tsc --noEmit

# Check Tailwind config
npx tailwindcss -i ./src/styles/globals.css -o ./output.css

# Run Playwright in headed mode (see browser)
npx playwright test --headed

# Generate Playwright report
npx playwright show-report

# Check bundle size
npx @next/bundle-analyzer

# Lighthouse audit
lighthouse http://localhost:3000 --view
```

---

## Still Stuck?

1. **Check the logs:**
   - Browser console (F12)
   - Terminal output
   - Network tab for API calls

2. **Read the docs:**
   - ARCHITECTURE.md - Component specifications
   - RESEARCH.md - Implementation patterns
   - INTEGRATION-GUIDE.md - API swap guide

3. **Search GitHub Issues:**
   - Next.js: https://github.com/vercel/next.js/issues
   - Playwright: https://github.com/microsoft/playwright/issues
   - Framer Motion: https://github.com/framer/motion/issues

4. **Ask the community:**
   - Next.js Discord: https://nextjs.org/discord
   - Playwright Discord: https://aka.ms/playwright/discord

---

**Last Updated:** 2026-03-26  
**Maintained by:** RESEARCHER Agent
