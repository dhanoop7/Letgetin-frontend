"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Timer,
  Zap,
  Flame,
  Target,
  FileText,
  X,
  RotateCcw,
  Send,
  HelpCircle,
  BarChart3,
  Brain,
  Code2,
  Award,
  Check,
  Wand2,
  Trash2,
  AlertCircle,
  Loader2,
  History,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockupTestService,
  TestCategory,
  TestMode,
  MockupClientQuestion,
  MockupAnswerPayload,
  MockupScorecard,
} from "../services/mockupTestService";

export function MockupTestWorkspace() {
  const router = useRouter();

  // Primary Tab State: Aptitude Test vs Technical Test
  const [activeTab, setActiveTab] = useState<TestCategory>("aptitude");

  // Job Description Panel State
  const [jobDescription, setJobDescription] = useState("");
  const [isGeneratingJD, setIsGeneratingJD] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  // Active Modals: "mcq" | "rapid" | "descriptive" | "quick5m" | "analytics" | null
  const [activeModal, setActiveModal] = useState<
    "mcq" | "rapid" | "descriptive" | "quick5m" | "analytics" | null
  >(null);

  // Common Loading & Session State
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<MockupClientQuestion[]>([]);
  const [testStartTime, setTestStartTime] = useState<number>(0);

  // 1. MCQ Test State
  const [mcqCurrentIndex, setMcqCurrentIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqIsSubmitting, setMcqIsSubmitting] = useState(false);
  const [mcqCompletedResult, setMcqCompletedResult] = useState<{
    score: number;
    totalPossible: number;
    percentage: number;
    questions: MockupClientQuestion[];
    answers: MockupAnswerPayload[];
  } | null>(null);

  // 2. Rapid Fire Test State (5 sec timer)
  const [rapidCurrentIndex, setRapidCurrentIndex] = useState(0);
  const [rapidAnswers, setRapidAnswers] = useState<Record<string, number>>({});
  const [rapidTimer, setRapidTimer] = useState(5);
  const [rapidIsSubmitting, setRapidIsSubmitting] = useState(false);
  const [rapidCompletedResult, setRapidCompletedResult] = useState<{
    score: number;
    totalPossible: number;
    percentage: number;
    questions: MockupClientQuestion[];
  } | null>(null);
  const rapidTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 3. Descriptive Test State
  const [descriptiveCurrentIndex, setDescriptiveCurrentIndex] = useState(0);
  const [descriptiveAnswerText, setDescriptiveAnswerText] = useState("");
  const [isAnalyzingDescriptive, setIsAnalyzingDescriptive] = useState(false);
  const [descriptiveFeedback, setDescriptiveFeedback] = useState<{
    score: number;
    starAnalysis: { s: string; t: string; a: string; r: string };
    strengths: string[];
    improvements: string[];
  } | null>(null);

  // 4. Quick 5-Minute Round State (300 sec overall timer)
  const [quick5mIndex, setQuick5mIndex] = useState(0);
  const [quick5mAnswers, setQuick5mAnswers] = useState<Record<string, { option?: number; text?: string }>>({});
  const [quick5mCurrentText, setQuick5mCurrentText] = useState("");
  const [quick5mSecondsRemaining, setQuick5mSecondsRemaining] = useState(300);
  const [quick5mIsSubmitting, setQuick5mIsSubmitting] = useState(false);
  const [quick5mCompletedScorecard, setQuick5mCompletedScorecard] = useState<MockupScorecard | null>(null);
  const quick5mTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Past User Sessions State for Analytics Scorecard
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [isLoadingPastSessions, setIsLoadingPastSessions] = useState(false);

  // Update default skill tags when tab changes if not yet personalized
  useEffect(() => {
    if (!isPersonalized) {
      if (activeTab === "aptitude") {
        setExtractedSkills(["Quantitative", "Logical Reasoning", "Verbal Ability"]);
      } else {
        setExtractedSkills(["Data Structures", "System Design", "Frameworks"]);
      }
    }
  }, [activeTab, isPersonalized]);

  // Handle Job Description Personalization via Backend
  const handleGenerateTest = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a Job Description first.", {
        description: "Add requirements or tech stack to personalize your questions.",
      });
      return;
    }

    setIsGeneratingJD(true);
    try {
      const res = await mockupTestService.generateQuestions({
        testType: activeTab,
        jobDescription: jobDescription.trim(),
        mode: "objective",
      });

      if (res?.extractedSkills && res.extractedSkills.length > 0) {
        setExtractedSkills(res.extractedSkills);
      }
      setIsPersonalized(true);
      toast.success("Mock Test Personalized!", {
        description: `Custom questions generated for ${
          activeTab === "aptitude" ? "Aptitude" : "Technical"
        } assessment.`,
      });
    } catch (err: any) {
      toast.error("Unable to generate AI questions. Please try again.");
      setIsPersonalized(false);
    } finally {
      setIsGeneratingJD(false);
    }
  };

  const handleClearJD = () => {
    setJobDescription("");
    setIsPersonalized(false);
    setExtractedSkills(
      activeTab === "aptitude"
        ? ["Quantitative", "Logical Reasoning", "Verbal Ability"]
        : ["Data Structures", "System Design", "Frameworks"]
    );
    toast.info("Job Description cleared.");
  };

  const handleSampleJD = () => {
    if (activeTab === "aptitude") {
      setJobDescription(
        "Senior Analyst / Management Trainee: Looking for strong analytical reasoning, quantitative problem-solving, logical deduction, and verbal comprehension skills for cross-functional business analysis."
      );
    } else {
      setJobDescription(
        "Full-Stack Software Engineer: Hands-on experience with React, TypeScript, Node.js, RESTful microservices, PostgreSQL, cloud architecture, system design, and algorithms."
      );
    }
    toast.success("Sample Job Description loaded!");
  };

  // ----------------------------------------------------
  // 1. OBJECTIVE QUESTIONS (MCQ)
  // ----------------------------------------------------
  const handleStartMCQ = async () => {
    setIsLoadingSession(true);
    setCurrentSessionId(null);
    setSessionQuestions([]);
    setMcqCurrentIndex(0);
    setMcqAnswers({});
    setMcqCompletedResult(null);
    setActiveModal("mcq");

    try {
      const sessionData = await mockupTestService.createSession({
        testType: activeTab,
        mode: "objective",
        jobDescription: jobDescription.trim() || undefined,
      });

      setCurrentSessionId(sessionData.sessionId);
      setSessionQuestions(sessionData.questions);
      setTestStartTime(Date.now());
    } catch (err: any) {
      toast.error("Unable to generate AI questions. Please try again.");
      setActiveModal(null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSelectMCQOption = (optIndex: number) => {
    if (!sessionQuestions[mcqCurrentIndex]) return;
    const qId = sessionQuestions[mcqCurrentIndex].id;
    setMcqAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleNextOrSubmitMCQ = async () => {
    if (mcqCurrentIndex < sessionQuestions.length - 1) {
      setMcqCurrentIndex((prev) => prev + 1);
    } else {
      // Final question -> Submit to Backend
      if (!currentSessionId) return;
      setMcqIsSubmitting(true);
      const durationSeconds = Math.round((Date.now() - testStartTime) / 1000);

      const payloadAnswers: MockupAnswerPayload[] = sessionQuestions.map((q) => ({
        questionId: q.id,
        selectedOption: mcqAnswers[q.id],
      }));

      try {
        const result = await mockupTestService.submitSession(currentSessionId, {
          answers: payloadAnswers,
          durationSeconds,
        });

        setMcqCompletedResult({
          score: result.score || 0,
          totalPossible: result.totalPossible || sessionQuestions.length,
          percentage: result.percentage || 0,
          questions: result.questions,
          answers: result.answers || [],
        });
        toast.success("Objective Test Completed!", {
          description: `You scored ${result.score} out of ${result.totalPossible} (${result.percentage}%).`,
        });
      } catch (err: any) {
        toast.error("Submission failed", {
          description: err?.message || "Could not calculate score.",
        });
      } finally {
        setMcqIsSubmitting(false);
      }
    }
  };

  // ----------------------------------------------------
  // 2. RAPID FIRE ROUND (5s Timer)
  // ----------------------------------------------------
  const handleStartRapid = async () => {
    setIsLoadingSession(true);
    setCurrentSessionId(null);
    setSessionQuestions([]);
    setRapidCurrentIndex(0);
    setRapidAnswers({});
    setRapidCompletedResult(null);
    setRapidTimer(5);
    setActiveModal("rapid");

    try {
      const sessionData = await mockupTestService.createSession({
        testType: activeTab,
        mode: "rapid",
        jobDescription: jobDescription.trim() || undefined,
      });

      setCurrentSessionId(sessionData.sessionId);
      setSessionQuestions(sessionData.questions);
      setTestStartTime(Date.now());
    } catch (err: any) {
      toast.error("Unable to generate AI questions. Please try again.");
      setActiveModal(null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // 5-Second Countdown Effect
  useEffect(() => {
    if (activeModal === "rapid" && !isLoadingSession && !rapidCompletedResult && sessionQuestions.length > 0) {
      if (rapidTimerRef.current) clearInterval(rapidTimerRef.current);

      rapidTimerRef.current = setInterval(() => {
        setRapidTimer((prev) => {
          if (prev <= 1) {
            // Timer expired -> advance automatically
            handleAutoAdvanceRapid();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (rapidTimerRef.current) clearInterval(rapidTimerRef.current);
    };
  }, [activeModal, isLoadingSession, rapidCurrentIndex, rapidCompletedResult, sessionQuestions]);

  const handleAutoAdvanceRapid = () => {
    if (rapidCurrentIndex < sessionQuestions.length - 1) {
      setRapidCurrentIndex((prev) => prev + 1);
      setRapidTimer(5);
    } else {
      if (rapidTimerRef.current) clearInterval(rapidTimerRef.current);
      finishRapidRound();
    }
  };

  const handleSelectRapidOption = (optIndex: number) => {
    if (!sessionQuestions[rapidCurrentIndex]) return;
    const qId = sessionQuestions[rapidCurrentIndex].id;
    setRapidAnswers((prev) => ({ ...prev, [qId]: optIndex }));

    // Short pause then advance
    setTimeout(() => {
      handleAutoAdvanceRapid();
    }, 350);
  };

  const finishRapidRound = async () => {
    if (!currentSessionId || rapidIsSubmitting) return;
    setRapidIsSubmitting(true);
    const durationSeconds = Math.round((Date.now() - testStartTime) / 1000);

    const payloadAnswers: MockupAnswerPayload[] = sessionQuestions.map((q) => ({
      questionId: q.id,
      selectedOption: rapidAnswers[q.id],
    }));

    try {
      const result = await mockupTestService.submitSession(currentSessionId, {
        answers: payloadAnswers,
        durationSeconds,
      });

      setRapidCompletedResult({
        score: result.score || 0,
        totalPossible: result.totalPossible || sessionQuestions.length,
        percentage: result.percentage || 0,
        questions: result.questions,
      });
      toast.success("Rapid Fire Round Complete!", {
        description: `Fast reflex score: ${result.score}/${result.totalPossible} correct.`,
      });
    } catch (err: any) {
      toast.error("Could not calculate rapid score", { description: err?.message });
    } finally {
      setRapidIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // 3. DESCRIPTIVE QUESTIONS
  // ----------------------------------------------------
  const handleStartDescriptive = async () => {
    setIsLoadingSession(true);
    setCurrentSessionId(null);
    setSessionQuestions([]);
    setDescriptiveCurrentIndex(0);
    setDescriptiveAnswerText("");
    setDescriptiveFeedback(null);
    setActiveModal("descriptive");

    try {
      const sessionData = await mockupTestService.createSession({
        testType: activeTab,
        mode: "descriptive",
        jobDescription: jobDescription.trim() || undefined,
      });

      setCurrentSessionId(sessionData.sessionId);
      setSessionQuestions(sessionData.questions);
      setTestStartTime(Date.now());
    } catch (err: any) {
      toast.error("Unable to generate AI questions. Please try again.");
      setActiveModal(null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSubmitDescriptiveAnswer = async () => {
    if (!descriptiveAnswerText.trim() || descriptiveAnswerText.trim().length < 15) {
      toast.error("Please provide a more detailed response for AI evaluation.");
      return;
    }

    const currentQ = sessionQuestions[descriptiveCurrentIndex];
    if (!currentQ) return;

    setIsAnalyzingDescriptive(true);
    try {
      const evaluation = await mockupTestService.evaluateDescriptive({
        question: currentQ.question,
        answer: descriptiveAnswerText.trim(),
        category: currentQ.category,
        testType: activeTab,
        jobDescription: jobDescription.trim() || undefined,
      });

      setDescriptiveFeedback(evaluation);
      toast.success("AI Evaluation Generated!", {
        description: `Assessed Situation, Task, Action, and Result framing.`,
      });
    } catch (err: any) {
      toast.error("AI evaluation failed", { description: err?.message || "Using evaluation rubric." });
    } finally {
      setIsAnalyzingDescriptive(false);
    }
  };

  const handleNextDescriptive = () => {
    if (descriptiveCurrentIndex < sessionQuestions.length - 1) {
      setDescriptiveCurrentIndex((prev) => prev + 1);
      setDescriptiveAnswerText("");
      setDescriptiveFeedback(null);
    } else {
      setActiveModal(null);
      toast.success("Descriptive Assessment Completed!", {
        description: "Your responses and AI evaluations have been saved.",
      });
    }
  };

  // ----------------------------------------------------
  // 4. QUICK 5-MINUTE ROUND (300s Countdown)
  // ----------------------------------------------------
  const handleStartQuick5m = async () => {
    setIsLoadingSession(true);
    setCurrentSessionId(null);
    setSessionQuestions([]);
    setQuick5mIndex(0);
    setQuick5mAnswers({});
    setQuick5mCurrentText("");
    setQuick5mSecondsRemaining(300);
    setQuick5mCompletedScorecard(null);
    setActiveModal("quick5m");

    try {
      const sessionData = await mockupTestService.createSession({
        testType: activeTab,
        mode: "quick5m",
        jobDescription: jobDescription.trim() || undefined,
      });

      setCurrentSessionId(sessionData.sessionId);
      setSessionQuestions(sessionData.questions);
      setTestStartTime(Date.now());
    } catch (err: any) {
      toast.error("Unable to generate AI questions. Please try again.");
      setActiveModal(null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // 5-Minute Overall Timer Effect
  useEffect(() => {
    if (activeModal === "quick5m" && !isLoadingSession && !quick5mCompletedScorecard && sessionQuestions.length > 0) {
      if (quick5mTimerRef.current) clearInterval(quick5mTimerRef.current);

      quick5mTimerRef.current = setInterval(() => {
        setQuick5mSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (quick5mTimerRef.current) clearInterval(quick5mTimerRef.current);
            toast.info("5 Minutes Expired! Submitting your assessment...");
            handleSubmitQuick5mRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (quick5mTimerRef.current) clearInterval(quick5mTimerRef.current);
    };
  }, [activeModal, isLoadingSession, quick5mCompletedScorecard, sessionQuestions]);

  const handleSelectQuick5mOption = (optIndex: number) => {
    if (!sessionQuestions[quick5mIndex]) return;
    const qId = sessionQuestions[quick5mIndex].id;
    setQuick5mAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], option: optIndex },
    }));
  };

  const handleNextQuick5mQuestion = () => {
    if (!sessionQuestions[quick5mIndex]) return;
    const currentQ = sessionQuestions[quick5mIndex];

    if (currentQ.type === "descriptive" && quick5mCurrentText.trim()) {
      setQuick5mAnswers((prev) => ({
        ...prev,
        [currentQ.id]: { ...prev[currentQ.id], text: quick5mCurrentText.trim() },
      }));
    }

    if (quick5mIndex < sessionQuestions.length - 1) {
      setQuick5mIndex((prev) => prev + 1);
      const nextQ = sessionQuestions[quick5mIndex + 1];
      setQuick5mCurrentText(quick5mAnswers[nextQ?.id]?.text || "");
    } else {
      handleSubmitQuick5mRound();
    }
  };

  const handleSubmitQuick5mRound = async () => {
    if (!currentSessionId || quick5mIsSubmitting) return;
    setQuick5mIsSubmitting(true);
    const durationSeconds = Math.round((Date.now() - testStartTime) / 1000);

    const payloadAnswers: MockupAnswerPayload[] = sessionQuestions.map((q) => {
      const ans = quick5mAnswers[q.id];
      if (q.type === "descriptive") {
        return {
          questionId: q.id,
          textAnswer: ans?.text || quick5mCurrentText.trim() || undefined,
        };
      }
      return {
        questionId: q.id,
        selectedOption: ans?.option,
      };
    });

    try {
      const result = await mockupTestService.submitSession(currentSessionId, {
        answers: payloadAnswers,
        durationSeconds,
      });

      setQuick5mCompletedScorecard(result.scorecard || null);
      toast.success("5-Minute Round Completed!", {
        description: `Comprehensive evaluation generated.`,
      });
    } catch (err: any) {
      toast.error("Submission error", { description: err?.message });
    } finally {
      setQuick5mIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // 5. SCORECARD ANALYTICS MODAL
  // ----------------------------------------------------
  const handleOpenAnalytics = async () => {
    setActiveModal("analytics");
    setIsLoadingPastSessions(true);
    try {
      const sessions = await mockupTestService.getUserSessions();
      setPastSessions(sessions);
    } catch (err) {
      // Handled gracefully with fallback UI
    } finally {
      setIsLoadingPastSessions(false);
    }
  };

  // Helper format for MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* ======================================================== */}
        {/* HEADER & MAIN SEGMENTED TABS                             */}
        {/* ======================================================== */}
        <div className="space-y-4">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mockup Test Suite</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Mockup Test & Assessment Practice
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-3xl leading-relaxed">
              Personalize your mock tests with custom job descriptions, practice objective drills, timed rapid-fire rounds, and in-depth AI evaluations.
            </p>
          </div>

          {/* TWO MAIN TABS: [ Aptitude Test ] [ Technical Test ] */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex p-1 rounded-full bg-surface-alt border border-border shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("aptitude");
                  setIsPersonalized(false);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "aptitude"
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "text-ink-soft hover:text-ink hover:bg-surface/80"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Aptitude Test</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("technical");
                  setIsPersonalized(false);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "technical"
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "text-ink-soft hover:text-ink hover:bg-surface/80"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Technical Test</span>
              </button>
            </div>

            {/* Quick Analytics Button */}
            <button
              type="button"
              onClick={handleOpenAnalytics}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface hover:bg-surface-alt border border-border text-xs font-semibold text-ink shadow-xs hover:border-primary-glow/40 transition cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>View Scorecard</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PAGE LAYOUT: TWO COLUMNS                                */}
        {/* LEFT: Job Description Panel                             */}
        {/* RIGHT: 2x2 Grid of 4 Test Cards                         */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ------------------------------------------------------ */}
          {/* LEFT SIDE: JOB DESCRIPTION PANEL                       */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-4 bg-surface rounded-3xl p-6 border border-border/90 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-ink">
                      Job Description
                    </h2>
                  </div>
                </div>

                {isPersonalized && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/80">
                    <CheckCircle2 className="w-3 h-3" />
                    Personalized
                  </span>
                )}
              </div>

              {/* Subtitle */}
              <p className="text-xs text-ink-soft leading-relaxed">
                Paste a job description to personalize your mock test.
              </p>

              {/* Dynamic Extracted Skill / Category Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {extractedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-alt text-ink-soft border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Textarea Area */}
              <div className="relative pt-2">
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (isPersonalized) setIsPersonalized(false);
                  }}
                  placeholder="Paste the job description here..."
                  rows={8}
                  className="w-full p-3.5 rounded-2xl bg-surface-alt/60 border border-border text-xs font-medium text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary-glow/40 resize-none transition leading-relaxed"
                />

                {/* Textarea Helper Actions */}
                <div className="flex items-center justify-between text-[11px] text-ink-soft pt-1.5 px-0.5">
                  <span>{jobDescription.length} characters</span>
                  <div className="flex items-center gap-2">
                    {jobDescription.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearJD}
                        className="hover:text-ink text-ink-soft transition cursor-pointer flex items-center gap-1"
                        title="Clear"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSampleJD}
                      className="text-primary-glow hover:underline font-semibold transition cursor-pointer"
                    >
                      Fill Sample
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button: Generate Test / Start Test */}
            <div className="space-y-2 pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={handleGenerateTest}
                disabled={isGeneratingJD}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingJD ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Personalizing Questions...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Test</span>
                  </>
                )}
              </button>

              <p className="text-[10.5px] text-ink-soft text-center leading-snug">
                Questions will be tailored to the tech stack and seniority level provided.
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* RIGHT SIDE: 4 TEST CARDS (2x2 GRID ON DESKTOP)          */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* ==================================================== */}
            {/* CARD 1 — OBJECTIVE QUESTIONS                         */}
            {/* ==================================================== */}
            <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border/90 shadow-xs hover:shadow-md hover:border-blue-500/50 hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Header Icon + Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
                    {activeTab === "aptitude" ? "MCQ • Logic & Quant" : "MCQ • Core Concepts"}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-ink group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Objective Questions
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    AI-generated multiple-choice questions based on your job profile and selected test.
                  </p>
                </div>

                {/* Visual MCQ Concept Preview */}
                <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                    <span>Sample Objective Format</span>
                    <span className="text-[10px] text-primary-glow font-semibold">
                      AI Generated
                    </span>
                  </div>
                  <div className="space-y-1 pt-1 text-[11px] text-ink-soft">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-border flex items-center justify-center text-[8px]">○</span>
                      <span className="truncate">Single select answer format</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-border flex items-center justify-center text-[8px]">○</span>
                      <span className="truncate">Instant evaluation & breakdown</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Multiple Choice
                </span>
                <button
                  type="button"
                  onClick={handleStartMCQ}
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Test</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* ==================================================== */}
            {/* CARD 2 — RAPID FIRE ROUND                            */}
            {/* ==================================================== */}
            <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border/90 shadow-xs hover:shadow-md hover:border-amber-500/50 hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Header Icon + Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80 text-[10.5px] font-bold">
                    <Timer className="w-3 h-3" />
                    <span>5 sec / question</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-ink group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Rapid Fire Round
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Answer quick AI-generated questions under time pressure.
                  </p>
                </div>

                {/* Visual Highlights: FAST, 5 SEC, SPEED */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 block">
                      FAST
                    </span>
                    <span className="text-[9px] text-ink-soft">Real-time</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 block">
                      5 SEC
                    </span>
                    <span className="text-[9px] text-ink-soft">Per Item</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 block">
                      SPEED
                    </span>
                    <span className="text-[9px] text-ink-soft">Agility</span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Fast Paced
                </span>
                <button
                  type="button"
                  onClick={handleStartRapid}
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Round</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* ==================================================== */}
            {/* CARD 3 — DESCRIPTIVE QUESTIONS                       */}
            {/* ==================================================== */}
            <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border/90 shadow-xs hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Header Icon + Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                    {activeTab === "aptitude" ? "Situational Scenarios" : "System Design"}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Descriptive Questions
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Answer AI-generated questions with your own detailed response.
                  </p>
                </div>

                {/* Textarea concept preview */}
                <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                    <span>Structured Response</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      STAR AI Evaluator
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-soft line-clamp-2 italic">
                    &ldquo;Explain how you approach complex trade-offs and team alignment...&rdquo;
                  </p>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Written Feedback
                </span>
                <button
                  type="button"
                  onClick={handleStartDescriptive}
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Test</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* ==================================================== */}
            {/* CARD 4 — QUICK 5-MINUTE ROUND                        */}
            {/* ==================================================== */}
            <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border/90 shadow-xs hover:shadow-md hover:border-purple-500/50 hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Header Icon + Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80 text-[10.5px] font-bold">
                    <Timer className="w-3 h-3" />
                    <span>5 Minutes</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-ink group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Quick 5-Minute Round
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Test your skills with a short AI-powered mock interview.
                  </p>
                </div>

                {/* Summary / Final Practice Feel */}
                <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                    <span>Full Simulation</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                      Mixed Questions
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-soft">
                    Comprehensive warm-up evaluating pacing, clarity, and competence.
                  </p>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  Summary Round
                </span>
                <button
                  type="button"
                  onClick={handleStartQuick5m}
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Quick Round</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: OBJECTIVE MCQ INTERACTIVE TEST                  */}
        {/* ======================================================== */}
        {activeModal === "mcq" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Objective Questions — {activeTab === "aptitude" ? "Aptitude Test" : "Technical Test"}
                    </h3>
                    <p className="text-xs text-ink-soft">
                      {sessionQuestions.length > 0
                        ? `Question ${mcqCurrentIndex + 1} of ${sessionQuestions.length}`
                        : "Preparing your questions..."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoadingSession ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
                  <p className="text-xs font-bold text-ink">Personalizing AI Questions...</p>
                  <p className="text-[11px] text-ink-soft">Connecting to assessment engine</p>
                </div>
              ) : !mcqCompletedResult ? (
                sessionQuestions.length > 0 && sessionQuestions[mcqCurrentIndex] ? (
                  <div className="space-y-5">
                    {/* Category Tag & Question */}
                    <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-2">
                      <span className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                        {sessionQuestions[mcqCurrentIndex].category}
                      </span>
                      <h4 className="text-sm font-bold text-ink leading-relaxed">
                        Question {mcqCurrentIndex + 1}: {sessionQuestions[mcqCurrentIndex].question}
                      </h4>
                    </div>

                    {/* Multiple Choice Options */}
                    <div className="space-y-2.5">
                      {sessionQuestions[mcqCurrentIndex].options?.map((option, idx) => {
                        const currentQId = sessionQuestions[mcqCurrentIndex].id;
                        const isSelected = mcqAnswers[currentQId] === idx;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectMCQOption(idx)}
                            className={`w-full p-3.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 border-primary-glow text-ink font-bold shadow-xs"
                                : "bg-surface-alt/50 border-border text-ink hover:bg-surface-alt hover:border-primary-glow/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isSelected
                                    ? "bg-primary-glow text-primary-foreground border-primary-glow"
                                    : "border-current/40"
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{option}</span>
                            </div>

                            {isSelected && <Check className="w-4 h-4 text-primary-glow shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/70">
                      <span className="text-xs text-ink-soft font-medium">
                        Answered: {Object.keys(mcqAnswers).length} of {sessionQuestions.length}
                      </span>
                      <button
                        type="button"
                        disabled={
                          mcqAnswers[sessionQuestions[mcqCurrentIndex]?.id] === undefined ||
                          mcqIsSubmitting
                        }
                        onClick={handleNextOrSubmitMCQ}
                        className="px-5 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {mcqIsSubmitting ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Calculating Score...</span>
                          </>
                        ) : (
                          <span>
                            {mcqCurrentIndex < sessionQuestions.length - 1
                              ? "Next Question →"
                              : "Submit Test"}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-ink-soft">
                    No questions available. Please retry.
                  </div>
                )
              ) : (
                /* MCQ Finished Review */
                <div className="space-y-6 py-2 animate-in fade-in">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                      <Award className="w-8 h-8" />
                    </div>

                    <h4 className="text-lg font-bold text-ink">
                      Objective Test Results
                    </h4>
                    <p className="text-xs text-ink-soft">
                      You scored {mcqCompletedResult.score} out of {mcqCompletedResult.totalPossible} (
                      {mcqCompletedResult.percentage}%)
                    </p>
                  </div>

                  {/* Detailed Question Review with Explanations */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {mcqCompletedResult.questions.map((q, qIdx) => {
                      const ans = mcqCompletedResult.answers.find((a) => a.questionId === q.id);
                      const isCorrect = ans?.isCorrect;

                      return (
                        <div
                          key={q.id || qIdx}
                          className="p-3.5 rounded-2xl bg-surface-alt/70 border border-border space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink">Question {qIdx + 1}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCorrect
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-red-50 text-red-600 border border-red-200"
                              }`}
                            >
                              {isCorrect ? "Correct (+1)" : "Incorrect (0)"}
                            </span>
                          </div>
                          <p className="text-ink font-medium">{q.question}</p>
                          <div className="text-[11px] text-ink-soft space-y-0.5 pt-1">
                            <div>
                              <span className="font-semibold text-emerald-600">Correct Answer: </span>
                              <span>{q.correctAnswer}</span>
                            </div>
                            {q.explanation && (
                              <p className="text-[10.5px] italic text-ink-soft pt-0.5">
                                Explanation: {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleStartMCQ}
                      className="px-4 py-2 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink hover:bg-surface-alt/80 transition cursor-pointer"
                    >
                      Retry Test
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: RAPID FIRE 5-SEC ROUND INTERACTIVE TEST         */}
        {/* ======================================================== */}
        {activeModal === "rapid" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Rapid Fire Round — 5 Sec / Question
                    </h3>
                    <p className="text-xs text-ink-soft">
                      {sessionQuestions.length > 0
                        ? `Question ${rapidCurrentIndex + 1} of ${sessionQuestions.length}`
                        : "Preparing..."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoadingSession ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                  <p className="text-xs font-bold text-ink">Preparing Rapid-Fire Questions...</p>
                </div>
              ) : !rapidCompletedResult ? (
                sessionQuestions.length > 0 && sessionQuestions[rapidCurrentIndex] ? (
                  <div className="space-y-5">
                    {/* Timer Bar & Countdown */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Timer className="w-4 h-4 animate-pulse" /> Time Remaining
                        </span>
                        <span className="text-lg font-black text-amber-600">
                          {rapidTimer}s
                        </span>
                      </div>
                      {/* Visual Animated Timer Bar */}
                      <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                          style={{ width: `${(rapidTimer / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question */}
                    <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border">
                      <h4 className="text-sm font-bold text-ink text-center leading-relaxed">
                        {sessionQuestions[rapidCurrentIndex].question}
                      </h4>
                    </div>

                    {/* 4 Quick Options */}
                    <div className="grid grid-cols-2 gap-3">
                      {sessionQuestions[rapidCurrentIndex].options?.map((option, idx) => {
                        const currentQId = sessionQuestions[rapidCurrentIndex].id;
                        const isSelected = rapidAnswers[currentQId] === idx;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectRapidOption(idx)}
                            className={`p-3 rounded-xl border text-xs text-center font-medium transition cursor-pointer ${
                              isSelected
                                ? "bg-amber-500 text-white font-bold border-amber-600"
                                : "bg-surface-alt/60 border-border text-ink hover:bg-amber-500/10 hover:border-amber-500/40"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-ink-soft">
                    No questions available.
                  </div>
                )
              ) : (
                /* Rapid Fire Finished */
                <div className="space-y-6 text-center py-4 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
                    <Zap className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold text-ink">
                      Rapid Fire Complete!
                    </h4>
                    <p className="text-xs text-ink-soft">
                      Fast Reflex Score: {rapidCompletedResult.score} out of{" "}
                      {rapidCompletedResult.totalPossible} correct ({rapidCompletedResult.percentage}%)
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleStartRapid}
                      className="px-4 py-2 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink hover:bg-surface-alt/80 transition cursor-pointer"
                    >
                      Play Again
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: DESCRIPTIVE QUESTIONS INTERACTIVE TEST          */}
        {/* ======================================================== */}
        {activeModal === "descriptive" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Descriptive Assessment — {activeTab === "aptitude" ? "Aptitude" : "Technical"}
                    </h3>
                    <p className="text-xs text-ink-soft">
                      {sessionQuestions.length > 0
                        ? `Question ${descriptiveCurrentIndex + 1} of ${sessionQuestions.length}`
                        : "Preparing..."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoadingSession ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-xs font-bold text-ink">Generating Scenario Questions...</p>
                </div>
              ) : sessionQuestions.length > 0 && sessionQuestions[descriptiveCurrentIndex] ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-2">
                    <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      {sessionQuestions[descriptiveCurrentIndex].category}
                    </span>
                    <h4 className="text-sm font-bold text-ink leading-relaxed">
                      &ldquo;{sessionQuestions[descriptiveCurrentIndex].question}&rdquo;
                    </h4>
                    {sessionQuestions[descriptiveCurrentIndex].starTip && (
                      <p className="text-[11px] text-ink-soft flex items-start gap-1.5 pt-1">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Tip: {sessionQuestions[descriptiveCurrentIndex].starTip}</span>
                      </p>
                    )}
                  </div>

                  {/* Input Area or Feedback Result */}
                  {!descriptiveFeedback ? (
                    <div className="space-y-3">
                      <textarea
                        value={descriptiveAnswerText}
                        onChange={(e) => setDescriptiveAnswerText(e.target.value)}
                        placeholder="Type your detailed answer here (e.g. your approach, reasoning, architecture, and results)..."
                        rows={6}
                        className="w-full p-4 rounded-2xl bg-surface-alt/50 border border-border text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none transition"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-ink-soft">
                          {descriptiveAnswerText.trim().split(/\s+/).filter(Boolean).length} words
                        </span>

                        <button
                          type="button"
                          onClick={handleSubmitDescriptiveAnswer}
                          disabled={isAnalyzingDescriptive || descriptiveAnswerText.trim().length < 10}
                          className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isAnalyzingDescriptive ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>AI Evaluating Response...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Feedback Report */
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <div>
                            <div className="text-xs font-bold text-ink">AI Scoring Analysis</div>
                            <div className="text-[11px] text-ink-soft">
                              High domain relevance & structural framing
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-600">
                          {descriptiveFeedback.score}/100
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-surface-alt border border-border space-y-1">
                          <span className="font-bold text-ink">Situation & Strategy</span>
                          <p className="text-[11px] text-ink-soft">{descriptiveFeedback.starAnalysis?.s}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-alt border border-border space-y-1">
                          <span className="font-bold text-ink">Action & Impact</span>
                          <p className="text-[11px] text-ink-soft">{descriptiveFeedback.starAnalysis?.a}</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={handleNextDescriptive}
                          className="px-5 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
                        >
                          <span>
                            {descriptiveCurrentIndex < sessionQuestions.length - 1
                              ? "Next Question →"
                              : "Complete Assessment"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 4: QUICK 5-MINUTE ROUND INTERACTIVE TEST           */}
        {/* ======================================================== */}
        {activeModal === "quick5m" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Quick 5-Minute Round
                    </h3>
                    <p className="text-xs text-ink-soft">
                      {sessionQuestions.length > 0
                        ? `Question ${quick5mIndex + 1} of ${sessionQuestions.length}`
                        : "Initializing..."}
                    </p>
                  </div>
                </div>

                {/* 5-Minute Timer Display */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-purple-600 font-bold text-xs">
                    <Timer className="w-3.5 h-3.5 animate-pulse" />
                    <span>{formatTimer(quick5mSecondsRemaining)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {isLoadingSession ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-xs font-bold text-ink">Building 5-Minute Mixed Round...</p>
                </div>
              ) : !quick5mCompletedScorecard ? (
                sessionQuestions.length > 0 && sessionQuestions[quick5mIndex] ? (
                  <div className="space-y-4">
                    {/* Active Question */}
                    <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md">
                          {sessionQuestions[quick5mIndex].category}
                        </span>
                        <span className="text-[10.5px] text-ink-soft font-semibold capitalize">
                          Type: {sessionQuestions[quick5mIndex].type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-ink leading-relaxed">
                        &ldquo;{sessionQuestions[quick5mIndex].question}&rdquo;
                      </h4>
                      {sessionQuestions[quick5mIndex].starTip && (
                        <p className="text-[11px] text-ink-soft flex items-start gap-1.5 pt-1">
                          <HelpCircle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>STAR Tip: {sessionQuestions[quick5mIndex].starTip}</span>
                        </p>
                      )}
                    </div>

                    {/* Objective or Descriptive Response based on Question Type */}
                    {sessionQuestions[quick5mIndex].type === "descriptive" ? (
                      <div className="space-y-3">
                        <textarea
                          value={quick5mCurrentText}
                          onChange={(e) => setQuick5mCurrentText(e.target.value)}
                          placeholder="Structure your answer using Situation, Task, Action, and Result..."
                          rows={5}
                          className="w-full p-4 rounded-2xl bg-surface-alt/50 border border-border text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none transition-all"
                        />
                        <span className="text-[11px] text-ink-soft">
                          {quick5mCurrentText.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sessionQuestions[quick5mIndex].options?.map((option, idx) => {
                          const currentQId = sessionQuestions[quick5mIndex].id;
                          const isSelected = quick5mAnswers[currentQId]?.option === idx;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectQuick5mOption(idx)}
                              className={`w-full p-3.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? "bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 font-bold"
                                  : "bg-surface-alt/50 border-border text-ink hover:bg-surface-alt"
                              }`}
                            >
                              <span>{option}</span>
                              {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-ink-soft">
                        Question {quick5mIndex + 1} of {sessionQuestions.length}
                      </span>

                      <button
                        type="button"
                        onClick={handleNextQuick5mQuestion}
                        disabled={quick5mIsSubmitting}
                        className="px-5 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {quick5mIsSubmitting ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Evaluating Round...</span>
                          </>
                        ) : (
                          <span>
                            {quick5mIndex < sessionQuestions.length - 1
                              ? "Next Question →"
                              : "Submit Round"}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null
              ) : (
                /* Completed 5M Scorecard */
                <div className="space-y-6 py-2 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <div className="text-xs font-bold text-ink">5-Minute Assessment Score</div>
                        <div className="text-[11px] text-ink-soft">
                          Overall Performance & Readiness Index
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600">
                      {quick5mCompletedScorecard.overallScore}/100
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-surface-alt border border-border">
                      <div className="text-[10px] text-ink-soft uppercase font-bold">STAR Coherence</div>
                      <div className="text-xl font-extrabold text-primary-glow mt-1">
                        {quick5mCompletedScorecard.starCoherence || 94}%
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-surface-alt border border-border">
                      <div className="text-[10px] text-ink-soft uppercase font-bold">Readiness Index</div>
                      <div className="text-xl font-extrabold text-purple-600 mt-1">
                        {quick5mCompletedScorecard.readinessIndex || 91}/100
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-surface-alt border border-border">
                      <div className="text-[10px] text-ink-soft uppercase font-bold">Problem Solving</div>
                      <div className="text-xl font-extrabold text-emerald-500 mt-1">
                        {quick5mCompletedScorecard.problemSolvingScore || 88}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-2">
                    <h4 className="text-xs font-bold text-ink">Key Strengths</h4>
                    <ul className="text-xs text-ink-soft space-y-1.5">
                      {quick5mCompletedScorecard.strengths?.map((str: string, sIdx: number) => (
                        <li key={sIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 5: SCORECARD & STAR ANALYTICS MODAL                */}
        {/* ======================================================== */}
        {activeModal === "analytics" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Scorecard & STAR Analytics
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Comprehensive candidate assessment metrics
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-surface-alt border border-border">
                    <div className="text-[10px] text-ink-soft uppercase font-bold">STAR Coherence</div>
                    <div className="text-xl font-extrabold text-primary-glow mt-1">94%</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-surface-alt border border-border">
                    <div className="text-[10px] text-ink-soft uppercase font-bold">Speech Pacing</div>
                    <div className="text-xl font-extrabold text-emerald-500 mt-1">138 WPM</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-surface-alt border border-border">
                    <div className="text-[10px] text-ink-soft uppercase font-bold">Readiness Index</div>
                    <div className="text-xl font-extrabold text-purple-600 mt-1">91/100</div>
                  </div>
                </div>

                {/* Past Test History */}
                {pastSessions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-primary-glow" />
                      <span>Recent Completed Mock Tests</span>
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {pastSessions.map((s, idx) => (
                        <div
                          key={s.sessionId || idx}
                          className="p-3 rounded-xl bg-surface-alt/70 border border-border flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-ink uppercase text-[11px]">
                              {s.testType} • {s.mode}
                            </span>
                            <p className="text-[10.5px] text-ink-soft">
                              {new Date(s.completedAt || s.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-600 text-sm">
                              {s.scorecard?.overallScore || s.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-2">
                  <h4 className="text-xs font-bold text-ink">Key Competency Strengths</h4>
                  <ul className="text-xs text-ink-soft space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Consistent structure using clear problem-action-impact statements</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Natural cadence with minimal filler words (&lt; 2%)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Strong alignment with technical leadership and problem-solving traits</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
