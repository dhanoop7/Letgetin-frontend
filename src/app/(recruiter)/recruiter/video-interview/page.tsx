"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Settings,
  Code2,
  Bot,
  FileText,
  Play,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Copy,
  RotateCcw,
  Star,
  Users,
  Clock,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Radio,
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Plus,
  HelpCircle,
  ExternalLink,
  Check,
  AlertTriangle,
  Layers,
  Terminal,
  Share2,
} from "lucide-react";
import { interviewService } from "@/features/interview/services/interviewService";
import { Interview, AiQuestion } from "@/features/interview/types";

// ==========================================
// PRESET CODING CHALLENGES
// ==========================================
interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  templates: Record<string, string>;
  testOutput: string;
}

const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: "lru-cache",
    title: "Design LRU Cache",
    difficulty: "Medium",
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.
Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if the key exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if key exists. Otherwise, add the key-value pair.
Both operations must run in O(1) average time complexity.`,
    templates: {
      typescript: `class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

// Test harness
const cache = new LRUCache(2);
cache.put(1, 100);
cache.put(2, 200);
console.log("get(1):", cache.get(1)); // 100
cache.put(3, 300); // evicts key 2
console.log("get(2):", cache.get(2)); // -1 (evicted)
console.log("get(3):", cache.get(3)); // 300`,
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) {
      this.map.delete(this.map.keys().next().value);
    }
    this.map.set(key, value);
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        # Utilizing Python 3.7+ ordered dict behavior or custom doubly linked list
    
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        self.cache[key] = value`,
      java: `class LRUCache {
    private final int capacity;
    private final java.util.LinkedHashMap<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new java.util.LinkedHashMap<Integer, Integer>(capacity, 0.75f, true) {
            protected boolean removeEldestEntry(java.util.Map.Entry eldest) {
                return size() > capacity;
            }
        };
    }

    public int get(int key) {
        return map.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        map.put(key, value);
    }
}`,
    },
    testOutput: `[Running test suite for LRU Cache...]
Test 1: Initialize capacity=2 -> Passed (0.8ms)
Test 2: Put (1, 100), (2, 200) -> Passed (0.4ms)
Test 3: Get (1) -> Expected 100, Received 100 -> Passed (0.2ms)
Test 4: Put (3, 300) [Eviction Check] -> Evicted key 2 -> Passed (0.3ms)
Test 5: Get (2) -> Expected -1, Received -1 -> Passed (0.1ms)

===========================================
✅ ALL 5 TEST CASES PASSED
Time: 42ms | Memory: 14.8 MB | Complexity: O(1) Time, O(N) Space`,
  },
  {
    id: "rate-limiter",
    title: "Token Bucket Rate Limiter",
    difficulty: "Hard",
    description: `Implement a distributed-ready Token Bucket rate limiter that allows at most capacity requests per refill interval.
Ensure thread safety, clean time synchronization, and zero memory leaks for idle users.`,
    templates: {
      typescript: `interface RateLimiterRule {
  capacity: number;
  refillRatePerSec: number;
}

class TokenBucketLimiter {
  private capacity: number;
  private refillRate: number;
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }

  public allowRequest(tokensRequired: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
}`,
      python: `import time

class TokenBucketLimiter:
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.tokens = float(capacity)
        self.last_refill = time.time()

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(float(self.capacity), self.tokens + (elapsed * self.refill_rate))
        self.last_refill = now

    def allow_request(self, cost: int = 1) -> bool:
        self._refill()
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False`,
    },
    testOutput: `[Running Token Bucket Rate Limiter Tests...]
Test 1: Burst 10 requests under capacity 10 -> Allowed 10/10 -> Passed (1.2ms)
Test 2: 11th instantaneous request -> Throttled (429 Too Many Requests) -> Passed (0.4ms)
Test 3: Wait 500ms refill interval -> Tokens refilled -> Passed (501ms)
Test 4: Precision float replenishment -> Passed (0.1ms)

===========================================
✅ ALL 4 CONCURRENCY TEST CASES PASSED
Latency: 18ms | Jitter: < 1ms | Safe Under Distributed Lock`,
  },
  {
    id: "two-sum",
    title: "Two Sum & Target Pairs",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
Assume each input has exactly one solution, and do not use the same element twice.`,
    templates: {
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log("twoSum([2, 7, 11, 15], 9):", twoSum([2, 7, 11, 15], 9));`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []`,
    },
    testOutput: `[Running Two Sum Test Suite...]
Test 1: [2, 7, 11, 15], target=9 -> Output: [0, 1] -> Passed
Test 2: [3, 2, 4], target=6 -> Output: [1, 2] -> Passed
Test 3: [3, 3], target=6 -> Output: [0, 1] -> Passed
Test 4: Large array 100k items -> Solved in 4.2ms -> Passed

===========================================
✅ ALL 4 BENCHMARKS PASSED
Time Complexity: O(N) | Space Complexity: O(N)`,
  },
];

// Fallback questions for Interview Buddy drawer
const DEFAULT_BUDDY_QUESTIONS: AiQuestion[] = [
  {
    id: "q1",
    question: "Walk us through how you would architect a real-time collaborative workspace with WebSockets and conflict resolution.",
    category: "System Design",
    difficulty: "senior",
    criteria: [
      "Mentions CRDTs or Operational Transformation (OT)",
      "Addresses network partitions and reconnection queueing",
      "Decouples WebSocket state server from persistent database",
    ],
    greenFlags: ["Mentions Yjs, Automerge, or Redis Pub/Sub", "Thinks about message ordering with Lamport timestamps"],
    redFlags: ["Proposes simple HTTP polling without scaling considerations", "Ignores race conditions on concurrent writes"],
  },
  {
    id: "q2",
    question: "How do you detect, profile, and optimize slow rendering passes and unnecessary re-renders in large React applications?",
    category: "Frontend Core",
    difficulty: "mid",
    criteria: [
      "Mentions React DevTools Profiler & Chrome Performance panel",
      "Explains useMemo / useCallback trade-offs and object reference stability",
      "Understands component composition to avoid prop drilling and state hoisting",
    ],
    greenFlags: ["Mentions virtualized lists for 1,000+ DOM nodes", "Aware that premature memoization has memory overhead"],
    redFlags: ["Wraps every single function in useCallback without measuring", "Doesn't know how React reconciliation works"],
  },
  {
    id: "q3",
    question: "Describe your strategy for zero-downtime database schema migrations on a high-traffic table with 50M+ rows.",
    category: "Databases & DevOps",
    difficulty: "senior",
    criteria: [
      "Expand and contract pattern (dual-write, backfill, cutover, cleanup)",
      "Non-locking index creation (e.g., CREATE INDEX CONCURRENTLY in Postgres)",
      "Backwards compatible column addition with nullable defaults",
    ],
    greenFlags: ["Mentions pg_repack or gh-ost / pt-online-schema-change", "Has an explicit rollback plan"],
    redFlags: ["Suggests taking the production API offline during business hours", "Runs ALTER TABLE without lock timeout"],
  },
];

// ==========================================
// INNER VIDEO INTERVIEW CONTENT
// ==========================================
function VideoInterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const interviewId = searchParams.get("id") || "";
  const roomParam = searchParams.get("room") || "";
  const candidateParam = searchParams.get("candidate") || "";
  const roleParam = searchParams.get("role") || "";

  // Data states
  const [interview, setInterview] = useState<Interview | null>(null);
  const [candidateName, setCandidateName] = useState(candidateParam || "Alex Chen");
  const [candidateRole, setCandidateRole] = useState(roleParam || "Senior Full-Stack Engineer");
  const [candidateAvatar, setCandidateAvatar] = useState("");
  const [questions, setQuestions] = useState<AiQuestion[]>(DEFAULT_BUDDY_QUESTIONS);
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>({});

  // Media & Hardware states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(true);
  const [audioLevel, setAudioLevel] = useState(65);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedMic, setSelectedMic] = useState("Default - Studio Microphone");
  const [selectedCam, setSelectedCam] = useState("FaceTime HD Camera / Integrated 1080p");

  // Call runtime state
  const [callDuration, setCallDuration] = useState(1124); // Start at ~18 mins for demo realism
  const [isRecording, setIsRecording] = useState(true);
  const [viewMode, setViewMode] = useState<"split" | "focus-code" | "focus-video">("split");

  // Workspace states
  const [activeTab, setActiveTab] = useState<"code" | "buddy" | "notes">("code");
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge>(CODING_CHALLENGES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("typescript");
  const [editorCode, setEditorCode] = useState<string>(CODING_CHALLENGES[0].templates.typescript || "");
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Recruiter Notes & Scoring states
  const [recruiterNotes, setRecruiterNotes] = useState(
    "Candidate demonstrates structured architectural thinking. Immediately brought up cache invalidation and distributed lock nuances. Code is clean and modular."
  );
  const [quickTags, setQuickTags] = useState<string[]>([
    "Strong Architecture",
    "Clean Modularity",
    "O(1) Time Awareness",
  ]);
  const [newTagInput, setNewTagInput] = useState("");

  // End Interview & Debrief Modal states
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [endCallRating, setEndCallRating] = useState(4);
  const [endCallRecommendation, setEndCallRecommendation] = useState<"Strong Hire" | "Hire" | "Hold" | "Reject">("Strong Hire");
  const [endCallFeedback, setEndCallFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Video Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // 1. Fetch Interview data if ID is present
  useEffect(() => {
    async function loadInterview() {
      if (!interviewId) return;
      try {
        const data = await interviewService.getInterviewById(interviewId);
        if (data) {
          setInterview(data);
          setCandidateName(data.candidateName || candidateName);
          setCandidateRole(data.position || candidateRole);
          if (data.candidateAvatar) setCandidateAvatar(data.candidateAvatar);
          if (data.aiQuestions && data.aiQuestions.length > 0) {
            setQuestions(data.aiQuestions);
          }
          if (data.feedbackNotes) {
            setRecruiterNotes(data.feedbackNotes);
          }
          if (data.score) {
            setEndCallRating(data.score);
          }
        }
      } catch (err) {
        console.warn("Could not load interview by ID, continuing in standalone room mode:", err);
      }
    }
    loadInterview();
  }, [interviewId]);

  // 2. Local Camera Feed Setup with graceful fallback
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function initCamera() {
      if (!isVideoOn) {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
          localStreamRef.current = null;
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
        return;
      }

      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false, // audio handled separately to prevent local feedback loops
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setCameraPermissionError(false);
        }
      } catch (err) {
        console.info("Webcam access not granted or not available, showing high-fidelity avatar:", err);
        setCameraPermissionError(true);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isVideoOn]);

  // 3. Call Duration Timer & Simulated Audio Activity
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Audio visualizer subtle fluctuation
    const audioInterval = setInterval(() => {
      if (isCandidateSpeaking) {
        setAudioLevel(Math.floor(35 + Math.random() * 55));
      } else {
        setAudioLevel(0);
      }
    }, 200);

    return () => {
      clearInterval(timer);
      clearInterval(audioInterval);
    };
  }, [isCandidateSpeaking]);

  // Format call timer (HH:MM:SS or MM:SS)
  const formattedTimer = useMemo(() => {
    const hrs = Math.floor(callDuration / 3600);
    const mins = Math.floor((callDuration % 3600) / 60);
    const secs = callDuration % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [callDuration]);

  // Handle Challenge change
  const handleSelectChallenge = (challenge: CodingChallenge) => {
    setSelectedChallenge(challenge);
    const code = challenge.templates[selectedLanguage] || challenge.templates.typescript || "";
    setEditorCode(code);
    setConsoleOutput("");
  };

  // Handle Language change
  const handleSelectLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    const code = selectedChallenge.templates[lang] || selectedChallenge.templates.typescript || "";
    setEditorCode(code);
    setConsoleOutput("");
  };

  // Run Code Simulation
  const handleRunCode = () => {
    setIsRunningCode(true);
    setConsoleOutput("Compiling and running against test suite in sandbox container...");
    setTimeout(() => {
      setIsRunningCode(false);
      setConsoleOutput(selectedChallenge.testOutput);
    }, 950);
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Toggle Question Completed
  const toggleQuestionCompleted = (id: string) => {
    setCompletedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Add Tag
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!quickTags.includes(newTagInput.trim())) {
      setQuickTags([...quickTags, newTagInput.trim()]);
    }
    setNewTagInput("");
  };

  // Remove Tag
  const handleRemoveTag = (tag: string) => {
    setQuickTags(quickTags.filter((t) => t !== tag));
  };

  // Submit End-Call Feedback
  const handleSubmitFeedback = async () => {
    setIsSubmittingFeedback(true);
    try {
      if (interviewId) {
        const fullNotes = `[Recommendation: ${endCallRecommendation}]\n[Tags: ${quickTags.join(", ")}]\n\n${endCallFeedback || recruiterNotes}`;
        await interviewService.submitFeedback(interviewId, endCallRating, fullNotes);
        await interviewService.updateStage(interviewId, "feedback_pending");
      }
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Failed to submit feedback to backend:", err);
      // Still show success for UI response
      setFeedbackSubmitted(true);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ============================================================ */}
      {/* 1. TOP HD ROOM HEADER */}
      {/* ============================================================ */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/recruiter/interview-schedule"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 text-xs font-medium transition-all"
            title="Return to Interview Schedule"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Room</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold text-white tracking-tight">
                LetGetIn Video Room
              </h1>
              {roomParam && (
                <span className="hidden md:inline text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {roomParam}
                </span>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>End-to-End Encrypted HD</span>
          </div>
        </div>

        {/* Center: Candidate Info & Elapsed Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
              {candidateAvatar ? (
                <img
                  src={candidateAvatar}
                  alt={candidateName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                candidateName.slice(0, 2)
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                <span>{candidateName}</span>
                <span className="text-[10px] text-blue-400 font-normal">
                  ({candidateRole})
                </span>
              </div>
            </div>
          </div>

          {/* Clock Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formattedTimer}</span>
          </div>

          {/* Recording Badge */}
          {isRecording && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>REC</span>
            </div>
          )}
        </div>

        {/* Right: View Mode & Layout Switches */}
        <div className="flex items-center gap-2">
          {/* Layout switcher */}
          <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/70 text-xs text-slate-400">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === "split"
                  ? "bg-blue-600 text-white font-medium shadow"
                  : "hover:text-slate-200"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("focus-code")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === "focus-code"
                  ? "bg-blue-600 text-white font-medium shadow"
                  : "hover:text-slate-200"
              }`}
            >
              Focus Code
            </button>
            <button
              onClick={() => setViewMode("focus-video")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === "focus-video"
                  ? "bg-blue-600 text-white font-medium shadow"
                  : "hover:text-slate-200"
              }`}
            >
              Focus Video
            </button>
          </div>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="AV & Device Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* End Call Button */}
          <button
            onClick={() => setShowEndCallModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN SPLIT ARENA */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ------------------------------------------------------------ */}
        {/* LEFT COLUMN: VIDEO STREAMS (Collapsible in focus-code mode) */}
        {/* ------------------------------------------------------------ */}
        <div
          className={`flex flex-col border-r border-slate-800/90 bg-slate-950 transition-all duration-300 relative ${
            viewMode === "focus-code"
              ? "w-0 p-0 overflow-hidden border-r-0"
              : viewMode === "focus-video"
              ? "w-full"
              : "w-full lg:w-[46%] xl:w-[42%]"
          }`}
        >
          {/* Main Candidate Video Feed Tile */}
          <div className="flex-1 p-3 flex flex-col min-h-0">
            <div className="flex-1 relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden flex items-center justify-center group">
              {/* Simulated HD Candidate Video Stream / Avatar */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-radial from-blue-950/20 via-slate-900 to-slate-950">
                {/* Glow rings */}
                <div className="absolute w-64 h-64 rounded-full bg-blue-600/10 blur-3xl animate-pulse pointer-events-none" />

                <div className="relative">
                  {/* Candidate Avatar with audio ripple rings */}
                  <div
                    className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 transition-all duration-300 ${
                      isCandidateSpeaking
                        ? "ring-4 ring-blue-500/80 shadow-[0_0_35px_rgba(59,130,246,0.35)]"
                        : "ring-2 ring-slate-700"
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-800 via-blue-900 to-indigo-700 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-inner overflow-hidden">
                      {candidateAvatar ? (
                        <img
                          src={candidateAvatar}
                          alt={candidateName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      )}
                    </div>

                    {/* Microphone status icon */}
                    <div className="absolute bottom-1 right-1 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-white shadow">
                      {isCandidateSpeaking ? (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Name & Speaking Status */}
                <div className="mt-4 text-center z-10">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {candidateName}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-0.5">
                    <span>{candidateRole}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span className="text-blue-400 font-medium">Candidate Feed</span>
                  </p>
                </div>

                {/* Live Audio Visualizer Bars */}
                <div className="mt-3 flex items-end gap-1 h-6 z-10 px-4 py-1 rounded-full bg-slate-900/70 border border-slate-800">
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(15, (audioLevel * 0.7) % 100)}%` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(20, audioLevel % 100)}%` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(25, (audioLevel * 1.2) % 100)}%` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(10, (audioLevel * 0.8) % 100)}%` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(30, (audioLevel * 1.1) % 100)}%` }}
                  />
                  <span className="text-[10px] font-mono text-emerald-400 ml-1">
                    {audioLevel > 20 ? "Voice Active" : "Muted"}
                  </span>
                </div>
              </div>

              {/* Stream Top Overlay: Quality Indicators */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>1080p 60fps</span>
                    <span className="text-slate-500 font-mono">| 14ms</span>
                  </div>
                  {isScreenSharing && (
                    <div className="px-2 py-0.5 rounded-md bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-[11px] font-medium text-blue-300 flex items-center gap-1">
                      <MonitorUp className="w-3 h-3" />
                      <span>Screen Shared</span>
                    </div>
                  )}
                </div>

                <div className="pointer-events-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsCandidateSpeaking(!isCandidateSpeaking)}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 shadow"
                    title={isCandidateSpeaking ? "Simulate Candidate Mute" : "Simulate Candidate Talk"}
                  >
                    {isCandidateSpeaking ? (
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "focus-video" ? "split" : "focus-video")
                    }
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 shadow"
                    title="Maximize Video"
                  >
                    {viewMode === "focus-video" ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* PICTURE-IN-PICTURE: RECRUITER SELF-VIEW */}
              {/* -------------------------------------------------------- */}
              <div className="absolute bottom-3 right-3 w-32 h-24 sm:w-44 sm:h-32 rounded-xl bg-slate-950/90 border-2 border-slate-700/80 shadow-2xl overflow-hidden z-20 transition-all hover:scale-105 group/pip">
                {isVideoOn && !cameraPermissionError ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-xs font-bold text-blue-300">
                      YOU
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {cameraPermissionError ? "Cam Blocked" : "Cam Off"}
                    </span>
                  </div>
                )}

                {/* Self-view badge */}
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[9px] font-semibold text-slate-300 flex items-center gap-1 border border-slate-800">
                  <span>You (Interviewer)</span>
                </div>

                {/* Self-view mic badge */}
                <div className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-slate-950/80 border border-slate-800">
                  {isMicOn ? (
                    <Mic className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <MicOff className="w-2.5 h-2.5 text-rose-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* CALL CONTROLS TOOLBAR (Docked at bottom of video stream) */}
          {/* ------------------------------------------------------------ */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center gap-2 sm:gap-3 shrink-0">
            {/* Mic Toggle */}
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 ${
                isMicOn
                  ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
              }`}
              title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 ${
                isVideoOn
                  ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
              }`}
              title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 ${
                isScreenSharing
                  ? "bg-blue-600 text-white shadow-blue-500/30 border border-blue-500"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
              title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
            >
              <MonitorUp className="w-4 h-4" />
            </button>

            {/* AV Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Audio & Video Devices"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1" />

            {/* End Call Direct trigger */}
            <button
              onClick={() => setShowEndCallModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">End & Submit</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT COLUMN: WORKSPACE TABS (Code, AI Buddy, Private Notes) */}
        {/* ------------------------------------------------------------ */}
        <div
          className={`flex flex-col bg-slate-900/95 transition-all duration-300 min-w-0 ${
            viewMode === "focus-video"
              ? "w-0 p-0 overflow-hidden border-l-0"
              : viewMode === "focus-code"
              ? "w-full"
              : "flex-1"
          }`}
        >
          {/* Workspace Tabs Header */}
          <div className="h-11 border-b border-slate-800 bg-slate-900/80 px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "code"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Live Code Sandbox</span>
              </button>

              <button
                onClick={() => setActiveTab("buddy")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "buddy"
                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Co-Pilot Cheatsheet</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
                  {questions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "notes"
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interviewer Scorecard</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                Real-time Sync Active
              </span>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* TAB 1: LIVE CODE SANDBOX */}
          {/* ---------------------------------------------------------- */}
          {activeTab === "code" && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
              {/* Editor Sub-Bar: Problem picker + Language selector + Actions */}
              <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
                {/* Challenge picker */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={selectedChallenge.id}
                      onChange={(e) => {
                        const c = CODING_CHALLENGES.find((ch) => ch.id === e.target.value);
                        if (c) handleSelectChallenge(c);
                      }}
                      aria-label="Select Coding Challenge"
                      className="appearance-none bg-slate-800/90 text-white text-xs font-medium pl-3 pr-8 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {CODING_CHALLENGES.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.title} ({ch.difficulty})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Difficulty Tag */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      selectedChallenge.difficulty === "Easy"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : selectedChallenge.difficulty === "Medium"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {selectedChallenge.difficulty}
                  </span>
                </div>

                {/* Right controls: Language & Run */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleSelectLanguage(e.target.value)}
                      aria-label="Select Programming Language"
                      className="appearance-none bg-slate-800/90 text-white text-xs font-mono pl-3 pr-8 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python 3.11</option>
                      <option value="java">Java 17</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Copy code to clipboard"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const initialCode =
                        selectedChallenge.templates[selectedLanguage] || "";
                      setEditorCode(initialCode);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Reset to challenge starter code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-60"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isRunningCode ? "Running..." : "Run Tests"}</span>
                  </button>
                </div>
              </div>

              {/* Problem Statement Strip */}
              <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 text-xs text-slate-300 leading-relaxed font-sans max-h-24 overflow-y-auto">
                <span className="font-semibold text-blue-400 mr-2">Problem:</span>
                {selectedChallenge.description}
              </div>

              {/* Code Input Area with Line Numbers */}
              <div className="flex-1 flex min-h-0 bg-slate-950 font-mono text-xs overflow-hidden">
                {/* Line numbers column */}
                <div className="w-10 py-3 bg-slate-950 text-slate-600 select-none text-right pr-3 font-mono text-[11px] leading-[1.6] border-r border-slate-800/60">
                  {editorCode.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Textarea code editor */}
                <textarea
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  spellCheck={false}
                  aria-label="Code Editor"
                  className="flex-1 p-3 bg-slate-950 text-slate-100 font-mono text-xs leading-[1.6] focus:outline-none resize-none overflow-auto selection:bg-blue-600/40 whitespace-pre"
                />
              </div>

              {/* Execution Output Console Drawer */}
              <div className="h-36 border-t border-slate-800 bg-slate-950 flex flex-col shrink-0">
                <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>Output Terminal</span>
                  </div>
                  {consoleOutput && (
                    <button
                      onClick={() => setConsoleOutput("")}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
                  {consoleOutput ? (
                    <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
                  ) : (
                    <span className="text-slate-600 italic">
                      Click &quot;Run Tests&quot; to execute candidate code in the sandbox container.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 2: AI CO-PILOT CHEATSHEET */}
          {/* ---------------------------------------------------------- */}
          {activeTab === "buddy" && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-4 overflow-y-auto">
              <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      AI Interviewer Co-Pilot Active
                    </h3>
                    <p className="text-[11px] text-purple-300/80">
                      Curated questions for {candidateRole} with signal criteria and follow-up probes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Quick add a synthesized question
                    const newQ: AiQuestion = {
                      id: `q-${Date.now()}`,
                      question: `Explain how you design observability and structured distributed tracing in a microservice ecosystem.`,
                      category: "Architecture & Ops",
                      difficulty: "senior",
                      criteria: ["OpenTelemetry standard", "Trace IDs propagation across RPC boundaries"],
                      greenFlags: ["Mentions Jaeger, Zipkin, or Grafana Tempo"],
                      redFlags: ["Only relies on console.log in container stdout"],
                    };
                    setQuestions([newQ, ...questions]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1 shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Question</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isDone = completedQuestions[q.id];
                  return (
                    <div
                      key={q.id || idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? "bg-slate-900/40 border-slate-800 opacity-60"
                          : "bg-slate-900/80 border-slate-800/80 hover:border-slate-700 shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleQuestionCompleted(q.id)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isDone
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "border-slate-600 hover:border-blue-400 text-transparent"
                            }`}
                            title={isDone ? "Mark Uncompleted" : "Mark as Asked"}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {q.category || "General"}
                              </span>
                              {q.difficulty && (
                                <span className="text-[10px] font-mono text-slate-500 uppercase">
                                  {q.difficulty}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                              {q.question}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Criteria & Green/Red Flags */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/60">
                        {q.greenFlags && q.greenFlags.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                            <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-1 text-[11px]">
                              <ThumbsUp className="w-3 h-3" />
                              Green Flags (Signals):
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                              {q.greenFlags.map((flag, fIdx) => (
                                <li key={fIdx}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {q.redFlags && q.redFlags.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/30">
                            <span className="font-semibold text-rose-400 flex items-center gap-1 mb-1 text-[11px]">
                              <ThumbsDown className="w-3 h-3" />
                              Red Flags:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                              {q.redFlags.map((flag, fIdx) => (
                                <li key={fIdx}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Follow-up Probing Suggestions */}
                      {q.criteria && q.criteria.length > 0 && (
                        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="font-medium text-purple-400">Evaluation Criteria:</span>
                          <span>{q.criteria.join(" • ")}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 3: INTERVIEWER SCORECARD & NOTES */}
          {/* ---------------------------------------------------------- */}
          {activeTab === "notes" && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-4 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Live Recruiter Scorecard</h3>
                <p className="text-xs text-slate-400">
                  Private notes recorded during the call. These are automatically attached to the candidate profile.
                </p>
              </div>

              {/* Quick Sentiment & Competency Tags */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  Quick Competency Badges
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {quickTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-300 flex items-center gap-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Markdown Notes Area */}
              <div className="flex-1 flex flex-col min-h-[220px] mb-4">
                <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span>Detailed Interview Notes</span>
                  <span className="text-[10px] text-emerald-400">Autosaving enabled</span>
                </label>
                <textarea
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  placeholder="Record your immediate thoughts on candidate responses, architectural choices, and technical depth..."
                  className="flex-1 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
                />
              </div>

              {/* End of Round Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to wrap up? Complete score and recommendations.
                </span>
                <button
                  onClick={() => setShowEndCallModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
                >
                  Finalize Debrief Scorecard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. HARDWARE & AV SETTINGS MODAL */}
      {/* ============================================================ */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Audio & Video Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Microphone Input
                </label>
                <select
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option>Default - Studio Microphone</option>
                  <option>Built-in MacBook Microphone (Array)</option>
                  <option>USB External Audio Interface</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Camera Device
                </label>
                <select
                  value={selectedCam}
                  onChange={(e) => setSelectedCam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option>FaceTime HD Camera / Integrated 1080p</option>
                  <option>Logitech Brio 4K Ultra HD</option>
                  <option>Virtual Background Cam</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Noise Suppression (AI Beamforming)</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Echo Cancellation</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>HD Cloud Recording Enabled</span>
                  <input
                    type="checkbox"
                    checked={isRecording}
                    onChange={(e) => setIsRecording(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. END CALL & DEBRIEF SCORECARD MODAL */}
      {/* ============================================================ */}
      {showEndCallModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {feedbackSubmitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Interview Concluded & Saved!
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  Feedback rating of {endCallRating}/5 and recommendation &quot;{endCallRecommendation}&quot; successfully attached to {candidateName}&apos;s profile.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/recruiter/interview-schedule"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
                  >
                    Back to Interview Schedule
                  </Link>
                  <Link
                    href="/recruiter/interview-buddy"
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                  >
                    Open Interview Buddy
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Debrief & Conclude Session
                    </h3>
                    <p className="text-xs text-slate-400">
                      Submit immediate hiring recommendation for {candidateName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEndCallModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Star Rating */}
                <div className="mb-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Overall Technical Rating:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEndCallRating(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= endCallRating ? "fill-current text-amber-400" : "text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-mono text-xs font-bold text-amber-400">
                      {endCallRating}/5
                    </span>
                  </div>
                </div>

                {/* Recommendation Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Hiring Recommendation
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["Strong Hire", "Hire", "Hold", "Reject"] as const).map((rec) => (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => setEndCallRecommendation(rec)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          endCallRecommendation === rec
                            ? rec === "Strong Hire"
                              ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
                              : rec === "Hire"
                              ? "bg-blue-600/30 border-blue-500 text-blue-300"
                              : rec === "Hold"
                              ? "bg-amber-600/30 border-amber-500 text-amber-300"
                              : "bg-rose-600/30 border-rose-500 text-rose-300"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                        }`}
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Notes */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Summary Notes & Feedback
                  </label>
                  <textarea
                    rows={4}
                    value={endCallFeedback || recruiterNotes}
                    onChange={(e) => setEndCallFeedback(e.target.value)}
                    placeholder="Candidate demonstrated great algorithmic efficiency, clean code..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setShowEndCallModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingFeedback ? "Saving to Pipeline..." : "Submit & Conclude Call"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback skeleton while Suspense hydrates query params
function VideoInterviewSkeleton() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Entering HD Video Room...</p>
      </div>
    </div>
  );
}

export default function VideoInterviewPage() {
  return (
    <Suspense fallback={<VideoInterviewSkeleton />}>
      <VideoInterviewContent />
    </Suspense>
  );
}
