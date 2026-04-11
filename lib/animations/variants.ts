import { Variants } from 'framer-motion';

/**
 * Fade In Animations
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Scale Animations
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: [0.3, 1.05, 0.9, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.5, 0.7, 1],
      ease: 'easeOut',
    },
  },
  exit: { opacity: 0, scale: 0.9 },
};

/**
 * Slide Animations
 */
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

/**
 * Card Hover Animation
 */
export const cardHover: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Card Tilt Animation (3D Effect)
 */
export const cardTilt: Variants = {
  initial: { rotateX: 0, rotateY: 0 },
  hover: {
    rotateX: 2,
    rotateY: 2,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Button Hover Animation
 */
export const buttonHover: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * Badge Animation
 */
export const badgePulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Stagger Container Animation
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Stagger Item Animation (to be used with staggerContainer)
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Page Transition Animation
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Scroll Reveal Animation (for use with scroll triggers)
 */
export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Icon Animation (spin, bounce)
 */
export const iconSpin: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const iconBounce: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 0, -5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Search Bar Focus Animation
 */
export const searchFocus: Variants = {
  initial: { scale: 1, borderColor: 'transparent' },
  focus: {
    scale: 1.02,
    borderColor: '#0051D5',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

/**
 * Category Chip Animation
 */
export const chipHover: Variants = {
  initial: { scale: 1, backgroundColor: 'transparent' },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  active: {
    scale: 1,
  },
};
