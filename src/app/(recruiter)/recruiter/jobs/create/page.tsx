"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  X,
  FileText,
  GraduationCap,
  Briefcase,
  Crown,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  FileQuestion,
  Users,
  Code,
  Plus,
  Trash2,
} from "lucide-react";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";
import { BuyCreditsModal } from "@/features/recruiter/components/BuyCreditsModal";
import { UpgradePlanModal } from "@/features/recruiter/components/UpgradePlanModal";
import { AIAssistPanel } from "@/features/recruiter/components/AIAssistPanel";
import { CustomQuestionModal, CustomQuestionItem } from "@/features/recruiter/components/CustomQuestionModal";
import { AIWritingAssistant } from "@/features/aiWriting/components/AIWritingAssistant";
import { SkillRequirementsInput } from "@/features/recruiter/components/SkillRequirementsInput";
import {
  AssessmentRoundConfig,
  CreditPack,
  EducationLevel,
  EmploymentType,
  GeneralAssessmentQuestionType,
  GeneratedJobContent,
  JobRequirements,
  JobSkillRequirement,
  SkillProficiency,
  MatchVolumeOption,
  PipelineOptions,
  PipelineSection,
  PipelineSubOptionsCatalog,
  WorkplaceType,
} from "@/features/recruiter/types";

const EDUCATION_LEVEL_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "none", label: "No specific requirement" },
  { value: "high_school", label: "High School" },
  { value: "associate", label: "Associate Degree" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate / Ph.D." },
  { value: "other", label: "Other / Equivalent" },
];

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

const WORKPLACE_TYPES: { value: WorkplaceType; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const SECTION_META: Record<PipelineSection, { label: string; description: string }> = {
  resumeMatch: { label: "Resume Shortlisting", description: "Automatically rank applicants against this job" },
  assessment: { label: "Assessment", description: "Send an assessment to shortlisted candidates" },
  aiInterview: { label: "AI Interview", description: "Run an AI-driven candidate interview" },
};

export default function CreateJobPage() {
  const router = useRouter();
  const { orgProfile } = useRecruiterStore();

  // Step state: 1 = Role Definition, 2 = Pipeline & Assessment, 3 = Funnel & Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Role Basics & Structured Requirements
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full-time");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>("remote");
  const [salaryText, setSalaryText] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [requiredSkills, setRequiredSkills] = useState<JobSkillRequirement[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [minimumExperience, setMinimumExperience] = useState("");
  const [maximumExperience, setMaximumExperience] = useState("");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("none");
  const [educationFieldsText, setEducationFieldsText] = useState("");

  const handleRequiredSkillsChange = (newSkills: JobSkillRequirement[]) => {
    setRequiredSkills(newSkills);
    const requiredLowers = new Set(newSkills.map((s) => s.name.toLowerCase()));
    setPreferredSkills((prev) => prev.filter((s) => !requiredLowers.has(s.toLowerCase())));
  };

  const handlePreferredSkillsChange = (newSkills: string[]) => {
    const requiredLowers = new Set(requiredSkills.map((s) => s.name.toLowerCase()));
    const filtered = newSkills.filter((s) => !requiredLowers.has(s.toLowerCase()));
    setPreferredSkills(filtered);
  };

  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [pendingGeneratedContent, setPendingGeneratedContent] = useState<GeneratedJobContent | null>(null);
  const [hasAiGeneratedContent, setHasAiGeneratedContent] = useState(false);

  // Step 2: Hiring Pipeline & Assessments
  const [matchVolume, setMatchVolume] = useState<string | null>(null);
  const [customRatioError, setCustomRatioError] = useState<string | null>(null);

  // Resume shortlisting
  const [resumeMatchEnabled, setResumeMatchEnabled] = useState(true);
  const [selectedSubOptions, setSelectedSubOptions] = useState<Record<PipelineSection, Set<string>>>({
    resumeMatch: new Set(),
    assessment: new Set(),
    aiInterview: new Set(),
  });

  // Assessment Module 1: AI Online Test (Strictly MCQ Only)
  const [aiOnlineTestEnabled, setAiOnlineTestEnabled] = useState(false);
  const [onlineTestConfig, setOnlineTestConfig] = useState({
    questionCount: 15,
    durationMinutes: 45,
    passingScore: 70,
    difficulty: "mixed" as "beginner" | "intermediate" | "advanced" | "mixed",
  });
  const [onlineTestCustomQuestions, setOnlineTestCustomQuestions] = useState<CustomQuestionItem[]>([]);

  // Assessment Module 2: Interview (Screening & Technical)
  const [interviewEnabled, setInterviewEnabled] = useState(false);
  const [screeningInterviewEnabled, setScreeningInterviewEnabled] = useState(true);
  const [technicalInterviewEnabled, setTechnicalInterviewEnabled] = useState(true);
  const [screeningDuration, setScreeningDuration] = useState(20);
  const [technicalDuration, setTechnicalDuration] = useState(45);

  // Assessment Module 3: AI Assessment (Basic Aptitude & Coding Test)
  const [aiAssessmentEnabled, setAiAssessmentEnabled] = useState(false);
  const [aiAssessmentConfig, setAiAssessmentConfig] = useState({
    aptitudeEnabled: true,
    aptitudeQuestionCount: 10,
    codingEnabled: true,
    codingProblemCount: 2,
    durationMinutes: 60,
    passingScore: 75,
  });
  const [aiAssessmentCustomQuestions, setAiAssessmentCustomQuestions] = useState<CustomQuestionItem[]>([]);

  // Custom question modal state
  const [customQuestionModalTarget, setCustomQuestionModalTarget] = useState<"ai_online_test" | "ai_assessment" | null>(null);

  const handleAddCustomQuestion = (question: CustomQuestionItem) => {
    if (question.target === "ai_online_test") {
      setOnlineTestCustomQuestions((prev) => [...prev, question]);
    } else {
      setAiAssessmentCustomQuestions((prev) => [...prev, question]);
    }
  };

  const handleRemoveCustomQuestion = (target: "ai_online_test" | "ai_assessment", id: string) => {
    if (target === "ai_online_test") {
      setOnlineTestCustomQuestions((prev) => prev.filter((q) => q.id !== id));
    } else {
      setAiAssessmentCustomQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  // Step 3: Candidate Collection & Funnel Targets
  const [finalShortlistTarget, setFinalShortlistTarget] = useState<number>(10);
  const [idealIntake, setIdealIntake] = useState<number>(15);
  const [minimumIntake, setMinimumIntake] = useState<number>(8);
  const [collectionDurationDays, setCollectionDurationDays] = useState<number>(7);
  const [autoExtensionEnabled, setAutoExtensionEnabled] = useState<boolean>(true);
  const [extensionDurationDays, setExtensionDurationDays] = useState<number>(3);
  const [maxExtensions, setMaxExtensions] = useState<number>(2);
  const [autoStartEnabled, setAutoStartEnabled] = useState<boolean>(false);

  // Credits & Billing
  const [balance, setBalance] = useState<number | null>(null);
  const [subOptionsCatalog, setSubOptionsCatalog] = useState<PipelineSubOptionsCatalog | null>(null);
  const [subOptionCost, setSubOptionCost] = useState(10);
  const [matchVolumeOptions, setMatchVolumeOptions] = useState<MatchVolumeOption[]>([]);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const loadCredits = () => {
    setLoadingCredits(true);
    recruiterService
      .getCredits()
      .then((res) => {
        setBalance(res.balance);
        setSubOptionsCatalog(res.pipelineSubOptions);
        setSubOptionCost(res.subOptionCost);
        setMatchVolumeOptions(res.matchVolumeOptions);
        setPacks(res.packs);
      })
      .catch(() => {})
      .finally(() => setLoadingCredits(false));
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const applyGeneratedContent = (content: GeneratedJobContent) => {
    setDescription(content.description);
    if (content.skills && content.skills.length > 0) {
      const mapped: JobSkillRequirement[] = content.skills.map((sk) => ({
        name: sk.trim(),
        proficiency: "intermediate" as SkillProficiency,
      }));
      handleRequiredSkillsChange(mapped);
    }
    setHasAiGeneratedContent(true);
    setPendingGeneratedContent(null);
  };

  const handleGenerateContent = async () => {
    if (!title.trim()) return;
    setGenerationError(null);
    setIsGeneratingContent(true);
    try {
      const content = await recruiterService.generateJobContent({
        title: title.trim(),
        employmentType,
        workplaceType,
        location: location.trim() || undefined,
      });

      if (!content) {
        setGenerationError("AI generation is temporarily unavailable. You can still fill this in manually.");
        return;
      }

      const hasExistingContent = description.trim().length > 0 || requiredSkills.length > 0 || preferredSkills.length > 0;
      if (hasExistingContent) {
        setPendingGeneratedContent(content);
      } else {
        applyGeneratedContent(content);
      }
    } catch (err: unknown) {
      setGenerationError((err as { message?: string })?.message || "AI generation is temporarily unavailable. You can still fill this in manually.");
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const toggleSubOption = (section: PipelineSection, key: string) => {
    setSelectedSubOptions((prev) => {
      const next = new Set(prev[section]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, [section]: next };
    });
  };

  // AI Assist smart suggestions handler
  const handleApplySuggestion = (type: "skills" | "pipeline" | "funnel") => {
    if (type === "skills") {
      const recommended = ["Problem Solving", "Agile Collaboration", "System Design"];
      setPreferredSkills((prev) => Array.from(new Set([...prev, ...recommended])));
    } else if (type === "pipeline") {
      setAiOnlineTestEnabled(true);
      setInterviewEnabled(true);
      setScreeningInterviewEnabled(true);
      setTechnicalInterviewEnabled(true);
      setAiAssessmentEnabled(true);
    } else if (type === "funnel") {
      setMinimumIntake(8);
      setIdealIntake(15);
      setAutoStartEnabled(true);
    }
  };

  // Live Credit Calculations
  const summaryLines = useMemo(() => {
    const lines: { key: string; label: string; cost: number }[] = [];

    if (matchVolume) {
      const opt = matchVolumeOptions.find((o) => o.key === matchVolume);
      if (opt) {
        lines.push({ key: `matchVolume:${opt.key}`, label: `Candidate Match ${opt.label}`, cost: opt.credits });
      } else if (matchVolume.startsWith("1:")) {
        lines.push({ key: `matchVolume:${matchVolume}`, label: `Candidate Match ${matchVolume} (Custom)`, cost: 10 });
      }
    }

    if (resumeMatchEnabled) {
      lines.push({ key: "resumeMatch", label: "Resume Shortlisting", cost: subOptionCost });
    }

    if (aiOnlineTestEnabled) {
      lines.push({ key: "assessment:aiOnlineTest", label: "AI Online Test (MCQ)", cost: subOptionCost });
    }

    if (interviewEnabled) {
      if (screeningInterviewEnabled) {
        lines.push({ key: "interview:screening", label: "Screening Interview", cost: subOptionCost });
      }
      if (technicalInterviewEnabled) {
        lines.push({ key: "interview:technical", label: "Technical Interview", cost: subOptionCost });
      }
    }

    if (aiAssessmentEnabled) {
      lines.push({ key: "assessment:aiAssessment", label: "AI Assessment (Aptitude & Coding)", cost: subOptionCost });
    }

    return lines;
  }, [
    matchVolume,
    matchVolumeOptions,
    resumeMatchEnabled,
    aiOnlineTestEnabled,
    interviewEnabled,
    screeningInterviewEnabled,
    technicalInterviewEnabled,
    aiAssessmentEnabled,
    subOptionCost,
  ]);

  const totalCost = summaryLines.reduce((sum, l) => sum + l.cost, 0);
  const balanceAfterPublish = balance != null ? balance - totalCost : null;
  const hasInsufficientCredits = balance != null && totalCost > balance;

  const buildAssessmentRounds = (): AssessmentRoundConfig[] => {
    const rounds: AssessmentRoundConfig[] = [];

    if (aiOnlineTestEnabled) {
      rounds.push({
        id: "round_general",
        type: "general",
        order: rounds.length + 1,
        name: "AI Online Test (MCQ)",
        enabled: true,
        config: {
          questionTypes: ["mcq"], // Strictly MCQ only!
          mcq: {
            questionCount: onlineTestConfig.questionCount,
            difficulty: onlineTestConfig.difficulty,
          },
          durationMinutes: onlineTestConfig.durationMinutes,
          passingScore: onlineTestConfig.passingScore,
          customQuestions: onlineTestCustomQuestions,
        },
      });
    }

    if (aiAssessmentEnabled) {
      rounds.push({
        id: "round_coding",
        type: "coding",
        order: rounds.length + 1,
        name: "AI Assessment (Aptitude & Coding)",
        enabled: true,
        config: {
          basicAptitude: {
            enabled: aiAssessmentConfig.aptitudeEnabled,
            questionCount: aiAssessmentConfig.aptitudeQuestionCount,
          },
          codingTest: {
            enabled: aiAssessmentConfig.codingEnabled,
            problemCount: aiAssessmentConfig.codingProblemCount,
          },
          durationMinutes: aiAssessmentConfig.durationMinutes,
          passingScore: aiAssessmentConfig.passingScore,
          customQuestions: aiAssessmentCustomQuestions,
        },
      });
    }

    return rounds;
  };

  const buildPipelineOptions = (): PipelineOptions => {
    const rounds = buildAssessmentRounds();
    const interviewTypes: string[] = [];
    if (interviewEnabled) {
      if (screeningInterviewEnabled) interviewTypes.push("screening");
      if (technicalInterviewEnabled) interviewTypes.push("technical");
    }

    return {
      matchVolume,
      resumeMatch: resumeMatchEnabled,
      resumeMatchTypes: Array.from(selectedSubOptions.resumeMatch),
      assessment: rounds.length > 0,
      assessmentTypes: rounds.map((r) => r.type),
      aiInterview: interviewEnabled && interviewTypes.length > 0,
      aiInterviewTypes: interviewTypes,
    };
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      setLocalError("Job title is required before proceeding.");
      return false;
    }
    setLocalError(null);
    return true;
  };

  const validateStep2 = () => {
    if (customRatioError) {
      setLocalError(customRatioError);
      return false;
    }
    setLocalError(null);
    return true;
  };

  const validateCommonFields = () => {
    if (!title.trim()) {
      setLocalError("Job title is required.");
      return false;
    }
    if (customRatioError) {
      setLocalError(customRatioError);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLocalError(null);
    if (!validateCommonFields()) return;

    const minExpNum = minimumExperience.trim() !== "" ? Number(minimumExperience) : undefined;
    const maxExpNum = maximumExperience.trim() !== "" ? Number(maximumExperience) : undefined;

    if (minExpNum !== undefined && (isNaN(minExpNum) || minExpNum < 0)) {
      setLocalError("Minimum experience must be a non-negative number.");
      return;
    }
    if (maxExpNum !== undefined && (isNaN(maxExpNum) || maxExpNum < 0)) {
      setLocalError("Maximum experience must be a non-negative number.");
      return;
    }
    if (minExpNum !== undefined && maxExpNum !== undefined && maxExpNum < minExpNum) {
      setLocalError("Maximum experience cannot be less than minimum experience.");
      return;
    }

    if (hasInsufficientCredits) {
      setLocalError("Insufficient credits. Please buy more credits before publishing.");
      return;
    }

    const eduFieldsList = educationFieldsText
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const structuredRequirements: JobRequirements = {
      requiredSkills,
      preferredSkills,
      minimumExperienceYears: minExpNum,
      maximumExperienceYears: maxExpNum,
      education: {
        minimumLevel: educationLevel,
        fields: eduFieldsList,
      },
    };

    const allSkills = Array.from(new Set([...requiredSkills.map((s) => s.name), ...preferredSkills]));

    const responsibilitiesList = responsibilitiesText
      .split("\n")
      .map((r) => r.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);

    const rounds = buildAssessmentRounds();

    setIsSubmitting(true);
    try {
      const job = await recruiterService.createJob({
        title: title.trim(),
        location: location.trim(),
        employmentType,
        workplaceType,
        salaryText: salaryText.trim(),
        skills: allSkills,
        description: description.trim(),
        responsibilities: responsibilitiesList,
        minimumExperience: minExpNum,
        maximumExperience: maxExpNum,
        structuredRequirements,
        assessment: {
          enabled: rounds.length > 0,
          rounds,
        },
        pipelineOptions: buildPipelineOptions(),
        finalShortlistTarget: finalShortlistTarget > 0 ? finalShortlistTarget : 10,
        idealIntake: idealIntake > 0 ? idealIntake : 15,
        minimumIntake: minimumIntake > 0 ? minimumIntake : 8,
        collectionDurationDays: collectionDurationDays > 0 ? collectionDurationDays : 7,
        autoExtensionEnabled,
        extensionDurationDays: extensionDurationDays > 0 ? extensionDurationDays : 3,
        maxExtensions: maxExtensions >= 0 ? maxExtensions : 2,
        autoStartEnabled,
      });
      router.push(`/recruiter/jobs/${job._id}`);
    } catch (err: unknown) {
      setLocalError((err as { message?: string })?.message || "Failed to create job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setLocalError(null);
    if (!validateCommonFields()) return;

    const minExpNum = minimumExperience.trim() !== "" ? Number(minimumExperience) : undefined;
    const maxExpNum = maximumExperience.trim() !== "" ? Number(maximumExperience) : undefined;

    if (minExpNum !== undefined && (isNaN(minExpNum) || minExpNum < 0)) {
      setLocalError("Minimum experience must be a non-negative number.");
      return;
    }
    if (maxExpNum !== undefined && (isNaN(maxExpNum) || maxExpNum < 0)) {
      setLocalError("Maximum experience must be a non-negative number.");
      return;
    }
    if (minExpNum !== undefined && maxExpNum !== undefined && maxExpNum < minExpNum) {
      setLocalError("Maximum experience cannot be less than minimum experience.");
      return;
    }

    const eduFieldsList = educationFieldsText
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const structuredRequirements: JobRequirements = {
      requiredSkills,
      preferredSkills,
      minimumExperienceYears: minExpNum,
      maximumExperienceYears: maxExpNum,
      education: {
        minimumLevel: educationLevel,
        fields: eduFieldsList,
      },
    };

    const allSkills = Array.from(new Set([...requiredSkills.map((s) => s.name), ...preferredSkills]));

    const responsibilitiesList = responsibilitiesText
      .split("\n")
      .map((r) => r.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);

    const rounds = buildAssessmentRounds();

    setIsSavingDraft(true);
    try {
      const job = await recruiterService.createJob({
        title: title.trim(),
        location: location.trim(),
        employmentType,
        workplaceType,
        salaryText: salaryText.trim(),
        skills: allSkills,
        description: description.trim(),
        responsibilities: responsibilitiesList,
        minimumExperience: minExpNum,
        maximumExperience: maxExpNum,
        structuredRequirements,
        saveAsDraft: true,
        assessment: {
          enabled: rounds.length > 0,
          rounds,
        },
        pipelineOptions: buildPipelineOptions(),
        finalShortlistTarget: finalShortlistTarget > 0 ? finalShortlistTarget : 10,
        idealIntake: idealIntake > 0 ? idealIntake : 15,
        minimumIntake: minimumIntake > 0 ? minimumIntake : 8,
        collectionDurationDays: collectionDurationDays > 0 ? collectionDurationDays : 7,
        autoExtensionEnabled,
        extensionDurationDays: extensionDurationDays > 0 ? extensionDurationDays : 3,
        maxExtensions: maxExtensions >= 0 ? maxExtensions : 2,
        autoStartEnabled,
      });
      router.push(`/recruiter/jobs/${job._id}`);
    } catch (err: unknown) {
      setLocalError((err as { message?: string })?.message || "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header Banner in Letgetin UI Blue Style */}
      <div className="relative overflow-hidden bg-gradient-brand rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 shadow-elegant text-white border border-white/10">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-glow/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-32 bg-white/5 rotate-12 blur-2xl pointer-events-none" />

        {/* Divided by half: Left side (Page details) & Right side (Mockup UI content) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Column: What page is this & description */}
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/90 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs">
              <Briefcase className="w-3.5 h-3.5 text-white" />
              <span>{orgProfile?.name ? `${orgProfile.name} · Role Studio` : "Letgetin Recruitment · Role Studio"}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Create a New Job
              </h1>
              <p className="text-white/80 mt-2 text-sm sm:text-base leading-relaxed max-w-xl">
                Configure your tailored hiring pipeline for this role. Customize AI candidate matching volume, automated assessments, and interactive interviews with pay-per-feature precision.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/10 border border-white/15 px-3 py-1 rounded-lg backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> AI Description
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/10 border border-white/15 px-3 py-1 rounded-lg backdrop-blur-xs">
                <Zap className="w-3.5 h-3.5 text-amber-300" /> Auto-Shortlisting
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/10 border border-white/15 px-3 py-1 rounded-lg backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Proctored Rounds
              </span>
            </div>
          </div>

          {/* Right Column: Mockup UI with Current Plan, Upgrade Plan button & Credit summary / balance */}
          <div>
            <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center shrink-0 shadow-xs">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        Current Plan
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-500/25 border border-emerald-400/30 px-1.5 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Active
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-white truncate">
                      Growth Recruiter Pro
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-ink hover:bg-white/90 px-3.5 py-2 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Upgrade Plan
                </button>
              </div>

              <div className="h-px bg-white/15" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-300/30 flex items-center justify-center shrink-0 shadow-xs">
                    <Zap className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block">
                      Credit Balance
                    </span>
                    <span className="text-lg sm:text-xl font-black text-white">
                      {loadingCredits ? "…" : `${balance ?? 0} Credits`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBuyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 px-3.5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-white" />
                  Buy credits
                </button>
              </div>

              <div className="bg-black/25 border border-white/10 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80">Role Pipeline Cost</span>
                  <span className="font-extrabold text-white">{totalCost} credits</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      hasInsufficientCredits ? "bg-rose-400" : "bg-cyan-300"
                    }`}
                    style={{
                      width: `${
                        balance && balance > 0
                          ? Math.min(100, Math.max(8, (totalCost / balance) * 100))
                          : totalCost > 0
                          ? 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span>
                    Balance after publish:{" "}
                    <strong className="text-white font-semibold">
                      {balanceAfterPublish != null ? `${balanceAfterPublish} cr` : "—"}
                    </strong>
                  </span>
                  <span
                    className={
                      hasInsufficientCredits
                        ? "text-rose-300 font-semibold"
                        : "text-emerald-300 font-semibold"
                    }
                  >
                    {hasInsufficientCredits ? "Low balance" : "Ready"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Wizard Navigation */}
      <div className="bg-surface border border-border rounded-2xl p-2 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            step === 1
              ? "bg-gradient-brand text-white shadow-sm"
              : step > 1
              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 1
                ? "bg-white/20 text-white"
                : step > 1
                ? "bg-emerald-500 text-white"
                : "bg-surface-alt text-ink-soft border border-border"
            }`}
          >
            {step > 1 ? <Check className="w-3 h-3" /> : "1"}
          </span>
          <span>1. Role Definition</span>
        </button>

        <ChevronRight className="w-4 h-4 text-ink-soft/40 shrink-0" />

        <button
          type="button"
          onClick={() => {
            if (validateStep1()) setStep(2);
          }}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            step === 2
              ? "bg-gradient-brand text-white shadow-sm"
              : step > 2
              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2
                ? "bg-white/20 text-white"
                : step > 2
                ? "bg-emerald-500 text-white"
                : "bg-surface-alt text-ink-soft border border-border"
            }`}
          >
            {step > 2 ? <Check className="w-3 h-3" /> : "2"}
          </span>
          <span>2. Pipeline & Assessment</span>
        </button>

        <ChevronRight className="w-4 h-4 text-ink-soft/40 shrink-0" />

        <button
          type="button"
          onClick={() => {
            if (validateStep1() && validateStep2()) setStep(3);
          }}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            step === 3
              ? "bg-gradient-brand text-white shadow-sm"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 3
                ? "bg-white/20 text-white"
                : "bg-surface-alt text-ink-soft border border-border"
            }`}
          >
            3
          </span>
          <span>3. Funnel & Credits</span>
        </button>
      </div>

      {/* Main Section Divided in Two: Left (Forms / Config) + Right (AI Assist Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* STEP 1: Job Information, Job Description, Job Requirements */}
          {step === 1 && (
            <>
              {/* 1. Job Information */}
              <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-primary-glow" />
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Job Information</h2>
                </div>

                <Field label="Job title">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Accountant, Nurse Practitioner, Software Engineer"
                    className="input-base"
                    required
                  />
                </Field>

                <div className="flex items-center justify-between gap-3 flex-wrap -mt-1">
                  <p className="text-xs text-ink-soft">
                    {hasAiGeneratedContent
                      ? "Description and skills were AI-generated — review and edit before publishing."
                      : "Enter a job title, then let AI draft a description and skill suggestions."}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={!title.trim() || isGeneratingContent}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-glow border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGeneratingContent ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> {hasAiGeneratedContent ? "Regenerate with AI" : "Generate with AI"}
                      </>
                    )}
                  </button>
                </div>

                {generationError && (
                  <p className="text-xs text-ink-soft bg-surface-alt/60 border border-border rounded-lg px-3 py-2">
                    {generationError}
                  </p>
                )}

                {pendingGeneratedContent && (
                  <div className="p-3 rounded-xl border border-primary/30 bg-primary/5">
                    <p className="text-xs font-semibold text-ink mb-2">
                      Replace your current description and skills with AI-generated content?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyGeneratedContent(pendingGeneratedContent)}
                        className="text-xs font-semibold text-primary-foreground bg-gradient-brand px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Use AI content
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingGeneratedContent(null)}
                        className="text-xs font-semibold text-ink-soft hover:text-ink px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Keep mine
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Location">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Mumbai, India or London, UK"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Salary">
                    <input
                      type="text"
                      value={salaryText}
                      onChange={(e) => setSalaryText(e.target.value)}
                      placeholder="e.g. ₹15L – ₹22L / year or Competitive"
                      className="input-base"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Employment type">
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                      className="input-base"
                    >
                      {EMPLOYMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Workplace type">
                    <select
                      value={workplaceType}
                      onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                      className="input-base"
                    >
                      {WORKPLACE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* 2. Job Description */}
              <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-primary-glow" />
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Job Description</h2>
                </div>

                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink mb-1.5">
                    Description
                    {hasAiGeneratedContent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-2.5 h-2.5" /> AI-generated
                      </span>
                    )}
                  </span>
                  <textarea
                    ref={descriptionRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Overview of the role, department, mission, and working environment"
                    className="input-base min-h-[120px] resize-y"
                  />
                  {description.trim().length > 0 && (
                    <div className="mt-2">
                      <AIWritingAssistant
                        value={description}
                        context="job-description"
                        metadata={{ jobTitle: title }}
                        textareaRef={descriptionRef}
                        onApply={setDescription}
                        label="AI Improve"
                      />
                    </div>
                  )}
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-ink mb-1.5">Responsibilities</span>
                  <textarea
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    placeholder="Key daily responsibilities and deliverables (one per line)"
                    className="input-base min-h-[100px] resize-y"
                  />
                  <p className="text-[11px] text-ink-soft mt-1">Separate distinct duties on new lines or with bullet points.</p>
                </label>
              </div>

              {/* 3. Job Requirements */}
              <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-5">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-glow" />
                    <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Job Requirements</h2>
                  </div>
                  <span className="text-[11px] text-ink-soft font-normal">Industry-neutral & flexible</span>
                </div>

                {/* Required Skills */}
                <SkillRequirementsInput
                  label="Required Skills & Competencies"
                  description="Essential qualifications candidates must possess."
                  skills={requiredSkills}
                  onSkillsChange={handleRequiredSkillsChange}
                  showProficiency={true}
                  addButtonText="+ Add required skill"
                  placeholder="Search catalogue or type custom skill (e.g. Java, React, SQL)..."
                  badgeTone="primary"
                />

                {/* Preferred Skills */}
                <SkillRequirementsInput
                  label="Preferred / Nice-to-Have Skills"
                  description="Helpful competencies that provide an advantage but are not mandatory."
                  skills={preferredSkills}
                  onSkillsChange={handlePreferredSkillsChange}
                  disallowedSkills={requiredSkills}
                  showProficiency={false}
                  addButtonText="+ Add preferred skill"
                  placeholder="Search catalogue or type custom skill (e.g. Docker, AWS, Redis)..."
                  badgeTone="neutral"
                />

                {/* Experience Range */}
                <div>
                  <span className="block text-sm font-medium text-ink mb-1.5">Experience Range (Years)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-ink-soft block mb-1">Minimum (years)</label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={minimumExperience}
                        onChange={(e) => setMinimumExperience(e.target.value)}
                        placeholder="e.g. 0 for fresher, 2 for mid"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink-soft block mb-1">Maximum (years)</label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={maximumExperience}
                        onChange={(e) => setMaximumExperience(e.target.value)}
                        placeholder="e.g. 5 (leave blank for any max)"
                        className="input-base"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-soft mt-1">
                    Optional. Leave blank if there is no strict experience requirement. Supports 0 for fresher roles.
                  </p>
                </div>

                {/* Education Requirements */}
                <div className="space-y-3">
                  <span className="block text-sm font-medium text-ink mb-0.5">Education Requirements</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Minimum Education Level">
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                        className="input-base"
                      >
                        {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Accepted Fields of Study (Optional)">
                      <input
                        type="text"
                        value={educationFieldsText}
                        onChange={(e) => setEducationFieldsText(e.target.value)}
                        placeholder="e.g. Accounting, Finance or Nursing"
                        className="input-base"
                      />
                    </Field>
                  </div>
                  <p className="text-[11px] text-ink-soft">
                    Leave fields empty to accept candidates from all academic backgrounds.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Candidate Matching Volume, Resume Shortlisting, Assessment with Test, Interview & Domain Specific Test */}
          {step === 2 && (
            <>
              {/* Candidate Matching Volume */}
              <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary-glow" />
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Candidate Matching Volume</h2>
                </div>

                <MatchVolumeSection
                  options={matchVolumeOptions}
                  selected={matchVolume}
                  onSelect={setMatchVolume}
                  customRatioError={customRatioError}
                  setCustomRatioError={setCustomRatioError}
                />
              </div>

              {/* Resume Shortlisting */}
              <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-primary-glow" />
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Resume Shortlisting</h2>
                </div>

                <PipelineSectionCard
                  section="resumeMatch"
                  meta={SECTION_META.resumeMatch}
                  subOptions={subOptionsCatalog?.resumeMatch || []}
                  subOptionCost={subOptionCost}
                  enabled={resumeMatchEnabled}
                  onToggleEnabled={setResumeMatchEnabled}
                  selectedKeys={selectedSubOptions.resumeMatch}
                  onToggleSubOption={(key) => toggleSubOption("resumeMatch", key)}
                />
              </div>

              {/* Assessment Section: AI Online Test, Interview (Screening & Technical), AI Assessment */}
              <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-glow" />
                    <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Candidate Assessment Rounds</h2>
                  </div>
                  <span className="text-[11px] text-ink-soft">10 credits per active round</span>
                </div>

                <p className="text-xs text-ink-soft">
                  Select candidate assessment stages for this role. Combine AI online tests (MCQ), screening &amp; technical interviews, and comprehensive aptitude &amp; coding evaluations.
                </p>

                <div className="space-y-4">
                  {/* Option 1: AI Online Test (Strictly MCQ) */}
                  <div
                    className={`rounded-xl border transition ${
                      aiOnlineTestEnabled ? "border-primary/40 bg-primary/5 p-4" : "border-border bg-background p-4"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={aiOnlineTestEnabled}
                        onChange={(e) => setAiOnlineTestEnabled(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <FileQuestion className="w-4 h-4 text-primary-glow" />
                            <span className="text-sm font-bold text-ink">AI Online Test</span>
                            <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full">
                              MCQ Only
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            10 credits
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft mt-0.5">
                          Automated AI-proctored Multiple Choice Question (MCQ) assessment evaluating role competencies.
                        </p>
                      </div>
                    </label>

                    {aiOnlineTestEnabled && (
                      <div className="mt-4 pt-3 border-t border-border/70 space-y-4">
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-primary/10 text-primary-glow text-xs font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            Format: Strictly Multiple Choice Questions (MCQ)
                          </span>
                          <span className="text-[10px] bg-white text-primary-glow px-2 py-0.5 rounded-md font-bold shadow-xs">
                            Auto-Graded
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[11px] font-medium text-ink-soft block mb-1">Questions</label>
                            <input
                              type="number"
                              min={5}
                              max={60}
                              value={onlineTestConfig.questionCount}
                              onChange={(e) =>
                                setOnlineTestConfig((prev) => ({
                                  ...prev,
                                  questionCount: Math.max(5, parseInt(e.target.value) || 5),
                                }))
                              }
                              className="input-base text-xs py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-ink-soft block mb-1">Duration (mins)</label>
                            <input
                              type="number"
                              min={15}
                              max={180}
                              value={onlineTestConfig.durationMinutes}
                              onChange={(e) =>
                                setOnlineTestConfig((prev) => ({
                                  ...prev,
                                  durationMinutes: Math.max(15, parseInt(e.target.value) || 15),
                                }))
                              }
                              className="input-base text-xs py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-ink-soft block mb-1">Passing Score (%)</label>
                            <input
                              type="number"
                              min={40}
                              max={100}
                              value={onlineTestConfig.passingScore}
                              onChange={(e) =>
                                setOnlineTestConfig((prev) => ({
                                  ...prev,
                                  passingScore: Math.max(40, parseInt(e.target.value) || 40),
                                }))
                              }
                              className="input-base text-xs py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-ink-soft block mb-1">Difficulty</label>
                            <select
                              value={onlineTestConfig.difficulty}
                              onChange={(e) =>
                                setOnlineTestConfig((prev) => ({
                                  ...prev,
                                  difficulty: e.target.value as "beginner" | "intermediate" | "advanced" | "mixed",
                                }))
                              }
                              className="input-base text-xs py-1.5"
                            >
                              <option value="mixed">Mixed</option>
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>

                        {/* Custom Questions for AI Online Test */}
                        <div className="pt-2 border-t border-border/70 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">
                              Custom Questions ({onlineTestCustomQuestions.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setCustomQuestionModalTarget("ai_online_test")}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-glow border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Custom Question
                            </button>
                          </div>

                          {onlineTestCustomQuestions.length > 0 ? (
                            <div className="space-y-2">
                              {onlineTestCustomQuestions.map((q, idx) => (
                                <div
                                  key={q.id}
                                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-surface border border-border text-xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-ink">Q{idx + 1}:</span>
                                      <span className="font-medium text-ink truncate">{q.question}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-soft">
                                      <span>{q.options?.length || 0} options</span>
                                      <span>•</span>
                                      <span className="text-emerald-600 font-semibold">
                                        Correct: {q.correctOptionId?.replace("opt_", "Option ").toUpperCase()}
                                      </span>
                                      <span>•</span>
                                      <span>{q.points || 1} pts</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomQuestion("ai_online_test", q.id)}
                                    className="p-1.5 rounded-lg text-ink-soft hover:text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0"
                                    aria-label="Remove question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-ink-soft">
                              No custom questions added yet. AI will auto-curate {onlineTestConfig.questionCount} MCQ questions based on required role skills.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Interview (Screening & Technical) */}
                  <div
                    className={`rounded-xl border transition ${
                      interviewEnabled ? "border-primary/40 bg-primary/5 p-4" : "border-border bg-background p-4"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={interviewEnabled}
                        onChange={(e) => setInterviewEnabled(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-bold text-ink">Interview (Screening &amp; Technical)</span>
                          </div>
                          <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            10 credits / round
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft mt-0.5">
                          Automated candidate interview rounds covering behavioral screening and deep technical evaluation.
                        </p>
                      </div>
                    </label>

                    {interviewEnabled && (
                      <div className="mt-4 pt-3 border-t border-border/70 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Screening Interview Sub-card */}
                          <div
                            className={`p-3.5 rounded-xl border transition ${
                              screeningInterviewEnabled
                                ? "border-primary/30 bg-white shadow-xs"
                                : "border-border bg-surface-alt/40"
                            }`}
                          >
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={screeningInterviewEnabled}
                                onChange={(e) => setScreeningInterviewEnabled(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/30"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-ink">Screening Interview</span>
                                  <span className="text-[10px] font-bold text-primary-glow">10 credits</span>
                                </div>
                                <p className="text-[11px] text-ink-soft mt-0.5">
                                  AI video screening for communication, culture fit, career motivations, and background.
                                </p>
                              </div>
                            </label>

                            {screeningInterviewEnabled && (
                              <div className="mt-3 pt-2 border-t border-border/70 flex items-center justify-between">
                                <span className="text-[11px] font-medium text-ink-soft">Duration</span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={10}
                                    max={45}
                                    value={screeningDuration}
                                    onChange={(e) => setScreeningDuration(Math.max(10, parseInt(e.target.value) || 10))}
                                    className="input-base text-xs py-1 w-16 text-center"
                                  />
                                  <span className="text-[11px] text-ink-soft">mins</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Technical Interview Sub-card */}
                          <div
                            className={`p-3.5 rounded-xl border transition ${
                              technicalInterviewEnabled
                                ? "border-primary/30 bg-white shadow-xs"
                                : "border-border bg-surface-alt/40"
                            }`}
                          >
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={technicalInterviewEnabled}
                                onChange={(e) => setTechnicalInterviewEnabled(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/30"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-ink">Technical Interview</span>
                                  <span className="text-[10px] font-bold text-primary-glow">10 credits</span>
                                </div>
                                <p className="text-[11px] text-ink-soft mt-0.5">
                                  Deep-dive AI technical interview evaluating core domain knowledge, coding logic, and system architecture.
                                </p>
                              </div>
                            </label>

                            {technicalInterviewEnabled && (
                              <div className="mt-3 pt-2 border-t border-border/70 flex items-center justify-between">
                                <span className="text-[11px] font-medium text-ink-soft">Duration</span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={20}
                                    max={90}
                                    value={technicalDuration}
                                    onChange={(e) => setTechnicalDuration(Math.max(20, parseInt(e.target.value) || 20))}
                                    className="input-base text-xs py-1 w-16 text-center"
                                  />
                                  <span className="text-[11px] text-ink-soft">mins</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 3: AI Assessment (Basic Aptitude & Coding Test) */}
                  <div
                    className={`rounded-xl border transition ${
                      aiAssessmentEnabled ? "border-primary/40 bg-primary/5 p-4" : "border-border bg-background p-4"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={aiAssessmentEnabled}
                        onChange={(e) => setAiAssessmentEnabled(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-bold text-ink">AI Assessment</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Aptitude &amp; Coding
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            10 credits
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft mt-0.5">
                          Rigorous candidate evaluation featuring basic aptitude tests and practical algorithmic coding challenges.
                        </p>
                      </div>
                    </label>

                    {aiAssessmentEnabled && (
                      <div className="mt-4 pt-3 border-t border-border/70 space-y-4">
                        {/* Two sub-modules: Basic Aptitude & Coding Test */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Basic Aptitude sub-card */}
                          <div
                            className={`p-3.5 rounded-xl border transition ${
                              aiAssessmentConfig.aptitudeEnabled
                                ? "border-primary/30 bg-white shadow-xs"
                                : "border-border bg-surface-alt/40"
                            }`}
                          >
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={aiAssessmentConfig.aptitudeEnabled}
                                onChange={(e) =>
                                  setAiAssessmentConfig((prev) => ({ ...prev, aptitudeEnabled: e.target.checked }))
                                }
                                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/30"
                              />
                              <div>
                                <span className="text-xs font-bold text-ink block">Basic Aptitude Test</span>
                                <p className="text-[11px] text-ink-soft mt-0.5">
                                  Logical reasoning, quantitative ability, and verbal comprehension.
                                </p>
                              </div>
                            </label>

                            {aiAssessmentConfig.aptitudeEnabled && (
                              <div className="mt-3 pt-2 border-t border-border/70 flex items-center justify-between">
                                <span className="text-[11px] font-medium text-ink-soft">Questions</span>
                                <input
                                  type="number"
                                  min={5}
                                  max={40}
                                  value={aiAssessmentConfig.aptitudeQuestionCount}
                                  onChange={(e) =>
                                    setAiAssessmentConfig((prev) => ({
                                      ...prev,
                                      aptitudeQuestionCount: Math.max(5, parseInt(e.target.value) || 5),
                                    }))
                                  }
                                  className="input-base text-xs py-1 w-16 text-center"
                                />
                              </div>
                            )}
                          </div>

                          {/* Coding Test sub-card */}
                          <div
                            className={`p-3.5 rounded-xl border transition ${
                              aiAssessmentConfig.codingEnabled
                                ? "border-primary/30 bg-white shadow-xs"
                                : "border-border bg-surface-alt/40"
                            }`}
                          >
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={aiAssessmentConfig.codingEnabled}
                                onChange={(e) =>
                                  setAiAssessmentConfig((prev) => ({ ...prev, codingEnabled: e.target.checked }))
                                }
                                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/30"
                              />
                              <div>
                                <span className="text-xs font-bold text-ink block">Coding Test</span>
                                <p className="text-[11px] text-ink-soft mt-0.5">
                                  Algorithmic challenges, code execution sandboxes, and automated test cases.
                                </p>
                              </div>
                            </label>

                            {aiAssessmentConfig.codingEnabled && (
                              <div className="mt-3 pt-2 border-t border-border/70 flex items-center justify-between">
                                <span className="text-[11px] font-medium text-ink-soft">Problems</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={5}
                                  value={aiAssessmentConfig.codingProblemCount}
                                  onChange={(e) =>
                                    setAiAssessmentConfig((prev) => ({
                                      ...prev,
                                      codingProblemCount: Math.max(1, parseInt(e.target.value) || 1),
                                    }))
                                  }
                                  className="input-base text-xs py-1 w-16 text-center"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Overall Duration & Passing score */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-medium text-ink-soft block mb-1">Total Duration (mins)</label>
                            <input
                              type="number"
                              min={30}
                              max={180}
                              value={aiAssessmentConfig.durationMinutes}
                              onChange={(e) =>
                                setAiAssessmentConfig((prev) => ({
                                  ...prev,
                                  durationMinutes: Math.max(30, parseInt(e.target.value) || 30),
                                }))
                              }
                              className="input-base text-xs py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-ink-soft block mb-1">Passing Score (%)</label>
                            <input
                              type="number"
                              min={40}
                              max={100}
                              value={aiAssessmentConfig.passingScore}
                              onChange={(e) =>
                                setAiAssessmentConfig((prev) => ({
                                  ...prev,
                                  passingScore: Math.max(40, parseInt(e.target.value) || 40),
                                }))
                              }
                              className="input-base text-xs py-1.5"
                            />
                          </div>
                        </div>

                        {/* Custom Questions for AI Assessment */}
                        <div className="pt-2 border-t border-border/70 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">
                              Custom Aptitude &amp; Coding Challenges ({aiAssessmentCustomQuestions.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setCustomQuestionModalTarget("ai_assessment")}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-glow border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Custom Question
                            </button>
                          </div>

                          {aiAssessmentCustomQuestions.length > 0 ? (
                            <div className="space-y-2">
                              {aiAssessmentCustomQuestions.map((q, idx) => (
                                <div
                                  key={q.id}
                                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-surface border border-border text-xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-ink">#{idx + 1}:</span>
                                      <span className="font-medium text-ink truncate">{q.question}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-soft">
                                      <span
                                        className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                                          q.type === "coding"
                                            ? "bg-emerald-500/10 text-emerald-600"
                                            : "bg-primary/10 text-primary-glow"
                                        }`}
                                      >
                                        {q.type === "coding" ? "Coding Challenge" : "Aptitude MCQ"}
                                      </span>
                                      <span>•</span>
                                      <span>{q.points || 5} pts</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomQuestion("ai_assessment", q.id)}
                                    className="p-1.5 rounded-lg text-ink-soft hover:text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0"
                                    aria-label="Remove question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-ink-soft">
                              No custom questions added yet. AI will auto-generate aptitude questions and coding problems matching the role stack.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: Candidate Collection & Funnel Targets + Credit Summary */}
          {step === 3 && (
            <>
              {/* Candidate Collection & Funnel Targets */}
              <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Sparkles className="w-4 h-4 text-primary-glow" />
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Candidate Collection & Funnel Targets</h2>
                </div>

                {/* 3 Core Target Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5 shadow-xs">
                    <label htmlFor="finalShortlistTarget" className="text-xs font-bold text-ink block">
                      Final Shortlist Target
                    </label>
                    <input
                      id="finalShortlistTarget"
                      type="number"
                      min={1}
                      max={100}
                      value={finalShortlistTarget}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setFinalShortlistTarget(val);
                        setIdealIntake(Math.max(val, Math.ceil(val * 1.5)));
                        setMinimumIntake(Math.max(1, Math.ceil(val * 0.8)));
                      }}
                      className="w-full px-3 py-1.5 text-sm font-bold rounded-lg bg-surface-alt border border-border text-ink focus:outline-none focus:border-primary text-center"
                    />
                    <p className="text-[10px] text-ink-soft leading-tight">
                      Target candidates to reach your final hiring shortlist.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5 shadow-xs">
                    <label htmlFor="idealIntake" className="text-xs font-bold text-ink block">
                      Ideal Candidate Intake
                    </label>
                    <input
                      id="idealIntake"
                      type="number"
                      min={1}
                      max={300}
                      value={idealIntake}
                      onChange={(e) => setIdealIntake(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 text-sm font-bold rounded-lg bg-surface-alt border border-border text-ink focus:outline-none focus:border-primary text-center"
                    />
                    <p className="text-[10px] text-ink-soft leading-tight">
                      Target qualified intake volume to run through assessment rounds.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5 shadow-xs">
                    <label htmlFor="minimumIntake" className="text-xs font-bold text-ink block">
                      Minimum Candidate Intake
                    </label>
                    <input
                      id="minimumIntake"
                      type="number"
                      min={1}
                      max={300}
                      value={minimumIntake}
                      onChange={(e) => setMinimumIntake(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 text-sm font-bold rounded-lg bg-surface-alt border border-border text-ink focus:outline-none focus:border-primary text-center"
                    />
                    <p className="text-[10px] text-ink-soft leading-tight">
                      Minimum intake required before automated pipeline starts.
                    </p>
                  </div>
                </div>

                {/* Window & Extension Settings */}
                <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label htmlFor="collectionDurationDays" className="text-xs font-semibold text-ink block mb-1">
                      Collection Window
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="collectionDurationDays"
                        type="number"
                        min={1}
                        max={60}
                        value={collectionDurationDays}
                        onChange={(e) => setCollectionDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-ink text-center"
                      />
                      <span className="text-xs text-ink-soft">days</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink block mb-1">
                      Auto-Extend Window
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={autoExtensionEnabled}
                        onChange={(e) => setAutoExtensionEnabled(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary/30"
                      />
                      <span className="text-xs text-ink-soft">
                        {autoExtensionEnabled ? "Enabled if under minimum" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  {autoExtensionEnabled && (
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-ink-soft block mb-1">Extend By</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={extensionDurationDays}
                            onChange={(e) => setExtensionDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-14 px-2 py-1 text-xs font-semibold rounded-lg bg-surface border border-border text-center text-ink"
                          />
                          <span className="text-[11px] text-ink-soft">d</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-ink-soft block mb-1">Max Times</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={maxExtensions}
                          onChange={(e) => setMaxExtensions(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 px-2 py-1 text-xs font-semibold rounded-lg bg-surface border border-border text-center text-ink"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-Start Pipeline Setting */}
                <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-ink block">Auto-Start Pipeline</span>
                    <p className="text-[11px] text-ink-soft">
                      Automatically start the funnel as soon as minimum intake ({minimumIntake}) is reached.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={autoStartEnabled}
                      onChange={(e) => setAutoStartEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Credit Summary & Plan Cost Review */}
              <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary-glow" />
                    <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Credit Summary & Review</h2>
                  </div>
                  <span className="text-xs font-bold text-primary-glow bg-primary/10 px-2.5 py-1 rounded-full">
                    {totalCost} Total Credits
                  </span>
                </div>

                {summaryLines.length === 0 ? (
                  <p className="text-xs text-ink-soft py-2">
                    No paid pipeline steps selected — this job will be free to publish.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {summaryLines.map((l) => (
                      <div
                        key={l.key}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-surface-alt/70 border border-border text-ink"
                      >
                        <span>{l.label}</span>
                        <span className="text-primary-glow font-bold">{l.cost} credits</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span>Available Credit Balance</span>
                    <span className="font-bold text-ink">{loadingCredits ? "…" : `${balance ?? 0} credits`}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span>Role Pipeline Cost</span>
                    <span className="font-extrabold text-ink">{totalCost} credits</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold pt-1 border-t border-border/60">
                    <span className="text-ink">Balance After Publish</span>
                    <span className={hasInsufficientCredits ? "text-destructive font-bold" : "text-emerald-600 font-bold"}>
                      {balanceAfterPublish != null ? `${balanceAfterPublish} credits` : "—"}
                    </span>
                  </div>
                </div>

                {hasInsufficientCredits && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2">
                    <p className="text-xs text-destructive font-semibold">
                      Insufficient credit balance. You need {totalCost - (balance ?? 0)} more credits to publish this role.
                    </p>
                    <button
                      type="button"
                      onClick={() => setBuyModalOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-primary text-white py-2 px-3 rounded-lg shadow-sm hover:opacity-95 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Buy More Credits
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Local Error Message */}
          {localError && (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3 font-semibold">
              ⚠️ {localError}
            </p>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
            {step === 1 && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingDraft ? "Saving draft…" : "Save as draft"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold bg-gradient-brand text-white px-5 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <span>Next: Pipeline & Assessments</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Role Details</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isSubmitting}
                    className="text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavingDraft ? "Saving…" : "Save draft"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setStep(3);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold bg-gradient-brand text-white px-5 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <span>Next: Funnel & Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Pipeline</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isSubmitting}
                    className="text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavingDraft ? "Saving…" : "Save draft"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || isSavingDraft || loadingCredits || hasInsufficientCredits}
                    className="inline-flex items-center gap-2 text-xs font-bold bg-gradient-brand text-white px-6 py-3 rounded-xl shadow-elegant hover:shadow-glow transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Publish Job · {totalCost} credits
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: AI Assist Panel (Active across all 3 steps) */}
        <div>
          <AIAssistPanel
            step={step}
            jobTitle={title}
            onApplySuggestion={handleApplySuggestion}
            onDraftWithAi={handleGenerateContent}
            isGenerating={isGeneratingContent}
          />
        </div>
      </div>

      {/* Credit & Plan Modals */}
      <BuyCreditsModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        packs={packs}
        onPurchased={(newBalance) => setBalance(newBalance)}
      />

      <UpgradePlanModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlanId="growth"
      />

      <CustomQuestionModal
        open={customQuestionModalTarget !== null}
        onClose={() => setCustomQuestionModalTarget(null)}
        target={customQuestionModalTarget || "ai_online_test"}
        onAddQuestion={handleAddCustomQuestion}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function MatchVolumeSection({
  options,
  selected,
  onSelect,
  customRatioError,
  setCustomRatioError,
}: {
  options: MatchVolumeOption[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  customRatioError: string | null;
  setCustomRatioError: (err: string | null) => void;
}) {
  const isPredefined = options.some((o) => o.key === selected);
  const isCustomSelected = !!(selected && !isPredefined && selected.startsWith("1:"));
  const initialCustomNum = isCustomSelected ? selected.replace(/^1:/, "") : "";
  const [customDenominator, setCustomDenominator] = useState(initialCustomNum);
  const [isCustomMode, setIsCustomMode] = useState(isCustomSelected);

  const handleCustomChange = (val: string) => {
    setCustomDenominator(val);
    const clean = val.trim();
    if (!clean) {
      setCustomRatioError("Custom ratio is required (e.g. 1:5, 1:9, up to 1:10).");
      onSelect(null);
      return;
    }

    const num = parseInt(clean, 10);
    if (isNaN(num) || num <= 0) {
      setCustomRatioError("Please enter a valid positive number for the ratio.");
      onSelect(null);
    } else if (num > 10) {
      setCustomRatioError(`Custom ratio 1:${num} exceeds maximum allowed ratio 1:10. Please choose a ratio between 1:1 and 1:10.`);
      onSelect(null);
    } else {
      setCustomRatioError(null);
      onSelect(`1:${num}`);
    }
  };

  const handleSelectPredefined = (key: string) => {
    setIsCustomMode(false);
    setCustomRatioError(null);
    onSelect(key);
  };

  const handleSelectCustomMode = () => {
    setIsCustomMode(true);
    if (customDenominator.trim()) {
      handleCustomChange(customDenominator);
    } else {
      setCustomDenominator("5");
      setCustomRatioError(null);
      onSelect("1:5");
    }
  };

  return (
    <div className={`rounded-xl border transition ${selected ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-ink">Candidate Match Volume</span>
          {selected && (
            <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
              {isPredefined ? options.find((o) => o.key === selected)?.credits : 10} credits
            </span>
          )}
        </div>
        <p className="text-xs text-ink-soft mt-0.5">
          How many candidates should be matched against this job (choose one or enter a custom ratio up to 1:10)
        </p>

        <div className="mt-3 space-y-1.5">
          {options.map((opt) => {
            const active = !isCustomMode && selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleSelectPredefined(opt.key)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-sm transition cursor-pointer ${
                  active
                    ? "border-primary/40 bg-white shadow-sm font-semibold text-ink"
                    : "border-transparent text-ink-soft hover:bg-surface-alt/60"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      active ? "border-primary" : "border-border"
                    }`}
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-gradient-brand" />}
                  </span>
                  {opt.label}
                </span>
                <span className={active ? "text-primary-glow font-bold" : "text-ink-soft/70"}>{opt.credits} credits</span>
              </button>
            );
          })}

          {/* Custom Ratio Option (up to 1:10) */}
          <div
            className={`rounded-lg border text-sm transition ${
              isCustomMode
                ? "border-primary/40 bg-white shadow-sm p-3 font-semibold text-ink"
                : "border-transparent p-2 text-ink-soft hover:bg-surface-alt/60"
            }`}
          >
            <button
              type="button"
              role="radio"
              aria-checked={isCustomMode}
              onClick={handleSelectCustomMode}
              className="w-full flex items-center justify-between gap-3 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isCustomMode ? "border-primary" : "border-border"
                  }`}
                >
                  {isCustomMode && <span className="w-2 h-2 rounded-full bg-gradient-brand" />}
                </span>
                <span>Custom Ratio <span className="text-xs font-normal text-ink-soft">(up to 1:10, e.g. 1:5, 1:9)</span></span>
              </span>
              <span className={isCustomMode ? "text-primary-glow font-bold text-xs" : "text-ink-soft/70 text-xs"}>
                10 credits
              </span>
            </button>

            {isCustomMode && (
              <div className="mt-2.5 pl-6 pt-2 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink">Ratio:</span>
                  <span className="text-xs font-bold text-primary-glow bg-primary/10 px-2 py-1 rounded-md">1 :</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={customDenominator}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="5"
                    className="w-20 px-2.5 py-1 text-xs font-semibold bg-background border border-border rounded-md focus:border-primary focus:outline-hidden"
                  />
                  <span className="text-[11px] text-ink-soft">
                    {customDenominator ? `(1 candidate selected per ${customDenominator} matches)` : ""}
                  </span>
                </div>

                {customRatioError && (
                  <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-2.5 py-1.5 mt-2 font-normal">
                    ⚠️ {customRatioError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineSectionCard({
  meta,
  subOptions,
  subOptionCost,
  enabled,
  onToggleEnabled,
  selectedKeys,
  onToggleSubOption,
}: {
  section: PipelineSection;
  meta: { label: string; description: string };
  subOptions: { key: string; label: string }[];
  subOptionCost: number;
  enabled: boolean;
  onToggleEnabled: (v: boolean) => void;
  selectedKeys: Set<string>;
  onToggleSubOption: (key: string) => void;
}) {
  const selectedCount = selectedKeys.size;

  return (
    <div className={`rounded-xl border transition ${enabled ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
      <label className="flex items-start gap-3 p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink">{meta.label}</span>
            {enabled && selectedCount > 0 && (
              <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                {selectedCount * subOptionCost} credits
              </span>
            )}
          </div>
          <p className="text-xs text-ink-soft mt-0.5">{meta.description}</p>
        </div>
      </label>

      {enabled && subOptions.length > 0 && (
        <div className="px-3 pb-3 pt-1 flex flex-wrap gap-2">
          {subOptions.map((opt) => {
            const active = selectedKeys.has(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onToggleSubOption(opt.key)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                  active
                    ? "bg-gradient-brand text-primary-foreground border-transparent shadow-sm"
                    : "bg-surface text-ink-soft border-border hover:text-ink hover:border-primary/30"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                    active ? "bg-white/20 border-white/40" : "border-border"
                  }`}
                >
                  {active && <Check className="w-2.5 h-2.5" />}
                </span>
                {opt.label}
                <span className={active ? "text-primary-foreground/80" : "text-ink-soft/70"}>· {subOptionCost}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
