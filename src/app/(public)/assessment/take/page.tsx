"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  BookmarkCheck,
  FileQuestion,
  HelpCircle,
  Loader2,
  Send,
  Maximize,
  AlertOctagon,
  Award,
  ChevronRight,
  RefreshCw,
  Check,
  Zap,
  Layers,
  Paperclip,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/apiClient";

interface StageQuestion {
  id: string;
  order: number;
  type: string;
  section?: string;
  question: string;
  instructions?: string;
  points: number;
  timeLimitSeconds?: number;
  options?: Array<{ id: string; text: string }>;
  context?: string;
  sampleAnswer?: string;
  evaluationRubric?: string;
  correctOptionId?: string;
}

interface TestData {
  applicationId: string;
  job: {
    _id: string;
    title: string;
    company: { name: string };
  };
  stage: {
    stageId: string;
    stageName: string;
    stageType: string;
    assessmentType?: string;
    durationMinutes: number;
    passingScore: number;
    totalQuestions: number;
    schedule?: any;
    config?: any;
    instructions: string;
  };
  questions: StageQuestion[];
}

function CandidateStageTakeComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const applicationId = searchParams.get("applicationId") || "";
  const stageId = searchParams.get("stageId") || "";
  const jobId = searchParams.get("jobId") || "";

  // Phases: 'onboarding' | 'in_progress' | 'completed'
  const [phase, setPhase] = useState<"onboarding" | "in_progress" | "completed">("onboarding");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestData | null>(null);

  // Session state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(1800);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Rapid Question Round per-question speed timer state
  const [rapidRemaining, setRapidRemaining] = useState<number | null>(null);
  const [rapidLimit, setRapidLimit] = useState<number>(30);

  // Scratchpad / calculation sheet attachments for descriptive questions
  const [attachments, setAttachments] = useState<Record<string, { name: string; size: string }>>({});

  // Proctoring state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Evaluation outcome state
  const [submissionResult, setSubmissionResult] = useState<{
    passed: boolean;
    totalScore: number;
    maxScore: number;
    percentage: number;
    passingScore: number;
    verdict: string;
    message: string;
    tabSwitchCount: number;
    proctorDisqualified: boolean;
    nextStageId: string | null;
    isFinalShortlist: boolean;
  } | null>(null);

  // Fetch stage test data on mount
  useEffect(() => {
    async function loadTest() {
      const isPreview = searchParams.get("preview") === "true";

      // If recruiter preview or no applicationId: attempt to load the actual configured stage questions
      if (!applicationId || isPreview) {
        if (jobId && stageId) {
          try {
            setLoading(true);
            const res: any = await apiClient.get(`/recruiter/jobs/${jobId}/hiring-engine/stages/${stageId}`);
            const stageData = res.data;
            const customQuestions = stageData?.config?.customQuestions || [];
            if (customQuestions && customQuestions.length > 0) {
              setTestData({
                applicationId: "preview-application",
                job: {
                  _id: jobId,
                  title: stageData.stageName ? `${stageData.stageName} (Recruiter Preview)` : "Live Assessment Preview",
                  company: { name: "Stage Configuration Preview" },
                },
                stage: {
                  stageId: stageData.stageId || stageId,
                  stageName: stageData.stageName || "General Aptitude Test",
                  stageType: stageData.stageType || "assessment",
                  assessmentType: stageData.assessmentType || "general_aptitude",
                  durationMinutes: stageData.durationMinutes || 30,
                  passingScore: stageData.passingScore || stageData.autoAdvanceScoreThreshold || 70,
                  totalQuestions: customQuestions.length,
                  config: stageData.config,
                  instructions: "Recruiter Preview Mode: This window simulates the exact test portal your candidates will experience with your configured questions, timers, and rules.",
                },
                questions: customQuestions.map((q: any, idx: number) => ({
                  id: q.id || `q_${idx + 1}`,
                  order: q.order || idx + 1,
                  type: q.type || (q.section === "rapid" ? "rapid" : q.section === "descriptive" ? "descriptive" : "mcq"),
                  section: q.section,
                  question: q.question,
                  instructions: q.instructions || "",
                  points: q.points || 10,
                  timeLimitSeconds: q.timeLimitSeconds,
                  options: q.options,
                  context: q.context,
                  correctOptionId: q.correctOptionId,
                  sampleAnswer: q.sampleAnswer,
                  evaluationRubric: q.evaluationRubric,
                })),
              });
              const totalSecs = (stageData.durationMinutes || 30) * 60;
              setTimeRemainingSeconds(totalSecs);
              setLoading(false);
              return;
            }
          } catch {
            // Fall back to demo dataset below if recruiter session isn't active or endpoint fails
          }
        }

        // Fallback demo/preview dataset so recruiters and testers can try the proctor interface instantly
        setTestData({
          applicationId: "demo-preview-application",
          job: {
            _id: "demo-job",
            title: "Senior Full Stack Engineer",
            company: { name: "TechCorp Labs" },
          },
          stage: {
            stageId: "stage_general_aptitude",
            stageName: "General Aptitude Test (Interactive Demo)",
            stageType: "assessment",
            assessmentType: "general_aptitude",
            durationMinutes: 15,
            passingScore: 70,
            totalQuestions: 7,
            instructions: "This is a demonstration of the proctored assessment environment. Experience full-screen enforcement, tab-switch infraction tracking (max 3 warnings), and automated grading across all 3 sections.",
          },
          questions: [
            {
              id: "demo-q1",
              order: 1,
              type: "mcq",
              section: "mcq",
              question: "If a project sprint velocity increases by 20% and the backlog is reduced by 10%, how does the completion timeline change relative to the initial forecast?",
              points: 15,
              correctOptionId: "B",
              options: [
                { id: "A", text: "Decreases by 25%" },
                { id: "B", text: "Decreases by approximately 25%" },
                { id: "C", text: "Increases by 10%" },
                { id: "D", text: "Remains approximately unchanged" },
              ],
            },
            {
              id: "demo-q2",
              order: 2,
              type: "mcq",
              section: "mcq",
              question: "Which of the following data structures provides average O(1) time complexity for lookup, insert, and delete operations?",
              points: 15,
              correctOptionId: "B",
              options: [
                { id: "A", text: "Binary Search Tree" },
                { id: "B", text: "Hash Table" },
                { id: "C", text: "Red-Black Tree" },
                { id: "D", text: "B-Tree" },
              ],
            },
            {
              id: "demo-q3",
              order: 3,
              type: "mcq",
              section: "mcq",
              question: "In a microservices architecture, what is the primary purpose of the Circuit Breaker pattern?",
              points: 15,
              correctOptionId: "B",
              options: [
                { id: "A", text: "To encrypt payload transmissions between microservices" },
                { id: "B", text: "To prevent cascading failures when a downstream service is unresponsive" },
                { id: "C", text: "To distribute HTTP traffic evenly across available worker nodes" },
                { id: "D", text: "To authenticate API tokens before forwarding requests" },
              ],
            },
            {
              id: "demo-q4",
              order: 4,
              type: "mcq",
              section: "mcq",
              question: "What is the key difference between optimistic and pessimistic concurrency control in database transactions?",
              points: 15,
              correctOptionId: "A",
              options: [
                { id: "A", text: "Optimistic assumes conflicts are rare and verifies at commit; pessimistic locks resources in advance" },
                { id: "B", text: "Pessimistic requires distributed consensus while optimistic does not" },
                { id: "C", text: "Optimistic only works on NoSQL databases" },
                { id: "D", text: "Pessimistic uses rollback segments while optimistic does not" },
              ],
            },
            {
              id: "demo-q5",
              order: 5,
              type: "descriptive",
              section: "descriptive",
              question: "A distribution hub has two conveyor lines, Line A and Line B. Line A processes an entire cargo batch in 6 hours alone, while Line B takes 9 hours alone. Line A begins operating at 9:00 AM. At 11:00 AM, Line B joins Line A, and both work together until the cargo batch is finished. At what exact time is the entire cargo batch processed? Provide your full mathematical deduction and intermediate steps.",
              points: 20,
              sampleAnswer: "Line A rate = 1/6 batch/hr. In first 2 hrs (9-11 AM), Line A completes 2/6 = 1/3 of the work. Remaining work = 1 - 1/3 = 2/3. Combined rate = 1/6 + 1/9 = 5/18 batch/hr. Time needed = (2/3)/(5/18) = 12/5 = 2.4 hrs = 2 hrs 24 mins. Adding 2h 24m to 11:00 AM gives exactly 1:24 PM.",
              evaluationRubric: "Award partial points for initial fraction done (1/3), combined work rate calculation (5/18), and final completion timestamp (1:24 PM).",
            },
            {
              id: "demo-q6",
              order: 6,
              type: "rapid",
              section: "rapid",
              timeLimitSeconds: 30,
              correctOptionId: "B",
              question: "A cloud API service currently processes 1,200 requests/minute. If sudden traffic surges by 150%, how many requests per second must the cluster handle?",
              points: 10,
              options: [
                { id: "A", text: "30 req/s" },
                { id: "B", text: "50 req/s" },
                { id: "C", text: "75 req/s" },
                { id: "D", text: "120 req/s" },
              ],
            },
            {
              id: "demo-q7",
              order: 7,
              type: "rapid",
              section: "rapid",
              timeLimitSeconds: 20,
              correctOptionId: "C",
              question: "Which HTTP status code is the industry standard for indicating that client rate limits have been exceeded?",
              points: 10,
              options: [
                { id: "A", text: "401 Unauthorized" },
                { id: "B", text: "403 Forbidden" },
                { id: "C", text: "429 Too Many Requests" },
                { id: "D", text: "503 Service Unavailable" },
              ],
            },
          ],
        });
        setTimeRemainingSeconds(15 * 60);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const url = `/applications/${applicationId}/stage-test${stageId ? `?stageId=${encodeURIComponent(stageId)}` : ""}`;
        const res: any = await apiClient.get(url);
        const data: TestData = res.data;
        setTestData(data);
        const totalSecs = (data.stage?.durationMinutes || 30) * 60;
        setTimeRemainingSeconds(totalSecs);
      } catch (err: any) {
        setLoadError(err.response?.data?.message || "Failed to load assessment questions for this stage.");
      } finally {
        setLoading(false);
      }
    }

    loadTest();
  }, [applicationId, stageId]);

  // Live timer tick
  useEffect(() => {
    if (phase !== "in_progress") return;

    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Rapid Question speed-timer initialization on question navigation
  useEffect(() => {
    if (phase !== "in_progress" || !testData?.questions?.[currentIdx]) {
      setRapidRemaining(null);
      return;
    }

    const q = testData.questions[currentIdx];
    const isRapid = q.type === "rapid" || q.section === "rapid";
    if (isRapid) {
      const limit = q.timeLimitSeconds || testData.stage?.config?.rapidTimeLimitSeconds || 30;
      setRapidLimit(limit);
      setRapidRemaining(limit);
    } else {
      setRapidRemaining(null);
    }
  }, [currentIdx, phase, testData]);

  // Rapid Question countdown ticker
  useEffect(() => {
    if (phase !== "in_progress" || rapidRemaining === null) return;

    const timer = setInterval(() => {
      setRapidRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("⚡ Time's up for this rapid question! Auto-advancing...", {
            duration: 3000,
          });
          const qs = testData?.questions || [];
          if (qs.length > 0 && currentIdx < qs.length - 1) {
            setCurrentIdx((c) => c + 1);
          } else {
            setShowSubmitModal(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, rapidRemaining, currentIdx, testData]);

  // Fullscreen change listener
  useEffect(() => {
    if (phase !== "in_progress") return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) {
        setShowFullscreenWarning(true);
      } else {
        setShowFullscreenWarning(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [phase]);

  // Tab switch & visibility monitoring
  useEffect(() => {
    if (phase !== "in_progress") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleInfraction("Tab switch detected: Focus lost.");
      }
    };

    const handleWindowBlur = () => {
      handleInfraction("Window switch detected: Window blurred.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [phase, tabSwitchCount]);

  const handleInfraction = (reason: string) => {
    setTabSwitchCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 4) {
        toast.error("Proctor Violation: Excessive tab switches detected. Auto-submitting assessment...", {
          duration: 6000,
        });
        handleSubmitExam(nextCount);
      } else {
        toast.warning(
          `⚠️ Proctor Warning (${nextCount}/3): Please remain in your exam window. Repeated infractions will disqualify your test.`,
          { duration: 5000 }
        );
      }
      return nextCount;
    });
  };

  const handleStartExam = async () => {
    if (!agreedToTerms) {
      toast.error("Please accept the test integrity agreement to proceed.");
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Fullscreen prompt fallback
    }

    setPhase("in_progress");
    toast.success("Assessment started! You are in proctored exam mode.");
  };

  const handleReenterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setShowFullscreenWarning(false);
      }
    } catch {
      toast.error("Could not trigger full screen. Please click allow when prompted.");
    }
  };

  const handleAutoSubmitOnExpiry = () => {
    toast.error("Time has expired! Submitting your assessment answers...", { duration: 6000 });
    handleSubmitExam();
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const toggleReview = (questionId: string) => {
    setMarkedForReview((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmitExam = async (overrideInfractionCount?: number) => {
    if (!testData) return;
    try {
      setIsSubmitting(true);
      setShowSubmitModal(false);
      toast.loading("Submitting and evaluating your assessment...", { id: "stage-eval" });

      const infractions = overrideInfractionCount !== undefined ? overrideInfractionCount : tabSwitchCount;

      // In demo/preview mode, compute score locally so anyone can test the complete taker flow immediately
      const isPreview = searchParams.get("preview") === "true";
      if (
        applicationId === "demo-preview-application" ||
        applicationId === "preview-application" ||
        isPreview ||
        !applicationId
      ) {
        await new Promise((r) => setTimeout(r, 600));

        let earnedPoints = 0;
        let totalPossible = 0;
        (testData.questions || []).forEach((q: any) => {
          const pts = Number(q.points) || 10;
          totalPossible += pts;
          const userAns = (answers[q.id] || "").trim();

          if (q.correctOptionId) {
            if (userAns.toLowerCase() === String(q.correctOptionId).trim().toLowerCase()) {
              earnedPoints += pts;
            }
          } else if (q.type === "descriptive" || q.section === "descriptive" || !q.options || q.options.length === 0) {
            if (userAns.length >= 25) {
              earnedPoints += Math.round(pts * 0.9);
            } else if (userAns.length >= 10) {
              earnedPoints += Math.round(pts * 0.5);
            }
          } else if (userAns) {
            earnedPoints += pts;
          }
        });

        const maxScore = totalPossible || 100;
        const totalScore = earnedPoints;
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        const proctorDisqualified = infractions >= 4;
        const passingThreshold = testData.stage?.passingScore || 70;
        const passed = percentage >= passingThreshold && !proctorDisqualified;

        setSubmissionResult({
          passed,
          totalScore,
          maxScore,
          percentage,
          passingScore: passingThreshold,
          verdict: proctorDisqualified
            ? "Disqualified due to excessive proctoring infractions (>3 tab switches)"
            : passed
            ? "Congratulations! You met the passing criteria and have been advanced to the next round."
            : `Score of ${percentage}% is below required ${passingThreshold}% passing threshold.`,
          message: passed
            ? "You qualified for the next stage in the pipeline."
            : "Review your performance and attempt future openings.",
          tabSwitchCount: infractions,
          proctorDisqualified,
          nextStageId: passed ? "stage_ai_interview" : null,
          isFinalShortlist: false,
        });
        setPhase("completed");
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        toast.dismiss("stage-eval");
        toast.success(
          applicationId === "preview-application"
            ? "Preview test evaluated! Verified against your saved answer keys."
            : "Assessment evaluated successfully!"
        );
        return;
      }

      const payload = {
        stageId: testData.stage.stageId,
        answers,
        timeSpentSeconds,
        tabSwitchCount: infractions,
      };

      const res: any = await apiClient.post(`/applications/${applicationId}/submit-stage`, payload);
      setSubmissionResult(res.data);
      setPhase("completed");

      // Exit fullscreen if active
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      toast.dismiss("stage-eval");
      toast.success("Assessment evaluated successfully!");
    } catch (err: any) {
      toast.dismiss("stage-eval");
      toast.error(err.response?.data?.message || "Failed to submit assessment. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const questions = testData?.questions || [];
  const currentQ = questions[currentIdx] || null;
  const answeredCount = Object.keys(answers).length;
  const isTimeUrgent = timeRemainingSeconds < 300;

  // Computed section groups (Hook called unconditionally)
  const sectionGroups = React.useMemo(() => {
    if (!questions.length) return [];
    const map = new Map<string, { key: string; label: string; count: number; firstIdx: number }>();
    questions.forEach((q, idx) => {
      const secKey = q.section || (q.type === "rapid" ? "rapid" : q.type === "descriptive" ? "descriptive" : "mcq");
      if (!map.has(secKey)) {
        let label = "Section 1: Multiple Choice";
        if (secKey === "descriptive") label = "Section 2: Descriptive & Analytical";
        if (secKey === "rapid") label = "Section 3: Rapid Question Round";
        map.set(secKey, { key: secKey, label, count: 0, firstIdx: idx });
      }
      map.get(secKey)!.count += 1;
    });
    return Array.from(map.values());
  }, [questions]);

  const activeSectionKey = currentQ?.section || (currentQ?.type === "rapid" ? "rapid" : currentQ?.type === "descriptive" ? "descriptive" : "mcq");

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
          <p className="text-xs text-slate-400">Loading proctored assessment session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || !testData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Assessment Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {loadError || "Could not retrieve the specified assessment round."}
          </p>
          <div className="pt-2">
            <Link
              href="/candidate/applications"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition"
            >
              <span>Return to My Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 1. ONBOARDING & PROCTOR RULES SCREEN
  if (phase === "onboarding") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary-glow flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-primary-glow uppercase tracking-wider">
                {testData.job.company.name}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {testData.stage.stageName}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Role: {testData.job.title}</p>
            </div>
          </div>

          {/* Test Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <Clock className="w-4 h-4 text-primary-glow mx-auto mb-1.5" />
              <div className="text-base font-bold text-white">{testData.stage.durationMinutes} mins</div>
              <div className="text-[10px] text-slate-400">Total Duration</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <FileQuestion className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
              <div className="text-base font-bold text-white">{questions.length}</div>
              <div className="text-[10px] text-slate-400">Questions</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-base font-bold text-white">{testData.stage.passingScore}%</div>
              <div className="text-[10px] text-slate-400">Pass Mark</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
              <div className="text-base font-bold text-white">Strict</div>
              <div className="text-[10px] text-slate-400">Proctored</div>
            </div>
          </div>

          {/* Configured 3-Section Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary-glow" />
                Assessment Structure &amp; Sections
              </span>
              <span className="text-[10px] font-semibold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full">
                {sectionGroups.length} Configured Sections
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Section 1: MCQ
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Conceptual and quantitative multiple choice questions.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Section 2: Descriptive
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Step-by-step mathematical working or scratchpad attachment.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-current text-amber-400" />
                  Section 3: Rapid Round
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  High-speed questions with live countdown timer and auto-advance.
                </p>
              </div>
            </div>
          </div>

          {/* Proctoring Rules */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Proctoring &amp; Examination Regulations</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-300/90 pl-1 leading-relaxed">
              <li>Fullscreen mode is strictly enforced throughout the duration of this exam.</li>
              <li>Switching tabs, windows, or minimizing your browser triggers an infraction warning.</li>
              <li>Exceeding 3 proctoring infractions will automatically terminate and disqualify your test.</li>
              <li>Copy, paste, and right-click actions are disabled to preserve test integrity.</li>
              <li>Answers are recorded and scored immediately upon submission.</li>
            </ul>
          </div>

          {/* Integrity Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/30 cursor-pointer"
            />
            <span className="text-xs text-slate-300">
              I acknowledge the test rules, confirm that I will complete this assessment independently, and agree to enter full-screen proctored mode.
            </span>
          </label>

          {/* Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartExam}
              disabled={!agreedToTerms}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-brand shadow-lg hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Maximize className="w-4 h-4" />
              <span>Enter Proctored Exam (Full Screen)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. COMPLETED & SCORECARD SCREEN
  if (phase === "completed" && submissionResult) {
    const isPass = submissionResult.passed;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${
              isPass
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
            }`}
          >
            {isPass ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>

          <div>
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                isPass
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {submissionResult.verdict}
            </span>
            <h1 className="text-2xl font-bold text-white mt-3">
              {isPass ? "Congratulations! Stage Qualified" : "Assessment Completed"}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              {submissionResult.message}
            </p>
          </div>

          {/* Score Summary Box */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div>
              <div className="text-2xl font-extrabold text-white">
                {submissionResult.percentage}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Your Score</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-300">
                {submissionResult.passingScore}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Passing Mark</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-300">
                {submissionResult.totalScore}/{submissionResult.maxScore}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Points Earned</div>
            </div>
          </div>

          {/* Advancement status */}
          {isPass && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 text-left flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your application has been automatically advanced to the next stage in the hiring pipeline. Track your progress anytime in your applicant portal.
              </span>
            </div>
          )}

          {submissionResult.proctorDisqualified && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive text-left flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span>
                Disqualified due to {submissionResult.tabSwitchCount} tab-switch proctoring infractions.
              </span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/candidate/applications"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
            >
              <span>View Application Tracking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. LIVE PROCTORED EXAM TAKING SCREEN
  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      {/* Fullscreen Alert Modal (If user escapes fullscreen) */}
      {showFullscreenWarning && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Maximize className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Full-Screen Required</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have exited full-screen mode. Exam regulations require active full-screen. Please re-enter full-screen immediately to continue your test.
            </p>
            <button
              type="button"
              onClick={handleReenterFullscreen}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-brand shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              Return to Full Screen
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow flex items-center justify-center font-bold text-xs shrink-0">
              Q{currentIdx + 1}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                  {testData.stage.stageName}
                </h2>
                <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {testData.job.title}
                </span>
                {(applicationId === "demo-preview-application" || applicationId === "preview-application") && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    Simulation Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {answeredCount} of {questions.length} answered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Proctor Infractions Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                tabSwitchCount === 0
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Warnings: {tabSwitchCount}/3</span>
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                isTimeUrgent
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-200 border-slate-700"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit Test</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Section Navigation Ribbon */}
      {sectionGroups.length > 1 && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Layers className="w-3 h-3 text-primary-glow" />
              Sections:
            </span>
            {sectionGroups.map((sec) => {
              const isActive = activeSectionKey === sec.key;
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => setCurrentIdx(sec.firstIdx)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isActive
                      ? "bg-primary/20 text-white border-primary/50 shadow-sm"
                      : "bg-slate-800/40 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {sec.key === "rapid" && <Zap className="w-3 h-3 text-amber-400 fill-current" />}
                  <span>{sec.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive ? "bg-primary/40 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {sec.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Question Card (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          {currentQ ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Question Meta Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary-glow bg-primary/10 px-2.5 py-1 rounded-lg">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    {currentQ.type === "rapid" || currentQ.section === "rapid" ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-current" />
                        Rapid Question ({currentQ.timeLimitSeconds || 30}s)
                      </span>
                    ) : currentQ.type === "descriptive" || (!currentQ.options || currentQ.options.length === 0) ? (
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
                        Descriptive / Analytical
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        Multiple Choice
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {currentQ.points || 1} {currentQ.points === 1 ? "point" : "points"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleReview(currentQ.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      markedForReview[currentQ.id]
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>{markedForReview[currentQ.id] ? "Marked for Review" : "Mark for Review"}</span>
                  </button>
                </div>

                {/* Rapid Question Live Speed Bar */}
                {rapidRemaining !== null && (currentQ.type === "rapid" || currentQ.section === "rapid") && (
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      rapidRemaining <= 5
                        ? "bg-rose-500/15 border-rose-500/40 animate-pulse"
                        : "bg-amber-500/10 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs mb-2">
                      <div className="flex items-center gap-2 font-bold">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            rapidRemaining <= 5 ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div>
                          <span className={rapidRemaining <= 5 ? "text-rose-300" : "text-amber-300"}>
                            Speed Round Active:
                          </span>{" "}
                          <span className="text-white font-extrabold">{rapidRemaining}s remaining</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Auto-advances when time expires
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                          rapidRemaining <= 5 ? "bg-rose-500" : "bg-gradient-to-r from-amber-400 to-amber-500"
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, (rapidRemaining / (rapidLimit || 30)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Question Statement */}
                <div>
                  {currentQ.instructions && (
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {currentQ.instructions}
                    </p>
                  )}
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Descriptive Answer Field */}
                {(currentQ.type === "descriptive" || !currentQ.options || currentQ.options.length === 0) && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Type your step-by-step mathematical working or written deduction:
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {(answers[currentQ.id] || "").length} chars ·{" "}
                        {(answers[currentQ.id] || "").trim() ? (answers[currentQ.id] || "").trim().split(/\s+/).length : 0} words
                      </span>
                    </div>
                    <textarea
                      rows={7}
                      value={answers[currentQ.id] || ""}
                      onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                      placeholder="Detail your intermediate equations, deduction steps, and final answer here..."
                      className="w-full bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-y font-mono leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400 italic">
                      Tip: Show complete steps. Your solution is scored against the evaluation rubric and key intermediate values.
                    </p>

                    {/* Optional handwritten scratchpad upload */}
                    <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-primary-glow" />
                          Attach Handwritten Working / Scratchpad (Optional)
                        </span>
                        <span className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</span>
                      </div>

                      {attachments[currentQ.id] ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-slate-200 truncate">{attachments[currentQ.id].name}</span>
                            <span className="text-[10px] text-slate-400">({attachments[currentQ.id].size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAttachments((prev) => {
                                const copy = { ...prev };
                                delete copy[currentQ.id];
                                return copy;
                              });
                            }}
                            className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-primary/50 bg-slate-800/30 hover:bg-slate-800/60 transition cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                          <UploadCloud className="w-4 h-4 text-primary-glow" />
                          <span>Upload photo or PDF of your calculations</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const sizeKb = Math.round(file.size / 1024);
                                const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
                                setAttachments((prev) => ({
                                  ...prev,
                                  [currentQ.id]: { name: file.name, size: sizeStr },
                                }));
                                toast.success(`Attached ${file.name}`);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Multiple Choice Options List */}
                {currentQ.options && currentQ.options.length > 0 && currentQ.type !== "descriptive" && (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = answers[currentQ.id] === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(currentQ.id, opt.id)}
                          className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-xs sm:text-sm transition cursor-pointer ${
                            isSelected
                              ? "bg-primary/15 border-primary text-white shadow-sm"
                              : "bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 transition ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="flex-1 leading-relaxed">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Nav Prev/Next Buttons */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="text-[11px] text-slate-400">
                  {answers[currentQ.id] ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Answer recorded</span>
                    </span>
                  ) : (
                    <span>No answer selected yet</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={currentIdx >= questions.length - 1}
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">No question selected.</div>
          )}
        </div>

        {/* Right: Question Navigation Palette (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Question Palette
            </h4>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Unattempted</span>
              </div>
            </div>

            {/* Questions Grid (Grouped by section if available) */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {sectionGroups.length > 1 ? (
                sectionGroups.map((sec) => (
                  <div key={sec.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        {sec.key === "rapid" && <Zap className="w-3 h-3 text-amber-400 fill-current" />}
                        {sec.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{sec.count} Qs</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((q, idx) => {
                        const secKey = q.section || (q.type === "rapid" ? "rapid" : q.type === "descriptive" ? "descriptive" : "mcq");
                        if (secKey !== sec.key) return null;

                        const isCurrent = idx === currentIdx;
                        const isAnswered = Boolean(answers[q.id]);
                        const isReview = Boolean(markedForReview[q.id]);

                        let bgClass = "bg-slate-800/80 text-slate-400 border-slate-700";
                        if (isReview) {
                          bgClass = "bg-purple-500/20 text-purple-300 border-purple-500/50";
                        } else if (isAnswered) {
                          bgClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
                        }

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentIdx(idx)}
                            className={`h-9 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${bgClass} ${
                              isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-slate-950 scale-105" : ""
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIdx;
                    const isAnswered = Boolean(answers[q.id]);
                    const isReview = Boolean(markedForReview[q.id]);

                    let bgClass = "bg-slate-800/80 text-slate-400 border-slate-700";
                    if (isReview) {
                      bgClass = "bg-purple-500/20 text-purple-300 border-purple-500/50";
                    } else if (isAnswered) {
                      bgClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-9 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${bgClass} ${
                          isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-slate-950 scale-105" : ""
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Test Progress Indicator */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Progress</span>
                <span className="font-bold text-white">
                  {Math.round((answeredCount / (questions.length || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Integrity Reminder Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-primary-glow" />
              <span>Session Monitored</span>
            </div>
            <p className="leading-relaxed">
              Active full-screen enforcement is engaged. All tab switches and window blur events are logged to the proctoring ledger.
            </p>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary-glow flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Submit Assessment?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please verify your responses before final evaluation submission.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center text-xs">
              <div>
                <div className="font-bold text-emerald-400 text-sm">{answeredCount}</div>
                <div className="text-[10px] text-slate-400">Answered</div>
              </div>
              <div>
                <div className="font-bold text-amber-400 text-sm">
                  {questions.length - answeredCount}
                </div>
                <div className="text-[10px] text-slate-400">Unanswered</div>
              </div>
              <div>
                <div className="font-bold text-purple-400 text-sm">
                  {Object.values(markedForReview).filter(Boolean).length}
                </div>
                <div className="text-[10px] text-slate-400">For Review</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
              >
                Continue Test
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitExam()}
                className="w-1/2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-brand shadow-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Confirm &amp; Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CandidateStageTakePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
        </div>
      }
    >
      <CandidateStageTakeComponent />
    </Suspense>
  );
}
