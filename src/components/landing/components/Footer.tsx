import React from 'react';
import { Shield } from 'lucide-react';

const XIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.02-3.28 1.64 1.64 0 0 0 .02 3.28m1.39 9.74V9.93H5.07v8.57h2.78z"/>
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

interface FooterLink {
  label: string;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

interface FooterProps {
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSignIn, onOpenSignUp, onNavigate }) => {
  const footerSections: { title: string; links: FooterLink[] }[] = [
    {
      title: 'PLATFORM',
      links: [
        {
          label: 'Help centre',
          href: 'https://talent.docs.mercor.com/welcome',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          label: 'Refer & Earn',
          href: '/refer-and-earn',
        },
        {
          label: 'Why LetGetIn',
          href: '/why-letgetin',
        },
        {
          label: 'Features',
          href: '/features',
        },
        {
          label: 'The 6 Dimensions',
          href: '/the-6-dimensions',
        },
      ],
    },
    {
      title: 'EXPLORE JOBS',
      links: [
        { label: 'AI & Engineering', href: '/jobs/ai-engineering' },
        { label: 'Finance and Accounting', href: '/jobs/finance-accounting' },
        { label: 'Health Sector Jobs', href: '/jobs/healthcare' },
        { label: 'Direct Company Bids', href: '/direct-company-bids' },
        { label: 'Resources', href: '/resources' },
      ],
    },
    {
      title: 'ENTERPRISE',
      links: [
        { label: 'AI Recruitment Suite', href: '/enterprise/ai-recruitment-suite' },
        { label: 'Enterprise AI', href: '/enterprise/ai' },
        { label: 'HUREMASO', href: '/enterprise/huremaso' },
        { label: 'Human Data', href: '/enterprise/human-data' },
        { label: 'Contact Sales', href: '/enterprise/contact-sales' },
      ],
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Employers', href: '/employers' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Policies', href: '/policies' },
        { label: 'Security', href: '/security' },
        { label: 'Customer Care', href: '/customer-care' },
      ],
    },
  ];

  const socialLinks = [
    { label: 'X', href: 'https://x.com/i/flow/login', icon: XIcon },
    { label: 'Instagram', href: 'https://www.instagram.com/accounts/login/', icon: InstagramIcon },
    { label: 'Facebook', href: 'https://www.facebook.com/login/', icon: FacebookIcon },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/login', icon: LinkedinIcon },
    { label: 'YouTube', href: 'https://www.youtube.com', icon: YoutubeIcon },
    { label: 'GitHub', href: 'https://github.com/login', icon: GithubIcon },
  ];

  return (
    <footer className="bg-[#061a33] text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid from PDF Page 6 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 pb-16 border-b border-white/10">
          
          {/* Brand Column (2 cols wide) */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              {/* Logo matching screenshot */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#063970] border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  <span className="font-display">L</span>
                </div>
                <span className="font-display text-2xl font-bold tracking-tight text-white">
                  Let<span className="text-[#38bdf8]">Get</span>In
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-sm mb-6 font-normal">
                The professional identity layer where verified skills, not CVs, get you hired.
              </p>

              {/* Status Indicator */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-mono text-sky-200 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verification Engine: Live (120k+ members)</span>
              </div>

              {/* Quick Sign In / Sign Up CTA Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenSignIn}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenSignUp}
                  className="px-3.5 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#0ea5e9] text-xs font-bold text-[#061a33] transition-all shadow-xs cursor-pointer"
                >
                  Sign Up Free
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-6 border-t border-white/10 max-w-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300 font-mono block mb-3">
                CONNECT
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.04] hover:bg-sky-500/15 border border-white/10 hover:border-sky-400/40 text-slate-300 hover:text-white transition-all text-xs group"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-sky-300 transition-colors" />
                      <span className="font-medium truncate">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((sec) => (
            <div key={sec.title} className="flex flex-col space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-sky-300 font-mono">
                {sec.title}
              </h5>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {sec.links.map((link) => {
                  if (link.onClick) {
                    return (
                      <li key={link.label}>
                        <button
                          type="button"
                          onClick={link.onClick}
                          className="hover:text-white transition-colors duration-150 text-left block py-0.5 text-sky-300 hover:underline cursor-pointer"
                        >
                          {link.label}
                        </button>
                      </li>
                    );
                  }

                  const isInternal = link.href?.startsWith('/');

                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.target}
                        rel={link.rel}
                        onClick={(e) => {
                          if (isInternal && onNavigate) {
                            e.preventDefault();
                            onNavigate(link.href!);
                          }
                        }}
                        className="hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div>
            © 2026 LetGetIn, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>SOC2 Certified · Zero Bias Verified</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
