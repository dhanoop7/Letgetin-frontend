"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { ComingSoonPage } from "@/components/recruiter/ComingSoonPage";

export default function AIInterviewPage() {
  return (
    <ComingSoonPage
      section="Interview"
      title="AI Interview"
      description="Autonomous AI-conducted candidate interviews with adaptive conversational probing, real-time code evaluation, and speech analysis."
      icon={Sparkles}
      highlights={[
        "Conversational AI interviewer tailored to job specifications & skill stacks",
        "Adaptive follow-up questions responding dynamically to candidate answers",
        "Comprehensive scoring rubric with breakdown on technical depth & problem solving",
        "Full interview audio/video recording with synchronized AI transcript",
      ]}
    />
  );
}
