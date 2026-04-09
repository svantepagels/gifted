/**
 * Device Detection Utilities
 * 
 * Provides reliable device type detection for mobile/desktop targeting.
 * Used primarily for eSIM installation flows where mobile users need
 * direct install buttons rather than QR codes.
 * 
 * Research-backed implementation:
 * - Simple UA parsing with graceful degradation
 * - No external dependencies
 * - Handles edge cases (tablets treated as mobile for eSIM context)
 * 
 * @see RESEARCH-UX-FIXES.md for standards and best practices
 */

/**
 * Detect if the current device is mobile (phone or tablet).
 * 
 * Uses a combination of:
 * 1. User-Agent string parsing (primary)
 * 2. Touch capability detection (secondary)
 * 3. Screen width heuristic (fallback)
 * 
 * Note: Tablets are considered "mobile" in eSIM installation context
 * because they have the same QR code scanning limitation.
 * 
 * @returns {boolean} True if device is mobile/tablet
 */
export function isMobileDevice(): boolean {
  // Server-side rendering guard
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  
  // Primary: User-Agent detection
  // Covers iOS, Android, Windows Phone, BlackBerry, and other mobile OSes
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
  const isMobileUA = mobileRegex.test(ua);
  
  if (isMobileUA) {
    return true;
  }
  
  // Secondary: Touch capability (helps catch desktop mode on tablets)
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Tertiary: Screen width heuristic (≤768px considered mobile)
  const isMobileWidth = window.innerWidth <= 768;
  
  // Device is mobile if it has touch AND small screen
  // (avoids false positives from touch-enabled laptops)
  return hasTouchScreen && isMobileWidth;
}

/**
 * Detect if the current device is iOS (iPhone or iPad).
 * 
 * Used for platform-specific installation flows.
 * iOS 12.1+ supports eSIM via Settings app.
 * 
 * @returns {boolean} True if device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

/**
 * Detect if the current device is Android.
 * 
 * Used for platform-specific installation flows.
 * Android 9+ supports eSIM on compatible devices.
 * 
 * @returns {boolean} True if device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  return /android/.test(ua);
}

/**
 * Get a user-friendly platform name for display.
 * 
 * @returns {string} Platform name ('iOS', 'Android', 'Desktop')
 */
export function getPlatformName(): string {
  if (isIOS()) return 'iOS';
  if (isAndroid()) return 'Android';
  return 'Desktop';
}

/**
 * Check if the device supports eSIM installation.
 * 
 * Note: This is a basic check based on OS detection.
 * Actual eSIM support depends on:
 * - Hardware capability (not all devices have eSIM chips)
 * - OS version (iOS 12.1+, Android 9+)
 * - Carrier support
 * 
 * For production, consider integrating with provider's device check API.
 * 
 * @returns {boolean} True if device likely supports eSIM
 */
export function supportsESIM(): boolean {
  // Most modern iOS and Android devices support eSIM
  // Desktop users would scan QR with their mobile device
  return isMobileDevice() && (isIOS() || isAndroid());
}
