"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Video,
  Calendar,
  Clock,
  User,
  Building,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { interviewService } from "@/features/interview/services/interviewService";
import { Interview, AiScorecard } from "@/features/interview/types";
import { VideoInterviewRoom } from "@/features/interview/components/VideoInterviewRoom";
import { InterviewCompletedView } from "@/features/interview/components/InterviewCompletedView";

function RecruiterVideoInterviewWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramRoom = searchParams?.get("room");
  const paramId = searchParams?.get("id");

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInRoom, setIsInRoom] = useState(false);
  const [completedScorecard, setCompletedScorecard] = useState<AiScorecard | undefined>(undefined);
  const [isCompleted, setIsCompleted] = useState(false);

  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await interviewService.getInterviews();
      if (data && data.length > 0) {
        setInterviews(data);

        // Match by room or ID if specified
        if (paramRoom || paramId) {
          const matched = data.find(
            (i) =>
              (paramId && (i._id === paramId || i.id === paramId)) ||
              (paramRoom && (i.roomCode === paramRoom || i._id === paramRoom))
          );
          if (matched) {
            setSelectedInterview(matched);
            setIsInRoom(true);
          } else {
            setSelectedInterview(data[0]);
          }
        } else {
          setSelectedInterview(data[0]);
        }
      } else {
        // Fallback demo interview
        const sample: Interview = {
          _id: 'recruiter-sample-1',
          userId: 'recruiter-1',
          candidateName: 'Adarsh',
          candidateEmail: 'adarsh@example.com',
          companyName: 'Growww Financial Technologies',
          position: 'Senior Full Stack Developer',
          department: 'Core Engineering',
          roundName: 'Round 2: Technical & Architecture',
          stage: 'upcoming',
          type: 'live_video',
          date: new Date().toISOString().slice(0, 10),
          time: '03:00 PM',
          durationMinutes: 30,
          platform: 'LetGetIn Room',
          meetingLink: '/recruiter/video-interview?room=growww-tech-782',
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
        };
        setInterviews([sample]);
        setSelectedInterview(sample);
        if (paramRoom || paramId) {
          setIsInRoom(true);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch recruiter interviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [paramRoom, paramId]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const handleEndInterview = (scorecard?: AiScorecard) => {
    setCompletedScorecard(scorecard);
    setIsInRoom(false);
    setIsCompleted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
        <p className="text-xs font-bold text-ink-soft">Loading Recruiter Video Studio...</p>
      </div>
    );
  }

  if (isCompleted && selectedInterview) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InterviewCompletedView
          interview={selectedInterview}
          scorecard={completedScorecard}
          onRestartOrBack={() => {
            setIsCompleted(false);
            setIsInRoom(false);
          }}
          onGoToSchedule={() => router.push('/recruiter/interview-schedule')}
        />
      </div>
    );
  }

  if (isInRoom && selectedInterview) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsInRoom(false)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-ink transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Candidate List</span>
          </button>
          <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Recruiter Mode Active
          </span>
        </div>

        <VideoInterviewRoom
          interview={selectedInterview}
          isRecruiter={true}
          onEndInterview={handleEndInterview}
          onExitRoom={() => setIsInRoom(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-semibold">
            <Video className="w-3.5 h-3.5" />
            <span>Recruiter Interview Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Live Video Interviews
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft max-w-2xl">
            Join candidate live video rooms, review real-time AI transcription, and generate instant competency scorecards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/recruiter/interview-schedule")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-alt hover:bg-surface border border-border text-ink text-xs font-bold transition cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-primary-glow" />
          <span>Manage Schedule</span>
        </button>
      </div>

      {/* Selected Interview Card or Candidate Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate List Column */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            Scheduled Sessions ({interviews.length})
          </h3>

          <div className="space-y-2.5">
            {interviews.map((item) => {
              const isSelected = (selectedInterview?._id || selectedInterview?.id) === (item._id || item.id);
              return (
                <div
                  key={item._id || item.id}
                  onClick={() => setSelectedInterview(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-surface hover:bg-surface-alt"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-ink">{item.candidateName}</h4>
                      <p className="text-xs text-ink-soft">{item.position}</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-md">
                      {item.time || "03:00 PM"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60 text-ink-soft">
                    <span>{item.date}</span>
                    <span className="font-semibold text-primary-glow">{item.platform || "LetGetIn Room"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel Column */}
        {selectedInterview && (
          <div className="lg:col-span-2 bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary-glow border border-primary/20">
                  {selectedInterview.roundName || "Round 2: Technical & Architecture"}
                </span>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Ready to Join
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-ink">
                  {selectedInterview.position || "Senior Full Stack Developer"}
                </h2>
                <p className="text-sm text-ink-soft mt-1">
                  Candidate: <strong className="text-ink">{selectedInterview.candidateName}</strong> ({selectedInterview.candidateEmail})
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-alt/60 border border-border/60 text-xs">
                <div>
                  <p className="text-ink-soft font-medium">Date</p>
                  <p className="font-bold text-ink mt-0.5">{selectedInterview.date}</p>
                </div>
                <div>
                  <p className="text-ink-soft font-medium">Time</p>
                  <p className="font-bold text-ink mt-0.5">{selectedInterview.time || "03:00 PM"}</p>
                </div>
                <div>
                  <p className="text-ink-soft font-medium">Duration</p>
                  <p className="font-bold text-ink mt-0.5">{selectedInterview.durationMinutes || 30} mins</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-ink-soft flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Camera, Mic & AI Live Transcription Active</span>
              </div>

              <button
                type="button"
                onClick={() => setIsInRoom(true)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-sm shadow-glow hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Join Recruiter Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecruiterVideoInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
          <p className="text-xs font-bold text-ink-soft">Loading Recruiter Video Studio...</p>
        </div>
      }
    >
      <RecruiterVideoInterviewWorkspace />
    </Suspense>
  );
}
