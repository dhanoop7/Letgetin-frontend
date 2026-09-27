"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Video,
  Sparkles,
  Mic,
  MicOff,
  Clock,
  Target,
  Award,
  Layers,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  RotateCcw,
  Volume2,
  VolumeX,
  Send,
  User,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  XCircle,
  X,
  CheckCircle,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

interface InterviewModeCard {
  id: string;
  title: string;
  description: string;
  icon: typeof Mic;
  iconBg: string;
  iconColor: string;
  badge?: string;
  actionText: string;
  categoryTag: string;
}

const INTERVIEW_MODES: InterviewModeCard[] = [
  {
    id: "simulated-manager",
    title: "Simulated Hiring Manager Interview",
    description:
      "Practice a realistic hiring-manager style interview with follow-up probing and behavioral evaluation.",
    icon: Video,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    badge: "Full Session",
    actionText: "Launch Simulation",
    categoryTag: "Hiring Manager Simulation",
  },
  {
    id: "custom-scenario",
    title: "Custom Scenario Setup",
    description:
      "Configure a customized interview scenario with tailored role seniority, demeanor, and technical scope.",
    icon: Target,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    badge: "Customizable",
    actionText: "Configure Setup",
    categoryTag: "Custom Scenario",
  },
  {
    id: "voice-ai",
    title: "Voice AI Practice",
    description:
      "Real-time interactive voice-based interview practice evaluating speech clarity, pacing, and keyword relevance.",
    icon: Mic,
    iconBg: "bg-primary/10",
    iconColor: "text-primary-glow",
    badge: "Voice AI",
    actionText: "Start Practice",
    categoryTag: "Voice AI Practice",
  },
  {
    id: "technical-coding",
    title: "Technical & Coding Rounds",
    description:
      "Technical and coding interview practice with domain-specific question banks and difficulty scaling.",
    icon: Layers,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    badge: "Adaptive",
    actionText: "Explore Drills",
    categoryTag: "Technical & Architecture",
  },
  {
    id: "instant-scoring",
    title: "Instant AI Scoring & STAR Feedback",
    description:
      "AI-powered evaluation and STAR-based feedback reports with structured recommendations.",
    icon: BarChart2,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    badge: "Analytics",
    actionText: "View Feedback",
    categoryTag: "STAR Evaluation",
  },
  {
    id: "mockup-interview",
    title: "Mockup Interview",
    description:
      "Comprehensive mockup interview testing end-to-end readiness, domain mastery, and communication.",
    icon: Award,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600",
    badge: "360° Mock",
    actionText: "Start Mockup",
    categoryTag: "Full Mock Session",
  },
];

interface QuestionData {
  id: number;
  category: string;
  question: string;
  hint: string;
  correctAnswer: string;
  expectedKeywords: string[];
}

const DEFAULT_QUESTIONS: Record<string, QuestionData[]> = {
  "simulated-manager": [
    {
      id: 1,
      category: "Leadership & Impact",
      question:
        "What is the core structure of the STAR method for answering behavioral interview questions, and what should be emphasized in the Result component?",
      hint: "Explain Situation, Task, Action, and Result. Highlight measurable outcomes and business impact.",
      correctAnswer:
        "The STAR method structures behavioral responses into Situation (context and challenge), Task (your specific role and goal), Action (concrete steps, technical choices, and leadership you executed), and Result (quantifiable business outcomes, metrics improved, and key lessons learned).",
      expectedKeywords: [
        "situation",
        "task",
        "action",
        "result",
        "quantifiable",
        "measurable",
        "metrics",
        "impact",
        "outcome",
      ],
    },
    {
      id: 2,
      category: "Conflict Resolution",
      question:
        "Describe how you resolve a significant architectural disagreement with another senior developer or technical lead.",
      hint: "Focus on data-driven discussion, active listening, proof-of-concepts (POCs), and aligning with user and business needs.",
      correctAnswer:
        "Resolve technical disagreements by facilitating a data-driven evaluation of architectural trade-offs, building lightweight proof-of-concepts (POCs) to benchmark assumptions, actively listening to alternative viewpoints, and anchoring decisions directly to business requirements and user impact.",
      expectedKeywords: [
        "trade-offs",
        "data",
        "poc",
        "proof of concept",
        "consensus",
        "alignment",
        "listening",
        "benchmarking",
      ],
    },
    {
      id: 3,
      category: "Handling Ambiguity",
      question:
        "How do you prioritize deliverables when business requirements change rapidly with incomplete information?",
      hint: "Explain your framework for assessing urgency vs impact, iterative MVP delivery, and stakeholder communication.",
      correctAnswer:
        "Assess urgency versus impact using an impact-effort matrix, break requirements down into small iterative MVPs with fast feedback loops, document and validate core assumptions with data, and maintain transparent, proactive communication with stakeholders.",
      expectedKeywords: [
        "prioritization",
        "mvp",
        "impact",
        "iterations",
        "feedback loops",
        "assumptions",
        "stakeholders",
        "communication",
      ],
    },
    {
      id: 4,
      category: "Team Accountability",
      question:
        "How do you address a situation where a key project milestone is at risk of missing its scheduled delivery deadline?",
      hint: "Discuss root cause triage, transparent escalation, scope negotiation, and proactive risk mitigation.",
      correctAnswer:
        "Immediately perform root-cause triage to identify critical blockers, communicate transparently with stakeholders without delay, negotiate non-essential scope reductions while protecting the core release milestone, and reallocate resources to unblock the critical path.",
      expectedKeywords: [
        "blockers",
        "triage",
        "stakeholders",
        "scope",
        "milestone",
        "communication",
        "risk mitigation",
        "critical path",
      ],
    },
  ],
  "custom-scenario": [
    {
      id: 1,
      category: "Role Customization",
      question:
        "When designing a resilient microservices architecture, what strategy prevents cascading failures when a downstream dependency goes down?",
      hint: "Discuss circuit breakers, fallback responses, timeouts, and asynchronous decoupling.",
      correctAnswer:
        "Prevent cascading failures by implementing Circuit Breakers (such as Resilience4j or Envoy) with configurable error thresholds, strict request timeouts, cached fallback responses, and decoupling synchronous calls with message queues (e.g., Kafka or RabbitMQ).",
      expectedKeywords: [
        "circuit breaker",
        "timeout",
        "fallback",
        "decoupling",
        "queue",
        "kafka",
        "resilience",
        "cascading",
      ],
    },
    {
      id: 2,
      category: "Seniority Scoping",
      question:
        "In an event-driven system, what mechanism guarantees that duplicate messages are not processed multiple times by consumer workers?",
      hint: "Explain idempotency keys, deduplication tables, transactional outbox, and atomic database constraints.",
      correctAnswer:
        "Guarantee exact-once processing semantics through idempotent consumers utilizing unique idempotency keys, an atomic deduplication cache/table (e.g., Redis or SQL unique constraint), and the transactional outbox pattern to ensure message state consistency.",
      expectedKeywords: [
        "idempotency",
        "idempotent",
        "deduplication",
        "outbox",
        "redis",
        "unique key",
        "atomic",
        "transactional",
      ],
    },
    {
      id: 3,
      category: "Technical Scope",
      question:
        "What architectural trade-offs should be weighed between synchronous gRPC communication and asynchronous event-driven messaging?",
      hint: "Contrast latency, coupling, backpressure, complex distributed state, and immediate consistency vs eventual consistency.",
      correctAnswer:
        "Synchronous gRPC provides low-latency binary serialization, strong type safety, and immediate consistency, but introduces temporal coupling and cascading latency. Asynchronous messaging provides high throughput, backpressure buffering, and loose coupling, but requires managing eventual consistency and distributed saga workflows.",
      expectedKeywords: [
        "grpc",
        "latency",
        "coupling",
        "eventual consistency",
        "throughput",
        "backpressure",
        "stateless",
        "asynchronous",
      ],
    },
  ],
  "voice-ai": [
    {
      id: 1,
      category: "Introduction & Core Pitch",
      question:
        "Walk me through your background and the most impactful technical project or system you have architected recently.",
      hint: "Keep your pace steady, articulate key technologies clearly, and state quantifiable outcomes (e.g., % latency reduction or scale).",
      correctAnswer:
        "An impactful elevator pitch concisely outlines your role, the business challenge, the technical architecture implemented (such as microservices, React/Next.js, or cloud infrastructure), and highlights quantifiable results such as reduced latency by 40% or scaled traffic to 100k daily users.",
      expectedKeywords: [
        "architecture",
        "scale",
        "performance",
        "latency",
        "metrics",
        "impact",
        "technologies",
        "ownership",
      ],
    },
    {
      id: 2,
      category: "Problem Solving Under Pressure",
      question:
        "Describe your step-by-step triage and root cause analysis (RCA) process when handling a critical P0 production outage.",
      hint: "Detail alerting, immediate blast-radius mitigation (rollbacks/traffic draining), debugging logs/metrics, and postmortem action items.",
      correctAnswer:
        "First mitigate user impact immediately via rollback or traffic draining. Next, analyze logs, distributed traces, and APM metrics to isolate the root cause. Once stabilized, document the timeline, conduct a blameless postmortem, and implement automated regression tests and alerting guards.",
      expectedKeywords: [
        "rollback",
        "mitigation",
        "root cause",
        "postmortem",
        "logs",
        "traces",
        "metrics",
        "alerting",
        "apm",
      ],
    },
    {
      id: 3,
      category: "Communication & Stakeholder Empathy",
      question:
        "How do you explain the necessity of addressing technical debt to non-technical product managers and executives?",
      hint: "Frame tech debt in terms of business velocity, feature delivery risk, uptime reliability, and total cost of ownership (TCO).",
      correctAnswer:
        "Explain technical debt in terms of business impact: illustrating how unaddressed tech debt slows down new feature delivery velocity, increases incident frequency, degrades customer experience, and drives up cloud infrastructure costs.",
      expectedKeywords: [
        "business velocity",
        "feature delivery",
        "reliability",
        "cost",
        "risk",
        "customer experience",
        "roi",
      ],
    },
  ],
  "technical-coding": [
    {
      id: 1,
      category: "API Design & Protocols",
      question:
        "What is the primary purpose of a REST API, and what are its key architectural constraints?",
      hint: "Mention client-server separation, statelessness, cacheability, uniform interface, and HTTP methods.",
      correctAnswer:
        "A REST API provides a standardized, stateless client-server communication interface over HTTP. Key constraints include stateless interactions (no client context stored on server), uniform interface (standard HTTP verbs like GET, POST, PUT, DELETE), resource URIs, and cacheable response representations.",
      expectedKeywords: [
        "stateless",
        "client-server",
        "http",
        "resource",
        "cacheable",
        "uniform interface",
        "get",
        "post",
        "rest",
      ],
    },
    {
      id: 2,
      category: "Distributed Caching",
      question:
        "How does the Cache-Aside (Lazy Loading) pattern work, and how does it handle cache misses and database updates?",
      hint: "Explain how the application queries cache first, reads DB on miss, populates cache, and invalidates cache on writes.",
      correctAnswer:
        "In Cache-Aside, the application queries the cache first. On a cache miss, it reads from the primary database, populates the cached entry for subsequent requests, and returns the data. On database writes/updates, the application updates the DB and immediately invalidates or refreshes the corresponding cache key.",
      expectedKeywords: [
        "cache miss",
        "database",
        "invalidation",
        "lazy loading",
        "cache-aside",
        "write",
        "read",
        "redis",
      ],
    },
    {
      id: 3,
      category: "Data Consistency",
      question:
        "What is the Saga pattern in microservices, and how does it maintain data consistency across distributed services without 2PC?",
      hint: "Discuss local transactions, orchestration vs choreography, and compensating transactions on failure.",
      correctAnswer:
        "The Saga pattern coordinates a sequence of local transactions across microservices. Each service executes its local transaction and publishes an event. If a step fails, the Saga executes compensating transactions in reverse order to undo the previously committed changes, maintaining eventual consistency.",
      expectedKeywords: [
        "saga",
        "compensating",
        "eventual consistency",
        "orchestration",
        "choreography",
        "local transactions",
        "rollback",
      ],
    },
    {
      id: 4,
      category: "Database Performance",
      question:
        "What is the difference between Clustered and Non-Clustered indexes in relational databases like PostgreSQL or MySQL?",
      hint: "Explain physical row ordering on disk versus separate B-tree pointer structures.",
      correctAnswer:
        "A Clustered index defines the physical order of data rows on disk (only one clustered index per table, typically the Primary Key). A Non-Clustered index is a separate B-tree structure containing index keys and row pointers (or primary keys) that point to the actual physical data locations.",
      expectedKeywords: [
        "clustered",
        "non-clustered",
        "physical order",
        "b-tree",
        "primary key",
        "pointers",
        "disk",
        "index",
      ],
    },
  ],
  "instant-scoring": [
    {
      id: 1,
      category: "STAR Methodology Evaluation",
      question:
        "In automated AI interview evaluation, what distinguishes the 'Action' rubric from the 'Task' rubric?",
      hint: "Task is the assigned goal/problem, while Action covers the specific technical steps and decisions executed by the candidate.",
      correctAnswer:
        "The 'Task' rubric evaluates the candidate's articulation of the specific goal, technical challenge, or responsibility assigned. The 'Action' rubric evaluates the individual's specific technical contributions, problem-solving methods, tools used, and leadership decisions executed.",
      expectedKeywords: [
        "task",
        "action",
        "goal",
        "execution",
        "responsibility",
        "decisions",
        "contributions",
        "problem-solving",
      ],
    },
    {
      id: 2,
      category: "Depth & Metric Quantification",
      question:
        "Why is metric quantification essential in technical and behavioral interview responses?",
      hint: "Discuss tangible business impact, verifiable outcomes, latency/cost improvements, and credibility.",
      correctAnswer:
        "Metric quantification provides concrete, verifiable evidence of impact (e.g., 'reduced API p99 latency from 350ms to 45ms' or 'saved $20k monthly in cloud costs'). It demonstrates business awareness, outcome ownership, and elevates answers from theoretical to high-performing.",
      expectedKeywords: [
        "quantifiable",
        "metrics",
        "impact",
        "latency",
        "cost",
        "evidence",
        "credibility",
        "outcomes",
      ],
    },
    {
      id: 3,
      category: "Technical Trade-Off Analysis",
      question:
        "How should an engineer structure an answer when asked to compare SQL vs NoSQL database solutions?",
      hint: "Compare ACID consistency, schema flexibility, horizontal scaling, query complexity, and specific workload requirements.",
      correctAnswer:
        "Structure the comparison across clear dimensions: ACID transactions and complex joins (SQL strength) vs flexible schemaless documents and horizontal partitioning at scale (NoSQL strength), concluding with a concrete workload recommendation based on read/write patterns and consistency requirements.",
      expectedKeywords: [
        "acid",
        "schema",
        "horizontal scaling",
        "joins",
        "consistency",
        "nosql",
        "sql",
        "trade-offs",
      ],
    },
  ],
  "mockup-interview": [
    {
      id: 1,
      category: "System Design & Architecture",
      question:
        "How would you design a distributed URL shortener service (like Bitly) capable of generating 100M unique URLs per month?",
      hint: "Discuss Base62 encoding, unique ID generation (Snowflake/counter), caching, database sharding, and redirection performance.",
      correctAnswer:
        "Use a distributed ID generator (e.g., Snowflake or Redis pre-allocated counter ranges) converted via Base62 encoding to generate 7-character hashes. Store mappings in a distributed key-value store (Cassandra or DynamoDB), cache popular hot URLs in Redis, and serve 301/302 redirects via geographically distributed edge CDNs.",
      expectedKeywords: [
        "base62",
        "encoding",
        "snowflake",
        "redis",
        "caching",
        "redirect",
        "sharding",
        "hash",
        "distributed",
      ],
    },
    {
      id: 2,
      category: "High-Volume Rate Limiting",
      question:
        "Explain how the Token Bucket rate-limiting algorithm operates and how Redis is leveraged to enforce API limits in real time.",
      hint: "Explain token refill rates, capacity bursts, token consumption per request, and atomic Lua script execution.",
      correctAnswer:
        "The Token Bucket algorithm adds tokens to a bucket at a constant refill rate up to a max burst capacity. Each request consumes one token; if empty, requests are throttled with 429 Too Many Requests. In Redis, atomic Lua scripts calculate elapsed time and update token counts to prevent race conditions across distributed servers.",
      expectedKeywords: [
        "token bucket",
        "redis",
        "refill rate",
        "burst",
        "capacity",
        "lua script",
        "throttling",
        "atomic",
      ],
    },
    {
      id: 3,
      category: "Zero-Downtime Deployment",
      question:
        "What is the Expand-and-Contract (Parallel Run) pattern for performing database schema migrations with zero downtime?",
      hint: "Explain adding new nullable columns, dual-writing, backfilling historical data, switching reads, and dropping deprecated columns.",
      correctAnswer:
        "First expand the database schema with new nullable columns or tables; update application code to dual-write to both old and new schemas; run background jobs to backfill historical data; switch application reads to the new schema; and finally contract by removing writes to the old columns and dropping deprecated fields.",
      expectedKeywords: [
        "expand and contract",
        "dual write",
        "backfill",
        "zero downtime",
        "migration",
        "schema",
        "nullable",
      ],
    },
  ],
};

interface TranscriptEntry {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  isCorrect?: boolean;
  feedback?: {
    score: number;
    starMatch: string;
    strengths: string;
    tip: string;
  };
}

interface QuestionResult {
  isCorrect: boolean;
  userAnswer: string;
  scoreAwarded: number;
  timestamp: string;
}

interface EvaluationModalState {
  isOpen: boolean;
  isCorrect: boolean;
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  matchedKeywords: string[];
  isFinalQuestion: boolean;
}

function AIInterviewPracticeContent() {
  const router = useRouter();

  // Navigation & Page State (1 = 6-card selection view, 2 = inner interview view)
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedModeId, setSelectedModeId] = useState<string>("simulated-manager");

  // Interview Session State (PAGE 2)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Score & Evaluation State
  const [score, setScore] = useState(0);
  const [questionResults, setQuestionResults] = useState<Record<number, QuestionResult>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Modal State for instant submission feedback
  const [modalState, setModalState] = useState<EvaluationModalState | null>(null);

  // Transcript Feed
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Selected mode metadata
  const selectedMode =
    INTERVIEW_MODES.find((m) => m.id === selectedModeId) || INTERVIEW_MODES[0];

  // Questions for chosen mode
  const questionsList: QuestionData[] =
    DEFAULT_QUESTIONS[selectedModeId] || DEFAULT_QUESTIONS["simulated-manager"];
  const currentQuestion = questionsList[currentQuestionIndex] || questionsList[0];

  // Answered questions count
  const answeredCount = Object.keys(questionResults).length;

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

  // Scroll transcript to bottom on updates
  useEffect(() => {
    if (currentPage === 2) {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, currentPage]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setUserAnswer((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${currentTranscript}` : currentTranscript;
          });
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Format timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Toggle Voice Recording
  const handleToggleRecording = () => {
    if (!speechSupported) {
      toast.info("Microphone input is active. You can type or use browser voice dictation.");
      setIsRecording(!isRecording);
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsRecording(false);
      toast.success("Voice recording paused.");
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        toast.success("Listening... Speak your answer clearly.");
      } catch (e) {
        setIsRecording(true);
      }
    }
  };

  // TTS Speak question aloud
  const handleToggleSpeakQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingQuestion(true);
    }
  };

  // Navigate back to AI Interview Buddy 6-card selection page
  const handleReturnToModes = () => {
    setCurrentPage(1);
    router.push("/interviews/ai-practice");
  };

  // Start interview with selected mode
  const handleStartInterview = (modeId?: string) => {
    const targetModeId = modeId || selectedModeId;
    setSelectedModeId(targetModeId);

    const targetQuestions =
      DEFAULT_QUESTIONS[targetModeId] || DEFAULT_QUESTIONS["simulated-manager"];
    const targetMode =
      INTERVIEW_MODES.find((m) => m.id === targetModeId) || INTERVIEW_MODES[0];

    setCurrentPage(2);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setIsRecording(false);
    setScore(0);
    setQuestionResults({});
    setIsCompleted(false);
    setSessionSeconds(0);
    setModalState(null);

    // Initial welcome in transcript
    const initialWelcome: TranscriptEntry = {
      id: `ai-init-${Date.now()}`,
      sender: "ai",
      text: `Welcome to your ${targetMode.title}. I have reviewed your target role expectations and prepared ${targetQuestions.length} tailored questions. Let's begin with Question 1: "${targetQuestions[0].question}"`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTranscript([initialWelcome]);
    toast.success(`Starting ${targetMode.title}!`);
  };

  // Restart current session
  const handleRestart = () => {
    handleStartInterview(selectedModeId);
  };

  // Evaluate Answer Function
  const evaluateAnswer = (
    text: string,
    question: QuestionData
  ): { isCorrect: boolean; matchedKeywords: string[]; accuracyScore: number } => {
    const cleanedText = text.toLowerCase();
    const words = text.trim().split(/\s+/).filter(Boolean);

    // Find matched expected keywords
    const matchedKeywords = question.expectedKeywords.filter((kw) =>
      cleanedText.includes(kw.toLowerCase())
    );

    // Check concept overlap
    const minRequiredKeywords = Math.min(2, Math.max(1, Math.floor(question.expectedKeywords.length * 0.25)));
    const hasSufficientKeywords = matchedKeywords.length >= minRequiredKeywords;
    const hasSufficientLength = words.length >= 8;

    // Evaluate correctness
    const isCorrect = hasSufficientKeywords && hasSufficientLength;
    const accuracyScore = isCorrect
      ? Math.min(98, 80 + matchedKeywords.length * 4)
      : Math.max(25, matchedKeywords.length * 15 + Math.min(20, words.length * 2));

    return { isCorrect, matchedKeywords, accuracyScore };
  };

  // Submit Answer & Evaluate on Page 2
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast.info("Please provide an answer before submitting.");
      return;
    }

    // Check if question was already submitted to prevent duplicate scoring
    if (questionResults[currentQuestion.id]) {
      toast.info("You have already submitted an answer for this question.");
      return;
    }

    setIsSubmittingAnswer(true);

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
    }

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const { isCorrect, matchedKeywords, accuracyScore } = evaluateAnswer(
      userAnswer,
      currentQuestion
    );

    // Update Score: only increment if correct and question not already recorded
    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }

    // Record question result
    setQuestionResults((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        isCorrect,
        userAnswer: userAnswer.trim(),
        scoreAwarded: isCorrect ? 1 : 0,
        timestamp: nowTime,
      },
    }));

    // Add User Answer to Transcript
    const userEntry: TranscriptEntry = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userAnswer.trim(),
      timestamp: nowTime,
      isCorrect,
      feedback: {
        score: accuracyScore,
        starMatch: isCorrect ? "Strong Concept Alignment" : "Partial Concept Coverage",
        strengths: isCorrect
          ? `Accurately identified key principles (${matchedKeywords.slice(0, 3).join(", ")}).`
          : "Initial attempt recorded. Review the expected technical answer below.",
        tip: isCorrect
          ? "Great explanation! Continue providing quantifiable examples and architectural specifics."
          : `Expected key concepts: ${currentQuestion.expectedKeywords.slice(0, 4).join(", ")}.`,
      },
    };

    // AI Follow-up in Transcript
    const aiFeedbackEntry: TranscriptEntry = {
      id: `ai-eval-${Date.now()}`,
      sender: "ai",
      text: isCorrect
        ? `✓ Correct Answer! Excellent analysis. Your score is now ${newScore} / ${questionsList.length}.`
        : `✕ Incorrect Answer. The correct expected answer is: "${currentQuestion.correctAnswer}"`,
      timestamp: nowTime,
    };

    setTranscript((prev) => [...prev, userEntry, aiFeedbackEntry]);

    const isFinalQuestion = currentQuestionIndex + 1 >= questionsList.length;

    // Open the evaluation popup modal with the result & correct answer
    setModalState({
      isOpen: true,
      isCorrect,
      questionNumber: currentQuestionIndex + 1,
      totalQuestions: questionsList.length,
      questionText: currentQuestion.question,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentQuestion.correctAnswer,
      matchedKeywords,
      isFinalQuestion,
    });

    if (isCorrect) {
      toast.success("✓ Correct Answer! Score increased.");
    } else {
      toast.error("✕ Incorrect Answer. Review the correct response.");
    }

    setIsSubmittingAnswer(false);
  };

  // Close modal and proceed to next question
  const handleModalContinue = () => {
    if (!modalState) return;

    const nextIndex = currentQuestionIndex + 1;
    const isDone = nextIndex >= questionsList.length;

    setModalState(null);
    setUserAnswer("");

    if (isDone) {
      setIsCompleted(true);
      toast.success("Interview session completed! Review your final score report.");
    } else {
      setCurrentQuestionIndex(nextIndex);
      const nextQ = questionsList[nextIndex];
      const existing = questionResults[nextQ.id];
      if (existing) {
        setUserAnswer(existing.userAnswer);
      }
    }
  };

  // Copy full transcript text
  const handleCopyTranscript = () => {
    const fullText = transcript
      .map(
        (t) =>
          `[${t.timestamp}] ${t.sender === "ai" ? "AI Interviewer" : "You"}:\n${t.text}\n`
      )
      .join("\n");

    navigator.clipboard.writeText(fullText);
    setCopiedTranscript(true);
    toast.success("Transcript copied to clipboard!");
    setTimeout(() => setCopiedTranscript(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* =========================================================================
          PAGE 1 — SETUP STEP (Job Description + Interview Modes 50/50 Split)
         ========================================================================= */}
      {currentPage === 1 && (
        <div className="space-y-6">
          {/* Top Header Banner */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Interview Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              AI Interview Practice
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-3xl leading-relaxed">
              Sharpen your answers with real-time AI voice evaluation, customized question banks, and realistic hiring manager simulations tailored to your target role.
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
                    Paste the job description to personalize your interview questions, seniority level, and evaluation criteria.
                  </p>
                </div>

                {jobDescription && (
                  <button
                    type="button"
                    onClick={() => setJobDescription("")}
                    className="text-[11px] font-semibold text-ink-soft hover:text-rose-500 inline-flex items-center gap-1 shrink-0 p-1.5 rounded-lg hover:bg-surface-alt transition cursor-pointer"
                    title="Clear text"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>

              {/* Main Area: Textarea */}
              <div className="flex-1 flex flex-col min-h-[360px] sm:min-h-[420px]">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full flex-1 min-h-[340px] sm:min-h-[400px] p-4 text-xs sm:text-sm bg-surface-alt/40 border border-border/80 rounded-2xl text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-glow resize-none transition-all leading-relaxed scrollbar-thin scrollbar-thumb-border"
                />
              </div>

              {/* Bottom Bar: Character info & Next Button */}
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

                <button
                  type="button"
                  onClick={() => handleStartInterview()}
                  className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* RIGHT SECTION — INTERVIEW MODES (50%) */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col space-y-4">
              {/* Header */}
              <div className="border-b border-border/70 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-glow" />
                  <h2 className="text-lg font-bold text-ink">Interview Modes</h2>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Choose an interview mode to practice for your target role.
                </p>
              </div>

              {/* 2-Column Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
                {INTERVIEW_MODES.map((mode) => {
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
                            className={`w-9 h-9 rounded-xl ${mode.iconBg} ${mode.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {mode.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border/70 text-ink-soft">
                              {mode.badge}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-xs font-bold text-ink group-hover:text-primary-glow transition-colors line-clamp-2">
                            {mode.title}
                          </h3>
                          <p className="text-[11px] text-ink-soft mt-1 line-clamp-3 leading-relaxed">
                            {mode.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Link / Bottom */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartInterview(mode.id);
                        }}
                        className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-[11px]"
                      >
                        <span className="font-semibold text-primary-glow group-hover:underline flex items-center gap-1">
                          {mode.actionText}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary-glow group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 2 — LIVE INNER INTERVIEW SESSION
         ========================================================================= */}
      {currentPage === 2 && (
        <div className="space-y-6 animate-fade-in">
          {/* =====================================================================
              1. DYNAMIC HEADER BANNER (Company Dashboard Header Style)
             ===================================================================== */}
          <div className="bg-gradient-brand rounded-2xl sm:rounded-3xl shadow-elegant p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white">
            <div className="space-y-1">
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wide text-primary-foreground/90 bg-white/15 px-2.5 py-1 rounded-full mb-1">
                INTERVIEW MODE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-foreground tracking-tight">
                {selectedMode.title}
              </h1>
              <p className="text-primary-foreground/80 mt-1 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {selectedMode.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleReturnToModes}
                className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-white text-ink px-4 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Mode</span>
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </button>
            </div>
          </div>

          {/* =====================================================================
              2. MARKS / SCORE BAR (Replaces 'Complete company profile' banner)
             ===================================================================== */}
          <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow font-extrabold text-base shrink-0 shadow-xs">
                {questionsList.length > 0
                  ? Math.round((score / questionsList.length) * 100)
                  : 0}
                %
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
                  <span>Interview Marks</span>
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    {isCompleted ? "Completed" : "Live Evaluation"}
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-0.5">
                  Question {Math.min(currentQuestionIndex + 1, questionsList.length)} of{" "}
                  {questionsList.length} • {answeredCount} answered • Real-time score evaluation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
              <div className="text-left sm:text-right px-3 py-1 rounded-xl bg-surface-alt/60 border border-border/70">
                <div className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">
                  Score
                </div>
                <div className="text-base sm:text-lg font-extrabold text-ink">
                  <span className="text-primary-glow font-black">{score}</span> /{" "}
                  {questionsList.length}
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink">
                <Clock className="w-3.5 h-3.5 text-primary-glow" />
                <span>{formatTimer(sessionSeconds)}</span>
              </div>
            </div>
          </div>

          {/* =====================================================================
              COMPLETED SUMMARY VIEW (If all questions finished)
             ===================================================================== */}
          {isCompleted ? (
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-center animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h2 className="text-2xl font-extrabold text-ink">Interview Completed!</h2>
                <p className="text-sm text-ink-soft">
                  You have answered all questions for the{" "}
                  <strong className="text-ink">{selectedMode.title}</strong> round.
                </p>
              </div>

              {/* Score Highlight Card */}
              <div className="inline-flex flex-col items-center justify-center p-6 rounded-3xl bg-primary/5 border border-primary/20 min-w-[260px]">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Final Score
                </span>
                <div className="text-4xl font-black text-primary-glow mt-1">
                  {score} / {questionsList.length}
                </div>
                <span className="text-xs font-bold text-ink-soft mt-1">
                  ({Math.round((score / questionsList.length) * 100)}% Accuracy)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border/70">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake This Drill</span>
                </button>
                <button
                  type="button"
                  onClick={handleReturnToModes}
                  className="inline-flex items-center gap-2 bg-surface hover:bg-surface-alt text-ink border border-border font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-primary-glow" />
                  <span>Practice Another Mode</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* =====================================================================
              3. MAIN 50/50 SPLIT: QUESTION / ANSWER (LEFT) & TRANSCRIPT (RIGHT)
             ===================================================================== */}
          {!isCompleted && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-h-[640px]">
              {/* ========================================
                  LEFT SECTION — OBJECTIVE QUESTION & ANSWER (50%)
                 ======================================== */}
              <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
                {/* Question Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-primary-glow bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        Question {currentQuestionIndex + 1} of {questionsList.length}
                      </span>
                      {questionResults[currentQuestion.id] && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            questionResults[currentQuestion.id].isCorrect
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          }`}
                        >
                          {questionResults[currentQuestion.id].isCorrect ? (
                            <>
                              <Check className="w-3 h-3" /> Correct
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" /> Incorrect
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleSpeakQuestion}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        isSpeakingQuestion
                          ? "bg-primary text-white border-primary"
                          : "bg-surface-alt border-border text-ink-soft hover:text-ink hover:bg-surface-alt/80"
                      }`}
                      title="Speak question aloud"
                    >
                      {isSpeakingQuestion ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-primary-glow" />
                          <span>Play Question</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 bg-surface-alt/40 border border-border/80 rounded-2xl space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary-glow">
                      {currentQuestion.category}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-ink leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                    {currentQuestion.hint && (
                      <div className="flex items-start gap-1.5 text-[11px] text-ink-soft/90 pt-1.5 border-t border-border/40">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Hint:</strong> {currentQuestion.hint}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer Input Area */}
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-primary-glow" /> Type your answer:
                    </label>

                    {/* Voice Record Toggle Button */}
                    <button
                      type="button"
                      onClick={handleToggleRecording}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isRecording
                          ? "bg-rose-500 text-white animate-pulse shadow-glow"
                          : "bg-primary/10 hover:bg-primary/20 text-primary-glow border border-primary/20"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Recording...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Speak into Mic</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Textarea for Response */}
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={!!questionResults[currentQuestion.id]}
                    className="w-full flex-1 min-h-[200px] p-4 text-xs sm:text-sm bg-surface-alt/40 border border-border/80 rounded-2xl text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-glow resize-none transition-all leading-relaxed scrollbar-thin scrollbar-thumb-border disabled:opacity-75 disabled:cursor-not-allowed"
                  />

                  {/* If already submitted, show quick answer indicator */}
                  {questionResults[currentQuestion.id] && (
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        questionResults[currentQuestion.id].isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        {questionResults[currentQuestion.id].isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Submitted — Correct (+1 Mark)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span>Submitted — Incorrect</span>
                          </>
                        )}
                      </div>
                      {!questionResults[currentQuestion.id].isCorrect && (
                        <p className="text-[11px] text-ink-soft mt-1">
                          <strong>Correct answer:</strong> {currentQuestion.correctAnswer}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-ink-soft">
                    <span>
                      Word count:{" "}
                      <strong className="text-ink">
                        {userAnswer.trim().split(/\s+/).filter(Boolean).length}
                      </strong>
                    </span>
                    <span className="text-[10px]">
                      Supports typed input & speech transcription
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Previous / Submit Answer / Next */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/70">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        const prevIdx = currentQuestionIndex - 1;
                        setCurrentQuestionIndex(prevIdx);
                        const prevQ = questionsList[prevIdx];
                        const existing = questionResults[prevQ.id];
                        setUserAnswer(existing ? existing.userAnswer : "");
                      }
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink rounded-xl border border-border hover:bg-surface-alt transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {/* If question already submitted, show Next Button */}
                    {questionResults[currentQuestion.id] ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = currentQuestionIndex + 1;
                          if (nextIdx >= questionsList.length) {
                            setIsCompleted(true);
                          } else {
                            setCurrentQuestionIndex(nextIdx);
                            const nextQ = questionsList[nextIdx];
                            const existing = questionResults[nextQ.id];
                            setUserAnswer(existing ? existing.userAnswer : "");
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
                      >
                        <span>
                          {currentQuestionIndex + 1 === questionsList.length
                            ? "View Final Score"
                            : "Next Question"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        disabled={!userAnswer.trim() || isSubmittingAnswer}
                        className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Submit Answer</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ========================================
                  RIGHT SECTION — AI TRANSCRIPT (50%)
                 ======================================== */}
              <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-glow" />
                      <h2 className="text-lg font-bold text-ink">AI Transcript</h2>
                    </div>
                    <p className="text-xs text-ink-soft">
                      Live conversational dialogue, answer evaluation & STAR breakdown
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    title="Copy transcript"
                  >
                    {copiedTranscript ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>

                {/* Transcript Scrollable Conversation Feed */}
                <div className="flex-1 overflow-y-auto space-y-4 p-3 bg-surface-alt/20 rounded-2xl border border-border/60 max-h-[500px] scrollbar-thin scrollbar-thumb-border">
                  {transcript.map((entry) => {
                    const isAi = entry.sender === "ai";

                    return (
                      <div
                        key={entry.id}
                        className={`flex flex-col space-y-1.5 ${
                          isAi ? "items-start" : "items-end"
                        }`}
                      >
                        {/* Avatar & Sender label */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft px-1">
                          {isAi ? (
                            <>
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary-glow flex items-center justify-center">
                                <Bot className="w-3 h-3" />
                              </div>
                              <span className="text-primary-glow font-bold">
                                AI Interviewer
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-ink font-bold">You</span>
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                <User className="w-3 h-3" />
                              </div>
                            </>
                          )}
                          <span className="text-[10px] text-ink-soft/60">
                            • {entry.timestamp}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[92%] ${
                            isAi
                              ? "bg-surface border border-border text-ink shadow-xs rounded-tl-sm"
                              : "bg-[#1B3A5B] text-white shadow-xs rounded-tr-sm"
                          }`}
                        >
                          {entry.text}
                        </div>

                        {/* AI Feedback Snippet for User Responses */}
                        {entry.feedback && (
                          <div
                            className={`w-full max-w-[92%] p-3 rounded-xl border text-xs space-y-1.5 text-left animate-fade-in mt-1 ${
                              entry.isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "bg-rose-500/10 border-rose-500/20"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-extrabold flex items-center gap-1 ${
                                  entry.isCorrect
                                    ? "text-emerald-700 dark:text-emerald-300"
                                    : "text-rose-700 dark:text-rose-300"
                                }`}
                              >
                                {entry.isCorrect ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                )}
                                {entry.feedback.starMatch}
                              </span>
                              <span
                                className={`font-bold ${
                                  entry.isCorrect
                                    ? "text-emerald-700 dark:text-emerald-300"
                                    : "text-rose-700 dark:text-rose-300"
                                }`}
                              >
                                Score: {entry.feedback.score}%
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-soft">
                              <strong>Analysis:</strong> {entry.feedback.strengths}
                            </p>
                            <p className="text-[11px] text-ink-soft">
                              <strong>Guidance:</strong> {entry.feedback.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={transcriptEndRef} />
                </div>

                {/* Bottom Quick Indicator */}
                <div className="p-3 bg-surface-alt/40 border border-border/80 rounded-2xl flex items-center justify-between text-xs text-ink-soft">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time answer evaluation active</span>
                  </div>
                  <span className="font-semibold text-primary-glow">
                    {answeredCount} / {questionsList.length} answered
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          4. INTERACTIVE SUBMISSION EVALUATION MODAL (Correct / Incorrect Popup)
         ========================================================================= */}
      {modalState && modalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-scale-in relative">
            {/* Close icon */}
            <button
              type="button"
              onClick={handleModalContinue}
              className="absolute top-4 right-4 p-2 text-ink-soft hover:text-ink rounded-full hover:bg-surface-alt transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Status Header */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  modalState.isCorrect
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                }`}
              >
                {modalState.isCorrect ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7" />
                )}
              </div>

              <div>
                <h3
                  className={`text-lg sm:text-xl font-black ${
                    modalState.isCorrect
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {modalState.isCorrect ? "✓ Correct Answer!" : "✕ Incorrect Answer"}
                </h3>
                <p className="text-xs text-ink-soft">
                  {modalState.isCorrect
                    ? "Your answer is correct."
                    : "Your answer did not match the expected criteria."}
                </p>
              </div>
            </div>

            {/* Question Details */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-surface-alt/50 border border-border/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                  Question {modalState.questionNumber} of {modalState.totalQuestions}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-ink leading-relaxed">
                  {modalState.questionText}
                </p>
              </div>

              {/* User's Answer */}
              <div className="p-3.5 rounded-2xl bg-surface-alt/30 border border-border/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                  Your Answer:
                </span>
                <p className="text-xs sm:text-sm text-ink leading-relaxed">
                  &ldquo;{modalState.userAnswer}&rdquo;
                </p>
              </div>

              {/* Correct Answer Display */}
              <div
                className={`p-4 rounded-2xl border space-y-1.5 ${
                  modalState.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/25"
                    : "bg-blue-500/10 border-blue-500/25"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-glow flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Correct Answer:
                </span>
                <p className="text-xs sm:text-sm font-medium text-ink leading-relaxed">
                  {modalState.correctAnswer}
                </p>
              </div>
            </div>

            {/* Score update snippet */}
            <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs">
              <span className="text-ink-soft">
                Current Score:{" "}
                <strong className="text-primary-glow font-extrabold text-sm">
                  {score}
                </strong>{" "}
                / {modalState.totalQuestions}
              </span>

              <button
                type="button"
                onClick={handleModalContinue}
                className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
              >
                <span>
                  {modalState.isFinalQuestion ? "View Final Score" : "Next Question"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIInterviewPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-ink-soft animate-pulse">
          Loading AI Interview Suite...
        </div>
      }
    >
      <AIInterviewPracticeContent />
    </Suspense>
  );
}
