import React from 'react';
import { AlertCircle, Clock, Video, ArrowRight, Sparkles } from 'lucide-react';
import { Interview } from '../types';

interface Interview15MinAlertProps {
  interview: Interview;
  onJoin: () => void;
  minutesRemaining?: number;
}

export const Interview15MinAlert: React.FC<Interview15MinAlertProps> = ({
  interview,
  onJoin,
  minutesRemaining = 15,
}) => {
  const position = interview.position || 'Senior Full Stack Developer';
  const time = interview.time || '03:00 PM';

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/15 via-surface to-primary/15 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-lg shadow-emerald-500/10 animate-fade-in">
      {/* Background Pulse Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
            <Video className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Starting Soon</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-ink tracking-tight">
              {minutesRemaining > 0 && minutesRemaining <= 15
                ? `Your interview starts in ${minutesRemaining} minute${minutesRemaining === 1 ? '' : 's'}`
                : 'Your interview is starting now'}
            </h3>
            <p className="text-sm text-ink-soft font-medium">
              <span className="text-ink font-bold">{position}</span> • Interview starts at{' '}
              <span className="text-emerald-500 font-bold">{time}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onJoin}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-brand text-primary-foreground font-extrabold text-sm shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
        >
          <Video className="w-4 h-4" />
          <span>Join Interview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
