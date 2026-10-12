"use client";

import React from "react";
import { Languages } from "lucide-react";
import { ComingSoonPage } from "@/components/recruiter/ComingSoonPage";

export default function LinguisticTestPage() {
  return (
    <ComingSoonPage
      section="Career Guidance"
      title="Linguistic Test"
      description="Standardized language proficiency, CEFR communication benchmarks, listening, and business articulation assessments."
      icon={Languages}
      highlights={[
        "Automated spoken fluency, pronunciation, and phonetics scoring",
        "Reading comprehension and situational grammar evaluation",
        "Standardized CEFR (A1–C2) calibration for global roles",
        "Seamless integration with recruiter screening criteria",
      ]}
    />
  );
}
