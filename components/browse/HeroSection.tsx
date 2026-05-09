'use client';

import { motion } from 'framer-motion';
import { fadeInUp, badgePulse } from '@/lib/animations/variants';
import { Zap } from 'lucide-react';
import type { Messages } from '@/lib/i18n/useMessages';

const HERO_INITIALS = [
  { letter: 'N', gradient: 'from-category-entertainment to-purple-400' },
  { letter: 'G', gradient: 'from-category-shopping to-blue-400' },
  { letter: 'A', gradient: 'from-category-shopping to-blue-400' },
  { letter: 'S', gradient: 'from-category-food to-orange-400' },
  { letter: 'X', gradient: 'from-category-gaming to-pink-400' },
  { letter: 'T', gradient: 'from-category-travel to-cyan-400' },
  { letter: 'U', gradient: 'from-category-lifestyle to-green-400' },
  { letter: 'P', gradient: 'from-category-gaming to-pink-400' },
];

interface HeroSectionProps {
  messages: Messages;
}

export function HeroSection({ messages }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative py-10 md:py-8 lg:py-10 overflow-hidden"
    >
      {/* Mesh gradient background — mobile only */}
      <div className="absolute inset-0 -mx-4 sm:-mx-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-60 md:hidden" />
      <div
        className="absolute inset-0 -mx-4 sm:-mx-6 opacity-30 md:hidden"
        style={{
          background:
            'radial-gradient(at 27% 37%, hsla(270, 73%, 66%, 0.3) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(244, 73%, 66%, 0.3) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(280, 73%, 66%, 0.3) 0px, transparent 50%)',
        }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-12 md:gap-8 items-center">
        {/* Copy column */}
        <div className="md:col-span-7 lg:col-span-7 text-center md:text-start">
          <motion.div
            variants={badgePulse}
            initial="initial"
            animate="animate"
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-purple-100"
          >
            <Zap className="w-4 h-4 text-accent-purple fill-accent-purple" />
            <span className="text-label-md text-primary font-medium">
              {messages['hero.badge']}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5 }}
            className="font-archivo text-hero text-primary mb-4 uppercase leading-[0.95] tracking-tight"
          >
            {messages['hero.title.line1']}
            <br />
            <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange bg-clip-text text-transparent">
              {messages['hero.title.line2']}
            </span>
            <br className="md:hidden" />
            <span className="md:ml-3">{messages['hero.title.line3']}</span>
          </motion.h1>

          <p className="font-inter text-hero-sub text-surface-on-surface-variant max-w-xl mx-auto md:mx-0 mb-6">
            {messages['hero.subtitle']}
          </p>

          <a
            href="#products"
            className="hidden md:inline-flex items-center justify-center px-6 h-[44px] bg-secondary text-secondary-on-secondary rounded-full text-[13px] font-medium uppercase tracking-[0.5px] hover:bg-secondary-hover transition-colors duration-200 shadow-sm"
          >
            {messages['hero.browseCta']}
          </a>
        </div>

        {/* Decorative brand-initial rail — desktop/tablet only */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-5 items-center justify-end">
          <div className="grid grid-cols-4 gap-3">
            {HERO_INITIALS.map((b, i) => (
              <div
                key={i}
                aria-hidden
                className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${b.gradient} flex items-center justify-center text-white font-archivo font-black text-2xl lg:text-3xl shadow-ambient`}
              >
                {b.letter}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
