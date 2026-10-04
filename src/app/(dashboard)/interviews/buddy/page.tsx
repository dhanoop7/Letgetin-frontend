"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Video,
  Sparkles,
  Mic,
  Volume2,
  Layers,
  BarChart2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Copy,
  FileText,
  Sliders,
  Award,
  Send,
  Square,
  RotateCcw,
  Check,
  HelpCircle,
  ListChecks,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { interviewBuddyService } from "@/features/interviewBuddy/services/interviewBuddyService";

interface QuestionItem {
  id: string;
  questionNumber: number;
  category: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  expectedAnswer: string;
  keywords: string[];
  explanation: string;
  starTip?: string;
  codeSnippet?: string;
}

interface InterviewMode {
  id: string;
  title: string;
  badge: string;
  icon: typeof Video;
  iconBg: string;
  iconColor: string;
  description: string;
  actionText: string;
  interviewerIntro: string;
  questions: QuestionItem[];
}

const INTERVIEW_MODES: InterviewMode[] = [
  {
    id: "simulated-hiring",
    title: "Simulated Hiring Manager Interview",
    badge: "Full Session",
    icon: Video,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    description: "Practice a realistic hiring-manager style interview with follow-up probing and behavioral evaluation.",
    actionText: "Launch Simulation",
    interviewerIntro: "Welcome to your Simulated Hiring Manager Interview. I will evaluate your leadership, decision-making, and cross-functional impact using the STAR method.",
    questions: [
      {
        id: "shm-1",
        questionNumber: 1,
        category: "Leadership & Conflict Resolution",
        question: "Describe a situation where you had a strong disagreement with a technical lead or product manager. How did you resolve it?",
        options: [
          "Insisted on my preferred architecture until the team agreed to avoid tech debt.",
          "Used empirical data, trade-off matrices, and customer impact alignment to reach consensus.",
          "Escalated immediately to the VP of Engineering to decide between the approaches.",
          "Implemented both versions in parallel to let user feedback decide later.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "Used data and objective trade-off matrices to evaluate technical feasibility and business priorities, scheduled an alignment discussion to hear their rationale, and reached consensus focused on customer outcome.",
        keywords: ["data", "alignment", "trade-off", "consensus", "compromise", "stakeholder", "customer", "listen", "objective", "resolution"],
        explanation: "Hiring managers look for candidates who detach ego from technical debates, listen actively, use empirical data, and commit to shared goals (Disagree and Commit).",
        starTip: "Structure using STAR: Situation (the debate), Task (the conflict), Action (data/meeting), Result (delivery without friction).",
      },
      {
        id: "shm-2",
        questionNumber: 2,
        category: "Delivery & Time Management",
        question: "How do you handle unexpected scope creep or delayed dependencies when a mission-critical release deadline is fixed?",
        options: [
          "Require the engineering team to work overtime across the weekend to hit the date.",
          "Silently skip test coverage and security linters to expedite code merging.",
          "Perform ruthless MVP triage to de-scope non-critical features and align stakeholders early.",
          "Postpone the launch indefinitely without notifying executive leadership.",
        ],
        correctOptionIndex: 2,
        expectedAnswer: "Immediately perform a ruthless MVP triage to de-scope non-essential features, communicate transparently with stakeholders early, parallelize work streams, and establish contingency buffers.",
        keywords: ["triage", "de-scope", "mvp", "prioritize", "transparent", "stakeholder", "communicate", "buffer", "timeline", "scope"],
        explanation: "Leadership demands proactive communication over heroic last-minute crunching. De-scoping and early stakeholder alignment protect delivery quality.",
        starTip: "Highlight how early risk flags saved the team from a disastrous last-minute delay.",
      },
      {
        id: "shm-3",
        questionNumber: 3,
        category: "Engineering Culture & Mentorship",
        question: "What concrete steps do you take to foster continuous technical growth and high code quality within your engineering team?",
        options: [
          "Institute constructive peer code reviews, blameless post-mortems, and structured 1-on-1 mentorship.",
          "Assign all complex tasks strictly to senior engineers and routine tasks to juniors.",
          "Reject pull requests that do not match the lead engineer's personal styling preference.",
          "Eliminate sprint refactoring tasks to dedicate 100% of time to feature shipping.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Institute peer code reviews with clear linting standards, conduct regular tech-talks / blameless post-mortems, provide 1-on-1 mentorship, and reserve sprint capacity for refactoring.",
        keywords: ["code review", "mentor", "post-mortem", "standards", "pair programming", "refactoring", "knowledge sharing", "growth", "culture"],
        explanation: "Great seniors scale their impact by leveling up peers through psychological safety, constructive reviews, and blameless retrospectives.",
        starTip: "Give a concrete example of a junior engineer you successfully mentored into an independent contributor.",
      },
      {
        id: "shm-4",
        questionNumber: 4,
        category: "System Resilience & Production Outages",
        question: "When a severe P0 outage occurs in production, what is your step-by-step incident management protocol?",
        options: [
          "Immediately begin refactoring the broken service in production without communication.",
          "First stabilize and rollback to restore service, coordinate via incident lead, then conduct a blameless 5-Whys post-mortem.",
          "Assign blame to the engineer whose commit introduced the bug in public channels.",
          "Wait for user tickets to pile up to determine the full severity of the incident.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "First stabilize/rollback to restore user service, maintain a live incident channel with clear lead roles, capture logs/telemetry, and follow up with a thorough blameless post-mortem and automated regression fixes.",
        keywords: ["rollback", "mitigate", "incident", "triage", "post-mortem", "telemetry", "logs", "monitor", "restore", "stabilize"],
        explanation: "Mitigation comes before deep root-cause investigation. Once user impact is zero, conduct a 5-Whys root cause analysis.",
        starTip: "Emphasize Mean Time to Recovery (MTTR) over pointing fingers.",
      },
      {
        id: "shm-5",
        questionNumber: 5,
        category: "Strategic Career & Impact",
        question: "Why are you interested in this role, and what unique value do you bring within your first 90 days?",
        options: [
          "I will completely rewrite the entire tech stack from scratch in my first 30 days.",
          "Learn domain workflows in 30 days, ship high-impact features by 60 days, and optimize velocity and system reliability by 90 days.",
          "I will wait for managers to assign daily tickets before taking any initiative.",
          "Focus exclusively on personal side projects while completing assigned tasks.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "I bring strong domain expertise and structured delivery habits. In the first 30 days I will learn domain workflows, by 60 days ship high-impact features, and by 90 days optimize team velocity and reliability.",
        keywords: ["30-60-90", "velocity", "value", "impact", "domain", "deliver", "features", "reliability", "alignment", "learn"],
        explanation: "A crisp 30-60-90 day mental model demonstrates executive readiness, proactive onboarding, and fast time-to-productivity.",
        starTip: "Align your 90-day plan directly with the company's current quarter roadmap challenges.",
      },
    ],
  },
  {
    id: "custom-scenario",
    title: "Custom Scenario Setup",
    badge: "Customizable",
    icon: Sliders,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    description: "Configure a customized interview scenario with tailored role seniority, demeanor, and technical scope.",
    actionText: "Configure Setup",
    interviewerIntro: "Welcome to your custom scenario drill. I will probe your decision-making boundaries, architectural trade-offs, and strategic prioritization.",
    questions: [
      {
        id: "cs-1",
        questionNumber: 1,
        category: "Technical Debt vs Feature Velocity",
        question: "How do you evaluate trade-offs between technical debt accumulation and aggressive feature shipment in high-growth sprints?",
        options: [
          "Quantify tech debt risk, budget 15-20% capacity for refactoring, and prioritize debt that blocks velocity or causes downtime.",
          "Ignore all technical debt until the company completes its next major funding round.",
          "Halt all feature development for 6 months to perform a full system rebuild.",
          "Only refactor code if it is written by another developer.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Quantify the interest rate of tech debt against customer impact, dedicate a fixed 15-20% sprint capacity to debt refactoring, and prioritize debt that impedes critical velocity or causes outages.",
        keywords: ["capacity", "quantify", "velocity", "balance", "refactor", "risk", "interest", "sprint", "trade-off", "prioritize"],
        explanation: "Tech debt is an engineering loan. It must be budgeted intentionally rather than ignored until system collapse.",
      },
      {
        id: "cs-2",
        questionNumber: 2,
        category: "Microservices vs Monolith",
        question: "Under what specific criteria would you recommend breaking a monolithic codebase into microservices?",
        options: [
          "Whenever a new feature is requested by the product team.",
          "When independent team velocity, differing scaling bottlenecks, and clear bounded contexts justify distributed complexity.",
          "Strictly when the codebase reaches more than 1,000 lines of total code.",
          "To avoid writing integration tests across existing services.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "When independent team scaling, disparate deployment lifecycles, differing scalability bottlenecks, and clear bounded contexts outweigh the distributed operational complexity.",
        keywords: ["bounded context", "scaling", "deployment", "independent", "complexity", "team", "network", "distributed", "lifecycle"],
        explanation: "Microservices solve organizational scaling problems, not just technical ones. Premature distributed systems introduce unnecessary latency and ops overhead.",
      },
      {
        id: "cs-3",
        questionNumber: 3,
        category: "API Versioning Strategy",
        question: "What is the industry best practice for handling breaking changes in public REST APIs without disrupting existing clients?",
        options: [
          "Deploy breaking changes immediately without versioning so clients are forced to update.",
          "Use URI or header versioning (/v1, /v2), provide backward-compatible deprecation windows, and publish migration guides.",
          "Change HTTP status codes from 200 to 500 when old endpoints are accessed.",
          "Delete deprecated fields from payloads without prior announcements.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "Use URI path versioning (e.g. /v1, /v2) or header versioning, maintain backward compatibility with deprecation headers, provide migration guides, and enforce sunset timelines.",
        keywords: ["versioning", "backward compatibility", "deprecation", "sunset", "v1", "v2", "headers", "migration", "breaking"],
        explanation: "Clear semantic versioning and non-breaking contract extensions prevent client downtime.",
      },
      {
        id: "cs-4",
        questionNumber: 4,
        category: "Cost Optimization & Cloud Architecture",
        question: "How do you detect, analyze, and optimize spiraling cloud infrastructure costs (AWS/GCP/Azure)?",
        options: [
          "Shut down all production servers during non-business hours.",
          "Enforce cost allocation tagging, right-size idle compute, leverage spot/reserved instances, and configure auto-scaling policies.",
          "Switch all cloud storage to local disks on developer laptops.",
          "Disable all database replication and backups to cut storage costs.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "Tag all cloud resources with owner metadata, analyze cost anomaly reports, right-size over-provisioned instances, leverage spot/reserved instances, and implement auto-scaling policies.",
        keywords: ["tagging", "cost", "auto-scaling", "reserved", "right-size", "telemetry", "anomaly", "storage tier", "budget"],
        explanation: "FinOps requires continuous visibility, tag enforcement, and elastic resource management.",
      },
      {
        id: "cs-5",
        questionNumber: 5,
        category: "Security & Zero-Trust Architecture",
        question: "What are the core pillars of implementing a Zero-Trust security model for internal engineering services?",
        options: [
          "Trust any connection that comes from within the corporate VPN without authentication.",
          "Mutual TLS (mTLS), strict least-privilege IAM roles, ephemeral tokens, and continuous audit logging for every request.",
          "Store admin credentials in hardcoded environment variables across microservices.",
          "Disable TLS encryption between internal services to boost network speed.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "Never trust, always verify: Mutual TLS (mTLS), strict least-privilege IAM roles, ephemeral JWT tokens, centralized audit logging, and continuous automated vulnerability scanning.",
        keywords: ["zero trust", "mtls", "iam", "least privilege", "jwt", "tokens", "verify", "audit", "encryption", "auth"],
        explanation: "Zero-Trust assumes the internal perimeter is already compromised and authenticates every single service-to-service hop.",
      },
    ],
  },
  {
    id: "voice-ai",
    title: "Voice AI Practice",
    badge: "Voice AI",
    icon: Mic,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    description: "Real-time interactive voice-based interview practice evaluating speech clarity, pacing, and keyword relevance.",
    actionText: "Start Practice",
    interviewerIntro: "Voice AI practice initialized. Speak clearly into your microphone as I analyze pacing, tone, and keyword relevance in real time.",
    questions: [
      {
        id: "va-1",
        questionNumber: 1,
        category: "Executive Communication",
        question: "Walk me through how you communicate complex architectural changes to non-technical executive stakeholders.",
        options: [
          "Translate technical metrics into business outcomes (revenue impact, risk mitigation, ROI, availability) using clear analogies.",
          "Read raw database execution plans and assembly opcodes line by line in the meeting.",
          "Send a 100-page pull request link and ask executives to review the diff directly.",
          "Avoid discussing technical changes with leadership until after production deployment.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "I translate technical concepts into business outcomes such as revenue protection, cost reduction, system availability, and time-to-market using high-level analogies and executive summaries.",
        keywords: ["business outcome", "revenue", "cost", "risk", "analogy", "executive summary", "roi", "simplify", "stakeholder", "clarity"],
        explanation: "Executives care about risk, cost, speed, and customer satisfaction, not database index internals.",
      },
      {
        id: "va-2",
        questionNumber: 2,
        category: "Elevator Pitch & Introduction",
        question: "Give a concise 60-second professional summary of your background, core strengths, and what drives your engineering passion.",
        options: [
          "Recite every single project and git commit chronologically from college to present.",
          "Highlight domain experience, 2 key measurable engineering achievements, core strengths, and passion for scalable UX/systems.",
          "Discuss unrelated hobbies and avoid mentioning technical skills or results.",
          "State only that you are looking for any open engineering position available.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "I am a full-stack engineer with proven experience building scalable web applications, optimizing distributed performance, and driving developer ergonomics with clean, maintainable architecture.",
        keywords: ["full-stack", "scalable", "experience", "performance", "architecture", "results", "impact", "passion", "leadership"],
        explanation: "A great elevator pitch answers: Who you are, your top 2 measurable achievements, and where you excel.",
      },
      {
        id: "va-3",
        questionNumber: 3,
        category: "Cross-Functional Collaboration",
        question: "How do you ensure seamless alignment between UI/UX designers, backend engineers, and product managers during a fast-paced sprint?",
        options: [
          "Establish shared design tokens, async OpenAPI contract reviews, and interactive prototype syncs early in the cycle.",
          "Work completely in silos until the final day of sprint testing.",
          "Let backend engineers change API payload schemas without notifying frontend developers.",
          "Disregard Figma designs whenever implementation requires custom CSS.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Establish design tokens / shared component contracts early, hold async API contract reviews, conduct weekly syncs, and demo interactive prototypes before full implementation.",
        keywords: ["design tokens", "api contract", "sync", "prototype", "alignment", "collaboration", "specs", "communication"],
        explanation: "Front-loading contract definitions (OpenAPI specs and Figma design systems) prevents late-stage integration chaos.",
      },
      {
        id: "va-4",
        questionNumber: 4,
        category: "Handling Ambiguity",
        question: "Explain how you handle a project requirement that is vague, open-ended, or lacks clear acceptance criteria.",
        options: [
          "Guess what the client wants and build the entire feature without asking any questions.",
          "Draft a technical RFC with explicit assumptions and proposed flows, validate with stakeholders, and build a rapid PoC.",
          "Refuse to start any development work until a complete 50-page specification is provided.",
          "Delegate the task to another team to avoid responsibility.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "I break down assumptions, write a short technical RFC with proposed user flows, review with stakeholders to validate acceptance criteria, and build a rapid proof-of-concept.",
        keywords: ["rfc", "assumptions", "poc", "proof of concept", "clarify", "acceptance criteria", "scope", "prototype", "validate"],
        explanation: "Ambiguity is an opportunity for senior engineers to define structure and drive product discovery through rapid feedback loops.",
      },
      {
        id: "va-5",
        questionNumber: 5,
        category: "Customer Empathy & Feedback",
        question: "Describe how user telemetry and customer feedback influence your architectural and interface decisions.",
        options: [
          "Pair Core Web Vitals and error telemetry with user interview feedback to eliminate friction points and prioritize high-ROI UX.",
          "Rely solely on personal aesthetic opinions without measuring real user drop-offs.",
          "Delete user feedback tickets that point out performance lags.",
          "Optimize only for high-end gaming laptops and ignore mobile responsiveness.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "I combine quantitative telemetry (Core Web Vitals, conversion funnels, error rates) with qualitative user feedback to identify friction points and prioritize high-ROI UX and performance improvements.",
        keywords: ["telemetry", "web vitals", "feedback", "analytics", "conversion", "error rate", "friction", "user experience", "metrics"],
        explanation: "Engineering exists to serve user delight and business value. Telemetry grounds design in factual usage patterns.",
      },
    ],
  },
  {
    id: "technical-rounds",
    title: "Technical & Coding Rounds",
    badge: "Adaptive",
    icon: Layers,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    description: "Technical and coding interview practice with domain-specific question banks and difficulty scaling.",
    actionText: "Explore Drills",
    interviewerIntro: "Technical evaluation round ready. We will focus on data structures, distributed systems, caching, and debugging methodologies.",
    questions: [
      {
        id: "tr-1",
        questionNumber: 1,
        category: "Node.js & Memory Management",
        question: "How would you diagnose and resolve an intermittent memory leak in a high-throughput Node.js microservice?",
        options: [
          "Restart the server every 10 minutes via cron job without investigating root cause.",
          "Capture V8 heap snapshots, inspect detached closures/event listeners with Clinic.js or DevTools, and enforce memory bounds.",
          "Double the RAM on every server instance without analyzing heap growth.",
          "Disable garbage collection completely to boost CPU throughput.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "Generate V8 heap snapshots during peak memory, analyze detached DOM/closures using Chrome DevTools or Clinic.js, inspect unclosed event listeners or global caches, and apply memory limits.",
        keywords: ["heap snapshot", "clinic.js", "dev tools", "closure", "event listener", "garbage collection", "leak", "v8", "memory", "profiling"],
        explanation: "Heap snapshot diffing reveals retained object graphs, uncollected callbacks, or unbounded cache growth.",
      },
      {
        id: "tr-2",
        questionNumber: 2,
        category: "Distributed Caching & Redis",
        question: "What is Cache Invalidation, and how do you prevent Cache Stampede (Thundering Herd) when a key expires?",
        options: [
          "Set TTL to 0 for all cached items so nothing ever expires.",
          "Use mutex distributed locking (Redlock), probabilistic early refresh (XFetch), or stale-while-revalidate strategies.",
          "Send all client traffic directly to the relational database without a cache.",
          "Delete the Redis instance whenever latency exceeds 50ms.",
        ],
        correctOptionIndex: 1,
        expectedAnswer: "Prevent stampede using mutex locking (Redis redlock), probabilistic early expiration (XFetch), background cache pre-warming, or stale-while-revalidate caching headers.",
        keywords: ["stampede", "mutex", "lock", "thundering herd", "stale-while-revalidate", "pre-warm", "expiration", "redis", "ttl"],
        explanation: "Locking or early async refresh ensures only a single worker queries the origin database while others serve cached or stale data.",
      },
      {
        id: "tr-3",
        questionNumber: 3,
        category: "Database Indexing & Query Optimization",
        question: "What is the difference between Clustered and Non-Clustered indexes, and how does a composite B-Tree index work?",
        options: [
          "Clustered indexes determine physical row order on disk (one per table); composite indexes follow leftmost prefix matching.",
          "Non-clustered indexes reorder table rows physically; composite indexes can be queried in any arbitrary column order.",
          "Clustered indexes only work on string columns, while non-clustered indexes work on numbers.",
          "Indexes slow down SELECT queries but significantly speed up mass INSERTs.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "A clustered index physically sorts and stores table row data on disk (only one per table), while a non-clustered index stores pointers to rows. Composite indexes follow leftmost prefix matching.",
        keywords: ["clustered", "non-clustered", "b-tree", "leftmost prefix", "index", "disk", "pointer", "query plan", "explain"],
        explanation: "Clustered indexes determine physical row order. Composite indexes must match queries from left-to-right to utilize the index tree effectively.",
      },
      {
        id: "tr-4",
        questionNumber: 4,
        category: "Web Performance & Core Web Vitals",
        question: "Explain the difference between LCP, INP, and CLS, and name one key optimization technique for each.",
        options: [
          "LCP measures loading speed (optimize images/SSR), INP measures interaction responsiveness (break long tasks), and CLS measures layout stability (explicit media dimensions).",
          "LCP measures total CSS file size, INP measures network ping, and CLS measures memory leaks.",
          "All three metrics measure server response time from origin databases.",
          "CLS measures how fast JavaScript bundles download on 3G networks.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "LCP measures loading speed (optimize hero images / SSR), INP measures responsiveness to interaction (break up long JavaScript tasks), and CLS measures visual stability (reserve width/height on media).",
        keywords: ["lcp", "inp", "cls", "largest contentful paint", "interaction to next paint", "cumulative layout shift", "dimensions", "tasks", "vitals"],
        explanation: "Core Web Vitals quantify user perceptual performance: Loading (LCP), Interactivity (INP), and Visual Stability (CLS).",
      },
      {
        id: "tr-5",
        questionNumber: 5,
        category: "Concurrency & Event Loop",
        question: "How does the JavaScript event loop prioritize MacroTasks versus MicroTasks (Promises vs setTimeout)?",
        options: [
          "Microtasks (Promise callbacks, queueMicrotask) are drained completely before the next Macrotask (setTimeout) runs.",
          "Macrotasks always execute before any Promise callbacks.",
          "Both queues execute randomly in parallel using multi-threaded locks.",
          "SetTimeout callbacks have highest priority in Node.js event loop phases.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Microtasks (Promise.then, queueMicrotask, process.nextTick) are executed immediately after the current synchronous script and drained completely before the event loop picks the next Macrotask (setTimeout, setInterval).",
        keywords: ["microtask", "macrotask", "promise", "settimeout", "event loop", "queue", "call stack", "nexttick", "priority"],
        explanation: "The microtask queue is emptied after every stack execution, giving Promise callbacks higher execution priority than timer macrotasks.",
      },
    ],
  },
  {
    id: "instant-scoring",
    title: "Instant AI Scoring & STAR Feedback",
    badge: "Analytics",
    icon: BarChart2,
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    description: "AI-powered evaluation and STAR-based feedback reports with structured recommendations.",
    actionText: "View Feedback",
    interviewerIntro: "Scorecard evaluation ready. Answer with metrics and structured timeline milestones for instant analytical grading.",
    questions: [
      {
        id: "is-1",
        questionNumber: 1,
        category: "High-Stakes Post-Mortem",
        question: "Describe a high-stakes production outage you resolved. What post-mortem actions and metrics did you implement?",
        options: [
          "Quickly isolated root cause via distributed tracing, rolled back within 8 mins, and implemented canary deployments and health alerts.",
          "Waited for the database administrator to return the next morning before investigating.",
          "Disabled all production logs so the disk would not fill up during the incident.",
          "Blamed third-party network providers without verifying internal logs.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Identified the root cause via distributed tracing, rolled back the offending deploy within 8 minutes to restore SLA, and implemented automated canary deployments and synthetic health checks.",
        keywords: ["outage", "root cause", "tracing", "canary", "sla", "mttr", "post-mortem", "health check", "rollback", "metrics"],
        explanation: "STAR scoring evaluates quantification: time to mitigate, reduction in failure rate, and guardrails to prevent recurrence.",
      },
      {
        id: "is-2",
        questionNumber: 2,
        category: "System Scaling & Throughput",
        question: "Tell me about a time you optimized a slow system bottleneck. What were the baseline and final benchmark numbers?",
        options: [
          "Profiled queries with EXPLAIN ANALYZE, eliminated N+1 ORM joins, and added Redis caching to reduce p99 from 1,200ms to 45ms.",
          "Increased database connection pool to 100,000 without indexing tables.",
          "Replaced all database tables with raw text files on disk.",
          "Hid slow page loading behind a permanent spinner animation.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Profiled database queries with EXPLAIN ANALYZE, replaced N+1 ORM queries with batch joins, and added Redis caching, reducing p99 latency from 1,200ms to 45ms under 10k RPS.",
        keywords: ["p99", "latency", "rps", "benchmark", "bottleneck", "profiling", "redis", "n+1", "optimize", "metrics"],
        explanation: "Instant scoring rates quantitative impact highly. Stating exact before/after latency and throughput proves engineering rigor.",
      },
      {
        id: "is-3",
        questionNumber: 3,
        category: "Cross-Functional Influence",
        question: "Give an example of when you persuaded leadership to adopt a new engineering practice or modern framework.",
        options: [
          "Created a working PoC demonstrating 40% build time reduction and calculated cost savings, presenting empirical data to directors.",
          "Complained in general Slack channels until management gave in.",
          "Silently migrated codebase without stakeholder knowledge.",
          "Refused to write features unless new libraries were adopted.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Built a functional prototype showing 40% build time reduction and zero type regressions, presented a cost-benefit calculation to engineering directors, and rolled out pilot migration across two sprint teams.",
        keywords: ["prototype", "cost-benefit", "roi", "pilot", "persuade", "adoption", "velocity", "leadership", "metrics"],
        explanation: "Influencing without authority requires showing tangible evidence (PoC) and addressing managerial concerns on timeline and risk.",
      },
      {
        id: "is-4",
        questionNumber: 4,
        category: "Failure & Course Correction",
        question: "Describe a project that failed to meet its initial goals. What did you learn, and how did you pivot?",
        options: [
          "Conducted user interviews to identify flawed assumptions, pivoted UX flow, and recovered 75% target engagement next sprint.",
          "Abandoned the company to join a new startup immediately.",
          "Blamed the marketing department for poor product adoption.",
          "Continued pushing the unwanted feature despite negative metrics.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "An early feature launch suffered low user adoption due to unvalidated assumptions. We engaged in direct customer interviews, pivoted the UX workflow, and recovered 75% target engagement in the next sprint.",
        keywords: ["failure", "learn", "pivot", "assumptions", "feedback", "retrospective", "user interview", "recovered", "adoption"],
        explanation: "STAR scoring looks for accountability, humility, data-driven course correction, and organizational learning.",
      },
      {
        id: "is-5",
        questionNumber: 5,
        category: "Team Velocity & Automation",
        question: "How have you automated manual repetitive developer workflows to increase team development velocity?",
        options: [
          "Implemented automated CI preview deploys, TypeScript OpenAPI generator, and husky hooks, saving ~4 dev hours weekly.",
          "Manually copied files to production servers via FTP every Friday.",
          "Instructed developers to stop running tests to speed up commits.",
          "Disabled code formatting rules to reduce build times.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Built an automated CI/CD pipeline with preview deployments, auto-generated TypeScript OpenAPI clients, and husky pre-commit linters, saving approximately 4 engineering hours per developer weekly.",
        keywords: ["ci/cd", "preview", "automation", "husky", "pipeline", "openapi", "hours saved", "velocity", "developer experience"],
        explanation: "Quantifying developer velocity improvements (hours saved per sprint) demonstrates high leverage engineering leadership.",
      },
    ],
  },
  {
    id: "mockup-interview",
    title: "Mockup Interview",
    badge: "360° Mock",
    icon: Award,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    description: "Comprehensive mockup interview testing end-to-end readiness, domain mastery, and communication.",
    actionText: "Start Mockup",
    interviewerIntro: "360° Mock Interview session active. Let's start with big-picture technical vision, architecture, and live coding design.",
    questions: [
      {
        id: "mi-1",
        questionNumber: 1,
        category: "Future Architecture & Tech Vision",
        question: "Where do you see the biggest architectural innovations in scalable web engineering over the next 2 to 3 years?",
        options: [
          "Edge compute, AI-assisted workflows, WebAssembly for heavy client workloads, and fine-grained reactivity (Signals/RSC).",
          "Returning to server-side CGI scripts written in Perl.",
          "Discontinuing the use of web browsers in favor of terminal CLIs.",
          "Eliminating all JavaScript from web application development.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Edge compute / serverless at the edge, AI-assisted code generation, WebAssembly for heavy client workloads, and fine-grained reactivity architectures (like Signals and React Server Components).",
        keywords: ["edge", "serverless", "webassembly", "wasm", "ai", "reactivity", "signals", "rsc", "server components", "scaling"],
        explanation: "Candidates demonstrate forward-thinking vision by connecting bleeding-edge capabilities with practical enterprise adoption.",
      },
      {
        id: "mi-2",
        questionNumber: 2,
        category: "System Design: URL Shortener",
        question: "Design a high-scale URL shortening service like TinyURL. How do you generate unique 7-character hashes and handle 100M daily writes?",
        options: [
          "Base62 encoding on unique distributed 64-bit IDs (Snowflake/Redis counter), partitioned database, and CDN/Redis LRU caching.",
          "MD5 hash of the original URL truncated to 7 characters without collision handling.",
          "Store all URLs in a single flat CSV file on a single server.",
          "Generate random 7-letter strings and query the entire database on every write to check duplicates.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Use Base62 encoding on unique distributed auto-increment IDs (Snowflake ID or Redis counter), store in partitioned NoSQL/SQL with read replicas, and front with CDN and Redis LRU cache.",
        keywords: ["base62", "snowflake", "hash", "redis", "lru", "counter", "partition", "replica", "cdn", "nosql"],
        explanation: "Base62 (62^7 = 3.5 trillion URLs) with distributed ID generation prevents hash collisions and write bottlenecks.",
      },
      {
        id: "mi-3",
        questionNumber: 3,
        category: "Security: Authentication & Token Storage",
        question: "What is the most secure method to store and transport JWT authentication tokens in a single-page web app?",
        options: [
          "HTTP-only, Secure, SameSite=Strict cookies for refresh tokens, with short-lived memory access tokens to prevent XSS.",
          "Plain localStorage with no expiration check.",
          "Unencrypted query parameters in GET request URLs.",
          "Browser sessionStorage accessible to third-party ad scripts.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Store tokens in HTTP-only, Secure, SameSite=Strict cookies to protect against XSS attacks, implement short-lived access tokens with rotating refresh tokens, and protect against CSRF.",
        keywords: ["http-only", "secure", "samesite", "cookies", "xss", "csrf", "refresh token", "jwt", "rotation"],
        explanation: "LocalStorage is vulnerable to XSS script injection. HTTP-only cookies prevent JavaScript access to auth tokens.",
      },
      {
        id: "mi-4",
        questionNumber: 4,
        category: "Testing Strategy & CI Quality Gates",
        question: "What does an effective Testing Pyramid look like in a modern production web application?",
        options: [
          "Broad base of fast unit tests, middle layer of integration/API contract tests, and lightweight top layer of critical E2E tests.",
          "100% manual QA testing with zero automated unit tests.",
          "Exclusively E2E UI tests that take 6 hours to run on every commit.",
          "Testing only in production after users report bugs.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "A broad foundation of fast unit tests for business logic, a middle layer of integration/API contract tests, and a lightweight top layer of critical E2E user-flow tests (Playwright/Cypress).",
        keywords: ["pyramid", "unit test", "integration", "e2e", "playwright", "cypress", "contract", "coverage", "mocking"],
        explanation: "The pyramid ensures fast developer feedback in CI while guaranteeing that critical customer checkout/auth flows remain unbreakable.",
      },
      {
        id: "mi-5",
        questionNumber: 5,
        category: "Behavioral: Delivering under Pressure",
        question: "Describe a high-pressure situation where requirements changed 48 hours before an executive product launch. How did you adapt?",
        options: [
          "Maintained calm leadership, rapidly reassessed core deliverables, negotiated phased rollout, and mobilized focused pairing sessions.",
          "Panic and cancel the launch without consulting stakeholders.",
          "Worked 48 hours continuously without sleep while producing untested code.",
          "Refused to accept the new requirement and blamed product managers.",
        ],
        correctOptionIndex: 0,
        expectedAnswer: "Maintained calm leadership, rapidly reassessed the core deliverables, negotiated phased rollout with the product director, mobilized focused pairing sessions, and delivered the core flow without downtime.",
        keywords: ["pressure", "reassess", "negotiate", "phased", "rollout", "calm", "prioritize", "pairing", "delivery", "success"],
        explanation: "Poise under pressure, tactical de-scoping, and team alignment are the hallmark traits of senior engineering leaders.",
      },
    ],
  },
];

const SAMPLE_JD = `Senior Engineering Team Lead
Requirements:
- Proven experience leading high-performing software engineering teams.
- Deep expertise in scalable cloud architecture and distributed microservices.
- Excellent cross-functional communication and stakeholder management.`;

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

export default function AIInterviewBuddyPage() {
  const [selectedModeId, setSelectedModeId] = useState<string>("simulated-hiring");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState<boolean>(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<QuestionItem[]>([]);
  
  // Two answer modes: Objective Answer vs Type Your Answer
  const [answerMode, setAnswerMode] = useState<"objective" | "typed">("objective");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [userResponse, setUserResponse] = useState<string>("");

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [transcriptMessages, setTranscriptMessages] = useState<string[]>([]);

  // Answer tracking and scoring
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

  const selectedMode = INTERVIEW_MODES.find((m) => m.id === selectedModeId) || INTERVIEW_MODES[0];
  const questionsList = dynamicQuestions.length > 0 ? dynamicQuestions : selectedMode.questions;
  const currentQuestion = questionsList[currentQuestionIndex] || questionsList[0];

  // Calculate live score based on actual evaluated correct answers
  const correctCount = Object.values(answeredMap).filter((a) => a.isCorrect && a.scoreAwarded).length;
  const totalQuestions = questionsList.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

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
        setUserResponse("");
      } else {
        setUserResponse(record.userAnswer);
        setSelectedOptionIndex(null);
      }
    } else {
      setSelectedOptionIndex(null);
      setUserResponse("");
    }
  }, [currentQuestionIndex, currentQuestion?.id, answeredMap]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = async (modeId?: string) => {
    const activeModeId = modeId || selectedModeId;
    const activeMode = INTERVIEW_MODES.find((m) => m.id === activeModeId) || selectedMode;
    if (modeId) setSelectedModeId(modeId);

    setIsGeneratingAI(true);
    try {
      const res = await interviewBuddyService.generateBuddyQuestions({
        mode: activeModeId,
        jobDescription: jobDescription.trim(),
      });

      if (!res || !Array.isArray(res.questions) || res.questions.length === 0) {
        toast.error("Unable to generate AI interview questions. Please try again.");
        setIsGeneratingAI(false);
        return;
      }

      setDynamicQuestions(res.questions);
      setIsSessionActive(true);
      setIsCompleted(false);
      setCurrentQuestionIndex(0);
      setAnswerMode("objective");
      setSelectedOptionIndex(null);
      setUserResponse("");
      setAnsweredMap({});
      setIsRecording(false);
      setIsPlayingAudio(false);
      setTimerSeconds(0);
      setTranscriptMessages([activeMode.interviewerIntro]);
      toast.success(`Starting ${activeMode.title}!`);
    } catch (err: any) {
      console.error("[InterviewBuddy] Gemini generation failed:", err);
      toast.error(err?.message || "Unable to generate AI interview questions. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleExitSession = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSessionActive(false);
    setIsCompleted(false);
    setEvaluationModal(null);
  };

  const handleSpeakToggle = () => {
    const SpeechRecognition =
      (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));

    if (!SpeechRecognition) {
      toast.info("Speech recognition not supported in this browser. Please type your response.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      toast.info("Voice input paused.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        setAnswerMode("typed");
        toast.success("Listening... Speak your answer clearly.");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setUserResponse(transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsRecording(false);
    }
  };

  const handlePlayQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `Question ${currentQuestionIndex + 1}. ${currentQuestion.category}. ${currentQuestion.question}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Evaluate user's typed response
  const evaluateAnswer = (input: string, q: QuestionItem): boolean => {
    const cleanInput = input.toLowerCase().trim();
    if (cleanInput.length < 5) return false;

    // Check keyword matching threshold
    const matchingKeywords = (q.keywords || []).filter((kw) => cleanInput.includes(kw.toLowerCase()));
    
    // Substantial answer with matching keywords
    if (matchingKeywords.length >= 2 || (matchingKeywords.length >= 1 && cleanInput.length >= 30)) {
      return true;
    }

    // Direct similarity substring match with expected answer
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

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
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
      if (!userResponse.trim()) {
        toast.error("Please type or speak your answer before submitting.");
        return;
      }
      submittedUserAnswer = userResponse.trim();
      setIsEvaluatingAnswer(true);

      try {
        const evalRes = await interviewBuddyService.evaluateBuddyAnswer({
          question: q.question,
          answer: submittedUserAnswer,
          category: q.category,
          mode: selectedModeId,
          expectedAnswer: q.expectedAnswer,
          jobDescription: jobDescription.trim(),
        });

        if (evalRes && typeof evalRes.score === "number") {
          isCorrect = evalRes.isCorrect;
          explanationText = evalRes.feedback || q.explanation;
        } else {
          isCorrect = evaluateAnswer(submittedUserAnswer, q);
        }
      } catch (err: any) {
        console.warn("[InterviewBuddy] Evaluation API error, fallback to keyword evaluation:", err);
        isCorrect = evaluateAnswer(submittedUserAnswer, q);
      } finally {
        setIsEvaluatingAnswer(false);
      }
    }

    // Save evaluation result in answeredMap with duplicate protection
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

    // Add candidate response & evaluation to transcript
    const feedbackText = isCorrect
      ? `AI Evaluation: Correct! Strong technical mastery of ${q.category}.`
      : `AI Evaluation: Incomplete or incorrect. Expected answer: "${q.options ? q.options[q.correctOptionIndex] : q.expectedAnswer}".`;

    setTranscriptMessages((prev) => [
      ...prev,
      `Candidate (${answerMode.toUpperCase()} Q${q.questionNumber}): "${submittedUserAnswer}"`,
      feedbackText,
    ]);

    // Show evaluation modal
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
    if (currentQuestionIndex + 1 < questionsList.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      toast.success("Interview completed! Final score ready.");
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleCopyTranscript = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(transcriptMessages.join("\n\n"));
      toast.success("Interview transcript copied to clipboard!");
    }
  };

  const isCurrentQuestionAnswered = !!answeredMap[currentQuestion?.id];
  const currentRecord = answeredMap[currentQuestion?.id];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* View 1: 6-Card Selection Landing Page (Preserved) */}
      {!isSessionActive ? (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="space-y-2">
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

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Box: Job Description */}
            <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-elegant space-y-4 flex flex-col justify-between min-h-[520px]">
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
                  Paste the job description to personalize your interview questions, seniority level, and evaluation criteria.
                </p>

                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={15}
                  className="input-base text-xs leading-relaxed resize-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-ink-soft">
                <span>{jobDescription ? `${jobDescription.length} characters` : "Ready for JD paste"}</span>
                {jobDescription && (
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> JD Context Active
                  </span>
                )}
              </div>
            </div>

            {/* Right Box: 6 Interview Mode Cards */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-elegant space-y-4 flex flex-col justify-between min-h-[520px]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-primary-glow" />
                  <h2 className="text-sm font-bold text-ink">Interview Modes</h2>
                </div>
                <p className="text-xs text-ink-soft mb-4">
                  Choose an interview mode to practice for your target role.
                </p>

                {/* 2x3 Grid of Mode Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {INTERVIEW_MODES.map((mode) => {
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
                          <p className="text-[11px] text-ink-soft leading-snug line-clamp-2">
                            {mode.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border/50 flex items-center justify-end text-[11px]">
                          <button
                            type="button"
                            disabled={isGeneratingAI}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartSession(mode.id);
                            }}
                            className={`font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              isSelected ? "text-primary-glow" : "text-ink-soft group-hover:text-primary-glow"
                            }`}
                          >
                            <span>{isGeneratingAI && selectedModeId === mode.id ? "Generating..." : mode.actionText}</span>
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
                  Selected Mode: <strong className="text-ink">{selectedMode.title}</strong>
                </span>
                <span className="text-primary-glow font-medium">{selectedMode.badge}</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Card Banner */}
          <div className="bg-surface border border-border rounded-3xl p-4 sm:p-5 shadow-elegant flex items-center justify-between gap-4">
            <span className="text-xs text-ink-soft">{jobDescription ? "JD Context Ready" : "Ready for JD paste"}</span>
            <button
              type="button"
              disabled={isGeneratingAI}
              onClick={() => handleStartSession()}
              className="px-8 py-3 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating AI Interview...</span>
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
        /* View 2: Inner Interview Session (Header, Score Strip & Two-Mode Question/Answer Flow) */
        <div className="space-y-6 animate-fade-in">
          {/* 1. Top Blue Gradient Header Banner */}
          <div className="bg-gradient-brand rounded-3xl p-6 sm:p-8 text-white shadow-elegant relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5" />
                <span>Interview Mode • {selectedMode.badge}</span>
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
                onClick={handleExitSession}
                className="px-5 py-2.5 rounded-2xl bg-white text-primary font-bold text-xs shadow-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Mode</span>
              </button>
            </div>

            {/* Background shapes */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* 2. Marks / Score Strip Header */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-elegant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary-glow font-extrabold text-sm shadow-sm">
                {scorePercent}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-ink">Interview Performance Score</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow border border-primary/20">
                    Live Evaluation
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-0.5">
                  Select Objective Answer or Type Your Answer to evaluate your interview skills.
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

          {/* 3. Main Workspace: Final Summary Screen or Active Question & Answer */}
          {isCompleted ? (
            /* Final Score & Performance Report */
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-elegant space-y-6 text-center animate-scale-up">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary-glow mx-auto flex items-center justify-center shadow-glow">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-ink">Interview Session Completed!</h2>
                <p className="text-xs sm:text-sm text-ink-soft">
                  Here is your final evaluated score and question breakdown for{" "}
                  <strong className="text-ink">{selectedMode.title}</strong>.
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
                  onClick={() => handleStartSession(selectedMode.id)}
                  className="px-6 py-3 rounded-2xl border border-border text-ink hover:bg-surface-alt transition font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Practice</span>
                </button>
                <button
                  type="button"
                  onClick={handleExitSession}
                  className="px-8 py-3 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Choose Another Mode</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Active Question & Answer Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 Columns: Question & Two-Mode Answer Box */}
              <div className="lg:col-span-7 space-y-4">
                {/* Question Box */}
                <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-elegant space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-ink bg-primary/10 text-primary-glow px-2.5 py-1 rounded-xl border border-primary/20">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                      </span>
                      <span className="text-[11px] font-semibold text-ink-soft bg-surface-alt px-2.5 py-1 rounded-xl border border-border">
                        {currentQuestion.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handlePlayQuestion}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isPlayingAudio
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : "bg-surface-alt border border-border text-ink hover:text-primary-glow"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlayingAudio ? "Playing..." : "Play Question"}</span>
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-ink leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {currentQuestion.starTip && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-ink space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>STAR Framework Tip:</span>
                      </div>
                      <p className="text-ink-soft leading-relaxed">{currentQuestion.starTip}</p>
                    </div>
                  )}
                </div>

                {/* Answer Mode Box: Two Tabs (Objective Answer vs Type Your Answer) */}
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
                          <span>Type Your Answer</span>
                        </button>
                      </div>
                    </div>

                    {answerMode === "typed" && (
                      <button
                        type="button"
                        onClick={handleSpeakToggle}
                        disabled={isCurrentQuestionAnswered}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isRecording
                            ? "bg-destructive text-white animate-pulse"
                            : "bg-primary/10 border border-primary/20 text-primary-glow hover:bg-primary/20"
                        }`}
                      >
                        {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isRecording ? "Stop Recording" : "Speak into Mic"}</span>
                      </button>
                    )}
                  </div>

                  {/* Mode A: Objective Answer Option Selection */}
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
                    /* Mode B: Type Your Answer Text Area */
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        placeholder="Type your answer here..."
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
                          Words: <strong className="text-ink">{userResponse ? userResponse.split(/\s+/).filter(Boolean).length : 0}</strong>
                        </span>
                      )}
                      <span>• Objective evaluation</span>
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
                          <span>{currentQuestionIndex + 1 < totalQuestions ? "Next Question" : "Finish Interview"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: AI Transcript & Live Evaluation Panel */}
              <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-elegant space-y-4 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary-glow" />
                      <h3 className="text-sm font-bold text-ink">AI Evaluation & Transcript</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="p-1.5 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition text-xs flex items-center gap-1 cursor-pointer"
                      title="Copy transcript"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-ink-soft">
                    Live conversational dialogue, objective answer evaluation & STAR report
                  </p>

                  {/* Transcript Dialog Stream */}
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {transcriptMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.startsWith("Candidate")
                            ? "bg-primary/10 border border-primary/20 text-ink ml-3"
                            : msg.startsWith("AI Evaluation: Correct")
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-ink"
                            : msg.startsWith("AI Evaluation: Incomplete")
                            ? "bg-rose-500/10 border border-rose-500/20 text-ink"
                            : "bg-surface-alt/60 border border-border text-ink-soft"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Bot className="w-3.5 h-3.5 text-primary-glow" />
                          <span className="font-bold text-ink">
                            {msg.startsWith("Candidate") ? "Candidate" : "AI Evaluator"}
                          </span>
                        </div>
                        <p>{msg}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-ink-soft">
                  <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live answer evaluation active
                  </span>
                  <span className="font-medium text-ink">
                    {Object.keys(answeredMap).length} / {totalQuestions} answered
                  </span>
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
                <span>{currentQuestionIndex + 1 < totalQuestions ? "Next Question" : "Finish Interview"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

