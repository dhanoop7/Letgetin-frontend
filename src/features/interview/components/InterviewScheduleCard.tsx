import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Building, Video, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Interview } from '../types';

interface InterviewScheduleCardProps {
  interview: Interview;
  isUnlocked: boolean;
  minutesUntilStart: number;
  onJoin: () => void;
  formatDateStr: (date: string) => string;
}

export const InterviewScheduleCard: React.FC<InterviewScheduleCardProps> = ({
  interview,
  isUnlocked,
  minutesUntilStart,
  onJoin,
  formatDateStr,
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const companyName = interview.companyName || (interview.department ? `${interview.department} Team` : 'Growww Financial Technologies');
  const leadInterviewer = interview.interviewers?.[0] || { name: 'David Kim', role: 'Principal Engineer' };

  // Calculate exact countdown to 15-min join window
  const countdownInfo = useMemo(() => {
    try {
      const [year, month, day] = interview.date.split('-').map(Number);
      let hours = 15;
      let minutes = 0;
      if (interview.time) {
        const match = interview.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const period = match[3]?.toUpperCase();
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        }
      }

      const scheduledDate = new Date(year, month - 1, day, hours, minutes);
      const allowedJoinDate = new Date(scheduledDate.getTime() - 15 * 60 * 1000);
      const diffSec = Math.floor((allowedJoinDate.getTime() - now.getTime()) / 1000);

      if (diffSec <= 0 || isUnlocked) {
        return { isLocked: false, text: '' };
      }

      if (diffSec < 3600) {
        const m = Math.floor(diffSec / 60);
        const s = diffSec % 60;
        return {
          isLocked: true,
          text: `Join available in ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        };
      }

      const hoursLeft = Math.floor(diffSec / 3600);
      const minsLeft = Math.floor((diffSec % 3600) / 60);
      return {
        isLocked: true,
        text: `Join available in ${hoursLeft}h ${minsLeft}m`,
      };
    } catch {
      return { isLocked: !isUnlocked, text: 'Opens 15 mins before' };
    }
  }, [interview, now, isUnlocked]);

  const canJoin = isUnlocked || !countdownInfo.isLocked;

  return (
    <div className="bg-surface rounded-3xl border border-border/80 shadow-md hover:shadow-glow/10 transition-all duration-300 overflow-hidden">
      {/* Top Gradient Stripe */}
      <div className="h-2 bg-gradient-brand w-full" />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Header Badge & Title */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary-glow border border-primary/20 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                {interview.roundName || 'Round 2: Technical & Architecture'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {interview.stage === 'today' ? 'Scheduled Today' : 'Scheduled'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              {interview.position || 'Senior Full Stack Developer'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-ink-soft font-medium">
              <Building className="w-4 h-4 text-primary-glow shrink-0" />
              <span>{companyName}</span>
            </div>
          </div>

          {/* Platform Tag */}
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface-alt border border-border text-xs font-semibold text-ink">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-glow" />
              <span>{interview.platform || 'LetGetIn Room'}</span>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-alt/60 border border-border/60">
          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-glow shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-ink-soft">Interview Date</p>
              <p className="text-sm font-extrabold text-ink">{formatDateStr(interview.date)}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-ink-soft">Interview Time</p>
              <p className="text-sm font-extrabold text-ink">{interview.time || '03:00 PM'}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-ink-soft">Duration</p>
              <p className="text-sm font-extrabold text-ink">{interview.durationMinutes || 30} minutes</p>
            </div>
          </div>

          {/* Interviewer */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-[11px] uppercase tracking-wider font-bold text-ink-soft">Interviewer</p>
              <p className="text-sm font-extrabold text-ink truncate">{leadInterviewer.name}</p>
              {leadInterviewer.role && (
                <p className="text-[11px] text-ink-soft truncate">{leadInterviewer.role}</p>
              )}
            </div>
          </div>
        </div>

        {/* Access Restriction & Join Action */}
        <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {canJoin ? (
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Interview room is ready — Join anytime now</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold">
                <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  Your interview room will open 15 minutes before the scheduled time.
                </span>
              </div>
            )}
            <p className="text-xs text-ink-soft">
              Scheduled for {formatDateStr(interview.date)} at {interview.time || '03:00 PM'} ({interview.durationMinutes || 30} mins)
              {countdownInfo.isLocked && countdownInfo.text && (
                <span className="ml-2 font-bold text-amber-500">({countdownInfo.text})</span>
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={!canJoin}
            onClick={onJoin}
            className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              canJoin
                ? 'bg-gradient-brand text-primary-foreground shadow-glow hover:scale-105 active:scale-95'
                : 'bg-surface-alt border border-border text-ink-soft/60 cursor-not-allowed opacity-75'
            }`}
          >
            {canJoin ? (
              <>
                <Video className="w-4 h-4" />
                <span>Join Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Join Locked</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
