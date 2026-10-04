"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Video,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  User,
  Building,
  Lock,
  Play,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { interviewService } from '../services/interviewService';
import { Interview, AiScorecard } from '../types';
import { InterviewScheduleCard } from './InterviewScheduleCard';
import { InterviewTomorrowBanner } from './InterviewTomorrowBanner';
import { Interview15MinAlert } from './Interview15MinAlert';
import { VideoInterviewRoom } from './VideoInterviewRoom';
import { InterviewCompletedView } from './InterviewCompletedView';

export function VideoInterviewWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const paramInterviewId = searchParams?.get('interviewId') || searchParams?.get('id') || searchParams?.get('room');

  // Active view state
  // 'normal': upcoming states (States 1-4)
  // 'room': inside video room (State 5)
  // 'completed': viewing results (State 6)
  const [activeViewState, setActiveViewState] = useState<'normal' | 'room' | 'completed'>(
    paramInterviewId ? 'room' : 'normal'
  );
  const [completedScorecard, setCompletedScorecard] = useState<AiScorecard | undefined>(undefined);

  // State override for previewing the 6 states easily
  const [stateOverride, setStateOverride] = useState<
    'auto' | 'state1_none' | 'state2_future' | 'state3_tomorrow' | 'state4_15min' | 'state5_room' | 'state6_completed'
  >('auto');

  // Live timer for exact countdown & unlock detection
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch interviews
  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await interviewService.getInterviews();
      let matchedId = paramInterviewId || null;

      if (data && data.length > 0) {
        setInterviews(data);
        if (paramInterviewId) {
          const found = data.find((i) => (i._id || i.id) === paramInterviewId || i.roomCode === paramInterviewId);
          if (found) {
            matchedId = found._id || found.id || paramInterviewId;
            setActiveViewState('room');
          }
        }
        setSelectedInterviewId(matchedId || data[0]._id || data[0].id || null);
      } else {
        // Fallback sample catalog matching scheduled interviews
        const todayStr = new Date().toISOString().slice(0, 10);
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);

        const sampleCatalog: Record<string, Interview> = {
          'int-8': {
            _id: 'int-8',
            userId: user?.id || user?._id || 'candidate-1',
            candidateName: user?.fullName || user?.username || 'Adarsh',
            candidateEmail: user?.email || 'adarshanil2005au@gmail.com',
            companyName: 'Growww Financial Technologies',
            position: 'Full Stack AI Engineer',
            department: 'Engineering',
            roundName: 'Round 2: Technical & Architecture',
            stage: 'upcoming',
            type: 'live_video',
            date: todayStr,
            time: '11:30 AM',
            durationMinutes: 45,
            platform: 'LetGetIn Room',
            meetingLink: '/interviews/ai-practice?interviewId=int-8',
            roomCode: 'growww-tech-782',
            interviewers: [
              {
                name: 'David Kim',
                role: 'Principal Engineer',
                email: 'david.kim@growww.in',
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          'int-1': {
            _id: 'int-1',
            userId: user?.id || user?._id || 'candidate-1',
            candidateName: 'Sophia Chen',
            candidateEmail: 'sophia.chen@example.com',
            companyName: 'Growww Financial Technologies',
            position: 'Senior Frontend Engineer',
            department: 'Engineering',
            roundName: 'Round 2: Architecture & Code',
            stage: 'today',
            type: 'live_video',
            date: todayStr,
            time: '10:30 AM',
            durationMinutes: 45,
            platform: 'LetGetIn Room',
            meetingLink: '/interviews/ai-practice?interviewId=int-1',
            roomCode: 'live-7829-alpha',
            interviewers: [
              {
                name: 'David Kim',
                role: 'Principal Engineer',
                email: 'david.kim@growww.in',
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          'default-int-1': {
            _id: 'default-int-1',
            userId: user?.id || user?._id || 'candidate-1',
            candidateName: user?.fullName || user?.username || 'Adarsh',
            candidateEmail: user?.email || 'candidate@example.com',
            companyName: 'Growww Financial Technologies',
            position: 'Senior Full Stack Developer',
            department: 'Core Engineering',
            roundName: 'Round 2: Technical & Architecture',
            stage: 'upcoming',
            type: 'live_video',
            date: tomorrowStr,
            time: '03:00 PM',
            durationMinutes: 30,
            platform: 'LetGetIn Room',
            meetingLink: '/interviews/ai-practice',
            roomCode: 'growww-tech-782',
            interviewers: [
              {
                name: 'David Kim',
                role: 'Principal Engineer',
                email: 'david.kim@growww.in',
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };

        const activeItem = (paramInterviewId && sampleCatalog[paramInterviewId]) || sampleCatalog['default-int-1'];
        setInterviews(Object.values(sampleCatalog));
        setSelectedInterviewId(activeItem._id || 'default-int-1');
      }
    } catch (err) {
      console.warn('Failed to load interviews from service, using default:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, paramInterviewId]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  // Selected or primary upcoming interview
  const currentInterview = useMemo(() => {
    if (!interviews || interviews.length === 0) return null;
    if (selectedInterviewId) {
      const match = interviews.find((i) => (i._id || i.id) === selectedInterviewId);
      if (match) return match;
    }
    if (paramInterviewId) {
      const match = interviews.find((i) => (i._id || i.id) === paramInterviewId || i.roomCode === paramInterviewId);
      if (match) return match;
    }
    return interviews[0];
  }, [interviews, selectedInterviewId, paramInterviewId]);

  // Date parsing helper
  const parsedInterviewTime = useMemo(() => {
    if (!currentInterview) return null;
    try {
      const [year, month, day] = currentInterview.date.split('-').map(Number);
      let hours = 15;
      let minutes = 0;

      if (currentInterview.time) {
        const timeMatch = currentInterview.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          const period = timeMatch[3]?.toUpperCase();
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        }
      }

      return new Date(year, month - 1, day, hours, minutes);
    } catch {
      return null;
    }
  }, [currentInterview]);

  // Date comparison calculations
  const timingInfo = useMemo(() => {
    if (!currentInterview || !parsedInterviewTime) {
      return {
        isTomorrow: false,
        isToday: false,
        diffMinutes: 9999,
        isWithin15Min: false,
        isUnlocked: false,
      };
    }

    const todayStr = currentTime.toISOString().slice(0, 10);
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const isToday = currentInterview.date === todayStr;
    const isTomorrow = currentInterview.date === tomorrowStr;

    const diffMs = parsedInterviewTime.getTime() - currentTime.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    // 15-Minute Window Lock:
    // Room unlocks <= 15 minutes before scheduled start time and stays open throughout duration
    const isWithin15Min = diffMinutes <= 15 && diffMinutes >= -(currentInterview.durationMinutes || 45);
    const isUnlocked = isWithin15Min;

    return {
      isTomorrow,
      isToday,
      diffMinutes,
      isWithin15Min,
      isUnlocked,
    };
  }, [currentInterview, parsedInterviewTime, currentTime]);

  // Format date display
  const formatDateStr = (dateStr: string) => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      if (dateStr === todayStr) return 'Today';
      if (dateStr === tomorrowStr) return 'Tomorrow';

      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Determine current active state (1 through 6)
  const computedState = useMemo(() => {
    if (stateOverride !== 'auto') {
      return stateOverride;
    }

    if (activeViewState === 'room') return 'state5_room';
    if (activeViewState === 'completed') return 'state6_completed';

    if (!currentInterview || interviews.length === 0) {
      return 'state1_none';
    }

    if (timingInfo.isWithin15Min) {
      return 'state4_15min';
    }

    if (timingInfo.isTomorrow) {
      return 'state3_tomorrow';
    }

    return 'state2_future';
  }, [stateOverride, activeViewState, currentInterview, interviews, timingInfo]);

  // Handler: Join Interview Room
  const handleJoinRoom = () => {
    setActiveViewState('room');
  };

  // Handler: End Interview & show scorecard
  const handleEndInterview = (scorecard?: AiScorecard) => {
    setCompletedScorecard(scorecard);
    setActiveViewState('completed');
  };

  // Handler: Return to main state
  const handleBackToPreview = () => {
    setActiveViewState('normal');
    setStateOverride('auto');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* State Switcher & Preview Toolbar (Non-intrusive demo helper) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-alt/70 border border-border/80 text-xs">
        <div className="flex items-center gap-2 font-bold text-ink">
          <SlidersHorizontal className="w-4 h-4 text-primary-glow" />
          <span>Interview State Preview:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'auto', label: 'Live Auto-Detect' },
            { id: 'state1_none', label: '1. No Scheduled' },
            { id: 'state2_future', label: '2. Scheduled (>24h)' },
            { id: 'state3_tomorrow', label: '3. Tomorrow' },
            { id: 'state4_15min', label: '4. Within 15 Min (Unlocked)' },
            { id: 'state5_room', label: '5. Live Video Room' },
            { id: 'state6_completed', label: '6. Completed' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                setStateOverride(st.id as any);
                if (st.id === 'state5_room') setActiveViewState('room');
                else if (st.id === 'state6_completed') setActiveViewState('completed');
                else setActiveViewState('normal');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                (stateOverride === st.id && activeViewState === 'normal') ||
                (st.id === 'state5_room' && activeViewState === 'room') ||
                (st.id === 'state6_completed' && activeViewState === 'completed')
                  ? 'bg-gradient-brand text-primary-foreground shadow-glow'
                  : 'bg-surface hover:bg-surface-alt text-ink-soft border border-border'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* STATE 5 — INTERVIEW IN PROGRESS (VIDEO ROOM)                 */}
      {/* ============================================================ */}
      {(computedState === 'state5_room' || activeViewState === 'room') && currentInterview && (
        <VideoInterviewRoom
          interview={currentInterview}
          onEndInterview={handleEndInterview}
          onExitRoom={handleBackToPreview}
        />
      )}

      {/* ============================================================ */}
      {/* STATE 6 — INTERVIEW COMPLETED                                */}
      {/* ============================================================ */}
      {(computedState === 'state6_completed' || activeViewState === 'completed') && currentInterview && (
        <InterviewCompletedView
          interview={currentInterview}
          scorecard={completedScorecard}
          onRestartOrBack={handleBackToPreview}
          onGoToSchedule={() => router.push('/interviews/schedule')}
        />
      )}

      {/* ============================================================ */}
      {/* STATES 1 - 4: UPCOMING / SCHEDULED VIEWS                    */}
      {/* ============================================================ */}
      {activeViewState === 'normal' && computedState !== 'state5_room' && computedState !== 'state6_completed' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-semibold">
              <Video className="w-3.5 h-3.5" />
              <span>Video Interview Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Your Video Interviews
            </h1>
            <p className="text-sm text-ink-soft max-w-2xl">
              Access your upcoming scheduled video interviews, live AI-powered transcription rooms, and comprehensive performance evaluations.
            </p>
          </div>

          {/* STATE 1: No Interview Scheduled */}
          {computedState === 'state1_none' && (
            <div className="bg-surface rounded-3xl border border-dashed border-border p-10 sm:p-14 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary-glow flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-ink">No video interviews are currently scheduled.</h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Once you are selected for a video interview, it will appear here.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/interviews/mock')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-glow hover:scale-105 transition-all cursor-pointer"
                >
                  Practice Mock Interview
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/interviews/schedule')}
                  className="px-5 py-2.5 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-ink font-bold text-xs transition-all cursor-pointer"
                >
                  Check Interview Calendar
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: Tomorrow Banner */}
          {computedState === 'state3_tomorrow' && currentInterview && (
            <InterviewTomorrowBanner interview={currentInterview} />
          )}

          {/* STATE 4: 15-Minute Alert */}
          {computedState === 'state4_15min' && currentInterview && (
            <Interview15MinAlert
              interview={currentInterview}
              onJoin={handleJoinRoom}
              minutesRemaining={Math.max(1, timingInfo.diffMinutes)}
            />
          )}

          {/* STATE 2, 3, 4: Schedule Card */}
          {computedState !== 'state1_none' && currentInterview && (
            <InterviewScheduleCard
              interview={currentInterview}
              isUnlocked={computedState === 'state4_15min' || timingInfo.isUnlocked}
              minutesUntilStart={timingInfo.diffMinutes}
              onJoin={handleJoinRoom}
              formatDateStr={formatDateStr}
            />
          )}

          {/* Helpful Preparation Checklist */}
          {computedState !== 'state1_none' && currentInterview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-surface p-5 rounded-3xl border border-border/80 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-glow font-black text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-ink">Camera & Audio Check</h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Ensure your webcam and microphone permissions are enabled. The video room uses live AI voice transcription.
                </p>
              </div>

              <div className="bg-surface p-5 rounded-3xl border border-border/80 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-ink">15-Minute Early Access</h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  The Join button automatically unlocks 15 minutes before your scheduled start time for pre-flight setup.
                </p>
              </div>

              <div className="bg-surface p-5 rounded-3xl border border-border/80 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-ink">Instant AI Scorecard</h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  After ending the interview, the AI Hiring Engine compiles full STAR metrics, communication clarity, and feedback.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
