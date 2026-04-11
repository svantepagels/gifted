import { useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * Custom hook for scroll-triggered animations
 * 
 * @param options - IntersectionObserver options
 * @returns ref and inView boolean
 * 
 * @example
 * const { ref, inView } = useScrollAnimation({ threshold: 0.2, once: true });
 * 
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0, y: 40 }}
 *   animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
 * >
 *   Content
 * </motion.div>
 */
export function useScrollAnimation(options?: {
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: options?.once ?? true,
    amount: options?.threshold ?? 0.2,
  });

  return { ref, inView };
}

/**
 * Preset: Scroll reveal for sections
 */
export function useScrollReveal() {
  return useScrollAnimation({
    threshold: 0.2,
    once: true,
  });
}

/**
 * Preset: Scroll reveal for cards (stagger)
 */
export function useScrollRevealStagger(index: number = 0) {
  const { ref, inView } = useScrollAnimation({
    threshold: 0.1,
    once: true,
  });

  const delay = index * 0.1; // 100ms stagger per item

  return { ref, inView, delay };
}
