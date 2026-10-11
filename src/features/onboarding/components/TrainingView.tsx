'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Award,
  Video,
  X,
  Sparkles,
} from 'lucide-react';
import { StepId, TrainingModule } from '../types';
import { useCandidateOnboardingStore } from '../store/useCandidateOnboardingStore';
import { PageHeader } from './PageHeader';
import { StepFooter } from './StepFooter';
import { ProgressRing } from './ProgressRing';
import { StatusBadge } from './StatusBadge';

interface TrainingViewProps {
  onSelectStep: (stepId: StepId | 'dashboard') => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ onSelectStep }) => {
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const trainingModules = useCandidateOnboardingStore((state) => state.trainingModules);
  const updateTrainingProgress = useCandidateOnboardingStore((state) => state.updateTrainingProgress);
  const setStepStatus = useCandidateOnboardingStore((state) => state.setStepStatus);

  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulatedSeconds, setSimulatedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalModules = trainingModules.length;
  const completedModules = trainingModules.filter((m) => m.isCompleted).length;
  const totalProgress = Math.round(
    trainingModules.reduce((acc, curr) => acc + curr.progress, 0) / totalModules,
  );

  const handleOpenModule = (mod: TrainingModule) => {
    setActiveModule(mod);
    setSimulatedSeconds(Math.round((mod.progress / 100) * mod.videoDurationSeconds));
    setIsPlaying(false);
  };

  const handleCloseDialog = () => {
    if (activeModule) {
      const progress = Math.min(
        100,
        Math.round((simulatedSeconds / activeModule.videoDurationSeconds) * 100),
      );
      updateTrainingProgress(activeModule.id, progress);
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setActiveModule(null);
  };

  // Video playback simulation
  useEffect(() => {
    if (isPlaying && activeModule) {
      intervalRef.current = setInterval(() => {
        setSimulatedSeconds((prev) => {
          if (prev >= activeModule.videoDurationSeconds) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPlaying(false);
            updateTrainingProgress(activeModule.id, 100, true);
            return activeModule.videoDurationSeconds;
          }
          const nextSec = prev + 5;
          const progress = Math.min(
            100,
            Math.round((nextSec / activeModule.videoDurationSeconds) * 100),
          );
          updateTrainingProgress(activeModule.id, progress);
          return nextSec;
        });
      }, 400);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeModule, updateTrainingProgress]);

  const handleMarkModuleComplete = () => {
    if (activeModule) {
      updateTrainingProgress(activeModule.id, 100, true);
      setSimulatedSeconds(activeModule.videoDurationSeconds);
      setIsPlaying(false);
    }
  };

  const formatVideoTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleContinue = () => {
    setStepStatus('training', completedModules > 0 ? 'completed' : 'in_progress');
    onSelectStep('team');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        stepId="training"
        title="Orientation & Foundations"
        description="Get acquainted with engineering architecture, development best practices, and enterprise culture."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink">
              {completedModules} of {totalModules} Completed
            </span>
            <StatusBadge status={stepStatus.training} size="md" />
          </div>
        }
        onBackToDashboard={() => onSelectStep('dashboard')}
      />

      {/* Progress Card + Certificate Note */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs bg-gradient-to-r from-primary/5 via-purple-500/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <ProgressRing progress={totalProgress} size={90} strokeWidth={8} />
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black text-ink flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>Foundational Learning Curriculum</span>
            </h3>
            <p className="text-xs text-ink-soft max-w-md leading-relaxed">
              Completing these 4 core modules qualifies you for Developer Badge recognition and first-week security clearance.
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
              <span>{completedModules === totalModules ? 'Curriculum Fully Completed!' : 'Certificate unlocks upon 100% completion'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 4 Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainingModules.map((module, idx) => (
          <div
            key={module.id}
            className={`p-5 rounded-2xl border transition space-y-3 flex flex-col justify-between ${
              module.isCompleted
                ? 'bg-surface border-emerald-500/30'
                : 'bg-surface border-border hover:border-primary/40'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  Module {idx + 1}
                </span>
                <span className="text-[11px] text-ink-soft flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {module.duration}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-ink leading-snug">
                {module.title}
              </h4>

              <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                {module.description}
              </p>

              {/* Key Topics Badges */}
              <div className="flex flex-wrap gap-1 pt-1">
                {module.keyTopics.slice(0, 3).map((topic, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt text-ink-soft"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {module.isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                ) : module.progress > 0 ? (
                  <span className="text-xs font-bold text-amber-500">
                    {module.progress}% Viewed
                  </span>
                ) : (
                  <span className="text-xs text-ink-soft">Not started</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleOpenModule(module)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-bold transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{module.isCompleted ? 'Replay' : module.progress > 0 ? 'Resume' : 'Watch'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Step Footer */}
      <StepFooter
        onBack={() => onSelectStep('policies')}
        backText="Policies"
        canContinue={true}
        onContinue={handleContinue}
        continueText="Continue to Meet Your Team"
      />

      {/* Interactive Video Player Simulation Modal */}
      {activeModule && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden text-left">
            <div className="p-5 border-b border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-ink truncate">{activeModule.title}</h3>
                  <p className="text-[11px] text-ink-soft">Simulated Interactive Learning Session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="p-1.5 rounded-xl hover:bg-surface-alt text-ink-soft transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Canvas Simulation */}
            <div className="p-6 space-y-4">
              <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col items-center justify-center p-6 shadow-inner overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 text-[11px] font-bold text-white/90 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>HD 1080p • Interactive Stream</span>
                </div>

                <div className="text-center space-y-2 z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center mx-auto transition cursor-pointer shadow-lg backdrop-blur-md"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-white" />
                    ) : (
                      <Play className="w-6 h-6 fill-white translate-x-0.5" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{activeModule.title}</h4>
                  <p className="text-xs text-white/70">
                    {formatVideoTime(simulatedSeconds)} / {formatVideoTime(activeModule.videoDurationSeconds)}
                  </p>
                </div>

                {/* Progress Bar in Player */}
                <div className="absolute bottom-3 left-4 right-4 space-y-1">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{
                        width: `${(simulatedSeconds / activeModule.videoDurationSeconds) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedSeconds(0)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-semibold text-ink transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleMarkModuleComplete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Completed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
