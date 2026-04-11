'use client';

import { motion } from 'framer-motion';
import { fadeInUp, badgePulse } from '@/lib/animations/variants';
import { ChevronDown, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-60" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(at 27% 37%, hsla(270, 73%, 66%, 0.3) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(244, 73%, 66%, 0.3) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(280, 73%, 66%, 0.3) 0px, transparent 50%)',
        }}
      />

      <div className="relative text-center max-w-5xl mx-auto">
        {/* Animated Badge */}
        <motion.div
          variants={badgePulse}
          initial="initial"
          animate="animate"
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-purple-100"
        >
          <Zap className="w-4 h-4 text-accent-purple fill-accent-purple" />
          <span className="text-label-md text-primary font-medium">
            Instant Digital Delivery
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-archivo text-hero text-primary mb-6 uppercase leading-[0.95] tracking-tight"
        >
          Buy Digital
          <br />
          <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange bg-clip-text text-transparent">
            Gift Cards
          </span>
          <br />
          Instantly.
        </motion.h1>

        {/* Hero Subheadline */}
        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-inter text-hero-sub text-surface-on-surface-variant max-w-2xl mx-auto mb-10"
        >
          Gift cards for your favorite brands. Delivered in minutes.
          <br />
          Easy, secure, and always ready to send.
        </motion.p>

        {/* Scroll Indicator - subtle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{
            delay: 0.8,
            duration: 1.2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="inline-flex flex-col items-center gap-1 text-surface-on-surface-variant"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
    </section>
  );
}
