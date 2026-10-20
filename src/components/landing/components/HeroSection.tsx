import React, { useState } from 'react';
import { Play, Sparkles, Building2 } from 'lucide-react';
import { HERO_PROFILES } from '../constants/landing.constants';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import type { PublishedCmsData } from '../services/cms.service';

interface HeroSectionProps {
  onOpenDemo: () => void;
  onOpenVideoDemo: () => void;
  data?: PublishedCmsData['hero'];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDemo, onOpenVideoDemo, data }) => {
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const profiles = (data?.profiles && data.profiles.length > 0) ? data.profiles : HERO_PROFILES;
  const activeProfile = profiles[activeProfileIndex] || profiles[0] || HERO_PROFILES[0];

  const tagBadge = data?.tagBadge || "The future of professional identity";
  const headlineLine1 = data?.headlineLine1 || "Stop Claiming.";
  const headlineLine2Gradient = data?.headlineLine2Gradient || "Proving.";
  const subtitle = data?.subtitle || "The professional network where verified skills, not CVs, get you hired.";
  const subtitleHighlight = data?.subtitleHighlight || "Companies bid for talent — not the other way around.";
  const primaryCtaText = data?.primaryCtaText || "Get In — It's Free";
  const secondaryCtaText = data?.secondaryCtaText || "Watch Demo";
  const proofBadges = (data?.proofBadges && data.proofBadges.length > 0)
    ? data.proofBadges
    : ["Al-verified skills", "Zero bias hiring", "Global talent pool"];

  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden screenshot-ambient-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Content Matching Screenshot Exactly */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Tag Badge */}
            <div className="mb-8 w-fit">
              <Badge
                variant="pill"
                icon={<Sparkles className="w-3.5 h-3.5 text-brand-500" />}
              >
                <span>{tagBadge}</span>
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-[68px] font-extrabold text-[#06284f] tracking-[-0.04em] leading-[1.08] mb-6">
              {headlineLine1}<br />
              Start <span className="text-gradient-blue">{headlineLine2Gradient}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl mb-9 font-normal">
              {subtitle}{' '}
              <strong className="text-[#0a192f] font-bold">
                {subtitleHighlight}
              </strong>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Button
                onClick={onOpenDemo}
                variant="gradient"
                size="lg"
              >
                <span>{primaryCtaText}</span>
              </Button>

              <Button
                onClick={onOpenVideoDemo}
                variant="outline"
                size="lg"
                icon={
                  <div className="w-5 h-5 rounded-full border border-[#0a192f] flex items-center justify-center mr-0.5">
                    <Play className="w-2.5 h-2.5 fill-[#0a192f] text-[#0a192f] ml-0.5" />
                  </div>
                }
              >
                <span>{secondaryCtaText}</span>
              </Button>
            </div>

            {/* Bottom Proof Badges with cyan circle outline */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-xs sm:text-sm font-medium text-slate-600">
              {proofBadges.map((badge, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-[1.5px] border-[#0284c7] flex items-center justify-center text-[#0284c7]">
                    <span className="text-[9px] font-bold">✓</span>
                  </div>
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Aisha Kapoor / Marcus Chen Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end relative pt-4">
            
            {/* Ambient Cyan Glow behind the card */}
            <div className="absolute -inset-4 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

            {/* Main Card */}
            <div className="w-full max-w-[440px] bg-white rounded-[2rem] border border-sky-100 p-7 sm:p-8 shadow-[0_20px_50px_rgba(2,132,199,0.14)] relative z-10">
              
              {/* Header: Avatar + Name + Fit Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#063970] text-white font-bold text-base flex items-center justify-center shadow-xs">
                    {activeProfile.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0a192f] text-base leading-snug">
                      {activeProfile.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {activeProfile.role}
                    </p>
                  </div>
                </div>

                <Badge variant="fit">
                  <span>★ {activeProfile.fitScore}</span>
                </Badge>
              </div>

              {/* Verified Checklist Rows */}
              <div className="py-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5 font-semibold text-[#0a192f]">
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-[#0284c7] flex items-center justify-center text-[#0284c7]">
                      <span className="text-[9px] font-bold">✓</span>
                    </div>
                    <span>{activeProfile.interviewStatus}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{activeProfile.interviewDuration}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5 font-semibold text-[#0a192f]">
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-[#0284c7] flex items-center justify-center text-[#0284c7]">
                      <span className="text-[9px] font-bold">✓</span>
                    </div>
                    <span>{activeProfile.portfolioStatus}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{activeProfile.portfolioRating}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5 font-semibold text-[#0a192f]">
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-[#0284c7] flex items-center justify-center text-[#0284c7]">
                      <span className="text-[9px] font-bold">✓</span>
                    </div>
                    <span>{activeProfile.ranking}</span>
                  </div>
                  <span className="font-semibold text-[11px] text-slate-700">{activeProfile.tier}</span>
                </div>
              </div>

              {/* Bottom Deep Navy to Royal Blue Gradient Banner */}
              <div className="mt-2 rounded-2xl card-banner-gradient text-white px-4 py-3.5 text-xs flex items-center justify-between shadow-xs">
                <span className="font-medium text-white/95">{activeProfile.activeBids}</span>
                <span className="text-[11px] font-semibold text-sky-200">Active now</span>
              </div>

              {/* Floating Offer Pill at bottom-left */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white border border-sky-100 rounded-2xl py-2.5 px-4 shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center gap-3 z-20">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0a192f]">{activeProfile.offerCompany}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{activeProfile.offerDetails}</div>
                </div>
              </div>

            </div>

            {/* Profile Switcher Controls */}
            <div className="mt-10 flex items-center gap-2 z-10">
              {profiles.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveProfileIndex(idx)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    activeProfileIndex === idx
                      ? 'btn-gradient-blue text-white shadow-xs'
                      : 'bg-white border border-sky-200 text-slate-600 hover:bg-sky-50'
                  }`}
                >
                  {p.name ? `${p.name.split(' ')[0]} (${p.role ? p.role.split('·')[0].trim() : ''})` : `Profile ${idx + 1}`}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
