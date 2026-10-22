import React from 'react';
import {
  CheckCircle2,
  Award,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Calendar,
  Layers,
  BarChart2,
  Building,
} from 'lucide-react';
import { Interview, AiScorecard } from '../types';

interface InterviewCompletedViewProps {
  interview: Interview;
  scorecard?: AiScorecard;
  onRestartOrBack: () => void;
  onGoToSchedule: () => void;
}

export const InterviewCompletedView: React.FC<InterviewCompletedViewProps> = ({
  interview,
  scorecard,
  onRestartOrBack,
  onGoToSchedule,
}) => {
  const card: AiScorecard = scorecard ||
    interview.aiScorecard || {
      overallScore: 88,
      technicalScore: 90,
      communicationScore: 85,
      problemSolvingScore: 89,
      confidenceScore: 87,
      summary: `Candidate demonstrated solid foundational and practical knowledge for the ${interview.position || 'Senior Full Stack Developer'} position. Communicated concepts clearly with structured problem-solving.`,
      strengths: [
        'Clear articulate explanations of microservice architecture',
        'Strong hands-on technical understanding of state synchronization & caching',
        'High personal ownership and structured reasoning',
      ],
      improvements: [
        'Provide deeper production metrics on latency improvements',
        'Elaborate more on automated regression testing protocols',
      ],
      recommendation: 'Strong Hire',
      evaluationDate: new Date().toISOString(),
    };

  const companyName = interview.companyName || interview.department || 'Growww Financial Technologies';
  const position = interview.position || 'Senior Full Stack Developer';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-500/15 via-surface to-primary/10 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
              Interview Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Evaluation & AI Scorecard
            </h2>
            <p className="text-sm text-ink-soft">
              <span className="text-ink font-bold">{position}</span> • {companyName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRestartOrBack}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-ink font-bold text-xs transition-colors cursor-pointer"
          >
            Back to Video Interview
          </button>
          <button
            type="button"
            onClick={onGoToSchedule}
            className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View All Schedules</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scorecard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Column: Overall Score & Recommendation */}
        <div className="bg-surface rounded-3xl border border-border/80 p-6 sm:p-7 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Overall Performance</h3>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary-glow border border-primary/20">
                {card.recommendation || 'Hire'}
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-surface-alt/50 border border-border flex flex-col items-center justify-center space-y-2 text-center">
              <div className="relative flex items-center justify-center">
                <span className="text-5xl sm:text-6xl font-black text-ink tracking-tight">
                  {card.overallScore}
                </span>
                <span className="text-lg font-bold text-ink-soft ml-1">/100</span>
              </div>
              <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Exceeds Hiring Benchmark
              </p>
            </div>
          </div>

          {/* Dimension Bars */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Dimension Breakdown
            </h4>

            {[
              { label: 'Technical Depth', score: card.technicalScore, color: 'bg-primary-glow' },
              { label: 'Communication & STAR', score: card.communicationScore, color: 'bg-emerald-500' },
              { label: 'Problem Solving', score: card.problemSolvingScore, color: 'bg-purple-500' },
              { label: 'Confidence & Poise', score: card.confidenceScore, color: 'bg-amber-500' },
            ].map((dim, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-ink">{dim.label}</span>
                  <span className="text-ink-soft">{dim.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dim.color} transition-all duration-700`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Executive Summary & Strengths/Improvements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="bg-surface rounded-3xl border border-border/80 p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary-glow" />
              <h3 className="text-base font-extrabold text-ink">AI Hiring Evaluation Summary</h3>
            </div>
            <p className="text-sm text-ink leading-relaxed font-normal bg-surface-alt/40 p-4 rounded-2xl border border-border/60">
              {card.summary}
            </p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-surface rounded-3xl border border-border/80 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-extrabold text-ink">Key Strengths</h4>
              </div>
              <ul className="space-y-2.5 text-xs text-ink-soft leading-relaxed">
                {card.strengths && card.strengths.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Growth */}
            <div className="bg-surface rounded-3xl border border-border/80 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-extrabold text-ink">Areas for Improvement</h4>
              </div>
              <ul className="space-y-2.5 text-xs text-ink-soft leading-relaxed">
                {card.improvements && card.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
