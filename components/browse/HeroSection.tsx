import { Zap } from 'lucide-react';
import type { Messages } from '@/lib/i18n/useMessages';

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
        <div className="md:col-span-12 lg:col-span-12 text-center md:text-start">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-purple-100 animate-fade-in-up"
          >
            <Zap className="w-4 h-4 text-accent-purple fill-accent-purple" />
            <span className="text-label-md text-primary font-medium">
              {messages['hero.badge']}
            </span>
          </div>

          <h1
            className="font-archivo text-hero text-primary mb-4 uppercase leading-[0.95] tracking-tight break-words hyphens-auto animate-fade-in-up"
            style={{ animationDelay: '60ms' }}
          >
            {messages['hero.title.line1']}
            <br />
            <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange bg-clip-text text-transparent">
              {messages['hero.title.line2']}
            </span>
            <br className="md:hidden" />
            <span className="md:ml-3">{messages['hero.title.line3']}</span>
          </h1>

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

      </div>
    </section>
  );
}
