"use client";

import React from "react";
import { Bot } from "lucide-react";
import { ComingSoonPage } from "@/components/recruiter/ComingSoonPage";

export default function InterviewBuddyPage() {
  return (
    <ComingSoonPage
      section="Interview"
      title="Interview Buddy"
      description="Live AI co-pilot assisting human interviewers during technical and behavioral rounds with suggested questions, live cheat-sheet notes, and scoring prompts."
      icon={Bot}
      highlights={[
        "Real-time speech-to-text listener highlighting key candidate claims",
        "Contextual smart prompts suggesting immediate follow-up technical questions",
        "Resume fact-checking assistant verifying dates, projects, and tech stacks",
        "Automated scorecard generation post-interview for quick panel debriefs",
      ]}
    />
  );
}
