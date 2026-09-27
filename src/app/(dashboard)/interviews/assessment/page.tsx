"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  ClipboardCheck,
  Code2,
  Server,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  RotateCcw,
  Check,
  CheckCircle2,
  Clock,
  Send,
  User,
  Bot,
  BarChart2,
  HelpCircle,
  Play,
  Copy,
  RefreshCw,
  Award,
  Terminal,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface AssessmentModeCard {
  id: string;
  title: string;
  description: string;
  icon: typeof Code2;
  iconBg: string;
  iconColor: string;
  badge: string;
  actionText: string;
  categoryTag: string;
  duration: string;
}

const ASSESSMENT_MODES: AssessmentModeCard[] = [
  {
    id: "technical-coding",
    title: "Technical Coding Assessment",
    description:
      "Algorithmic challenges, data structures, and code quality evaluation tailored to target tech stacks.",
    icon: Code2,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    badge: "Coding & Logic",
    actionText: "Start Assessment",
    categoryTag: "Algorithms & Logic",
    duration: "45 mins",
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    description:
      "Assess distributed systems, microservices, scalability, caching patterns, and database trade-offs.",
    icon: Server,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    badge: "Architecture",
    actionText: "Start Assessment",
    categoryTag: "System Architecture",
    duration: "40 mins",
  },
  {
    id: "behavioral-psychometric",
    title: "Behavioral & Situational Fit",
    description:
      "Scenario-driven situational questions evaluating leadership, teamwork, ownership, and workplace agility.",
    icon: BrainCircuit,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    badge: "STAR Method",
    actionText: "Start Assessment",
    categoryTag: "Behavioral & Culture",
    duration: "30 mins",
  },
  {
    id: "domain-knowledge",
    title: "Domain & Role-Specific Drill",
    description:
      "In-depth technical knowledge evaluation covering frameworks, API design, security, and cloud ecosystems.",
    icon: ShieldCheck,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    badge: "Specialized Drill",
    actionText: "Start Assessment",
    categoryTag: "Domain Expertise",
    duration: "35 mins",
  },
];

interface AssessmentQuestion {
  id: number;
  category: string;
  question: string;
  hint: string;
  codeSnippet?: string;
  expectedKeywords: string[];
}

const DEFAULT_ASSESSMENT_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  "technical-coding": [
    {
      id: 1,
      category: "Data Structures & Time Complexity",
      question:
        "Explain how you would optimize an LRU (Least Recently Used) cache with O(1) time complexity for both get() and put() operations. Which data structures would you combine and why?",
      hint: "Combine a Doubly Linked List for O(1) node additions/removals with a Hash Map for O(1) key lookup and pointer references.",
      codeSnippet: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.map = new Map(); // Hash Map + Doubly Linked nodes\n  }\n  get(key) { /* O(1) */ }\n  put(key, value) { /* O(1) */ }\n}`,
      expectedKeywords: ["Doubly Linked List", "Hash Map", "O(1)", "eviction", "pointers", "capacity"],
    },
    {
      id: 2,
      category: "Algorithmic Problem Solving",
      question:
        "Given a stream of real-time integer transactions, design an algorithm to compute the median value at any arbitrary point in time with minimum overhead.",
      hint: "Utilize two heaps: a Max-Heap for the lower half of numbers and a Min-Heap for the upper half, maintaining balance within 1 element.",
      codeSnippet: `// Two-Heap Strategy: Max-Heap (lower half) + Min-Heap (upper half)\nfunction addNum(num) { /* balance heaps */ }\nfunction findMedian() { /* return top or avg */ }`,
      expectedKeywords: ["two heaps", "max heap", "min heap", "O(log n)", "median", "balance"],
    },
    {
      id: 3,
      category: "Code Quality & Edge Cases",
      question:
        "What edge cases and defensive programming practices do you implement when parsing arbitrary JSON payloads in high-throughput API endpoints?",
      hint: "Consider recursive nesting limits, payload size limits, prototype pollution, schema validation with Zod/Yup, and memory overhead.",
      expectedKeywords: ["schema validation", "prototype pollution", "payload limits", "sanitization", "error boundaries"],
    },
  ],
  "system-design": [
    {
      id: 1,
      category: "Scalability & Distributed Storage",
      question:
        "Design a distributed rate limiter supporting 1,000,000 requests per second across multiple geographical regions. How do you handle clock drift, race conditions, and centralized state sync?",
      hint: "Discuss sliding window counter algorithms, Redis clusters with Lua scripts for atomic increments, and local memory tokens with background sync.",
      expectedKeywords: ["sliding window", "Token Bucket", "Redis", "Lua scripts", "eventual consistency", "rate limiting"],
    },
    {
      id: 2,
      category: "Data Consistency & Partitioning",
      question:
        "How would you architect database sharding and read-write replicas for an order management system experiencing 100x traffic spikes during flash sales?",
      hint: "Explain consistent hashing, shard key selection (e.g. customer_id vs order_id), replication lag mitigation, and write queues with Kafka.",
      expectedKeywords: ["consistent hashing", "shard key", "read replicas", "replication lag", "Kafka", "idempotency"],
    },
    {
      id: 3,
      category: "High Availability & Fault Tolerance",
      question:
        "What strategies ensure zero-downtime deployments and resilience against cascading microservice failures during regional outages?",
      hint: "Discuss blue-green/canary deployments, circuit breakers (Resilience4j/Envoy), exponential backoff with jitter, and dead letter queues.",
      expectedKeywords: ["circuit breaker", "canary deployment", "exponential backoff", "jitter", "dead letter queue"],
    },
  ],
  "behavioral-psychometric": [
    {
      id: 1,
      category: "Conflict Resolution & Technical Alignment",
      question:
        "Describe a situation where you strongly disagreed with a senior architect or engineering lead on a technical approach. How did you advocate your perspective while maintaining collaboration?",
      hint: "Use the STAR structure (Situation, Task, Action, Result). Highlight objective benchmarking, proof-of-concept tests, and shared product goals.",
      expectedKeywords: ["benchmarking", "POC", "data-driven", "active listening", "consensus", "user impact"],
    },
    {
      id: 2,
      category: "Ownership Under Ambiguity",
      question:
        "Tell me about a time you were assigned a mission-critical objective with vague requirements and tight deadlines. How did you clarify requirements and drive execution?",
      hint: "Detail stakeholder interviews, incremental milestones, risk assessments, and proactive communications.",
      expectedKeywords: ["milestones", "stakeholders", "prioritization", "risk mitigation", "iterative delivery"],
    },
    {
      id: 3,
      category: "Continuous Learning & Mentorship",
      question:
        "How do you stay ahead of rapid technology advancements, and how have you uplifted junior developers or team capabilities in your recent roles?",
      hint: "Give concrete examples of tech talks, code review standards, documentation, and adopting modern tooling.",
      expectedKeywords: ["mentorship", "code review", "knowledge sharing", "best practices", "documentation"],
    },
  ],
  "domain-knowledge": [
    {
      id: 1,
      category: "Framework Architecture & Rendering",
      question:
        "Explain the performance trade-offs between Server Components (RSC), Client-Side Hydration, and Static Site Generation (SSG) in enterprise web applications.",
      hint: "Discuss bundle size reduction, streaming SSR, TTFB (Time to First Byte), FCP, and interactive state management boundaries.",
      expectedKeywords: ["React Server Components", "hydration", "streaming", "TTFB", "bundle size", "FCP"],
    },
    {
      id: 2,
      category: "Security & Authentication",
      question:
        "What security mechanisms protect modern single-page applications and REST/GraphQL APIs against XSS, CSRF, and token theft?",
      hint: "Cover httpOnly SameSite cookies, CSP (Content Security Policy), JWT refresh token rotation, and CORS origin whitelisting.",
      expectedKeywords: ["httpOnly cookie", "CSRF", "SameSite", "CSP", "refresh token rotation", "CORS"],
    },
    {
      id: 3,
      category: "State Management & Reactivity",
      question:
        "How do you decide between global state stores (e.g. Zustand, Redux Toolkit) versus server-state caching layers (e.g. TanStack Query, SWR)?",
      hint: "Highlight separation of client UI state vs cached server state, automatic revalidation, deduplication, and optimistic updates.",
      expectedKeywords: ["server state", "client state", "revalidation", "optimistic updates", "caching", "deduplication"],
    },
  ],
};

interface ResponseRecord {
  id: string;
  questionId: number;
  questionText: string;
  userAnswer: string;
  timestamp: string;
  score: number;
  rubric: {
    technicalAccuracy: number;
    depthAndCompleteness: number;
    clarityAndStructure: number;
  };
  feedback: string;
  strengths: string;
  growthArea: string;
}

function AIMockAssessmentContent() {
  // Navigation & Page State (Page 1 = Setup, Page 2 = Assessment Session)
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedModeId, setSelectedModeId] = useState<string>("technical-coding");

  // Assessment Session State (Page 2)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Selected mode
  const selectedMode =
    ASSESSMENT_MODES.find((m) => m.id === selectedModeId) || ASSESSMENT_MODES[0];

  // Questions for chosen mode
  const questionsList =
    DEFAULT_ASSESSMENT_QUESTIONS[selectedModeId] ||
    DEFAULT_ASSESSMENT_QUESTIONS["technical-coding"];
  const currentQuestion = questionsList[currentQuestionIndex] || questionsList[0];

  // Timer effect for Page 2
  useEffect(() => {
    let interval: any = null;
    if (currentPage === 2 && !isCompleted) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPage, isCompleted]);

  // Format timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Start Assessment / Go to Next Page
  const handleNext = () => {
    if (!selectedModeId) {
      toast.error("Please select an assessment mode to continue.");
      return;
    }

    if (!jobDescription.trim()) {
      toast.info("Tip: Pasting a job description helps tailor the assessment to your target role.");
    }

    setCurrentPage(2);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setShowHint(false);
    setIsCompleted(false);
    toast.success(`Starting ${selectedMode.title}!`);
  };

  // Submit Answer in Assessment Session
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error("Please write your answer before submitting.");
      return;
    }

    setIsSubmitting(true);

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Score evaluation based on keywords & length
    const words = userAnswer.trim().split(/\s+/).length;
    const matchedKeywords = currentQuestion.expectedKeywords.filter((kw) =>
      userAnswer.toLowerCase().includes(kw.toLowerCase())
    );

    const baseScore = Math.min(
      96,
      Math.max(72, 75 + matchedKeywords.length * 4 + (words > 40 ? 5 : 0))
    );

    const record: ResponseRecord = {
      id: `resp-${Date.now()}`,
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      userAnswer: userAnswer.trim(),
      timestamp: nowTime,
      score: baseScore,
      rubric: {
        technicalAccuracy: Math.min(10, Math.round(baseScore / 10)),
        depthAndCompleteness: Math.min(10, Math.round((baseScore - 2) / 10)),
        clarityAndStructure: Math.min(10, Math.round((baseScore + 1) / 10)),
      },
      feedback:
        matchedKeywords.length >= 2
          ? `Strong technical depth with correct terminology (${matchedKeywords.join(", ")}).`
          : "Good fundamental explanation. Consider including specific architectural trade-offs and performance metrics.",
      strengths: "Structured rationale and clear conceptual foundation.",
      growthArea:
        "Elaborate more on production scale limits, error boundaries, and defensive checks.",
    };

    const nextIndex = currentQuestionIndex + 1;
    const isDone = nextIndex >= questionsList.length;

    setResponses((prev) => [...prev, record]);
    setUserAnswer("");
    setShowHint(false);

    if (isDone) {
      setIsCompleted(true);
      toast.success("Assessment completed! Review your detailed score report below.");
    } else {
      setCurrentQuestionIndex(nextIndex);
      toast.success(`Question ${currentQuestionIndex + 1} submitted! Moving to next question.`);
    }

    setIsSubmitting(false);
  };

  // Reset or restart
  const handleRestart = () => {
    setCurrentPage(1);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setShowHint(false);
    setIsCompleted(false);
    setResponses([]);
    setSessionSeconds(0);
  };

  // Sample JD loader for quick test
  const handleLoadSampleJD = () => {
    const sample = `Job Title: Senior Full-Stack Engineer / Technical Lead
Company: CloudScale AI Technologies
Location: Remote / Hybrid

Role Overview:
We are seeking an experienced Senior Full-Stack Engineer to lead the architecture and development of our next-generation AI analytics platform. You will be responsible for building high-throughput microservices, designing scalable REST/GraphQL APIs, and developing responsive frontend interfaces in Next.js and TypeScript.

Key Requirements:
- 5+ years of experience with TypeScript, React/Next.js, and Node.js or Python backend services.
- Solid understanding of distributed systems, database indexing, caching strategies (Redis), and event queues (Kafka/RabbitMQ).
- Strong experience with cloud infrastructure (AWS/GCP), Docker, and CI/CD pipelines.
- Proven track record of designing fault-tolerant systems handling 100k+ concurrent requests.
- Excellent communication skills and ability to mentor junior engineers.`;
    setJobDescription(sample);
    toast.success("Sample Job Description loaded!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* =========================================================================
          PAGE 1 — SETUP STEP (Job Description + Assessment Cards 50/50 Split)
         ========================================================================= */}
      {currentPage === 1 && (
        <div className="space-y-6">
          {/* Top Header Banner */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-semibold">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>AI Assessment Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              AI Mock Assessment
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-3xl leading-relaxed">
              Evaluate your technical competence, system design capabilities, and role readiness with realistic AI-scored assessments tailored to your target job description.
            </p>
          </div>

          {/* Main 50/50 Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* LEFT SECTION — JOB DESCRIPTION (50%) */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-glow" />
                    <h2 className="text-lg font-bold text-ink">Job Description</h2>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Paste the job description to personalize your assessment.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!jobDescription && (
                    <button
                      type="button"
                      onClick={handleLoadSampleJD}
                      className="text-[11px] font-semibold text-primary-glow hover:underline inline-flex items-center gap-1 p-1 rounded hover:bg-primary/5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Sample JD</span>
                    </button>
                  )}
                  {jobDescription && (
                    <button
                      type="button"
                      onClick={() => setJobDescription("")}
                      className="text-[11px] font-semibold text-ink-soft hover:text-rose-500 inline-flex items-center gap-1 p-1.5 rounded-lg hover:bg-surface-alt transition cursor-pointer"
                      title="Clear text"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Area: Large Textarea */}
              <div className="flex-1 flex flex-col min-h-[360px] sm:min-h-[420px]">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full flex-1 min-h-[340px] sm:min-h-[400px] p-4 text-xs sm:text-sm bg-surface-alt/40 border border-border/80 rounded-2xl text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-glow resize-none transition-all leading-relaxed scrollbar-thin scrollbar-thumb-border"
                />
              </div>

              {/* Bottom Status / Helper Text */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/70">
                <span className="text-[11px] text-ink-soft">
                  {jobDescription.trim().length > 0 ? (
                    <>
                      <strong className="text-ink font-semibold">
                        {jobDescription.trim().split(/\s+/).filter(Boolean).length}
                      </strong>{" "}
                      words •{" "}
                      <strong className="text-ink font-semibold">
                        {jobDescription.length}
                      </strong>{" "}
                      characters
                    </>
                  ) : (
                    "Ready for JD paste"
                  )}
                </span>

                {jobDescription.trim().length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>JD Ready</span>
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT SECTION — AI MOCK ASSESSMENT (50%) */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col space-y-4">
              {/* Header */}
              <div className="border-b border-border/70 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-glow" />
                  <h2 className="text-lg font-bold text-ink">AI Mock Assessment</h2>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Choose an assessment mode to practice for your target role.
                </p>
              </div>

              {/* 2-Column Assessment Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
                {ASSESSMENT_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedModeId === mode.id;

                  return (
                    <div
                      key={mode.id}
                      onClick={() => setSelectedModeId(mode.id)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between group ${
                        isSelected
                          ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-glow"
                          : "bg-surface-alt/30 border-border/80 hover:border-primary-glow/60 hover:bg-surface-alt/60 shadow-xs hover:shadow-sm"
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Icon & Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${mode.iconBg} ${mode.iconColor}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface border border-border text-ink-soft">
                              {mode.badge}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3
                            className={`text-sm font-bold transition-colors ${
                              isSelected ? "text-primary-glow" : "text-ink group-hover:text-primary-glow"
                            }`}
                          >
                            {mode.title}
                          </h3>
                          <p className="text-[11px] text-ink-soft mt-1 line-clamp-3 leading-relaxed">
                            {mode.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom: Duration & Action */}
                      <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[10px] text-ink-soft flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-ink-soft/70" />
                          {mode.duration}
                        </span>

                        <span
                          className={`text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                            isSelected ? "text-primary-glow" : "text-ink-soft group-hover:text-primary-glow"
                          }`}
                        >
                          {mode.actionText}
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Helper footnote on right */}
              <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] text-ink-soft">
                <span className="inline-flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Selected: <strong className="text-ink font-semibold">{selectedMode.title}</strong></span>
                </span>
                <span className="text-[10px] text-ink-soft/80">3 comprehensive questions</span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION — PROMINENT NEXT BUTTON */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-ink">
                  Ready to start your {selectedMode.title}?
                </h4>
                <p className="text-[11px] text-ink-soft">
                  Your job description and assessment selection will be preserved throughout the session.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-brand text-primary-foreground font-bold text-sm px-8 py-3 rounded-xl shadow-glow hover:scale-[1.02] active:scale-98 transition-all cursor-pointer shrink-0"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 2 — ASSESSMENT SIMULATION SESSION & EVALUATION
         ========================================================================= */}
      {currentPage === 2 && (
        <div className="space-y-6">
          {/* Top Session Header */}
          <div className="bg-surface border border-border rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="p-2 rounded-xl bg-surface-alt hover:bg-border/60 text-ink-soft hover:text-ink transition cursor-pointer"
                title="Back to Setup"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary-glow border border-primary/20">
                    {selectedMode.categoryTag}
                  </span>
                  <span className="text-xs text-ink-soft">•</span>
                  <span className="text-xs text-ink-soft flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {formatTime(sessionSeconds)}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-ink mt-0.5">
                  {selectedMode.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-medium text-ink-soft">
                Question {isCompleted ? questionsList.length : currentQuestionIndex + 1} of{" "}
                {questionsList.length}
              </span>
              <button
                type="button"
                onClick={handleRestart}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Assessment</span>
              </button>
            </div>
          </div>

          {/* Active Question or Results */}
          {!isCompleted ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Question & Answer Panel (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                {/* Question Card */}
                <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-glow px-2.5 py-0.5 rounded-md bg-primary/5 border border-primary/20">
                      {currentQuestion.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs text-ink-soft hover:text-primary-glow font-medium inline-flex items-center gap-1 cursor-pointer transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                    </button>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-ink leading-snug">
                    {currentQuestion.question}
                  </h2>

                  {showHint && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-ink leading-relaxed animate-fade-in">
                      <strong className="text-amber-700 font-semibold block mb-0.5">Evaluation Hint:</strong>
                      {currentQuestion.hint}
                    </div>
                  )}

                  {currentQuestion.codeSnippet && (
                    <div className="rounded-xl bg-[#0f172a] p-4 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] mb-2 pb-1 border-b border-slate-800">
                        <span className="inline-flex items-center gap-1">
                          <Terminal className="w-3 h-3" />
                          Code Reference
                        </span>
                      </div>
                      <pre className="whitespace-pre">{currentQuestion.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* User Response Textarea */}
                <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">
                      Your Solution / Answer
                    </label>
                    <span className="text-[11px] text-ink-soft">
                      {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>

                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Write your comprehensive technical explanation, architecture strategy, or code logic here..."
                    className="w-full min-h-[220px] p-4 text-xs sm:text-sm bg-surface-alt/40 border border-border/80 rounded-2xl text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-glow resize-none transition-all leading-relaxed scrollbar-thin"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-ink-soft">
                      Evaluated on accuracy, structure, and depth.
                    </span>

                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !userAnswer.trim()}
                      className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <span>Submit Answer</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Context & Job Description Preview (1 Col) */}
              <div className="space-y-4">
                {/* Preserved JD Summary */}
                <div className="bg-surface border border-border rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-glow" />
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                        Preserved Job Context
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      className="text-[11px] text-primary-glow hover:underline font-semibold cursor-pointer"
                    >
                      Edit JD
                    </button>
                  </div>

                  {jobDescription ? (
                    <div className="max-h-[220px] overflow-y-auto pr-1 text-xs text-ink-soft leading-relaxed scrollbar-thin whitespace-pre-line bg-surface-alt/30 p-3 rounded-xl border border-border/60">
                      {jobDescription}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-surface-alt/30 border border-dashed border-border text-center text-xs text-ink-soft">
                      No JD pasted. Assessment using standardized {selectedMode.categoryTag} benchmark.
                    </div>
                  )}
                </div>

                {/* Rubric Criteria */}
                <div className="bg-surface border border-border rounded-3xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-border/70 pb-2 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary-glow" />
                    Evaluation Dimensions
                  </h3>
                  <ul className="space-y-2 text-xs text-ink-soft">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-glow shrink-0 mt-0.5" />
                      <span><strong>Technical Precision:</strong> Domain correctness and syntax accuracy.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-glow shrink-0 mt-0.5" />
                      <span><strong>System Scalability:</strong> Edge case handling and bottleneck analysis.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-glow shrink-0 mt-0.5" />
                      <span><strong>STAR Clarity:</strong> Structured explanation of actions and metrics.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Completed Assessment Results Report */
            <div className="space-y-6 animate-fade-in">
              {/* Score Banner */}
              <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-ink">
                    Assessment Completed!
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-soft max-w-xl mx-auto mt-1">
                    Your answers for <strong>{selectedMode.title}</strong> have been evaluated against industry benchmarks.
                  </p>
                </div>

                <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-surface-alt border border-border">
                  <div>
                    <div className="text-3xl font-extrabold text-primary-glow">
                      {Math.round(
                        responses.reduce((acc, r) => acc + r.score, 0) /
                          (responses.length || 1)
                      )}
                      %
                    </div>
                    <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                      Overall Score
                    </div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <div className="text-3xl font-extrabold text-emerald-600">
                      {formatTime(sessionSeconds)}
                    </div>
                    <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                      Duration
                    </div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <div className="text-3xl font-extrabold text-ink">
                      {responses.length} / {questionsList.length}
                    </div>
                    <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                      Completed
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Take Another Assessment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className="inline-flex items-center gap-2 bg-surface-alt border border-border text-ink font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl hover:bg-border/60 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Setup</span>
                  </button>
                </div>
              </div>

              {/* Question-by-Question Detailed Feedback */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary-glow" />
                  <span>Question-by-Question Evaluation & STAR Rubric</span>
                </h3>

                <div className="space-y-4">
                  {responses.map((resp, idx) => (
                    <div
                      key={resp.id}
                      className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-primary-glow px-2 py-0.5 rounded bg-primary/10">
                            Question {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-ink mt-1">
                            {resp.questionText}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-extrabold text-primary-glow">
                            {resp.score}%
                          </span>
                          <span className="block text-[10px] text-ink-soft">Score</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-ink font-semibold block text-[11px] mb-1">
                            Your Submitted Answer:
                          </strong>
                          <div className="bg-surface-alt/40 p-3 rounded-xl border border-border/60 text-ink-soft leading-relaxed">
                            {resp.userAnswer}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <div className="bg-surface-alt p-2.5 rounded-xl border border-border/60 text-center">
                            <span className="text-[10px] text-ink-soft block font-medium">Technical Accuracy</span>
                            <span className="text-sm font-bold text-ink">{resp.rubric.technicalAccuracy}/10</span>
                          </div>
                          <div className="bg-surface-alt p-2.5 rounded-xl border border-border/60 text-center">
                            <span className="text-[10px] text-ink-soft block font-medium">Depth & Completeness</span>
                            <span className="text-sm font-bold text-ink">{resp.rubric.depthAndCompleteness}/10</span>
                          </div>
                          <div className="bg-surface-alt p-2.5 rounded-xl border border-border/60 text-center">
                            <span className="text-[10px] text-ink-soft block font-medium">Clarity & Structure</span>
                            <span className="text-sm font-bold text-ink">{resp.rubric.clarityAndStructure}/10</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-primary-glow font-bold text-[11px]">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Feedback & Strengths</span>
                          </div>
                          <p className="text-ink-soft leading-relaxed">{resp.feedback}</p>
                          <p className="text-ink-soft/90 text-[11px] leading-relaxed pt-1">
                            <strong className="text-ink font-semibold">Growth Opportunity:</strong> {resp.growthArea}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-ink-soft">
          Loading AI Mock Assessment...
        </div>
      }
    >
      <AIMockAssessmentContent />
    </Suspense>
  );
}
