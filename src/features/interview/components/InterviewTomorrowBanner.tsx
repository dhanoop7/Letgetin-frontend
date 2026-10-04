import React from 'react';
import { Calendar, Bell, Clock, Building, Sparkles, Video } from 'lucide-react';
import { Interview } from '../types';

interface InterviewTomorrowBannerProps {
  interview: Interview;
}

export const InterviewTomorrowBanner: React.FC<InterviewTomorrowBannerProps> = ({ interview }) => {
  const companyName = interview.companyName || (interview.department ? `${interview.department} Team` : 'Growww Financial Technologies');
  const position = interview.position || 'Senior Full Stack Developer';
  const time = interview.time || '03:00 PM';

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/15 via-surface to-primary/10 border-2 border-primary/30 rounded-3xl p-6 sm:p-7 shadow-glow/10 animate-fade-in">
      {/* Decorative Blur Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-primary-foreground shadow-glow shrink-0">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-glow text-xs font-extrabold uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5" />
              <span>Interview Tomorrow</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-ink tracking-tight">
              Your video interview is tomorrow
            </h3>
            <p className="text-sm text-ink-soft font-medium">
              <span className="text-ink font-bold">{position}</span> interview with{' '}
              <span className="text-primary-glow font-bold">{companyName}</span>
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3 bg-surface/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-primary/20 shrink-0">
          <Clock className="w-5 h-5 text-primary-glow" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Scheduled Time</p>
            <p className="text-sm font-extrabold text-ink">Tomorrow at {time}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
