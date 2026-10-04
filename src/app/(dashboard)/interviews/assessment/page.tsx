"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ClipboardCheck,
  Code2,
  Layers,
  Target,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  Check,
  ListChecks,
  Award,
  Send,
  MessageSquare,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { mockupAssessmentService } from "@/features/mockupAssessment/services/mockupAssessmentService";

interface AssessmentQuestionItem {
  id: string;
  questionNumber: number;
  category: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  expectedAnswer: string;
  keywords: string[];
  explanation: string;
  hint?: string;
  codeSnippet?: string;
}

interface AssessmentMode {
  id: string;
  title: string;
  badge: string;
  icon: typeof Code2;
  iconBg: string;
  iconColor: string;
  description: string;
  duration: string;
  questions: AssessmentQuestionItem[];
}

export type InteractionModeType = "text" | "audio" | "video";

interface InteractionModeOption {
  id: InteractionModeType;
  title: string;
  icon: typeof MessageSquare;
  iconBg: string;
  iconColor: string;
  description: string;
  badge: string;
}

const INTERACTION_MODES: InteractionModeOption[] = [
  {
    id: "text",
    title: "Text",
    icon: MessageSquare,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    description: "Interact with the AI through text-based questions and answers.",
    badge: "Written & Logic",
  },
  {
    id: "audio",
    title: "Audio",
    icon: Mic,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    description: "Talk with the AI using your microphone and receive spoken questions.",
    badge: "Voice & Speech",
  },
  {
    id: "video",
    title: "Video",
    icon: VideoIcon,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    description: "Complete the assessment through an AI-powered video interaction.",
    badge: "Full Proctored Video",
  },
];

const ASSESSMENT_MODES: AssessmentMode[] = [
  {
    id: "technical-coding",
    title: "Technical Coding Assessment",
    badge: "Coding & Logic",
    icon: Code2,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    description: "Algorithmic challenges, data structures, and code quality evaluation tailored to target tech stacks.",
    duration: "45 mins",
    questions: [
      {
        id: "tc-1",
        questionNumber: 1,
        category: "Data Structures & Time Complexity",
        question: "How do you implement an LRU (Least Recently Used) Cache with O(1) time complexity for both get() and put() operations?",
        options: [
          "Combine a Hash Map for O(1) key lookups with a Doubly Linked List for O(1) node repositioning.",
          "Use a single sorted Array and shift elements on every access.",
          "Use a Binary Search Tree (BST) sorted by timestamp.",
          "Use a circular Singly Linked List with linear scans.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Combine a Hash Map for O(1) key lookups with a Doubly Linked List to maintain recency ordering with O(1) node additions and removals.",
        keywords: ["hash map", "doubly linked", "o(1)", "recency", "cache", "lookup", "nodes", "lru"],
        explanation: "The Hash Map maps keys directly to Doubly Linked List nodes in O(1) time, while the Doubly Linked List allows moving accessed nodes to the head/tail in O(1) time.",
        hint: "Consider combining a key-value hash lookup with a doubly linked list structure.",
        codeSnippet: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.map = new Map(); // Hash Map + Doubly Linked nodes\n  }\n  get(key) { /* O(1) */ }\n  put(key, value) { /* O(1) */ }\n}`,
      },
      {
        id: "tc-2",
        questionNumber: 2,
        category: "Algorithms & Search",
        question: "Which algorithm finds the shortest path in a weighted graph with non-negative edge weights in O((V + E) log V) time?",
        options: [
          "Dijkstra's Algorithm using a Min-Priority Queue (Binary Heap).",
          "Breadth-First Search (BFS) using a simple FIFO queue.",
          "Bellman-Ford Algorithm with full edge relaxation iterations.",
          "Depth-First Search (DFS) with recursive backtracking.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Dijkstra's algorithm with a min-priority queue (min-heap) finds the shortest path in non-negative weighted graphs in O((V + E) log V) time.",
        keywords: ["dijkstra", "priority queue", "min-heap", "shortest path", "weights", "graph"],
        explanation: "Dijkstra's algorithm greedily explores the closest unvisited vertex using a min-heap, guaranteeing optimal shortest path calculations for non-negative weights.",
        hint: "Think about greedy priority-queue exploration.",
      },
      {
        id: "tc-3",
        questionNumber: 3,
        category: "Concurrency & Event Loop",
        question: "In Node.js, what is the exact execution order of: synchronous code, process.nextTick, Promise.then (microtasks), and setTimeout (macrotasks)?",
        options: [
          "Synchronous code → process.nextTick → Promise microtasks → setTimeout macrotasks.",
          "setTimeout macrotasks → synchronous code → Promise microtasks → process.nextTick.",
          "Promise microtasks → process.nextTick → synchronous code → setTimeout.",
          "Synchronous code → setTimeout → Promise microtasks → process.nextTick.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Synchronous code executes first, followed immediately by process.nextTick queue, then the Promise microtask queue, and finally timer macrotasks (setTimeout) in the event loop.",
        keywords: ["synchronous", "nexttick", "promise", "microtask", "settimeout", "macrotask", "event loop"],
        explanation: "Node.js processes the nextTick queue before other microtasks, and all microtasks must drain completely before the event loop advances to macrotask timer phases.",
        hint: "nextTick runs before Promise microtasks, which both precede timer macrotasks.",
      },
      {
        id: "tc-4",
        questionNumber: 4,
        category: "Memory Management & Garbage Collection",
        question: "What is the primary cause of a JavaScript closure memory leak in long-running Single Page Applications (SPAs)?",
        options: [
          "Retaining references to parent scope variables or DOM nodes inside event listeners that are never removed.",
          "Calling Math.random() inside functional components.",
          "Using const instead of let for local loop variables.",
          "Declaring too many async/await functions in utility modules.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Retaining references to outer scope variables or DOM nodes inside un-detached event listeners or persistent global callbacks prevents garbage collection.",
        keywords: ["closure", "reference", "event listener", "garbage collection", "leak", "dom", "retain"],
        explanation: "When an event listener or singleton callback holds onto a closure, the V8 garbage collector cannot free the referenced scope or detached DOM trees.",
        hint: "Think about uncleaned event listeners retaining outer variables.",
      },
    ],
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    badge: "Architecture",
    icon: Layers,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    description: "Assess distributed systems, microservices, scalability, caching patterns, and database trade-offs.",
    duration: "40 mins",
    questions: [
      {
        id: "sd-1",
        questionNumber: 1,
        category: "Distributed Systems & High Availability",
        question: "Design a globally distributed URL shortening service capable of handling 100M daily active writes and 1B reads. How do you generate unique short URLs?",
        options: [
          "Base62 encoding on unique distributed auto-increment IDs (Snowflake ID / Redis Counter) backed by LRU caching and DB partitioning.",
          "Random 7-character string generation with full table scans to check for collisions.",
          "MD5 hash of URL truncated to 7 characters without collision resolution.",
          "Storing all URLs in a single flat CSV file replicated across servers.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Use Base62 encoding on unique 64-bit distributed auto-increment IDs (Twitter Snowflake or distributed Redis counters), fronted by CDN/Redis caching and database sharding.",
        keywords: ["base62", "snowflake", "counter", "redis", "cache", "partition", "sharding", "collision"],
        explanation: "Base62 encoding provides 62^7 (~3.5 trillion) distinct URLs with zero collision risk when paired with a distributed sequence generator.",
        hint: "Base62 encoding over a distributed counter avoids collision checks.",
      },
      {
        id: "sd-2",
        questionNumber: 2,
        category: "Database Sharding & Partitioning",
        question: "What is Consistent Hashing, and why is it preferred over simple modulo hashing (hash(key) % N) when scaling distributed database nodes?",
        options: [
          "Consistent Hashing minimizes key remapping to K/N keys when nodes are added or removed, preventing massive cache misses.",
          "Consistent Hashing guarantees that all nodes store the exact same identical data copy.",
          "Modulo hashing is faster and never requires rehashing when cluster size changes.",
          "Consistent Hashing encrypts database keys using RSA public-private keys.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Consistent hashing maps both keys and nodes to a hash ring, ensuring that adding or removing a node only remaps K/N keys on average instead of all keys.",
        keywords: ["consistent hashing", "hash ring", "remap", "virtual nodes", "modulo", "scale", "cache"],
        explanation: "With simple modulo hashing, changing N requires rehashing virtually 100% of keys. Consistent hashing limits data migration to adjacent nodes on the ring.",
        hint: "A hash ring minimizes the number of keys moved when cluster size changes.",
      },
      {
        id: "sd-3",
        questionNumber: 3,
        category: "Messaging & Event-Driven Systems",
        question: "How does Apache Kafka achieve high write throughput and guarantee message ordering across consumer groups?",
        options: [
          "Sequential disk I/O, OS page cache, zero-copy network transfer, and strict per-partition ordering via message keys.",
          "Storing all messages in an unindexed relational SQL table with row-level locks.",
          "Compressing the entire database into a single zip file on every write.",
          "Broadcasting every message randomly to all partitions regardless of key.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Kafka writes to an append-only commit log using sequential disk writes, OS page caching, and zero-copy sendfile, with ordering guaranteed strictly within individual partitions.",
        keywords: ["kafka", "partition", "append-only", "sequential", "page cache", "zero-copy", "ordering"],
        explanation: "Sequential disk I/O rivals memory speed. Kafka guarantees FIFO ordering per partition, allowing parallel scale across partitions.",
        hint: "Append-only commit logs and partitioning provide both speed and per-partition ordering.",
      },
      {
        id: "sd-4",
        questionNumber: 4,
        category: "Resilience & Rate Limiting",
        question: "Which rate limiting algorithm allows bursts of traffic while enforcing a smooth steady-state request rate?",
        options: [
          "Token Bucket Algorithm.",
          "Fixed Window Counter.",
          "Round Robin DNS.",
          "Single-threaded mutex lock.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "The Token Bucket algorithm adds tokens at a fixed rate up to a maximum bucket capacity, permitting burst traffic while strictly bounding the average throughput.",
        keywords: ["token bucket", "burst", "rate limit", "capacity", "steady-state", "leaky bucket"],
        explanation: "Token bucket allows accumulated tokens to be consumed instantaneously during bursts while refilling at a constant rate.",
        hint: "Tokens accumulate up to a capacity limit to support bursts.",
      },
    ],
  },
  {
    id: "behavioral-fit",
    title: "Behavioral & Situational Fit",
    badge: "STAR Method",
    icon: Target,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    description: "Scenario-driven situational questions evaluating leadership, teamwork, ownership, and workplace agility.",
    duration: "30 mins",
    questions: [
      {
        id: "bf-1",
        questionNumber: 1,
        category: "Conflict Resolution & Alignment",
        question: "Describe a situation where engineering priorities conflicted with strict product release deadlines. How did you negotiate scope and protect code quality?",
        options: [
          "Conducted an objective MVP triage with product leaders, defined non-negotiable quality criteria, and negotiated a phased release.",
          "Silently cut unit testing to ship all requested features on time.",
          "Refused to speak with the product manager until the deadline was extended by 3 months.",
          "Shipped buggy code and blamed the QA team for not catching issues.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Used data and trade-off matrices to triage features into a core MVP, communicated transparent risks to product leadership, and delivered in phased milestones.",
        keywords: ["triage", "mvp", "trade-off", "phased", "negotiate", "scope", "quality", "alignment", "star"],
        explanation: "Senior engineers balance business agility with technical integrity by transparently negotiating MVP boundaries.",
        hint: "Focus on proactive communication, trade-off matrices, and phased milestone delivery.",
      },
      {
        id: "bf-2",
        questionNumber: 2,
        category: "Ownership & Accountability",
        question: "Tell me about a time you made a critical technical mistake that impacted users or system availability. How did you handle it?",
        options: [
          "Took immediate ownership, mitigated user impact rapidly, published a transparent blameless post-mortem, and automated regression guards.",
          "Attempted to hide the mistake by modifying git commit history.",
          "Blamed the cloud hosting provider for the outage in public channels.",
          "Ignored customer support escalation tickets until the next sprint.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Owned the incident immediately, led recovery mitigation, shared a blameless post-mortem analyzing root cause, and added automated guardrails.",
        keywords: ["ownership", "blameless", "post-mortem", "mitigate", "guardrails", "accountability", "root cause"],
        explanation: "Top engineering leaders demonstrate extreme ownership, humility, fast mitigation, and institutional learning.",
        hint: "Highlight rapid mitigation, blameless reflection, and automated preventive measures.",
      },
      {
        id: "bf-3",
        questionNumber: 3,
        category: "Mentorship & Team Impact",
        question: "How do you help an underperforming junior engineer on your team improve their technical output and confidence?",
        options: [
          "Pair program regularly, establish clear weekly milestone goals, provide actionable constructive feedback, and celebrate incremental wins.",
          "Publicly criticize their pull requests during company all-hands meetings.",
          "Take over all their tasks and write their code for them silently.",
          "Ignore the situation and reassign them to another department.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Diagnose root blockers through 1-on-1s, institute pair programming and code review walkthroughs, set achievable milestones, and foster psychological safety.",
        keywords: ["mentor", "pair programming", "1-on-1", "psychological safety", "milestones", "feedback", "growth"],
        explanation: "Effective mentorship requires empathy, breaking down complex tasks, clear feedback loops, and psychological safety.",
        hint: "Focus on pair programming, psychological safety, and structured feedback.",
      },
      {
        id: "bf-4",
        questionNumber: 4,
        category: "Cross-Functional Collaboration",
        question: "How do you handle working with a difficult stakeholder who continuously requests urgent ad-hoc changes outside the sprint plan?",
        options: [
          "Acknowledge their goals, explain the sprint capacity trade-offs transparently, and route requests through formal backlog prioritization.",
          "Accede to every request immediately and abandon the planned sprint commitments.",
          "Block their emails and refuse to attend alignment meetings.",
          "Promise to deliver everything without consulting the engineering team.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Maintain respectful empathy, quantify the opportunity cost of interrupting active sprint commitments, and establish a clear triage process for backlog prioritization.",
        keywords: ["trade-off", "capacity", "backlog", "prioritization", "stakeholder", "sprint", "communication"],
        explanation: "Boundary management with stakeholders requires explaining trade-offs objectively rather than saying an emotional 'no'.",
        hint: "Frame capacity as an objective trade-off rather than personal resistance.",
      },
    ],
  },
  {
    id: "domain-drill",
    title: "Domain & Role-Specific Drill",
    badge: "Specialized Drill",
    icon: Shield,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    description: "In-depth technical knowledge evaluation covering frameworks, API design, security, and cloud ecosystems.",
    duration: "35 mins",
    questions: [
      {
        id: "dd-1",
        questionNumber: 1,
        category: "API Design & Security",
        question: "How do you implement OAuth2 + PKCE authentication flow with short-lived JWT access tokens and secure HTTP-only refresh tokens?",
        options: [
          "Exchange auth code with code_verifier for access token, store refresh token in HTTP-only Secure SameSite cookie, and keep access token in memory.",
          "Store all tokens and client secrets in browser localStorage without expiration checks.",
          "Pass plaintext passwords in query parameters on every API call.",
          "Disable CSRF and CORS protections across all backend routes.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Use PKCE code challenge/verifier exchange, store short-lived JWT in memory, and store refresh token in HTTP-only, Secure, SameSite=Strict cookie with token rotation.",
        keywords: ["oauth2", "pkce", "http-only", "cookie", "jwt", "refresh token", "samesite", "secure", "xss", "csrf"],
        explanation: "PKCE protects public clients from authorization code interception, while HTTP-only cookies protect refresh tokens against XSS attacks.",
        hint: "PKCE handles secure code exchange; HTTP-only cookies protect against XSS.",
      },
      {
        id: "dd-2",
        questionNumber: 2,
        category: "React / Next.js Architecture",
        question: "What is the primary difference between React Server Components (RSC) and Client Components ('use client') in Next.js App Router?",
        options: [
          "RSCs render strictly on the server with zero client bundle impact; Client Components hydrate on the client to provide interactivity and hooks.",
          "RSCs can use useState and useEffect, while Client Components cannot.",
          "Client Components render faster because they never execute JavaScript.",
          "There is no difference; 'use client' is purely an optional comment.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Server Components execute solely on the server and send pre-rendered HTML/JSON to the client with zero bundle weight, while Client Components ship JS for interactivity and lifecycle hooks.",
        keywords: ["rsc", "server components", "client components", "use client", "bundle size", "hydrate", "interactivity"],
        explanation: "RSCs keep large dependencies on the server to minimize client bundle size, while Client Components are reserved for browser interactivity.",
        hint: "Server components ship zero JavaScript bundle to the browser.",
      },
      {
        id: "dd-3",
        questionNumber: 3,
        category: "SQL Optimization & Indexing",
        question: "When running EXPLAIN ANALYZE on a slow SQL query, what indicates that an index is NOT being utilized?",
        options: [
          "Seq Scan (Sequential Table Scan) instead of Index Scan / Index Only Scan.",
          "Index Scan with low cost estimation.",
          "Bitmap Heap Scan matching indexed columns.",
          "Hash Join on indexed foreign keys.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "A Sequential Scan (Seq Scan) indicates the database engine is reading every table row from disk rather than using a B-Tree index scan.",
        keywords: ["seq scan", "sequential scan", "index scan", "explain analyze", "b-tree", "query plan", "performance"],
        explanation: "Sequential scans read entire tables into memory. Adding targeted B-tree indexes converts seq scans into fast log-time Index Scans.",
        hint: "Look for 'Seq Scan' in query execution plans.",
      },
      {
        id: "dd-4",
        questionNumber: 4,
        category: "Web Security & CSRF",
        question: "How does the SameSite cookie attribute protect web applications against Cross-Site Request Forgery (CSRF) attacks?",
        options: [
          "SameSite=Strict prevents cookies from being sent with cross-site requests initiated by third-party origins.",
          "SameSite encrypts the entire SQL database on the server.",
          "SameSite hides the website URL from search engine crawlers.",
          "SameSite disables all JavaScript execution in the browser.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "SameSite=Strict/Lax restricts browsers from sending cookies with cross-site requests, preventing malicious sites from executing unauthorized actions on behalf of the user.",
        keywords: ["samesite", "csrf", "cookies", "cross-site", "strict", "lax", "security"],
        explanation: "SameSite ensures that auth cookies are only sent when requests originate from the same domain, defeating CSRF.",
        hint: "SameSite stops browsers from attaching cookies to cross-origin requests.",
      },
    ],
  },
];

const SAMPLE_JD = `Senior Full Stack Software Engineer
Responsibilities:
- Architect and scale React/Next.js frontend and Node.js microservices.
- Design high-throughput event-driven architectures with Kafka and Redis.
- Optimize SQL queries and PostgreSQL database schemas.
- Mentor junior engineers and champion clean code and automated testing.`;

interface AnswerRecord {
  questionId: string;
  answerType: "objective" | "typed";
  selectedOptionIndex?: number;
  userAnswer: string;
  isCorrect: boolean;
  scoreAwarded: boolean;
  expectedAnswer: string;
  explanation: string;
  submittedAt: number;
}

export default function AIMockAssessmentPage() {
  const [selectedModeId, setSelectedModeId] = useState<string>("technical-coding");
  const [interactionMode, setInteractionMode] = useState<InteractionModeType>("text");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState<boolean>(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<AssessmentQuestionItem[]>([]);
  
  // Two answer modes: Objective Answer vs Type Your Answer
  const [answerMode, setAnswerMode] = useState<"objective" | "typed">("objective");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");

  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Audio / Video Interaction State & Controls
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [isRecordingSpeech, setIsRecordingSpeech] = useState<boolean>(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [mediaPermissionDenied, setMediaPermissionDenied] = useState<string | null>(null);
  const [isMediaInitializing, setIsMediaInitializing] = useState<boolean>(false);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Unified Answer tracking and scoring
  const [answeredMap, setAnsweredMap] = useState<Record<string, AnswerRecord>>({});
  const [evaluationModal, setEvaluationModal] = useState<{
    isOpen: boolean;
    isCorrect: boolean;
    answerType: "objective" | "typed";
    userAnswer: string;
    expectedAnswer: string;
    explanation: string;
    questionText: string;
    questionNumber: number;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const selectedMode = ASSESSMENT_MODES.find((m) => m.id === selectedModeId) || ASSESSMENT_MODES[0];
  const questionsList = dynamicQuestions.length > 0 ? dynamicQuestions : selectedMode.questions;
  const currentQuestion = questionsList[currentQuestionIndex] || questionsList[0];

  // Calculate live score based on evaluated correct answers
  const correctCount = Object.values(answeredMap).filter((a) => a.isCorrect && a.scoreAwarded).length;
  const totalQuestions = questionsList.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive && !isCompleted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, isCompleted]);

  // Load existing answer state if user navigates back to an answered question
  useEffect(() => {
    if (currentQuestion && answeredMap[currentQuestion.id]) {
      const record = answeredMap[currentQuestion.id];
      setAnswerMode(record.answerType);
      if (record.answerType === "objective") {
        setSelectedOptionIndex(record.selectedOptionIndex ?? null);
        setUserAnswer("");
      } else {
        setUserAnswer(record.userAnswer);
        setSelectedOptionIndex(null);
      }
    } else {
      setSelectedOptionIndex(null);
      setUserAnswer("");
    }
  }, [currentQuestionIndex, currentQuestion?.id, answeredMap]);

  // Clean up media streams and speech synth on unmount or session exit
  const cleanupMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
      speechRecognitionRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingQuestion(false);
    setIsRecordingSpeech(false);
  };

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, []);

  // Initialize Media Streams ONLY when entering Audio or Video assessment
  useEffect(() => {
    if (!isSessionActive || isCompleted) {
      cleanupMedia();
      return;
    }

    const initMediaForMode = async () => {
      setMediaPermissionDenied(null);
      setIsMediaInitializing(true);

      if (interactionMode === "audio") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          setIsMicMuted(false);
        } catch (err: any) {
          console.warn("Audio media permission error:", err);
          setMediaPermissionDenied("Microphone access was denied or not found. You can still read questions and type your responses.");
          toast.warning("Microphone access unavailable. Continuing in text-assisted mode.");
        } finally {
          setIsMediaInitializing(false);
        }
      } else if (interactionMode === "video") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          mediaStreamRef.current = stream;
          setIsCameraOff(false);
          setIsMicMuted(false);
          if (videoElementRef.current) {
            videoElementRef.current.srcObject = stream;
          }
        } catch (err: any) {
          console.warn("Video media permission error:", err);
          setMediaPermissionDenied("Camera and microphone access was denied or not found. You can still complete your assessment via text inputs.");
          toast.warning("Camera access unavailable. Continuing with assessment controls.");
        } finally {
          setIsMediaInitializing(false);
        }
      } else {
        setIsMediaInitializing(false);
      }
    };

    initMediaForMode();
  }, [isSessionActive, interactionMode, isCompleted]);

  // Handle Speech Recognition for voice answering
  const toggleSpeechRecognition = () => {
    if (isRecordingSpeech) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
      setIsRecordingSpeech(false);
      toast.info("Voice recording paused.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported in this browser. Please type your answer.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecordingSpeech(true);
        setAnswerMode("typed");
        toast.success("Listening... Speak your answer clearly.");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setUserAnswer(transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecordingSpeech(false);
        if (event.error !== "no-speech") {
          toast.error(`Microphone input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecordingSpeech(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecordingSpeech(false);
      toast.error("Unable to start speech recognition.");
    }
  };

  // Handle Text-to-Speech to read question aloud
  const toggleReadQuestionAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-Speech is not supported in your browser.");
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `Question ${currentQuestionIndex + 1}. Category: ${currentQuestion.category}. ${currentQuestion.question}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Camera in Video Mode
  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !isCameraOff;
        videoTracks.forEach((t) => (t.enabled = !nextState));
        setIsCameraOff(nextState);
        toast.info(nextState ? "Camera turned off" : "Camera turned on");
      }
    }
  };

  // Toggle Mic in Video/Audio Mode
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !isMicMuted;
        audioTracks.forEach((t) => (t.enabled = !nextState));
        setIsMicMuted(nextState);
        toast.info(nextState ? "Microphone muted" : "Microphone active");
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartAssessment = async (modeId?: string, overrideInteractionMode?: InteractionModeType) => {
    const activeModeId = modeId || selectedModeId;
    const activeInteractionMode = overrideInteractionMode || interactionMode;

    // Strict Validation
    if (!jobDescription.trim()) {
      toast.error("Please provide or paste a Job Description before starting the assessment.");
      return;
    }
    if (!activeModeId) {
      toast.error("Please select an Assessment Type.");
      return;
    }
    if (!activeInteractionMode) {
      toast.error("Please select an AI Interaction Mode.");
      return;
    }

    const activeMode = ASSESSMENT_MODES.find((m) => m.id === activeModeId) || selectedMode;
    setSelectedModeId(activeModeId);
    setInteractionMode(activeInteractionMode);
    setIsGeneratingAI(true);

    try {
      // Call Gemini assessment question generation
      const assessmentData = await mockupAssessmentService.generateAssessmentQuestions({
        assessmentType: activeModeId,
        interactionMode: activeInteractionMode,
        jobDescription: jobDescription.trim(),
      });

      if (!assessmentData || !Array.isArray(assessmentData.questions) || assessmentData.questions.length === 0) {
        toast.error("Unable to generate AI assessment. Please try again.");
        setIsGeneratingAI(false);
        return;
      }

      setDynamicQuestions(assessmentData.questions);
      if (assessmentData.sessionId) {
        setCurrentSessionId(assessmentData.sessionId);
      }

      setIsSessionActive(true);
      setIsCompleted(false);
      setCurrentQuestionIndex(0);
      setAnswerMode("objective");
      setSelectedOptionIndex(null);
      setUserAnswer("");
      setAnsweredMap({});
      setShowHint(false);
      setTimerSeconds(0);

      toast.success(`Starting ${activeMode.title} in ${activeInteractionMode.toUpperCase()} mode!`);
    } catch (err: any) {
      console.error("[MockupAssessment] Gemini generation failed:", err);
      toast.error(err?.message || "Unable to generate AI assessment. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleExitAssessment = () => {
    cleanupMedia();
    setIsSessionActive(false);
    setIsCompleted(false);
    setEvaluationModal(null);
  };

  // Evaluate typed answer against keywords and expected answer
  const evaluateTypedAnswer = (input: string, q: AssessmentQuestionItem): boolean => {
    const cleanInput = input.toLowerCase().trim();
    if (cleanInput.length < 5) return false;

    const matchingKeywords = (q.keywords || []).filter((kw) => cleanInput.includes(kw.toLowerCase()));
    if (matchingKeywords.length >= 2 || (matchingKeywords.length >= 1 && cleanInput.length >= 30)) {
      return true;
    }

    const cleanExpected = (q.expectedAnswer || "").toLowerCase();
    const wordsExpected = cleanExpected.split(/\s+/).filter((w) => w.length > 3);
    const matchedExpectedWords = wordsExpected.filter((w) => cleanInput.includes(w));
    if (matchedExpectedWords.length >= 3) {
      return true;
    }

    return false;
  };

  const handleSubmitAnswer = async () => {
    const q = currentQuestion;
    const isAlreadyAnswered = !!answeredMap[q.id];

    if (isAlreadyAnswered) {
      toast.info("Question already submitted.");
      return;
    }

    if (isRecordingSpeech) {
      toggleSpeechRecognition();
    }
    if (isSpeakingQuestion) {
      window.speechSynthesis?.cancel();
      setIsSpeakingQuestion(false);
    }

    let isCorrect = false;
    let submittedUserAnswer = "";
    let explanationText = q.explanation || "";

    if (answerMode === "objective") {
      if (selectedOptionIndex === null) {
        toast.error("Please select an answer option before submitting.");
        return;
      }
      isCorrect = selectedOptionIndex === q.correctOptionIndex;
      submittedUserAnswer = q.options[selectedOptionIndex];
      explanationText = q.explanation;
    } else {
      if (!userAnswer.trim()) {
        toast.error("Please provide or speak your answer before submitting.");
        return;
      }
      submittedUserAnswer = userAnswer.trim();
      setIsEvaluatingAnswer(true);

      try {
        const evalRes = await mockupAssessmentService.evaluateAssessmentAnswer({
          question: q.question,
          answer: submittedUserAnswer,
          category: q.category,
          assessmentType: selectedModeId,
          expectedAnswer: q.expectedAnswer,
          jobDescription: jobDescription.trim(),
          interactionMode,
        });

        if (evalRes && typeof evalRes.score === "number") {
          isCorrect = evalRes.score >= 6;
          explanationText = evalRes.summary || q.explanation;
        } else {
          isCorrect = evaluateTypedAnswer(submittedUserAnswer, q);
        }
      } catch (e) {
        console.warn("[MockupAssessment] Evaluation API error, fallback to keyword evaluation:", e);
        isCorrect = evaluateTypedAnswer(submittedUserAnswer, q);
      } finally {
        setIsEvaluatingAnswer(false);
      }
    }

    // Record answer with duplicate submission protection
    setAnsweredMap((prev) => ({
      ...prev,
      [q.id]: {
        questionId: q.id,
        answerType: answerMode,
        selectedOptionIndex: answerMode === "objective" ? (selectedOptionIndex ?? undefined) : undefined,
        userAnswer: submittedUserAnswer,
        isCorrect,
        scoreAwarded: isCorrect && (!isAlreadyAnswered || prev[q.id]?.scoreAwarded),
        expectedAnswer: q.options ? q.options[q.correctOptionIndex] : q.expectedAnswer,
        explanation: explanationText,
        submittedAt: Date.now(),
      },
    }));

    // Show evaluation feedback modal
    setEvaluationModal({
      isOpen: true,
      isCorrect,
      answerType: answerMode,
      userAnswer: submittedUserAnswer,
      expectedAnswer: q.options ? q.options[q.correctOptionIndex] : q.expectedAnswer,
      explanation: explanationText,
      questionText: q.question,
      questionNumber: q.questionNumber,
    });

    if (isCorrect) {
      toast.success("Congratulations! Your answer is correct. 🎉");
    } else {
      toast.error("Your answer is incorrect.");
    }
  };

  const handleNextQuestion = () => {
    setEvaluationModal(null);
    setShowHint(false);
    if (isSpeakingQuestion) {
      window.speechSynthesis?.cancel();
      setIsSpeakingQuestion(false);
    }
    if (currentQuestionIndex + 1 < questionsList.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      cleanupMedia();
      setIsCompleted(true);
      toast.success("Assessment completed! Final score ready.");
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setShowHint(false);
      if (isSpeakingQuestion) {
        window.speechSynthesis?.cancel();
        setIsSpeakingQuestion(false);
      }
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const isCurrentQuestionAnswered = !!answeredMap[currentQuestion?.id];
  const currentRecord = answeredMap[currentQuestion?.id];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* View 1: Assessment Setup & Selection */}
      {!isSessionActive ? (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner & Top Segmented Tabs */}
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-semibold">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>AI Assessment Suite</span>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                AI Mock Assessment
              </h1>
              <p className="text-xs sm:text-sm text-ink-soft max-w-3xl leading-relaxed">
                Evaluate your technical competence, system design capabilities, and role readiness with realistic AI-scored assessments tailored to your target job description.
              </p>
            </div>

            {/* TOP SEGMENTED TABS: [ Text ] [ Audio ] [ Video ] */}
            <div className="pt-1 flex items-center justify-between flex-wrap gap-3">
              <div className="inline-flex p-1 rounded-full bg-surface-alt border border-border shadow-xs">
                {INTERACTION_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = interactionMode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setInteractionMode(mode.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gradient-brand text-primary-foreground shadow-glow"
                          : "text-ink-soft hover:text-ink hover:bg-surface/80"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{mode.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Box: Job Description */}
            <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-elegant space-y-4 flex flex-col justify-between min-h-[460px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-glow" />
                    <h2 className="text-sm font-bold text-ink">Job Description</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setJobDescription(SAMPLE_JD);
                      toast.success("Sample Job Description loaded!");
                    }}
                    className="text-xs font-semibold text-primary-glow hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sample JD</span>
                  </button>
                </div>
                <p className="text-xs text-ink-soft">
                  Paste the job description to personalize your assessment.
                </p>

                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={13}
                  className="input-base text-xs leading-relaxed resize-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-ink-soft">
                <span>{jobDescription ? `${jobDescription.length} characters` : "Ready for JD paste"}</span>
                {jobDescription ? (
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> JD Context Active
                  </span>
                ) : (
                  <span className="text-amber-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Required for Assessment
                  </span>
                )}
              </div>
            </div>

            {/* Right Box: AI Mock Assessment Modes */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-elegant space-y-4 flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary-glow" />
                  <h2 className="text-sm font-bold text-ink">AI Mock Assessment</h2>
                </div>
                <p className="text-xs text-ink-soft mb-4">
                  Choose an assessment mode to practice for your target role.
                </p>

                {/* 2x2 Grid of Assessment Mode Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ASSESSMENT_MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = selectedModeId === mode.id;

                    return (
                      <div
                        key={mode.id}
                        onClick={() => setSelectedModeId(mode.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                          isSelected
                            ? "bg-primary/5 border-primary-glow ring-2 ring-primary-glow/40 shadow-glow"
                            : "bg-surface-alt/40 border-border/80 hover:border-primary-glow/40 hover:bg-surface-alt/70"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-xl ${mode.iconBg} ${mode.iconColor}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-ink-soft bg-surface px-2 py-0.5 rounded-full border border-border">
                              {mode.badge}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-ink group-hover:text-primary-glow transition-colors">
                            {mode.title}
                          </h3>
                          <p className="text-[11px] text-ink-soft leading-snug line-clamp-3">
                            {mode.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                          <span className="text-ink-soft flex items-center gap-1">
                            <Clock className="w-3 h-3 text-ink-soft" />
                            {mode.duration}
                          </span>
                          <button
                            type="button"
                            disabled={isGeneratingAI}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartAssessment(mode.id);
                            }}
                            className={`font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              isSelected ? "text-primary-glow" : "text-ink-soft group-hover:text-primary-glow"
                            }`}
                          >
                            <span>{isGeneratingAI && selectedModeId === mode.id ? "Generating..." : "Start Assessment"}</span>
                            {isGeneratingAI && selectedModeId === mode.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-ink-soft">
                <span>
                  Selected: <strong className="text-ink">{selectedMode.title}</strong>
                </span>
                <span className="text-primary-glow font-medium">
                  {selectedMode.questions.length} comprehensive questions
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Card Banner */}
          <div className="bg-surface border border-border rounded-3xl p-4 sm:p-5 shadow-elegant flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold shadow-glow shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-ink">
                  Ready to start your {selectedMode.title}?
                </h3>
                <p className="text-[11px] sm:text-xs text-ink-soft">
                  Interaction Mode: <strong className="text-ink">{INTERACTION_MODES.find((m) => m.id === interactionMode)?.title}</strong> • Your Job Description and mode will be preserved throughout the session.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isGeneratingAI}
              onClick={() => handleStartAssessment()}
              className="px-8 py-3 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating AI Assessment...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* View 2: Live Assessment Screen */
        <div className="space-y-6 animate-fade-in">
          {/* 1. Header Banner */}
          <div className="bg-gradient-brand rounded-3xl p-6 sm:p-8 text-white shadow-elegant relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Assessment Suite • {selectedMode.badge} • {interactionMode.toUpperCase()} INTERACTION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {selectedMode.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {selectedMode.description}
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 self-stretch md:self-auto justify-end">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
                <Clock className="w-4 h-4 text-white/90" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
              <button
                type="button"
                onClick={handleExitAssessment}
                className="px-5 py-2.5 rounded-2xl bg-white text-primary font-bold text-xs shadow-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Assessment</span>
              </button>
            </div>

            {/* Background shapes */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Interactive Audio / Video Console Header if in Audio or Video mode */}
          {interactionMode === "audio" && (
            <div className="bg-surface border border-purple-500/30 rounded-3xl p-5 shadow-elegant space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-2">
                      <span>AI Voice Interaction Workspace</span>
                      {isRecordingSpeech && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Recording
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-ink-soft">
                      Spoken questions & microphone voice-answering active.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={toggleReadQuestionAloud}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isSpeakingQuestion
                        ? "bg-purple-600 text-white border-purple-600 shadow-glow"
                        : "bg-surface-alt border-border text-ink hover:text-purple-600"
                    }`}
                  >
                    {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-purple-500" />}
                    <span>{isSpeakingQuestion ? "Stop AI Voice" : "Listen to Question"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    disabled={isCurrentQuestionAnswered}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                      isRecordingSpeech
                        ? "bg-rose-500 text-white shadow-glow animate-pulse"
                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                    }`}
                  >
                    {isRecordingSpeech ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecordingSpeech ? "Stop Speaking" : "Speak Your Answer"}</span>
                  </button>
                </div>
              </div>

              {mediaPermissionDenied && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mediaPermissionDenied}</span>
                </div>
              )}
            </div>
          )}

          {interactionMode === "video" && (
            <div className="bg-surface border border-emerald-500/30 rounded-3xl p-5 shadow-elegant space-y-4 animate-fade-in">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <VideoIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-2">
                      <span>AI Proctored Video Assessment</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live Session
                      </span>
                    </h3>
                    <p className="text-[11px] text-ink-soft">
                      Camera feed and speech evaluation stream active.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isCameraOff ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-surface-alt border-border text-ink"
                    }`}
                  >
                    {isCameraOff ? <VideoOff className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{isCameraOff ? "Camera Off" : "Camera On"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isMicMuted ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-surface-alt border-border text-ink"
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{isMicMuted ? "Muted" : "Mic Active"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleReadQuestionAloud}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-alt border border-border text-ink text-xs font-semibold flex items-center gap-1.5 hover:text-emerald-500 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isSpeakingQuestion ? "Stop Audio" : "Read Aloud"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    disabled={isCurrentQuestionAnswered}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                      isRecordingSpeech
                        ? "bg-rose-500 text-white shadow-glow animate-pulse"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isRecordingSpeech ? "Recording..." : "Voice Answer"}</span>
                  </button>
                </div>
              </div>

              {/* Video Feeds Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Interviewer View */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/40 text-primary-glow flex items-center justify-center shadow-glow mb-2 animate-pulse">
                    <Activity className="w-8 h-8" />
                  </div>
                  <h4 className="text-xs font-bold text-white">AI Evaluator</h4>
                  <p className="text-[10px] text-slate-400">
                    {isSpeakingQuestion ? "Speaking question..." : "Observing responses & pacing"}
                  </p>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>AI Interviewer Online</span>
                  </div>
                </div>

                {/* Candidate Video Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
                  <video
                    ref={videoElementRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover -scale-x-100 ${isCameraOff ? "hidden" : "block"}`}
                  />
                  {isCameraOff && (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                        <VideoOff className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-400">Camera is turned off</p>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Candidate Camera Feed</span>
                  </div>
                </div>
              </div>

              {mediaPermissionDenied && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mediaPermissionDenied}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Marks / Score Strip Header */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-elegant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary-glow font-extrabold text-sm shadow-sm">
                {scorePercent}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-ink">Assessment Performance Score</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow border border-primary/20">
                    Live Evaluation
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-0.5">
                  Mode: <strong className="text-ink uppercase">{interactionMode}</strong> • Choose Objective Answer or Type/Speak Your Answer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-bold text-ink-soft block">
                  Score
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-primary-glow">
                  {correctCount} <span className="text-xs font-semibold text-ink-soft">/ {totalQuestions}</span>
                </span>
              </div>

              <div className="h-8 w-px bg-border hidden sm:block" />

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-bold text-ink-soft block">
                  Progress
                </span>
                <span className="text-xs font-bold text-ink">
                  {Object.keys(answeredMap).length} of {totalQuestions} Answered
                </span>
              </div>
            </div>
          </div>

          {/* 3. Main Workspace: Final Summary or Active Assessment */}
          {isCompleted ? (
            /* Final Score Screen */
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-elegant space-y-6 text-center animate-scale-up">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary-glow mx-auto flex items-center justify-center shadow-glow">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-ink">Assessment Completed!</h2>
                <p className="text-xs sm:text-sm text-ink-soft">
                  Here is your final evaluated score and question breakdown for{" "}
                  <strong className="text-ink">{selectedMode.title}</strong> in{" "}
                  <strong className="text-ink uppercase">{interactionMode}</strong> mode.
                </p>
              </div>

              {/* Score Display Card */}
              <div className="max-w-lg mx-auto bg-surface-alt/60 border border-border rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-around">
                  <div>
                    <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Final Score</span>
                    <p className="text-3xl sm:text-4xl font-extrabold text-primary-glow mt-1">
                      {correctCount} / {totalQuestions}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Accuracy</span>
                    <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1">
                      {scorePercent}%
                    </p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Time</span>
                    <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1">
                      {formatTimer(timerSeconds)}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-brand h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>

              {/* Questions Breakdown List */}
              <div className="max-w-3xl mx-auto space-y-3 text-left">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider px-1">
                  Questions Review ({questionsList.length})
                </h3>
                <div className="space-y-3">
                  {questionsList.map((q, idx) => {
                    const ans = answeredMap[q.id];
                    const isCorrect = ans?.isCorrect;
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                          isCorrect
                            ? "bg-emerald-500/5 border-emerald-500/20 text-ink"
                            : ans
                            ? "bg-rose-500/5 border-rose-500/20 text-ink"
                            : "bg-surface-alt/40 border-border text-ink-soft"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">
                            Q{idx + 1}: {q.question}
                          </span>
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                            </span>
                          ) : ans ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect (0)
                            </span>
                          ) : (
                            <span className="text-[11px] text-ink-soft">Skipped</span>
                          )}
                        </div>

                        {ans && (
                          <div className="space-y-1 text-[11px] pt-1">
                            <p className="text-ink-soft">
                              <strong className="text-ink">Your answer ({ans.answerType}):</strong> {ans.userAnswer}
                            </p>
                            {!isCorrect && (
                              <p className="text-primary-glow font-medium">
                                <strong className="text-ink">Correct answer:</strong> {q.options ? q.options[q.correctOptionIndex] : q.expectedAnswer}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => handleStartAssessment(selectedMode.id)}
                  className="px-6 py-3 rounded-2xl border border-border text-ink hover:bg-surface-alt transition font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Assessment</span>
                </button>
                <button
                  type="button"
                  onClick={handleExitAssessment}
                  className="px-8 py-3 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Choose Another Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Active Assessment Workspace */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 8 Columns: Question Card & Two-Mode Answer Box */}
              <div className="lg:col-span-8 space-y-4">
                {/* Question Card */}
                <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-elegant space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-ink bg-primary/10 text-primary-glow px-2.5 py-1 rounded-xl border border-primary/20">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                      </span>
                      <span className="text-[11px] font-bold text-ink-soft bg-surface-alt px-2.5 py-1 rounded-xl border border-border">
                        {currentQuestion.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleReadQuestionAloud}
                        className="text-xs font-semibold text-primary-glow hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isSpeakingQuestion ? "Stop Audio" : "Read Aloud"}</span>
                      </button>

                      {currentQuestion.hint && (
                        <button
                          type="button"
                          onClick={() => setShowHint(!showHint)}
                          className="text-xs font-semibold text-ink-soft hover:text-ink flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-ink leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {showHint && currentQuestion.hint && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-ink space-y-1">
                      <span className="font-bold text-amber-600 dark:text-amber-400">Hint:</span>
                      <p className="text-ink-soft leading-relaxed">{currentQuestion.hint}</p>
                    </div>
                  )}

                  {currentQuestion.codeSnippet && (
                    <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto space-y-2">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-3 h-3 text-primary-glow" />
                        <span>Code Reference</span>
                      </div>
                      <pre className="text-emerald-400 leading-relaxed">
                        {currentQuestion.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Two-Mode Answer Box */}
                <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-elegant space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink uppercase tracking-wider">Answer Type:</span>
                      <div className="flex items-center gap-1 p-1 bg-surface-alt rounded-2xl border border-border">
                        <button
                          type="button"
                          disabled={isCurrentQuestionAnswered}
                          onClick={() => setAnswerMode("objective")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            answerMode === "objective"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          <ListChecks className="w-3.5 h-3.5" />
                          <span>Objective Answer</span>
                        </button>
                        <button
                          type="button"
                          disabled={isCurrentQuestionAnswered}
                          onClick={() => setAnswerMode("typed")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            answerMode === "typed"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Type / Speak Answer</span>
                        </button>
                      </div>
                    </div>

                    {(interactionMode === "audio" || interactionMode === "video") && (
                      <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        disabled={isCurrentQuestionAnswered}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                          isRecordingSpeech
                            ? "bg-rose-500 text-white shadow-glow animate-pulse"
                            : "bg-surface-alt border border-border text-ink hover:text-primary-glow"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isRecordingSpeech ? "Listening..." : "Dictate via Mic"}</span>
                      </button>
                    )}
                  </div>

                  {/* Mode A: Objective Multiple Choice */}
                  {answerMode === "objective" ? (
                    <div className="space-y-2.5 pt-1">
                      {currentQuestion.options?.map((optionText, optIdx) => {
                        const isSelected = selectedOptionIndex === optIdx;
                        const isSubmitted = isCurrentQuestionAnswered;
                        const isCorrectOption = optIdx === currentQuestion.correctOptionIndex;
                        const isUserChoice = currentRecord?.selectedOptionIndex === optIdx;

                        let cardStyle = "bg-surface-alt/40 border-border hover:border-primary-glow/40";
                        if (isSubmitted) {
                          if (isCorrectOption) {
                            cardStyle = "bg-emerald-500/10 border-emerald-500 text-ink font-semibold ring-1 ring-emerald-500/40";
                          } else if (isUserChoice && !currentRecord?.isCorrect) {
                            cardStyle = "bg-rose-500/10 border-rose-500 text-ink font-semibold ring-1 ring-rose-500/40";
                          } else {
                            cardStyle = "bg-surface-alt/20 border-border/60 opacity-60";
                          }
                        } else if (isSelected) {
                          cardStyle = "bg-primary/10 border-primary-glow text-ink font-semibold ring-2 ring-primary-glow/30";
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => !isSubmitted && setSelectedOptionIndex(optIdx)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer ${cardStyle} ${
                              isSubmitted ? "cursor-default" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${
                                  isSubmitted && isCorrectOption
                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                    : isSubmitted && isUserChoice && !currentRecord?.isCorrect
                                    ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                                    : isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-surface border-border text-ink-soft"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span className="leading-snug text-ink">{optionText}</span>
                            </div>
                            {isSubmitted && isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            {isSubmitted && isUserChoice && !currentRecord?.isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Mode B: Type / Speak Your Answer */
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={
                          interactionMode === "audio" || interactionMode === "video"
                            ? "Type or dictate via microphone your comprehensive technical explanation, architecture strategy, or logic..."
                            : "Write your comprehensive technical explanation, architecture strategy, or code logic here..."
                        }
                        rows={7}
                        disabled={isCurrentQuestionAnswered}
                        className={`input-base text-xs sm:text-sm leading-relaxed resize-none font-sans ${
                          isCurrentQuestionAnswered ? "bg-surface-alt/50 cursor-not-allowed opacity-80" : ""
                        }`}
                      />
                    </div>
                  )}

                  {/* If already answered, show status banner */}
                  {isCurrentQuestionAnswered && (
                    <div className="p-3 rounded-2xl bg-surface-alt border border-border flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-semibold">
                        {currentRecord?.isCorrect ? (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Evaluated Correct (+1 Score)
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Evaluated Incorrect (+0 Score)
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEvaluationModal({
                            isOpen: true,
                            isCorrect: currentRecord?.isCorrect ?? false,
                            answerType: currentRecord?.answerType ?? "objective",
                            userAnswer: currentRecord?.userAnswer ?? "",
                            expectedAnswer: currentQuestion.options ? currentQuestion.options[currentQuestion.correctOptionIndex] : currentQuestion.expectedAnswer,
                            explanation: currentQuestion.explanation,
                            questionText: currentQuestion.question,
                            questionNumber: currentQuestion.questionNumber,
                          });
                        }}
                        className="text-xs font-semibold text-primary-glow hover:underline cursor-pointer"
                      >
                        View Answer Key & Explanation
                      </button>
                    </div>
                  )}

                  {/* Bottom Action Strip */}
                  <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-ink-soft">
                      {answerMode === "objective" ? (
                        <span>
                          {selectedOptionIndex !== null ? (
                            <span>Selected: <strong className="text-ink">Option {String.fromCharCode(65 + selectedOptionIndex)}</strong></span>
                          ) : (
                            "Select one option above"
                          )}
                        </span>
                      ) : (
                        <span>
                          Words: <strong className="text-ink">{userAnswer ? userAnswer.split(/\s+/).filter(Boolean).length : 0}</strong>
                        </span>
                      )}
                      <span>• {interactionMode.toUpperCase()} Mode</span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        disabled={currentQuestionIndex === 0}
                        onClick={handlePrevQuestion}
                        className="px-3.5 py-2 text-xs font-semibold text-ink-soft hover:text-ink transition rounded-xl disabled:opacity-40 disabled:cursor-not-allowed border border-border cursor-pointer"
                      >
                        Previous
                      </button>

                      {!isCurrentQuestionAnswered ? (
                        <button
                          type="button"
                          disabled={isEvaluatingAnswer}
                          onClick={handleSubmitAnswer}
                          className="px-6 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isEvaluatingAnswer ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Evaluating with AI...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Answer</span>
                              <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-6 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{currentQuestionIndex + 1 < totalQuestions ? "Next Question" : "Finish Assessment"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4 Columns: Preserved JD Context & Evaluation Dimensions */}
              <div className="lg:col-span-4 space-y-4">
                {/* Preserved Job Context */}
                <div className="bg-surface border border-border rounded-3xl p-5 shadow-elegant space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary-glow" />
                      <span>Preserved Job Context</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsSessionActive(false)}
                      className="text-[11px] text-primary-glow font-semibold hover:underline cursor-pointer"
                    >
                      Edit JD
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-alt/50 border border-border text-xs text-ink-soft leading-relaxed max-h-48 overflow-y-auto">
                    {jobDescription ? (
                      <p className="whitespace-pre-line">{jobDescription}</p>
                    ) : (
                      <p className="italic">
                        No JD pasted. Assessment using standardized {selectedMode.badge} benchmark.
                      </p>
                    )}
                  </div>
                </div>

                {/* Evaluation Dimensions */}
                <div className="bg-surface border border-border rounded-3xl p-5 shadow-elegant space-y-3">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Evaluation Dimensions</span>
                  </h3>

                  <div className="space-y-2.5 text-xs text-ink-soft">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-glow shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-ink">Technical Precision:</strong> Domain correctness and syntax accuracy.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-glow shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-ink">System Scalability:</strong> Edge case handling and bottleneck analysis.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-glow shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-ink">STAR Clarity:</strong> Structured explanation of actions and metrics.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Evaluation Modal (Success & Incorrect Feedback Modal) */}
      {evaluationModal && evaluationModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    evaluationModal.isCorrect
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-glow"
                      : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                  }`}
                >
                  {evaluationModal.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-lg font-extrabold ${
                      evaluationModal.isCorrect ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {evaluationModal.isCorrect ? "✓ Correct Answer!" : "✕ Incorrect Answer"}
                  </h3>
                  <p className="text-xs text-ink-soft">
                    {evaluationModal.isCorrect
                      ? "Congratulations! Your answer is correct. 🎉 (+1 Score)"
                      : "Your answer is incorrect. Review the correct answer below:"}
                  </p>
                </div>
              </div>
            </div>

            {/* Question Summary */}
            <div className="p-3.5 rounded-2xl bg-surface-alt border border-border space-y-1 text-xs">
              <span className="font-bold text-ink-soft uppercase tracking-wider text-[10px]">
                Question {evaluationModal.questionNumber}:
              </span>
              <p className="font-semibold text-ink">{evaluationModal.questionText}</p>
            </div>

            {/* Candidate Answer */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-ink-soft uppercase tracking-wider text-[10px]">
                Your Answer ({evaluationModal.answerType}):
              </span>
              <p className="p-3 rounded-2xl bg-surface-alt/60 border border-border text-ink italic leading-relaxed">
                "{evaluationModal.userAnswer}"
              </p>
            </div>

            {/* Expected / Correct Answer */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                <Check className="w-3.5 h-3.5" />
                <span>Correct Answer:</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-ink leading-relaxed font-semibold">
                {evaluationModal.expectedAnswer}
              </div>
            </div>

            {/* Key Explanation / Rationale */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-primary-glow uppercase tracking-wider text-[10px]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Key Explanation & Criteria:</span>
              </div>
              <p className="text-ink-soft text-[11px] leading-relaxed">
                {evaluationModal.explanation}
              </p>
            </div>

            {/* Modal Bottom Action Button */}
            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEvaluationModal(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-ink hover:bg-surface-alt font-semibold text-xs transition cursor-pointer"
              >
                Review on Page
              </button>
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentQuestionIndex + 1 < totalQuestions ? "Next Question" : "Finish Assessment"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
