'use client';

import React from 'react';
import {
  FileCheck,
  UserCheck,
  UploadCloud,
  CreditCard,
  ShieldAlert,
  GraduationCap,
  Users,
  ListChecks,
  Lock,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Task, StepId } from '../types';
import { StatusBadge } from './StatusBadge';

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  FileCheck,
  UserCheck,
  UploadCloud,
  CreditCard,
  ShieldAlert,
  GraduationCap,
  Users,
  ListChecks,
};

interface TaskCardProps {
  task: Task;
  isLocked?: boolean;
  onSelectStep: (stepId: StepId) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isLocked = false,
  onSelectStep,
}) => {
  const IconComponent = ICONS[task.iconName] || FileCheck;

  return (
    <div
      onClick={() => {
        if (!isLocked) {
          onSelectStep(task.stepId);
        }
      }}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between gap-3 select-none ${
        isLocked
          ? 'bg-surface-alt/40 border-border/70 opacity-60 cursor-not-allowed'
          : 'bg-surface border-border hover:border-primary/50 hover:shadow-md cursor-pointer group'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              isLocked
                ? 'bg-surface-alt text-ink-soft'
                : 'bg-primary/10 text-primary group-hover:scale-105'
            }`}
          >
            {isLocked ? (
              <Lock className="w-5 h-5 text-ink-soft" />
            ) : (
              <IconComponent className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-ink-soft">
                Step {task.stepNumber}
              </span>
              <h4 className="text-sm font-bold text-ink group-hover:text-primary transition truncate">
                {task.title}
              </h4>
            </div>
            <p className="text-xs text-ink-soft line-clamp-2 mt-1 leading-relaxed">
              {task.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/70">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-soft font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>~{task.estimatedMinutes} mins</span>
          {task.required && (
            <>
              <span>•</span>
              <span className="text-primary font-bold">Required</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} isLocked={isLocked} size="sm" />
          {!isLocked && (
            <ChevronRight className="w-4 h-4 text-ink-soft group-hover:text-primary group-hover:translate-x-0.5 transition" />
          )}
        </div>
      </div>
    </div>
  );
};
