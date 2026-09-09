"use client";

import React from "react";
import { Video } from "lucide-react";
import { ComingSoonPage } from "@/components/recruiter/ComingSoonPage";

export default function VideoInterviewPage() {
  return (
    <ComingSoonPage
      section="Interview"
      title="Video Interview"
      description="Integrated HD video meeting rooms built directly into your recruitment pipeline with cloud recordings, interactive collaborative whiteboards, and live code editors."
      icon={Video}
      highlights={[
        "Zero-download browser video calls for both candidates and recruiters",
        "Built-in collaborative code editor and system design whiteboard",
        "Encrypted HD cloud recording with instant playback & timestamped bookmarking",
        "One-click invite links with automated candidate device & microphone check",
      ]}
    />
  );
}
