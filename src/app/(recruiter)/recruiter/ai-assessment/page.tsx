"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { ComingSoonPage } from "@/components/recruiter/ComingSoonPage";

export default function AIAssessmentPage() {
  return (
    <ComingSoonPage
      section="Interview"
      title="AI Assessment"
      description="Automated technical evaluations, skill benchmarking quizzes, coding tests, and behavioral situational judgment challenges."
      icon={Sparkles}
      highlights={[
        "Custom test generation based on job requirements and experience tier",
        "Proctored environment with plagiarism and AI-generation checks",
        "Automated code execution engine for 30+ programming languages",
        "Instant benchmark comparisons against national & industry percentiles",
      ]}
    />
  );
}
